'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Customize your reading experience
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select defaultValue="inter">
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="roboto">Roboto</SelectItem>
                <SelectItem value="opensans">Open Sans</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Font Size</Label>
            <Slider defaultValue={[16]} max={24} min={12} step={1} />
          </div>

          <div className="space-y-2">
            <Label>Line Height</Label>
            <Slider defaultValue={[1.5]} max={2} min={1} step={0.1} />
          </div>

          <div className="space-y-2">
            <Label>Layout</Label>
            <Select defaultValue="7-3">
              <SelectTrigger>
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7-3">70% / 30%</SelectItem>
                <SelectItem value="5-5">50% / 50%</SelectItem>
                <SelectItem value="drag">Draggable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}