'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

export function SignUpForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuthStore()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)
      await signUp(email, password)
      toast({
        title: 'Account created',
        description: 'Please check your email to verify your account.',
      })
      router.push('/')
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
        >
          Sign In
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push('/signup')}
          className="bg-accent"
        >
          Sign Up
        </Button>
      </header>

      <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
          </div>
        </div>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Creating account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </Button>
      </div>
    </>
  )
} 