'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Settings2, FileText, BookOpen, BookMarked } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { TextContent } from '@/components/reading/text-content'
import { AudioPlayer } from '@/components/reading/audio-player'
import { SettingsPanel } from '@/components/reading/settings-panel'
import { WordsPanel } from '@/components/reading/words-panel'
import { ScrollToTop } from '@/components/scroll-to-top'
import { useLessonStore } from '@/lib/store/lesson-store'
import { useWordStore } from '@/lib/store/word-store'
import { cn } from '@/lib/utils'
import type { Lesson } from '@/lib/store/lesson-store'

export function ReadingPageClient({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [showSettings, setShowSettings] = useState(false)
  const [showWordsPanel, setShowWordsPanel] = useState(false)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { lessons } = useLessonStore()
  const { fetchWords } = useWordStore()

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true)
      try {
        // Fetch words for this specific lesson
        await fetchWords(params.id)
        
        const currentLesson = lessons.find(l => l.id === params.id)
        if (currentLesson) {
          setLesson(currentLesson)
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Error loading lesson data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [lessons, params.id, router, fetchWords])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    )
  }

  if (!lesson) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/reading/${params.id}`)}
                className={cn(
                  'relative',
                  'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
                  'after:bg-primary after:transition-transform after:duration-200',
                  'after:scale-x-100'
                )}
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Reading
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push(`/new-things/${params.id}`)}
                className={cn(
                  'relative',
                  'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
                  'after:bg-primary after:transition-transform after:duration-200',
                  'after:scale-x-0'
                )}
              >
                <BookMarked className="h-5 w-5 mr-2" />
                New Words/Sentences
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowWordsPanel(!showWordsPanel)}
              >
                <FileText className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings2 className="h-5 w-5" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        <div className="flex gap-6">
          <div className={`flex-1 ${showWordsPanel ? 'w-7/10' : 'w-full'}`}>
            <TextContent key={params.id} lesson={lesson} />
          </div>
          {showWordsPanel && (
            <div className="w-3/10 min-w-[300px]">
              <WordsPanel lessonId={params.id} />
            </div>
          )}
        </div>
      </main>

      <AudioPlayer />
      <ScrollToTop />
      <SettingsPanel open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}