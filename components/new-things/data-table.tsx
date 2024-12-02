'use client'

import { useWordStore } from '@/lib/store/word-store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

export function DataTable({ lessonId }: { lessonId: string }) {
  const { words, removeWordById, fetchWords } = useWordStore();
  
  useEffect(() => {
    fetchWords(lessonId);
  }, [lessonId, fetchWords]);
  
  const currentLessonWords = words.filter(w => w.lesson_id === lessonId);
  
  const wordsList = currentLessonWords
    .filter(w => w.type !== 'sentence')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const sentences = currentLessonWords
    .filter(w => w.type === 'sentence')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Words ({wordsList.length})</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Word</TableHead>
              <TableHead>Part of Speech</TableHead>
              <TableHead>Phonetic</TableHead>
              <TableHead>Definition</TableHead>
              <TableHead>Example</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wordsList.map((word) => (
              <TableRow key={word.id}>
                <TableCell
                  className={cn(
                    'font-medium',
                    word.type === 'new'
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-green-500 dark:text-green-400'
                  )}
                >
                  {word.text}
                </TableCell>
                <TableCell>{word.part_of_speech || '-'}</TableCell>
                <TableCell>{word.phonetic || '-'}</TableCell>
                <TableCell className="max-w-[200px]">
                  {word.meaning || '-'}
                </TableCell>
                <TableCell className="max-w-[200px]">
                  {word.example || '-'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeWordById(word.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">
          Sentences ({sentences.length})
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sentence</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sentences.map((sentence) => (
              <TableRow key={sentence.id}>
                <TableCell className="text-blue-500 dark:text-blue-400">
                  {sentence.text}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeWordById(sentence.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}