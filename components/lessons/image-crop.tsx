'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Point {
  x: number
  y: number
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

interface ImageCropProps {
  imageUrl: string
  onCrop: (cropArea: CropArea) => void
  imageRef: React.RefObject<HTMLImageElement>
}

export function ImageCrop({ imageUrl, onCrop, imageRef }: ImageCropProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragCorner, setDragCorner] = useState<'tl' | 'tr' | 'bl' | 'br' | 'move' | null>(null)
  const [dragStart, setDragStart] = useState<Point | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (imageRef.current && containerRef.current) {
      const { width, height } = imageRef.current.getBoundingClientRect()
      setCropArea({
        x: width * 0.1,
        y: height * 0.1,
        width: width * 0.8,
        height: height * 0.8,
      })
    }
  }, [imageUrl])

  useEffect(() => {
    onCrop(cropArea)
  }, [cropArea, onCrop])

  const handleMouseDown = (type: 'tl' | 'tr' | 'bl' | 'br' | 'move') => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragCorner(type)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !containerRef.current) return

    e.preventDefault()
    e.stopPropagation()

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    const containerRect = containerRef.current.getBoundingClientRect()

    const newCropArea = { ...cropArea }

    if (dragCorner === 'move') {
      // Move the entire crop area
      newCropArea.x = Math.max(0, Math.min(cropArea.x + dx, containerRect.width - cropArea.width))
      newCropArea.y = Math.max(0, Math.min(cropArea.y + dy, containerRect.height - cropArea.height))
    } else {
      // Resize from corners with minimum size constraints
      const MIN_SIZE = 50
      switch (dragCorner) {
        case 'tl': {
          const maxX = cropArea.x + cropArea.width - MIN_SIZE
          const maxY = cropArea.y + cropArea.height - MIN_SIZE
          const newX = Math.max(0, Math.min(cropArea.x + dx, maxX))
          const newY = Math.max(0, Math.min(cropArea.y + dy, maxY))
          
          newCropArea.width = cropArea.width - (newX - cropArea.x)
          newCropArea.height = cropArea.height - (newY - cropArea.y)
          newCropArea.x = newX
          newCropArea.y = newY
          break
        }
        case 'tr': {
          const maxY = cropArea.y + cropArea.height - MIN_SIZE
          const newY = Math.max(0, Math.min(cropArea.y + dy, maxY))
          const newWidth = Math.max(MIN_SIZE, Math.min(cropArea.width + dx, containerRect.width - cropArea.x))
          
          newCropArea.width = newWidth
          newCropArea.height = cropArea.height - (newY - cropArea.y)
          newCropArea.y = newY
          break
        }
        case 'bl': {
          const maxX = cropArea.x + cropArea.width - MIN_SIZE
          const newX = Math.max(0, Math.min(cropArea.x + dx, maxX))
          const newHeight = Math.max(MIN_SIZE, Math.min(cropArea.height + dy, containerRect.height - cropArea.y))
          
          newCropArea.width = cropArea.width - (newX - cropArea.x)
          newCropArea.height = newHeight
          newCropArea.x = newX
          break
        }
        case 'br': {
          newCropArea.width = Math.max(MIN_SIZE, Math.min(cropArea.width + dx, containerRect.width - cropArea.x))
          newCropArea.height = Math.max(MIN_SIZE, Math.min(cropArea.height + dy, containerRect.height - cropArea.y))
          break
        }
      }
    }

    setCropArea(newCropArea)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setDragCorner(null)
    setDragStart(null)
  }

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Crop"
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
      
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/50">
        {/* Clear overlay in crop area */}
        <div
          className="absolute bg-transparent"
          style={{
            left: cropArea.x,
            top: cropArea.y,
            width: cropArea.width,
            height: cropArea.height,
          }}
        />
      </div>

      {/* Crop area border and handles */}
      <div
        className={cn(
          "absolute border-2 border-white shadow-[0_0_0_1px_black]",
          isDragging && dragCorner === 'move' ? "cursor-grabbing" : "cursor-move",
        )}
        style={{
          left: cropArea.x,
          top: cropArea.y,
          width: cropArea.width,
          height: cropArea.height,
        }}
        onMouseDown={handleMouseDown('move')}
      >
        {/* Guidelines */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border-white/20"
              style={{
                position: 'absolute',
                ...(i < 2
                  ? {
                      left: `${(i + 1) * 33.33}%`,
                      top: 0,
                      width: '1px',
                      height: '100%',
                    }
                  : {
                      top: `${(i - 1) * 33.33}%`,
                      left: 0,
                      height: '1px',
                      width: '100%',
                    }),
              }}
            />
          ))}
        </div>

        {/* Corner handles */}
        <div
          className="absolute w-5 h-5 bg-white border-2 border-black rounded-full cursor-nw-resize -left-2.5 -top-2.5 shadow-lg z-20 hover:scale-110 transition-transform"
          onMouseDown={handleMouseDown('tl')}
        />
        <div
          className="absolute w-5 h-5 bg-white border-2 border-black rounded-full cursor-ne-resize -right-2.5 -top-2.5 shadow-lg z-20 hover:scale-110 transition-transform"
          onMouseDown={handleMouseDown('tr')}
        />
        <div
          className="absolute w-5 h-5 bg-white border-2 border-black rounded-full cursor-sw-resize -left-2.5 -bottom-2.5 shadow-lg z-20 hover:scale-110 transition-transform"
          onMouseDown={handleMouseDown('bl')}
        />
        <div
          className="absolute w-5 h-5 bg-white border-2 border-black rounded-full cursor-se-resize -right-2.5 -bottom-2.5 shadow-lg z-20 hover:scale-110 transition-transform"
          onMouseDown={handleMouseDown('br')}
        />
      </div>
    </div>
  )
} 