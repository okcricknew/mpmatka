import { db } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth-session";
import { isUserAdmin } from "@/utils/admins";
import GuessingForumClient from "./GuessingForumClient";

export default async function GuessingForum() {
  const user = await getCurrentUser();

  const isAdmin = user ? (isUserAdmin(user.mobile) || user.is_admin === true) : false;

  const canPost = Boolean(
    user &&
    user.is_approved &&
    (user.permissions?.market_update === true || user.permissions?.add_results === true)
  );

  let posts = [];
  try {
    const snapshot = await db
      .collection("guessing_posts")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    posts = snapshot.docs.map((doc) => {
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
    console.error("Firestore SSR Error in GuessingForum:", error);
  }

  return (
    <GuessingForumClient
      user={user}
      isAdmin={isAdmin}
      canPost={canPost}
      posts={posts}
    />
  );
}

