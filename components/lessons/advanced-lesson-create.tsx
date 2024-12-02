'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Upload, Check, Scan } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLessonStore } from '@/lib/store/lesson-store'
import { useSectionStore } from '@/lib/store/section-store'
import { useToast } from '@/components/ui/use-toast'
import { ImageCrop } from './image-crop'
import dynamic from 'next/dynamic'
import { createWorker, PSM } from 'tesseract.js'
import DOMPurify from 'isomorphic-dompurify'
import 'react-quill/dist/quill.snow.css'

// Import Quill with dynamic import to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

const MAIN_SECTION = '_main'

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ['clean'],
  ],
}

const quillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'align',
  'color',
  'background',
]

export function AdvancedLessonCreate() {
  const router = useRouter()
  const { sections, fetchSections } = useSectionStore()
  const { addLesson } = useLessonStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    fetchSections()
  }, [])

  const [formData, setFormData] = useState({
    section_id: '',
    subsection_id: '',
    title: '',
    content: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 })
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedSection = sections.find((s) => s.id === formData.section_id)
  const hasSubsections = selectedSection?.subsections && selectedSection.subsections.length > 0

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Support for common image formats
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file.',
          variant: 'destructive',
        })
        return
      }

      const url = URL.createObjectURL(file)
      setImageUrl(url)
      setShowCamera(false)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setShowCamera(true)
      setImageUrl(null)
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      })
    }
  }

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(videoRef.current, 0, 0)
      const url = canvas.toDataURL('image/png')
      setImageUrl(url)
      setShowCamera(false)
      // Stop the camera stream
      stream?.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const extractText = async () => {
    if (!imageUrl || !cropArea || !imageRef.current) {
      toast({
        title: 'No selection',
        description: 'Please select an area of the image first.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsProcessing(true)

      // Create a canvas to crop the image
      const img = new Image()
      img.src = imageUrl
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      // Get the actual image dimensions
      const displayRect = imageRef.current.getBoundingClientRect()

      // Calculate scale factors between displayed size and actual image size
      const scaleX = img.naturalWidth / displayRect.width
      const scaleY = img.naturalHeight / displayRect.height

      // Scale the crop coordinates to match the actual image dimensions
      const actualCrop = {
        x: cropArea.x * scaleX,
        y: cropArea.y * scaleY,
        width: cropArea.width * scaleX,
        height: cropArea.height * scaleY
      }

      const canvas = document.createElement('canvas')
      canvas.width = actualCrop.width
      canvas.height = actualCrop.height
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Draw the cropped image
      ctx.drawImage(
        img,
        actualCrop.x,
        actualCrop.y,
        actualCrop.width,
        actualCrop.height,
        0,
        0,
        actualCrop.width,
        actualCrop.height
      )

      // Initialize Tesseract.js worker
      const worker = await createWorker()
      
      try {
        // Load multiple languages
        await worker.load('eng+ara')
        await worker.reinitialize()
        
        // Configure Tesseract for better accuracy
        await worker.setParameters({
          tessedit_ocr_engine_mode: 1, // Legacy + LSTM mode
          preserve_interword_spaces: '1',
          tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?@#$%&*()[]{}/<>\\|~`"\':;-_+= ',
          tessedit_pageseg_mode: PSM.AUTO // Use automatic page segmentation mode
        })

        // Perform OCR
        const { data } = await worker.recognize(canvas.toDataURL('image/png'))
        
        if (!data.text || data.confidence < 30) {
          throw new Error('Low confidence in text recognition')
        }

        // Format the extracted text with proper line joining
        const cleanedText = data.text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0) // Remove empty lines
          // Join lines that end with hyphen or incomplete words
          .reduce((acc: string[], line, i) => {
            if (i === 0) return [line];
            
            const prevLine = acc[acc.length - 1];
            // Check if previous line ends with hyphen or no punctuation
            const shouldJoin = prevLine.endsWith('-') || 
              (!prevLine.match(/[.!?]$/) && !line.match(/^[A-Z]/));
            
            if (shouldJoin) {
              // If ends with hyphen, remove it and join directly
              const joinedLine = prevLine.endsWith('-')
                ? prevLine.slice(0, -1) + line
                : prevLine + ' ' + line;
              acc[acc.length - 1] = joinedLine;
            } else {
              acc.push(line);
            }
            return acc;
          }, [])
          .map(line => line.replace(/\s+/g, ' ').trim()) // Remove multiple spaces
          .filter(Boolean) // Remove any remaining empty strings
          .map(line => `<p>${line}</p>`)
          .join('') // Join without newlines

        // Update the editor content without extra line breaks
        setFormData(prev => ({
          ...prev,
          content: prev.content + (prev.content ? '' : '') + cleanedText
        }))

        toast({
          title: 'Text Extracted',
          description: `Text extracted with ${Math.round(data.confidence)}% confidence.`,
        })
      } finally {
        // Always terminate the worker
        await worker.terminate()
      }
    } catch (error) {
      console.error('OCR Error:', error)
      toast({
        title: 'OCR Error',
        description: 'Failed to extract text. Try adjusting the selection or selecting a clearer area.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.section_id) {
      toast({
        title: 'Section required',
        description: 'Please select a section.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for the lesson.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)
      // Save the content as-is, without additional cleaning
      await addLesson({
        section_id: formData.section_id,
        subsection_id: formData.subsection_id || undefined,
        title: formData.title.trim(),
        content: formData.content,
        user_id: '', // This will be set by the backend
      })
      toast({
        title: 'Success',
        description: 'Lesson created successfully.',
      })
      router.push('/')
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Advanced Lesson Creation</h1>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Creating...</span>
                </div>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image Processing */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Section</Label>
              <Select
                value={formData.section_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, section_id: value, subsection_id: '' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasSubsections && (
              <div className="space-y-2">
                <Label>Subsection (Optional)</Label>
                <Select
                  value={formData.subsection_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subsection_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subsection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={MAIN_SECTION}>
                        Add to main section ({selectedSection?.name})
                      </SelectItem>
                      <SelectLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Subsections
                      </SelectLabel>
                      {selectedSection?.subsections?.map((subsection: { id: string, name: string }) => (
                        <SelectItem key={subsection.id} value={subsection.id}>
                          {subsection.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter lesson title"
              />
            </div>

            <div className="space-y-2">
              <Label>Image Upload or Capture</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <Button variant="outline" onClick={startCamera}>
                  <Camera className="h-4 w-4 mr-2" />
                  Take Picture
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            {showCamera && (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
                <Button
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                  onClick={captureImage}
                >
                  Capture
                </Button>
              </div>
            )}

            {imageUrl && (
              <div className="space-y-4 border rounded-lg p-4">
                <ImageCrop
                  imageUrl={imageUrl}
                  onCrop={setCropArea}
                  imageRef={imageRef}
                />
                <Button
                  variant="outline"
                  onClick={extractText}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <Scan className="h-4 w-4 mr-2" />
                      Extract Text from Selection
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Content Editor */}
          <div className="space-y-4">
            <Label>Content</Label>
            <div className="border rounded-lg [&_.ql-container]:h-[450px] [&_.ql-toolbar]:sticky [&_.ql-toolbar]:top-0 [&_.ql-toolbar]:z-10 [&_.ql-toolbar]:bg-background [&_.ql-editor]:min-h-[450px]">
              <ReactQuill
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                modules={quillModules}
                formats={quillFormats}
                theme="snow"
                preserveWhitespace
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 