'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Settings2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ReadingSettings {
  isRTL: boolean
  setRTL: (value: boolean) => void
}

export const useReadingSettings = create<ReadingSettings>()(
  persist(
    (set) => ({
      isRTL: false,
      setRTL: (value) => set({ isRTL: value }),
    }),
    {
      name: 'reading-settings',
    }
  )
)

export function ReadingSettings() {
  const [open, setOpen] = useState(false)
  const { isRTL, setRTL } = useReadingSettings()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Reading Settings</SheetTitle>
          <SheetDescription>
            Customize your reading experience
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="rtl-mode" className="flex flex-col space-y-1">
              <span>RTL Text Direction</span>
              <span className="font-normal text-sm text-muted-foreground">
                Enable right-to-left text direction for Arabic, Hebrew, etc.
              </span>
            </Label>
            <Switch
              id="rtl-mode"
              checked={isRTL}
              onCheckedChange={setRTL}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 