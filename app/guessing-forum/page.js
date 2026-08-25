'use client'

import dynamic from 'next/dynamic'

// SSR ko disable karke direct browser (client) par load karne ke liye
const GuessingForum = dynamic(() => import('../../components/GuessingForum'), {
  ssr: false,
  loading: () => (
    <div className="text-center py-10 font-bold text-xs text-gray-600 bg-white">
      Loading Guessing Forum...
    </div>
  ),
})

export default function Page() {
  return <GuessingForum initialPosts={[]} />
}
