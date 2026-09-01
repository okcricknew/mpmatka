import { getCurrentUser } from "@/lib/auth-session";
import { isUserAdmin } from "@/utils/admins";
import { getGuessingForumPage } from "@/app/actions/guessing";
import GuessingForumClient from "./GuessingForumClient";

export default async function GuessingForum() {
  const user = await getCurrentUser();

  const isAdmin = user
    ? Boolean(
        isUserAdmin(user.mobile) ||
        user.is_admin === true
      )
    : false;

  const isApproved =
    user?.is_approved === true ||
    user?.is_approved === "true";

  const canPost = Boolean(
    user && (isAdmin || isApproved)
  );

  let forumData = {
    posts: [],
    nextCursor: null,
    hasMore: false,
    totalPosts: 0,
    totalPages: 1
  };

  try {
    forumData = await getGuessingForumPage();
  } catch (error) {
    console.error(
      "Firestore SSR Error in GuessingForum:",
      error
    );
  }

  return (
    <GuessingForumClient
      user={user}
      isAdmin={isAdmin}
      canPost={canPost}
      posts={forumData.posts || []}
      nextCursor={forumData.nextCursor || null}
      hasMore={Boolean(forumData.hasMore)}
      totalPosts={forumData.totalPosts || 0}
      totalPages={forumData.totalPages || 1}
    />
  );
}
