'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Play, Pause, Settings2 } from 'lucide-react'
import { useWordStore, type Word } from '@/lib/store/word-store'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface ColumnSetting {
  enabled: boolean
  repetitions: string
}

interface PlaybackSettings {
  word: ColumnSetting
  meaning: ColumnSetting
  wordTranslation: ColumnSetting
  example: ColumnSetting
  sentence: ColumnSetting
  sentenceTranslation: ColumnSetting
}

const DEFAULT_SETTINGS: PlaybackSettings = {
  word: { enabled: true, repetitions: '1' },
  meaning: { enabled: false, repetitions: '1' },
  wordTranslation: { enabled: false, repetitions: '1' },
  example: { enabled: false, repetitions: '1' },
  sentence: { enabled: true, repetitions: '1' },
  sentenceTranslation: { enabled: false, repetitions: '1' },
}

export function PlaybackControls({ lessonId }: { lessonId: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState('1')
  const [loop, setLoop] = useState(false)
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0)
  const [currentRepetition, setCurrentRepetition] = useState(1)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const { words } = useWordStore()
  const { toast } = useToast()
  const [settings, setSettings] = useState<PlaybackSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSynthesis(window.speechSynthesis)
    }
  }, [])

  const speeds = [
    { value: '0.25', label: '0.25x' },
    { value: '0.5', label: '0.5x' },
    { value: '0.75', label: '0.75x' },
    { value: '1', label: '1x' },
    { value: '1.25', label: '1.25x' },
    { value: '1.5', label: '1.5x' },
    { value: '1.75', label: '1.75x' },
    { value: '2', label: '2x' },
  ]

  const wordColumns: Array<keyof PlaybackSettings> = [
    'word',
    'meaning',
    'wordTranslation',
    'example'
  ]

  const sentenceColumns: Array<keyof PlaybackSettings> = [
    'sentence',
    'sentenceTranslation'
  ]

  const getTextForColumn = (word: Word, column: keyof PlaybackSettings): string => {
    switch (column) {
      case 'word':
        return word.type !== 'sentence' ? word.text : ''
      case 'meaning':
        return word.type !== 'sentence' ? (word.meaning || '') : ''
      case 'wordTranslation':
        return word.type !== 'sentence' ? (word.translation || '') : ''
      case 'example':
        return word.type !== 'sentence' ? (word.example || '') : ''
      case 'sentence':
        return word.type === 'sentence' ? word.text : ''
      case 'sentenceTranslation':
        return word.type === 'sentence' ? (word.translation || '') : ''
      default:
        return ''
    }
  }

  const speak = useCallback((text: string) => {
    if (!speechSynthesis || !text || isSpeaking) return null

    return new Promise<void>((resolve) => {
      setIsSpeaking(true)
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = parseFloat(speed)
      
      utterance.onend = () => {
        setIsSpeaking(false)
        resolve()
      }
      
      utterance.onerror = () => {
        setIsSpeaking(false)
        resolve()
      }
      
      speechSynthesis.speak(utterance)
    })
  }, [speechSynthesis, speed, isSpeaking])

  const getEnabledColumns = useCallback(() => {
    const enabledWordColumns = settings.word.enabled || settings.meaning.enabled || 
                             settings.wordTranslation.enabled || settings.example.enabled
    const enabledSentenceColumns = settings.sentence.enabled || settings.sentenceTranslation.enabled

    if (enabledWordColumns && enabledSentenceColumns) {
      return [...wordColumns, ...sentenceColumns].filter(col => settings[col].enabled)
    } else if (enabledWordColumns) {
      return wordColumns.filter(col => settings[col].enabled)
    } else if (enabledSentenceColumns) {
      return sentenceColumns.filter(col => settings[col].enabled)
    }
    return []
  }, [settings])

  const getFilteredWords = useCallback(() => {
    const enabledWordColumns = settings.word.enabled || settings.meaning.enabled || 
                             settings.wordTranslation.enabled || settings.example.enabled
    const enabledSentenceColumns = settings.sentence.enabled || settings.sentenceTranslation.enabled

    // Filter words by the current lesson ID
    const currentLessonWords = words.filter(word => word.lesson_id === lessonId)

    const wordsArray = currentLessonWords
      .filter(word => word.type !== 'sentence')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const sentencesArray = currentLessonWords
      .filter(word => word.type === 'sentence')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (enabledWordColumns && !enabledSentenceColumns) {
      return wordsArray;
    } else if (!enabledWordColumns && enabledSentenceColumns) {
      return sentencesArray;
    } else if (enabledWordColumns && enabledSentenceColumns) {
      return [...wordsArray, ...sentencesArray];
    }
    return [];
  }, [words, settings, lessonId]);

  const playNext = useCallback(async () => {
    if (!isPlaying || isSpeaking) return

    const enabledColumns = getEnabledColumns()
    if (enabledColumns.length === 0) return

    const filteredWords = getFilteredWords()
    const currentWord = filteredWords[currentItemIndex]

    if (!currentWord) {
      if (loop) {
        setCurrentItemIndex(0)
        setCurrentColumnIndex(0)
        setCurrentRepetition(1)
      } else {
        setIsPlaying(false)
      }
      return
    }

    const currentColumn = enabledColumns[currentColumnIndex]
    const text = getTextForColumn(currentWord, currentColumn)
    const maxRepetitions = parseInt(settings[currentColumn].repetitions)

    if (text) {
      await speak(text)
      
      if (currentRepetition < maxRepetitions) {
        setCurrentRepetition(prev => prev + 1)
      } else {
        setCurrentRepetition(1)
        if (currentColumnIndex < enabledColumns.length - 1) {
          setCurrentColumnIndex(prev => prev + 1)
        } else {
          setCurrentColumnIndex(0)
          setCurrentItemIndex(prev => prev + 1)
        }
      }
    } else {
      if (currentColumnIndex < enabledColumns.length - 1) {
        setCurrentColumnIndex(prev => prev + 1)
      } else {
        setCurrentColumnIndex(0)
        setCurrentItemIndex(prev => prev + 1)
      }
    }
  }, [isPlaying, isSpeaking, currentItemIndex, currentColumnIndex, currentRepetition, settings, loop, speak, getEnabledColumns, getFilteredWords])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const runPlayback = () => {
      if (isPlaying && !isSpeaking) {
        timeoutId = setTimeout(() => {
          playNext()
        }, 100)
      }
    }

    runPlayback()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isPlaying, isSpeaking, playNext])

  const handlePlay = () => {
    if (!speechSynthesis) {
      toast({
        title: "Text-to-Speech not available",
        description: "Your browser doesn't support text-to-speech functionality.",
        variant: "destructive"
      })
      return
    }
    
    setIsPlaying(!isPlaying)
    if (isPlaying) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      setCurrentItemIndex(0)
      setCurrentColumnIndex(0)
      setCurrentRepetition(1)
    }
  }

  const updateSettings = (
    column: keyof PlaybackSettings,
    field: keyof ColumnSetting,
    value: boolean | string
  ) => {
    setSettings(prev => ({
      ...prev,
      [column]: {
        ...prev[column],
        [field]: value,
      },
    }))
  }

  const isAnyColumnEnabled = Object.values(settings).some(setting => setting.enabled)

  return (
    <div className="bg-card rounded-lg shadow-sm">
      <Collapsible>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <Button
              variant={isPlaying ? "destructive" : "default"}
              size="sm"
              onClick={handlePlay}
              disabled={!isAnyColumnEnabled || words.length === 0}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span className="ml-2">{isPlaying ? "Stop" : "Play"}</span>
            </Button>

            <Select value={speed} onValueChange={setSpeed}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {speeds.map((speed) => (
                  <SelectItem key={speed.value} value={speed.value}>
                    {speed.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Switch
                checked={loop}
                onCheckedChange={setLoop}
                id="loop"
              />
              <Label htmlFor="loop" className="text-sm">Loop</Label>
            </div>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings2 className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-8">
              {/* Words Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Words</h3>
                <div className="space-y-2">
                  {wordColumns.map((column) => (
                    <div key={column} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={column}
                          checked={settings[column].enabled}
                          onCheckedChange={(checked) => 
                            updateSettings(column, 'enabled', !!checked)
                          }
                        />
                        <Label htmlFor={column} className="text-sm">
                          {column.charAt(0).toUpperCase() + column.slice(1)}
                        </Label>
                      </div>
                      <Select
                        value={settings[column].repetitions}
                        onValueChange={(value) => 
                          updateSettings(column, 'repetitions', value)
                        }
                        disabled={!settings[column].enabled}
                      >
                        <SelectTrigger className="w-[60px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 5 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}x
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentences Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Sentences</h3>
                <div className="space-y-2">
                  {sentenceColumns.map((column) => (
                    <div key={column} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={column}
                          checked={settings[column].enabled}
                          onCheckedChange={(checked) => 
                            updateSettings(column, 'enabled', !!checked)
                          }
                        />
                        <Label htmlFor={column} className="text-sm">
                          {column.charAt(0).toUpperCase() + column.slice(1)}
                        </Label>
                      </div>
                      <Select
                        value={settings[column].repetitions}
                        onValueChange={(value) => 
                          updateSettings(column, 'repetitions', value)
                        }
                        disabled={!settings[column].enabled}
                      >
                        <SelectTrigger className="w-[60px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 5 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}x
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}