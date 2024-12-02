'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useLessonStore } from '@/lib/store/lesson-store'
import { useSectionStore } from '@/lib/store/section-store'
import { useToast } from '@/components/ui/use-toast'
import { DeleteConfirmation } from '@/components/delete-confirmation'
import Link from 'next/link'
import DOMPurify from 'isomorphic-dompurify'

// Function to extract text content from HTML
const getTextFromHtml = (html: string) => {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div')
  // Sanitize and set HTML
  tempDiv.innerHTML = DOMPurify.sanitize(html)
  // Get text content (this removes all HTML tags)
  return tempDiv.textContent || tempDiv.innerText || ''
}

export function LessonGrid() {
  const { lessons, currentSection, currentSubsection, deleteLesson } = useLessonStore()
  const { sections } = useSectionStore()
  const { toast } = useToast()
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean
    lessonId: string
  } | null>(null)

  const currentSectionData = sections.find(s => s.id === currentSection)
  const currentSubsectionData = currentSectionData?.subsections?.find(
    s => s.id === currentSubsection
  )

  const sectionLessons = lessons.filter(lesson => lesson.section_id === currentSection && !lesson.subsection_id)
  const subsectionLessons = currentSectionData?.subsections?.map(subsection => ({
    subsection,
    lessons: lessons.filter(lesson => lesson.subsection_id === subsection.id)
  })) || []

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmation({
      open: true,
      lessonId: id,
    })
  }

  const handleDeleteConfirm = () => {
    if (!deleteConfirmation) return

    deleteLesson(deleteConfirmation.lessonId)
    toast({
      title: 'Lesson deleted',
      description: 'The lesson has been successfully deleted.',
    })
    setDeleteConfirmation(null)
  }

  const renderLessonCard = (lesson: any) => (
    <Card key={lesson.id} className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <Link
          href={`/reading/${lesson.id}`}
          className="text-lg font-semibold hover:underline"
        >
          {lesson.title}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteClick(lesson.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {getTextFromHtml(lesson.content)}
      </p>
    </Card>
  )

  return (
    <>
      {currentSubsection ? (
        // Display only the selected subsection's lessons
        subsectionLessons.map(({ subsection, lessons }) => (
          subsection.id === currentSubsection && lessons.length > 0 && (
            <div key={subsection.id} className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{subsection.name} Lessons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map(renderLessonCard)}
              </div>
            </div>
          )
        ))
      ) : (
        // Display the main section's lessons and all subsections' lessons
        <>
          {sectionLessons.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{currentSectionData?.name} Lessons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sectionLessons.map(renderLessonCard)}
              </div>
            </div>
          )}

          {subsectionLessons.map(({ subsection, lessons }) => (
            lessons.length > 0 && (
              <div key={subsection.id} className="mb-8">
                <h3 className="text-xl font-semibold mb-4">{subsection.name} Lessons</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lessons.map(renderLessonCard)}
                </div>
              </div>
            )
          ))}
        </>
      )}

      {deleteConfirmation && (
        <DeleteConfirmation
          open={deleteConfirmation.open}
          onOpenChange={(open) => !open && setDeleteConfirmation(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Lesson"
          description='Type "Delete" to confirm that you want to delete this lesson.'
          requireTyping={true}
        />
      )}
    </>
  )
}