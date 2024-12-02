'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuthStore()
  const { toast } = useToast()

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      await signIn(email, password)
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 p-4 flex justify-end gap-4 bg-background/80 backdrop-blur-sm border-b">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="bg-accent"
        >
          Sign In
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push('/signup')}
        >
          Sign Up
        </Button>
      </header>

      <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center">Welcome to LinguaLeap</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="space-y-4">
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </div>
      </div>
    </>
  )
}