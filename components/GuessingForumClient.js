'use client'

import { useState, useRef } from "react";
import {
  createGuessPost,
  deleteGuessPost,
  getGuessingForumPage
} from "@/app/actions/guessing";
import GuessingWarning from "@/components/GuessingWarning";

export default function GuessingForumClient({
  user,
  isAdmin,
  canPost,
  posts: initialPosts,
  nextCursor: initialCursor,
  hasMore: initialHasMore,
  totalPosts,
  totalPages
}) {
  const [guessText, setGuessText] = useState("");
const [quotingPost, setQuotingPost] = useState(null);
const [loading, setLoading] = useState(false);
const [showOriginalPosts, setShowOriginalPosts] = useState(true);

const [posts, setPosts] = useState(initialPosts || []);

const [currentPage, setCurrentPage] = useState(1);

const [pageCursors, setPageCursors] = useState({
  1: null
});

const [pageNextCursors, setPageNextCursors] = useState({
  1: initialCursor || null
});

const [loadingPage, setLoadingPage] = useState(false);

const postFormRef = useRef(null);

  const loadPage = async (pageNumber) => {
  if (
    loadingPage ||
    pageNumber < 1 ||
    pageNumber > totalPages ||
    pageNumber === currentPage
  ) {
    return;
  }

  const cursor = pageCursors[pageNumber];

  // Agar target page ka cursor abhi known nahi hai,
  // pehle sequentially pages load karne padenge.
  if (pageNumber > 1 && !cursor) {
    return;
  }

  setLoadingPage(true);

  try {
    const result = await getGuessingForumPage(
      cursor
    );

    if (result?.error) {
      alert(
        "Failed to load page: " +
        result.error
      );
      return;
    }

    const newPosts = result.posts || [];

    setPosts(newPosts);

    setCurrentPage(pageNumber);

    setPageNextCursors((prev) => ({
      ...prev,
      [pageNumber]:
        result.nextCursor || null
    }));

    // Next page ka cursor save karo.
    if (result.nextCursor) {
      setPageCursors((prev) => ({
        ...prev,
        [pageNumber + 1]:
          result.nextCursor
      }));
    }
  } catch (error) {
    console.error(
      "loadPage error:",
      error
    );

    alert("Failed to load page.");
  } finally {
    setLoadingPage(false);
  }
};

  const getPageNumbers = () => {
  const pages = [];

  const maxVisible = 7;

  if (totalPages <= maxVisible) {
    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {
      pages.push(i);
    }

    return pages;
  }

  pages.push(1);

  let start = Math.max(
    2,
    currentPage - 2
  );

  let end = Math.min(
    totalPages - 1,
    currentPage + 2
  );

  if (start > 2) {
    pages.push("...");
  }

  for (
    let i = start;
    i <= end;
    i++
  ) {
    pages.push(i);
  }

  if (end < totalPages - 1) {
    pages.push("...");
  }

  pages.push(totalPages);

  return pages;
};

  const handlePostGuess = async (e) => {
    e.preventDefault();
    if (!guessText.trim() || !canPost) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("guessText", guessText);
    if (quotingPost) {
      formData.append("quotingPost", JSON.stringify(quotingPost));
    }

    const res = await createGuessPost(formData);
    setLoading(false);

    if (res?.error) {
      alert("Error: " + res.error);
    } else {
      setGuessText("");
      setQuotingPost(null);
    }
  };

  const handleDelete = async (postId) => {
    if (!isAdmin || !postId) return;
    if (!window.confirm("Kya aap is post ko permanently delete karna chahte hain?")) return;

    const res = await deleteGuessPost(postId);
    if (res?.error) {
      alert("Delete failed: " + res.error);
    }
  };

  const formatTimestamp = (dateIsoStr) => {
    if (!dateIsoStr) return "Just now";
    const date = new Date(dateIsoStr);
    if (isNaN(date.getTime())) return "Just now";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });

  return (
    <div className="w-full mt-2 bg-white font-sans text-sm">
      <div className="bg-yellow-400 text-black text-center py-2 font-black text-sm border-b border-orange-400 uppercase tracking-wider">
        * GUESSING FORUM *
      </div>
  <GuessingWarning />

      {canPost ? (
        <form ref={postFormRef} onSubmit={handlePostGuess} className="p-2 bg-gray-100 border-b border-orange-400">
          {quotingPost && (
            <div className="mb-2 p-2 bg-[#00ffff] border border-orange-400 text-xs font-semibold text-black text-center max-h-48 overflow-y-auto">
              {quotingPost.quotes && [...quotingPost.quotes].reverse().map((q, idx) => (
                <div key={idx} className="text-red-600 font-bold italic text-xs mb-1">
                  Originally Posted By: <span className="uppercase">{q.username}</span>
                  <div>{q.text}</div>
                </div>
              ))}
              <div className="text-red-600 font-bold italic text-xs mt-2">
                Originally Posted By: <span className="uppercase">{quotingPost.username}</span>
                <div>{quotingPost.guess}</div>
              </div>
              <button 
                type="button" 
                onClick={() => setQuotingPost(null)}
                className="text-red-700 font-bold text-[10px] mt-2 underline block mx-auto cursor-pointer"
              >
                Cancel Quote
              </button>
            </div>
          )}

          <textarea
            rows="10"
            placeholder={quotingPost ? "Write your reply/quote..." : "Enter your guessing numbers & text here..."}
            value={guessText}
            onChange={(e) => setGuessText(e.target.value)}
            className="w-full min-h-[130px] md:min-h-[160px] border p-2 text-xs font-bold rounded outline-none text-black bg-white"
            required
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-[10px] font-bold text-green-700">
              Guesser Name: <span className="text-blue-900 uppercase">{user?.username || "USER"}</span>
            </span>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-1 rounded border border-black shadow cursor-pointer"
            >
              {loading ? "Posting..." : quotingPost ? "Post Quote" : "Post Guess"}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3 bg-yellow-50 text-center border-b border-orange-400 text-xs text-yellow-900 font-bold">
          {user ? "🔒 Account deactivated or missing posting permissions." : "⚠️ Please login to post or quote in the forum."}
        </div>
      )}

      <div className="bg-white py-2 px-4 pt-4 mt-2 flex justify-between items-center text-xs font-bold text-black border-b-2 border-t-2 border-l-2 border-r-2 border-red-400 [border-style:groove]">
        <span>Show Original Posts</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={showOriginalPosts} 
            onChange={(e) => setShowOriginalPosts(e.target.checked)} 
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
        </label>
      </div>

      <div className="p-0 pt-6 space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-600 font-semibold bg-white border border-orange-400">
            No posts available in the forum.
          </div>
        ) : (
          posts
            .filter((post) => showOriginalPosts || !post.quotes?.length)
            .map((post) => {
              const hasQuotes = post.quotes && post.quotes.length > 0;
              return (
                <div key={post.id} className="w-full bg-white border-[3px] border-orange-400 shadow-sm [border-style:groove]">
                  <div className="grid grid-cols-2 border-b-2 border-orange-400 text-xs font-bold [border-style:groove]">
                    <div className="bg-[#00b000] text-[#ffff00] py-1.5 px-2 flex items-center justify-start text-sm border-r-2 border-orange-400 [border-style:groove]">
                      {formatTimestamp(post.createdAt)}
                    </div>
                    <div className="bg-white text-[#cc0000] py-1.5 px-2 flex items-center justify-center text-sm font-extrabold underline uppercase">
                      {post.username || "USER"}
                    </div>
                  </div>

                  <div className="bg-white px-1 pt-8 pb-3 text-center">
                    {showOriginalPosts && hasQuotes && (
                      <div className="bg-[#00ffff] w-full p-4 mb-3 text-center">
                        {post.quotes.map((q, idx) => (
                          <div key={`user-${idx}`} className="text-[#ff0000] italic text-sm my-1 font-semibold">
                            Originally Posted By: <span className="uppercase">{q.username}</span>
                          </div>
                        ))}
                        <div className="mt-4">
                          {[...post.quotes].reverse().map((q, idx) => (
                            <div key={`text-${idx}`} className="text-[#ff0000] text-sm italic whitespace-pre-wrap leading-relaxed font-semibold">
                              {q.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="w-full py-2 px-1 flex justify-center items-center">
                      <div className="text-black text-sm whitespace-pre-wrap leading-relaxed text-center inline-block font-semibold">
                        {post.guess}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 text-xs font-bold border-t border-b border-orange-400 [border-style:groove]">
                    <div className="bg-[#000080] text-yellow-300 py-1.5 px-2 text-sm flex items-center justify-start border-r border-orange-400 [border-style:groove]">
                      Google Chrome
                    </div>
                    <div className="bg-[#00b000] text-white py-1.5 px-2 text-sm flex items-center justify-between">
                      <a href="/" className="hover:underline">[ HOME ]</a>
                      {canPost && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuotingPost(post);
                            setTimeout(() => {
                              postFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }, 100);
                          }}
                          className="text-white text-sm font-bold hover:underline cursor-pointer"
                        >
                          [ QUOTE ]
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 text-xs font-bold">
                    <div className="col-span-6 bg-[#00b000] text-white py-1.5 px-2 text-sm flex items-center justify-between border-r border-orange-400 [border-style:groove]">
                      <a href="/" className="hover:underline">My Profile</a>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id)}
                          className="text-white text-sm font-bold hover:underline cursor-pointer"
                        >
                          [ DELETE ]
                        </button>
                      )}
                    </div>
                    <div onClick={scrollToTop} className="col-span-3 bg-[#000080] text-yellow-300 py-1.5 px-2 text-sm flex items-center justify-center border-r border-orange-400 cursor-pointer hover:underline">
                      GoTop
                    </div>
                    <div onClick={scrollToBottom} className="col-span-3 bg-[#000080] text-yellow-300 py-1.5 px-2 text-sm flex items-center justify-end pr-3 cursor-pointer hover:underline">
                      Bottom
                    </div>
                  </div>
                </div>
              );
            })
        )}

<div className="flex flex-wrap items-center justify-center gap-1 py-5 px-2 bg-white border-t-2 border-orange-400">

  <button
    type="button"
    disabled={
      currentPage === 1 ||
      loadingPage
    }
    onClick={() =>
      loadPage(currentPage - 1)
    }
    className="px-3 py-1 bg-gray-200 border border-black font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-300"
  >
    [PREV]
  </button>

  {getPageNumbers().map(
    (page, index) =>
      page === "..." ? (
        <span
          key={`dots-${index}`}
          className="px-1 font-bold text-xs"
        >
          ...
        </span>
      ) : (
        <button
          key={page}
          type="button"
          disabled={loadingPage}
          onClick={() =>
            loadPage(page)
          }
          className={`min-w-[30px] px-2 py-1 border border-black font-bold text-xs ${
            currentPage === page
              ? "bg-red-600 text-white"
              : "bg-white text-black hover:bg-yellow-300"
          }`}
        >
          [{page}]
        </button>
      )
  )}

  <button
    type="button"
    disabled={
      currentPage === totalPages ||
      loadingPage
    }
    onClick={() =>
      loadPage(currentPage + 1)
    }
    className="px-3 py-1 bg-gray-200 border border-black font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-300"
  >
    [NEXT]
  </button>

</div>
      
      </div>
    </div>
  );
    }
