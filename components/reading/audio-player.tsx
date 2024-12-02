'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioFile, setAudioFile] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAudioFile(url)
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsPlaying((prev) => !prev)
      } else if (e.code === 'ArrowLeft') {
        audioRef.current!.currentTime -= 1.5
      } else if (e.code === 'ArrowRight') {
        audioRef.current!.currentTime += 1.5
      } else if (e.code === 'Digit0' || e.code === 'Numpad0') {
        audioRef.current!.currentTime = 0
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t',
        'p-4 flex items-center justify-center gap-4 z-50'
      )}
    >
      <audio
        ref={audioRef}
        src={audioFile || ''}
        onTimeUpdate={() =>
          setCurrentTime(audioRef.current ? audioRef.current.currentTime : 0)
        }
        onLoadedMetadata={() =>
          setDuration(audioRef.current ? audioRef.current.duration : 0)
        }
      />

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (audioRef.current) audioRef.current.currentTime -= 1.5
          }}
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (audioRef.current) audioRef.current.currentTime += 1.5
          }}
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      <div className="w-[200px]">
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={(value) => {
            if (audioRef.current) audioRef.current.currentTime = value[0]
          }}
        />
      </div>

      <div className="relative">
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          id="audio-upload"
          onChange={handleFileUpload}
        />
        <label htmlFor="audio-upload">
          <Button variant="ghost" size="icon" asChild>
            <span>
              <Upload className="h-5 w-5" />
            </span>
          </Button>
        </label>
      </div>
    </div>
  )
}