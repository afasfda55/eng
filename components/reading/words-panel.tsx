'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useWordStore } from '@/lib/store/word-store'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

export function WordsPanel({ lessonId }: { lessonId: string }) {
  const { words, removeWordById } = useWordStore()

  const wordsList = useMemo(() => 
    words.filter((w) => w.type !== 'sentence' && w.lesson_id === lessonId),
    [words, lessonId]
  )

  const sentences = useMemo(() => 
    words.filter((w) => w.type === 'sentence' && w.lesson_id === lessonId),
    [words, lessonId]
  )

  return (
    <Tabs defaultValue="words" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="words">Words</TabsTrigger>
        <TabsTrigger value="sentences">Sentences</TabsTrigger>
      </TabsList>

      <TabsContent value="words">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Word</TableHead>
              <TableHead>Translation</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wordsList.map((word) => (
              <TableRow key={word.id}>
                <TableCell className={cn(
                  'font-medium',
                  word.type === 'new' ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
                )}>
                  {word.text}
                </TableCell>
                <TableCell>{word.translation || '-'}</TableCell>
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
      </TabsContent>

      <TabsContent value="sentences">
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
                <TableCell className="text-blue-500 dark:text-blue-400">{sentence.text}</TableCell>
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
      </TabsContent>
    </Tabs>
  )
}