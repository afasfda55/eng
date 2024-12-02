'use client'

import { useState, useCallback } from 'react'
import { TextSelectionContextMenu } from './text-selection/context-menu'
import { TextSegment } from './text-selection/text-segment'
import { useTextSelection } from './text-selection/use-text-selection'
import { useSpeech } from './text-selection/use-speech'
import { useWordStore, type WordType } from '@/lib/store/word-store'
import type { Lesson } from '@/lib/store/lesson-store'
import { useReadingSettings } from './settings'
import { cn } from '@/lib/utils'
import DOMPurify from 'isomorphic-dompurify'

interface TextContentProps {
  lesson: Lesson
}

interface TextSegmentData {
  text: string
  start: number
  end: number
  type?: 'highlight' | 'underline'
  wordType?: WordType
  wordId?: string
}

export function TextContent({ lesson }: TextContentProps) {
  const { words, addWord, removeWordById } = useWordStore()
  const { speak } = useSpeech()
  const { findTextPosition, findAllOccurrences } = useTextSelection(lesson.content)
  const lessonWords = words.filter(word => word.lesson_id === lesson.id)
  const { isRTL } = useReadingSettings()
  
  // Auto-detect RTL if not set manually
  const shouldUseRTL = isRTL || /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(lesson.content)

  const handleContextMenuAction = useCallback((action: WordType | 'clear' | 'read3x' | 'google') => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    const text = selection.toString().trim()
    if (!text) return

    const position = findTextPosition(text)
    if (!position) return

    switch (action) {
      case 'clear': {
        const wordToRemove = words.find(w => 
          w.text === text && 
          w.start === position.start && 
          w.end === position.end
        )
        if (wordToRemove) {
          removeWordById(wordToRemove.id)
        }
        break
      }
      case 'read3x':
        speak(text, 3)
        break
      case 'google':
        window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, '_blank')
        break
      default:
        addWord({
          text,
          type: action,
          start: position.start,
          end: position.end,
          user_id: '', // This will be set by the backend
        }, lesson.id)
        break
    }

    selection.removeAllRanges()
  }, [addWord, removeWordById, speak, words, findTextPosition, lesson.id])

  const renderText = () => {
    if (!lesson.content) return null

    const segments: TextSegmentData[] = []
    
    lessonWords.forEach(word => {
      const occurrences = findAllOccurrences(word.text)
      
      occurrences.forEach(occurrence => {
        const isOriginal = occurrence.start === word.start && occurrence.end === word.end
        
        segments.push({
          text: word.text,
          start: occurrence.start,
          end: occurrence.end,
          type: isOriginal ? 'highlight' : 'underline',
          wordType: word.type,
          wordId: word.id
        })
      })
    })

    segments.sort((a, b) => a.start - b.start)

    const mergedSegments: JSX.Element[] = []
    let currentPos = 0

    segments.forEach((segment, index) => {
      if (segment.start > currentPos) {
        const textContent = lesson.content.slice(currentPos, segment.start)
        const sanitizedHtml = DOMPurify.sanitize(textContent, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
          ALLOWED_ATTR: ['style'],
          ALLOWED_STYLES: ['color', 'background-color', 'text-align'],
        })
        
        // Split content by paragraphs and preserve them
        const parts = sanitizedHtml.split(/(<\/?p>)/)
        parts.forEach((part, i) => {
          if (part === '<p>') {
            mergedSegments.push(<p key={`p-start-${index}-${i}`} className="mb-4 last:mb-0" />)
          } else if (part === '</p>') {
            // Skip closing tags as we handle them with the opening tag
          } else if (part.trim()) {
            mergedSegments.push(
              <span key={`text-${index}-${i}`} dangerouslySetInnerHTML={{ __html: part }} />
            )
          }
        })
      }

      if (segment.start >= currentPos) {
        mergedSegments.push(
          <TextSegment
            key={`segment-${segment.wordId}-${index}`}
            text={segment.text}
            type={segment.type}
            wordType={segment.wordType}
          />
        )
        currentPos = segment.end
      }
    })

    if (currentPos < lesson.content.length) {
      const textContent = lesson.content.slice(currentPos)
      const sanitizedHtml = DOMPurify.sanitize(textContent, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
        ALLOWED_ATTR: ['style'],
        ALLOWED_STYLES: ['color', 'background-color', 'text-align'],
      })
      
      // Split content by paragraphs and preserve them
      const parts = sanitizedHtml.split(/(<\/?p>)/)
      parts.forEach((part, i) => {
        if (part === '<p>') {
          mergedSegments.push(<p key={`p-end-start-${i}`} className="mb-4 last:mb-0" />)
        } else if (part === '</p>') {
          // Skip closing tags as we handle them with the opening tag
        } else if (part.trim()) {
          mergedSegments.push(
            <span key={`text-end-${i}`} dangerouslySetInnerHTML={{ __html: part }} />
          )
        }
      })
    }

    return mergedSegments
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      <h2 className="text-2xl font-bold mb-4" dir={shouldUseRTL ? "rtl" : "ltr"}>
        {lesson.title}
      </h2>
      <TextSelectionContextMenu onAction={handleContextMenuAction}>
        <div 
          className={cn(
            "text-lg leading-relaxed",
            shouldUseRTL && "font-arabic",
            "[&_p]:whitespace-pre-wrap [&_p]:mb-4 last:[&_p]:mb-0",
            "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4",
            "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3",
            "[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2",
          )}
          dir={shouldUseRTL ? "rtl" : "ltr"}
        >
          {renderText()}
        </div>
      </TextSelectionContextMenu>
    </div>
  )
}