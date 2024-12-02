'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { useSectionStore } from '@/lib/store/section-store'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft } from 'lucide-react'

export default function SectionSharingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const { sections, updateSection } = useSectionStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const section = sections.find(s => s.id === params.id)

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.is_admin) {
      router.push('/')
    }
  }, [user, router])

  if (!user?.is_admin) {
    return null
  }

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p>Section not found.</p>
          <Button onClick={() => router.push('/admin')}>
            Return to Admin Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const handleShareToggle = async (checked: boolean) => {
    try {
      setIsLoading(true)
      await updateSection(section.id, {
        is_shared: checked,
        shared_by: checked ? user.id : null
      })
      toast({
        title: 'Success',
        description: `Section ${checked ? 'shared' : 'unshared'} successfully.`,
      })
    } catch (error) {
      console.error('Error updating section:', error)
      toast({
        title: 'Error',
        description: 'Failed to update section sharing status.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Section Sharing</h1>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">{section.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Manage sharing settings for this section
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Share with all users</p>
                  <p className="text-sm text-muted-foreground">
                    Make this section available to all users
                  </p>
                </div>
                <Switch
                  checked={section.is_shared}
                  onCheckedChange={handleShareToggle}
                  disabled={isLoading}
                />
              </div>

              {section.is_shared && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    This section is currently shared with all users.
                    {section.shared_by === user.id && ' You are sharing this section.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 