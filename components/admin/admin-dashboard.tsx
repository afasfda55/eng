'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { useSectionStore } from '@/lib/store/section-store'
import { useLessonStore } from '@/lib/store/lesson-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Plus, Share2 } from 'lucide-react'

export function AdminDashboard() {
  const router = useRouter()
  const { user, loading: isAuthLoading } = useAuthStore()
  const { sections, addSection, updateSection } = useSectionStore()
  const { lessons } = useLessonStore()
  const { toast } = useToast()
  const [showAddSection, setShowAddSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch sections on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await useSectionStore.getState().fetchSections()
      } catch (error) {
        console.error('Error fetching sections:', error)
        setError('Failed to load sections. Please try refreshing the page.')
        toast({
          title: 'Error',
          description: 'Failed to load sections.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [toast])

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthLoading && user && !user.is_admin) {
      router.push('/')
    }
  }, [user, router, isAuthLoading])

  // Show loading state while auth is being checked
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry Loading
          </Button>
        </div>
      </div>
    )
  }

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    )
  }

  // Check for admin access
  if (!user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p>You do not have permission to access this page.</p>
          <Button onClick={() => router.push('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  const handleAddSection = async () => {
    if (!newSectionName.trim()) return

    try {
      await addSection(newSectionName.trim(), 'book', true)
      setNewSectionName('')
      setShowAddSection(false)
      toast({
        title: 'Success',
        description: 'Shared section created successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create shared section.',
        variant: 'destructive',
      })
    }
  }

  const toggleSectionSharing = async (sectionId: string, isShared: boolean) => {
    try {
      await updateSection(sectionId, { is_shared: isShared })
      toast({
        title: 'Success',
        description: `Section ${isShared ? 'shared' : 'unshared'} successfully.`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update section sharing status.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shared Section
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Shared Section</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Section Name</Label>
                    <Input
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="Enter section name"
                    />
                  </div>
                  <Button onClick={handleAddSection} className="w-full">
                    Create Shared Section
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section Name</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Shared</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium">{section.name}</TableCell>
                    <TableCell>
                      {lessons.filter((l) => l.section_id === section.id).length}
                    </TableCell>
                    <TableCell>
                      {section.shared_by ? 'Admin' : 'User'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={section.is_shared}
                        onCheckedChange={(checked) =>
                          toggleSectionSharing(section.id, checked)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/sections/${section.id}`)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  )
} 