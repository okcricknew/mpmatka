import { db } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth-session";
import { isUserAdmin } from "@/utils/admins";
import GuessingForumClient from "./GuessingForumClient";

export default async function GuessingForum() {
  const user = await getCurrentUser();

  // Admin Check
  const isAdmin = user ? Boolean(isUserAdmin(user.mobile) || user.is_admin === true) : false;

  // Simple Approved Check: String "true" ya Boolean true dono ko handle karega
  const isApproved = user?.is_approved === true || user?.is_approved === "true";

  // UPDATED LOGIC: Sirf active (is_approved) ya Admin hone par posting allowed hai
  const canPost = Boolean(user && (isAdmin || isApproved));

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
