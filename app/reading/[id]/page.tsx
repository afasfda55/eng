'use client'

import { ReadingPageClient } from '@/components/reading/reading-page-client'
import { ReadingSettings } from '@/components/reading/settings'

export default function ReadingPage({ params }: { params: { id: string } }) {
  return <ReadingPageClient params={params} />
}