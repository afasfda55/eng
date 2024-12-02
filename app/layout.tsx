import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClientLayout } from '@/components/client-layout'
import { AuthProvider } from '@/components/auth/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LinguaLeap - Language Learning Platform',
  description: 'An immersive platform for language learning and practice',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ClientLayout>
          <AuthProvider>{children}</AuthProvider>
        </ClientLayout>
      </body>
    </html>
  )
}