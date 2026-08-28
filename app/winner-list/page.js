import { db } from "@/lib/firebase-admin";
import WinnerListClient from "@/components/WinnerListClient";

export const revalidate = 0; // Fresh data har request par

async function getSSRData() {
  try {
    const postsSnap = await db.collection("guessing_posts").get();
    const posts = [];
    postsSnap.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
      });
    });

    const marketsSnap = await db.collection("market_results").get();
    const markets = [];
    marketsSnap.forEach((doc) => {
      markets.push({ id: doc.id, ...doc.data() });
    });

    return { posts, markets };
  } catch (error) {
    console.error("SSR Fetch Error:", error);
    return { posts: [], markets: [] };
  }
}

export default async function WinnerListPage() {
  const { posts, markets } = await getSSRData();

  return (
    <main className="w-full min-h-screen bg-gray-100 p-2">
      <WinnerListClient initialPosts={posts} initialMarkets={markets} />
    </main>
  );
}

