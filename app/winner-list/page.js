import { db } from "@/lib/firebase-admin";
import WinnerListClient from "@/components/WinnerListClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WinnerListPage() {
  let initialPosts = [];

  try {
    const snapshot = await db
      .collection("guessing_posts")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    initialPosts = snapshot.docs.map((doc) => {
      const data = doc.data();
      let createdAtIso = new Date().toISOString();

      if (data.createdAt?.toDate) {
        createdAtIso = data.createdAt.toDate().toISOString();
      } else if (data.cachedTime) {
        createdAtIso = new Date(data.cachedTime).toISOString();
      }

      return {
        id: doc.id,
        ...data,
        createdAt: createdAtIso
      };
    });
  } catch (error) {
    console.error("Firestore SSR Error in WinnerListPage:", error);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-2">
      <div className="max-w-xl mx-auto mb-2">
        <a 
          href="/" 
          className="bg-blue-900 text-yellow-300 px-3 py-1 rounded text-xs font-bold inline-block shadow"
        >
          &larr; Back to Home
        </a>
      </div>
      <WinnerListClient initialPosts={initialPosts} />
    </main>
  );
}
