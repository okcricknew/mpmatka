// app/guessing-forum/page.jsx
import { db as adminDb } from '../../lib/firebase-admin'
import GuessingForum from './GuessingForum'

export const metadata = {
  title: 'Guessing Forum - Live Market Updates & Discussions',
  description: 'Join the live guessing forum for daily market updates and discussions.',
}

async function getInitialPosts() {
  try {
    const snapshot = await adminDb
      .collection('guessing_posts')
      .orderBy('createdAt', 'desc')
      .get()

    const posts = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : null,
      })
    })
    return posts
  } catch (error) {
    console.error("Server fetch error:", error)
    return []
  }
}

export default async function Page() {
  const initialPosts = await getInitialPosts()

  return (
    <div className="w-full max-w-4xl mx-auto">
      <GuessingForum initialPosts={initialPosts} />
    </div>
  )
}
