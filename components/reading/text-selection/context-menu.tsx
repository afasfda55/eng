'use client'

import { useCallback } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { WordType } from '@/lib/store/word-store'

interface TextSelectionContextMenuProps {
  children: React.ReactNode
  onAction: (action: WordType | 'clear' | 'read3x' | 'google') => void
}

export function TextSelectionContextMenu({ children, onAction }: TextSelectionContextMenuProps) {
  const handleAction = useCallback((action: WordType | 'clear' | 'read3x' | 'google') => {
    onAction(action)
  }, [onAction])

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-[160px]">
        <ContextMenuItem onClick={() => handleAction('new')}>
          New Word
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleAction('pronunciation')}>
          Pronunciation
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleAction('sentence')}>
          Sentence
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleAction('clear')}>
          Clear Highlight
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleAction('read3x')}>
          Read 3 Times
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleAction('google')}>
          Search in Google
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}