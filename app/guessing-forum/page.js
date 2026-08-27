import { getSSRGuessingPosts } from '@/services/guessingService'
import GuessingForumClient from '@/components/GuessingForumClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return {
    title: 'Guessing Forum - Live Predictions & Results',
    description: 'Live guessing forum for market updates, panna, jodi, and daily predictions.',
    openGraph: {
      title: 'Guessing Forum - Live Predictions',
      description: 'Live guessing forum for market updates, panna, jodi, and daily predictions.',
      type: 'website',
    },
  }
}

export default async function GuessingForumPage() {
  // Direct Server-Side Database Fetching using Repo Admin Firebase Instance
  const initialPosts = await getSSRGuessingPosts()

  return (
    <main className="min-h-screen bg-white">
      <GuessingForumClient initialPosts={initialPosts} />
    </main>
  )
}

