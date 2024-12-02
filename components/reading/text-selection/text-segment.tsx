'use client'

import { cn } from '@/lib/utils'
import { WordType } from '@/lib/store/word-store'

interface TextSegmentProps {
  text: string
  type?: 'highlight' | 'underline'
  wordType?: WordType
}

export function TextSegment({ text, type, wordType }: TextSegmentProps) {
  const highlightClass = wordType === 'new'
    ? 'bg-red-200/80 dark:bg-red-950 dark:text-red-200 dark:border-red-500'
    : wordType === 'pronunciation'
    ? 'bg-green-200/80 dark:bg-green-950 dark:text-green-200 dark:border-green-500'
    : 'bg-blue-200/80 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-500'

  const underlineClass = wordType === 'new'
    ? 'border-red-400 dark:border-red-400'
    : wordType === 'pronunciation'
    ? 'border-green-400 dark:border-green-400'
    : 'border-blue-400 dark:border-blue-400'

  return (
    <span
      className={cn(
        type === 'highlight' ? highlightClass : '',
        type === 'underline' ? 'border-b-2' : '',
        type === 'underline' ? underlineClass : '',
        'inline-block align-baseline px-1 py-0.5 rounded transition-colors duration-200',
        type === 'highlight' ? 'border border-opacity-50' : ''
      )}
    >
      {text}
    </span>
  )
}