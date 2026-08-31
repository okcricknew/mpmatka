import { getCurrentUser } from "@/lib/auth-session";
import { isUserAdmin } from "@/utils/admins";
import GuessingForumClient from "./GuessingForumClient";
import { fetchGuessPosts } from "@/app/actions/guessing";

export default async function GuessingForum({ searchParams }) {
  const user = await getCurrentUser();

  const isAdmin = user ? Boolean(isUserAdmin(user.mobile) || user.is_admin === true) : false;
  const isApproved = user?.is_approved === true || user?.is_approved === "true";
  const canPost = Boolean(user && (isAdmin || isApproved));

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const limit = 10;

  let posts = [];
  let totalPages = 1;
  let currentPage = 1;

  try {
    const result = await fetchGuessPosts(page, limit);
    posts = result.posts || [];
    totalPages = result.totalPages || 1;
    currentPage = result.currentPage || 1;
  } catch (error) {
    console.error("Firestore SSR Pagination Error in GuessingForum:", error);
  }

  return (
    <GuessingForumClient
      user={user}
      isAdmin={isAdmin}
      canPost={canPost}
      posts={posts}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  );
}
