import { getCurrentUser } from "@/lib/auth-session";
import { db } from "@/lib/firebase-admin";
import GuessingForum from "@/components/GuessingForum";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getInitialPosts() {
  try {
    const snapshot = await db
      .collection("guessing_posts")
      .get();

    const posts = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      let timestamp = null;

      if (data.createdAt?.toMillis) {
        timestamp = data.createdAt.toMillis();
      } else if (typeof data.cachedTime === "number") {
        timestamp = data.cachedTime;
      }

      posts.push({
        id: docSnap.id,
        userId: data.userId || "",
        username: data.username || "USER",
        guess: data.guess || "",
        parsedData: data.parsedData || null,
        quotes: Array.isArray(data.quotes)
          ? data.quotes
          : [],
        cachedTime: timestamp || Date.now(),
        createdAt: timestamp,
      });
    });

    posts.sort((a, b) => {
      return (b.cachedTime || 0) - (a.cachedTime || 0);
    });

    return posts;
  } catch (error) {
    console.error("Initial guessing posts error:", error);

    return [];
  }
}

export default async function GuessingForumPage() {
  const user = await getCurrentUser();

  const initialPosts = await getInitialPosts();

  return (
    <main className="w-full max-w-none min-w-0 bg-[#f5f7fb] pb-10 px-1.5 sm:px-4 m-0">
      <div className="w-full max-w-none min-w-0 m-0 mt-2 p-0">
        <GuessingForum
          initialPosts={initialPosts}
          initialUser={user}
        />
      </div>
    </main>
  );
}
