'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, BookMarked } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { PlaybackControls } from '@/components/new-things/playback-controls'
import { DataTable } from '@/components/new-things/data-table'
import { useLessonStore } from '@/lib/store/lesson-store'
import { cn } from '@/lib/utils'

export function NewThingsClient({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { lessons } = useLessonStore()
  const lesson = lessons.find(l => l.id === params.id)

  if (!lesson) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
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
                  'after:scale-x-0'
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
                  'after:scale-x-100'
                )}
              >
                <BookMarked className="h-5 w-5 mr-2" />
                New Words/Sentences
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <PlaybackControls lessonId={params.id} />
        <DataTable lessonId={params.id} />
      </main>
    </div>
  )
}