import GuessingForum from '../../components/GuessingForum';
import { db } from '../../lib/firebase-admin'; // Aapka Firebase Admin SDK config

async function getInitialPosts() {
  try {
    const snapshot = await db.collection('guessing_posts').get();
    const posts = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      posts.push({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt ? { toMillis: () => data.createdAt.toMillis() } : null
      });
    });
    return posts.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.cachedTime || Date.now());
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.cachedTime || Date.now());
      return timeB - timeA;
    });
  } catch (e) {
    return [];
  }
}

export default async function Page() {
  const initialPosts = await getInitialPosts();
  return <GuessingForum initialPosts={initialPosts} />;
}
