'use server'

import { revalidatePath } from "next/cache";
import { FieldPath, Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth-session";
import { isUserAdmin } from "@/utils/admins";


const GUESSING_PAGE_SIZE = 20;

function serializeGuessPost(doc) {
  const data = doc.data();

  let createdAtIso = new Date().toISOString();

  if (data.createdAt?.toDate) {
    createdAtIso = data.createdAt.toDate().toISOString();
  } else if (data.createdAt instanceof Date) {
    createdAtIso = data.createdAt.toISOString();
  } else if (data.cachedTime) {
    const cachedDate = new Date(data.cachedTime);

    if (!isNaN(cachedDate.getTime())) {
      createdAtIso = cachedDate.toISOString();
    }
  }

  return {
    id: doc.id,
    ...data,
    createdAt: createdAtIso
  };
}

export async function getGuessingForumPage(cursor = null) {
  try {
    let query = db
      .collection("guessing_posts")
      .orderBy("createdAt", "desc")
      .orderBy(FieldPath.documentId(), "desc")
      .limit(GUESSING_PAGE_SIZE + 1);

    if (cursor?.createdAt && cursor?.id) {
      const cursorDate = new Date(cursor.createdAt);

      if (!isNaN(cursorDate.getTime())) {
        query = query.startAfter(
          Timestamp.fromDate(cursorDate),
          cursor.id
        );
      }
    }

    const snapshot = await query.get();

    const hasMore = snapshot.docs.length > GUESSING_PAGE_SIZE;

    const docs = hasMore
      ? snapshot.docs.slice(0, GUESSING_PAGE_SIZE)
      : snapshot.docs;

    const posts = docs.map(serializeGuessPost);

    let nextCursor = null;

    if (hasMore && docs.length > 0) {
      const lastDoc = docs[docs.length - 1];
      const lastData = lastDoc.data();

      if (lastData.createdAt?.toDate) {
        nextCursor = {
          id: lastDoc.id,
          createdAt: lastData.createdAt.toDate().toISOString()
        };
      } else if (lastData.createdAt instanceof Date) {
        nextCursor = {
          id: lastDoc.id,
          createdAt: lastData.createdAt.toISOString()
        };
      }
    }

    // Exact total document count
    const countSnapshot = await db
      .collection("guessing_posts")
      .count()
      .get();

    const totalPosts = Number(
      countSnapshot.data().count || 0
    );

    const totalPages = Math.max(
      1,
      Math.ceil(totalPosts / GUESSING_PAGE_SIZE)
    );

    return {
      posts,
      nextCursor,
      hasMore,
      totalPosts,
      totalPages
    };
  } catch (error) {
    console.error(
      "getGuessingForumPage error:",
      error
    );

    return {
      posts: [],
      nextCursor: null,
      hasMore: false,
      totalPosts: 0,
      totalPages: 1,
      error: error.message
    };
  }
}
// Advanced Strict Panna & Jodi-to-Ank Parser (Server-side)
function parseGuessText(text) {
  const normalizedText = text.replace(/__+/g, ' ');
  const lines = normalizedText.split('\n').map(l => l.trim()).filter(Boolean);
  
  let market = 'GENERAL';
  let currentSession = 'OPEN';
  let pannas = [];
  let jodi = [];
  let openAnks = [];
  let closeAnks = [];

  lines.forEach((line, index) => {
    const upperLine = line.toUpperCase();

    if (upperLine.includes('CLOSE') || upperLine.includes('CLO') || upperLine.includes(' C ')) {
      currentSession = 'CLOSE';
    } else if (upperLine.includes('OPEN') || upperLine.includes('OPN') || upperLine.includes(' O ')) {
      currentSession = 'OPEN';
    }

    if (index === 0 && !/^\d+$/.test(line)) {
      const cleanedMarket = upperLine.replace(/OPEN|CLOSE/gi, '').trim();
      if (cleanedMarket) market = cleanedMarket;
    }

    const separatorMatches = line.match(/\b\d{3}\b\s*[^0-9\s]+\s*\d\b/g);
    if (separatorMatches) {
  separatorMatches.forEach(sm => {
    const parts = sm.match(/\d+/g);

    if (parts && parts.length === 2) {
      const pannaVal = parts[0];
      const singleVal = parts[1];

      if (!/^(\d)\1{2}$/.test(pannaVal)) {
        pannas.push(pannaVal);
      }

      if (currentSession === 'OPEN') {
        openAnks.push(singleVal);
      } else {
        closeAnks.push(singleVal);
      }
    }
  });
    }

    const foundPannas = line.match(/\b\d{3}\b/g);
    if (foundPannas) {
      foundPannas.forEach(p => {
        const isAllSame = /^(\d)\1{2}$/.test(p);
        if (!isAllSame) {
          pannas.push(p);
        } else {
          if (currentSession === 'OPEN') openAnks.push(p[0]);
          else closeAnks.push(p[0]);
        }
      });
    }

    const foundJodis = line.match(/\b\d{2}\b/g);
    if (foundJodis) {
      foundJodis.forEach(j => {
        jodi.push(j);
        const firstDigit = j[0];
        if (currentSession === 'OPEN') openAnks.push(firstDigit);
        else closeAnks.push(firstDigit);
      });
    }

    const cleanNums = line.replace(/[^0-9\s]/g, '').trim();
    if (cleanNums && !line.includes('-') && line !== market && !upperLine.includes('OPEN') && !upperLine.includes('CLOSE')) {
      const parts = cleanNums.split(/\s+/);
      parts.forEach(part => {
        if (part.length === 1 || (part.length >= 3 && /^(\d)\1+$/.test(part))) {
          const singleVal = part[0];
          if (currentSession === 'OPEN') openAnks.push(singleVal);
          else closeAnks.push(singleVal);
        }
      });
    }
  });

  return {
    market,
    session: currentSession,
    pannas: [...new Set(pannas)],
    openAnks: [...new Set(openAnks)],
    closeAnks: [...new Set(closeAnks)],
    jodi: [...new Set(jodi)]
  };
}

export async function createGuessPost(formData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const isAdmin = Boolean(isUserAdmin(user.mobile) || user.is_admin === true);
    const isApproved = user.is_approved === true || user.is_approved === "true";

    // UPDATED PERMISSION LOGIC:
    // User admin ho YA active (is_approved: true) ho, post kar sakta hai.
    if (!isAdmin && !isApproved) {
      throw new Error("Posting permission denied. Your account is deactivated.");
    }

    const guessText = formData.get("guessText");
    const quotingPostRaw = formData.get("quotingPost");
    
    if (!guessText || !guessText.trim()) return;

    let updatedQuotes = [];
    if (quotingPostRaw) {
      const quotingPost = JSON.parse(quotingPostRaw);
      const previousQuotes = quotingPost.quotes || [];
      updatedQuotes = [
        { username: quotingPost.username, text: quotingPost.guess },
        ...previousQuotes
      ];
    }

    const structuredData = parseGuessText(guessText);

    const newPostRef = await db.collection("guessing_posts").add({
  userId: user.uid,
  username: user.username || "USER",
  guess: guessText,
  parsedData: structuredData,
  quotes: updatedQuotes,
  createdAt: new Date()
});

revalidatePath("/guessing-forum");

// New post save hone ke baad Page 1 dobara fetch karo
const firstPageResult = await getGuessingForumPage(null);

return {
  success: true,
  firstPage: firstPageResult
};
  } catch (err) {
    console.error("createGuessPost error:", err);
    return { error: err.message };
  }
}

export async function deleteGuessPost(postId) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const isAdmin = Boolean(isUserAdmin(user.mobile) || user.is_admin === true);
    if (!isAdmin) throw new Error("Admin privilege required");

    await db.collection("guessing_posts").doc(postId).delete();
    revalidatePath("/guessing-forum");
    return { success: true };
  } catch (err) {
    console.error("deleteGuessPost error:", err);
    return { error: err.message };
  }
}
