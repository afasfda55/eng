'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface DeleteConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  requireTyping?: boolean
}

export function DeleteConfirmation({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  requireTyping = false,
}: DeleteConfirmationProps) {
  const [confirmText, setConfirmText] = useState('')
  const { toast } = useToast()
  const isValid = !requireTyping || confirmText.toLowerCase() === 'delete'

  const handleCopy = () => {
    navigator.clipboard.writeText('Delete')
    toast({
      title: 'Copied to clipboard',
      description: 'The word "Delete" has been copied to your clipboard.',
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {requireTyping && (
          <div className="py-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder='Type "Delete" to confirm'
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title="Copy 'Delete'"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Tip: Click the copy button and paste to quickly enter the confirmation text
            </div>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>No, Keep</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={!isValid}
            className={!isValid ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Yes, Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}