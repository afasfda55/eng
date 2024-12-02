'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/auth-store'
import { useLessonStore } from '@/lib/store/lesson-store'
import { useSectionStore } from '@/lib/store/section-store'
import { useWordStore } from '@/lib/store/word-store'
import { useToast } from '@/components/ui/use-toast'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkSession, loading, user } = useAuthStore()
  const { fetchLessons } = useLessonStore()
  const { fetchSections } = useSectionStore()
  const { fetchWords } = useWordStore()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeData = async () => {
      try {
        await checkSession()
        const { user } = useAuthStore.getState()
        if (user) {
          await Promise.all([
            fetchLessons(),
            fetchSections(),
            fetchWords(),
          ]).catch((error) => {
            console.error('Error fetching data:', error)
            toast({
              title: 'Error',
              description: 'Failed to load application data. Please refresh the page.',
              variant: 'destructive',
            })
          })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setError('Failed to initialize application. Please refresh the page.')
        toast({
          title: 'Error',
          description: 'Failed to initialize application.',
          variant: 'destructive',
        })
      }
    }
    
    initializeData()
  }, [checkSession, fetchLessons, fetchSections, fetchWords, toast])

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchLessons(),
        fetchSections(),
        fetchWords(),
      ]).catch((error) => {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load application data.',
          variant: 'destructive',
        })
      })
    }
  }, [user, fetchLessons, fetchSections, fetchWords, toast])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}