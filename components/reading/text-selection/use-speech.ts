'use client'

import { useState, useEffect, useCallback } from 'react'

export function useSpeech() {
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSynthesis(window.speechSynthesis)
    }
  }, [])

  const speak = useCallback((text: string, times: number = 1) => {
    if (!speechSynthesis) return
    speechSynthesis.cancel()
    Array.from({ length: times }).forEach(() => {
      const utterance = new SpeechSynthesisUtterance(text)
      speechSynthesis.speak(utterance)
    })
  }, [speechSynthesis])

  return { speak }
}