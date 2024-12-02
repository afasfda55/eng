'use client'

import { useCallback } from 'react'
import { WordType } from '@/lib/store/word-store'

interface TextPosition {
  start: number
  end: number
}

export function useTextSelection(content: string) {
  const findTextPosition = useCallback((searchText: string): TextPosition | null => {
    const start = content.indexOf(searchText)
    if (start === -1) return null
    return {
      start,
      end: start + searchText.length
    }
  }, [content])

  const findAllOccurrences = useCallback((searchText: string): TextPosition[] => {
    const occurrences: TextPosition[] = []
    let position = 0

    while (true) {
      const index = content.indexOf(searchText, position)
      if (index === -1) break
      
      occurrences.push({
        start: index,
        end: index + searchText.length
      })
      position = index + 1
    }

    return occurrences
  }, [content])

  return {
    findTextPosition,
    findAllOccurrences
  }
}