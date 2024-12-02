'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { Sidebar } from '@/components/sidebar'
import { LessonGrid } from '@/components/lesson-grid'
import { AddLessonDialog } from '@/components/add-lesson-dialog'
import { useAuthStore } from '@/lib/store/auth-store'
import { LoginForm } from '@/components/auth/login-form'

export default function Home() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoginForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">LinguaLeap</h1>
          <div className="flex items-center gap-4">
            <AddLessonDialog />
            <ThemeToggle />
          </div>
        </div>
        <LessonGrid />
      </main>
    </div>
  )
}