import { NewThingsClient } from '@/components/new-things/new-things-client'

export default function NewThingsPage({ params }: { params: { id: string } }) {
  return <NewThingsClient params={params} />
}