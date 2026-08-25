import GuessingForum from '../../components/GuessingForum';
import { db } from '../../lib/firebase-admin'; // Aapka Firebase Admin SDK config

async function getInitialPosts() {
  try {
    const snapshot = await db.collection('guessing_posts').get();
    const posts = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Handle Firestore Timestamp to milliseconds for SSR safely
      let millis = null;
      if (data.createdAt && typeof data.createdAt.toMillis === 'function') {
        millis = data.createdAt.toMillis();
      } else if (data.createdAt && data.createdAt._seconds) {
        millis = data.createdAt._seconds * 1000;
      }

      posts.push({
        id: docSnap.id,
        ...data,
        createdAt: millis ? { toMillis: () => millis } : null
      });
    });

    return posts.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.cachedTime || Date.now());
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.cachedTime || Date.now());
      return timeB - timeA;
    });
  } catch (e) {
    console.error("Error fetching initial posts in SSR:", e);
    return [];
  }
}

export default async function Page() {
  const initialPosts = await getInitialPosts();
  return <GuessingForum initialPosts={initialPosts} />;
}
