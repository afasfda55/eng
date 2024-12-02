'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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

const MAIN_SECTION = '_main'

export function AddLessonDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { sections } = useSectionStore()
  const { addLesson } = useLessonStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    section_id: '',
    subsection_id: '',
    title: '',
    content: '',
  })

  const selectedSection = sections.find((s) => s.id === formData.section_id)
  const hasSubsections = selectedSection?.subsections && selectedSection.subsections.length > 0

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
      const formattedContent = formData.content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => `<p>${line}</p>`)
        .join('\n')

      await addLesson({
        section_id: formData.section_id,
        subsection_id: formData.subsection_id || undefined,
        title: formData.title.trim(),
        content: formattedContent,
        user_id: '', // This will be set by the backend
      })

      toast({
        title: 'Success',
        description: 'Lesson created successfully.',
      })
      
      setOpen(false)
      setFormData({
        section_id: '',
        subsection_id: '',
        title: '',
        content: '',
      })
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
          <DialogDescription>
            Create a new lesson by filling out the information below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="section">Section</Label>
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
            <div>
              <Label htmlFor="subsection">Subsection (Optional)</Label>
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
                    {selectedSection?.subsections?.map((subsection) => (
                      <SelectItem key={subsection.id} value={subsection.id}>
                        {subsection.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter lesson title"
            />
          </div>

          <div>
            <Label htmlFor="content">Lesson Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Enter lesson content"
              className="h-[200px] font-mono"
              style={{ whiteSpace: 'pre-wrap' }}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false)
              router.push('/lessons/advanced-create')
            }}
          >
            Advanced
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Creating...</span>
              </div>
            ) : (
              'Create'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}