import { adminDb } from '@/lib/firebase-admin'
import { db } from '@/lib/firebase'
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore'

// Server-side fetch (SSR)
export async function getSSRGuessingPosts() {
  try {
    if (!adminDb) return []
    const snapshot = await adminDb
      .collection('guessing_posts')
      .orderBy('createdAt', 'desc')
      .limit(40)
      .get()

    return snapshot.docs.map(docSnap => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        cachedTime: data.createdAt?.toMillis
          ? data.createdAt.toMillis()
          : data.cachedTime || Date.now(),
        createdAt: null // Prevent Next.js SSR serialization errors
      }
    })
  } catch (error) {
    console.error('Error fetching SSR Guessing Posts:', error)
    return []
  }
}

// Client-side real-time listener
export function subscribeGuessingPosts(callback) {
  const q = query(collection(db, 'guessing_posts'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const list = []
    snapshot.forEach(docSnap => {
      const data = docSnap.data()
      list.push({
        id: docSnap.id,
        ...data,
        cachedTime: data.createdAt?.toMillis 
          ? data.createdAt.toMillis() 
          : (data.cachedTime || Date.now())
      })
    })
    callback(list)
  }, (err) => {
    console.error("Firestore subscribe error:", err)
  })
}

// Post creation
export async function createGuessPost(payload) {
  return await addDoc(collection(db, 'guessing_posts'), {
    ...payload,
    createdAt: serverTimestamp()
  })
}

// Post deletion
export async function deleteGuessPost(postId) {
  return await deleteDoc(doc(db, 'guessing_posts', postId))
}

