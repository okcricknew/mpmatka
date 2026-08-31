// 'use server'

import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth-session";
import { isUserAdmin } from "@/utils/admins";

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

// NEW: Server action to fetch paginated posts
export async function fetchGuessPosts(page = 1, limit = 10) {
  try {
    const pageNum = Math.max(1, parseInt(page, 10));
    const skip = (pageNum - 1) * limit;

    const snapshot = await db.collection("guessing_posts")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(skip)
      .get();

    const posts = snapshot.docs.map((doc) => {
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

    const totalSnapshot = await db.collection("guessing_posts").count().get();
    const totalPosts = totalSnapshot.data().count;
    const totalPages = Math.ceil(totalPosts / limit) || 1;

    return {
      posts,
      totalPages,
      currentPage: pageNum,
    };
  } catch (err) {
    console.error("fetchGuessPosts error:", err);
    return { posts: [], totalPages: 1, currentPage: 1, error: err.message };
  }
}

export async function createGuessPost(formData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const isAdmin = Boolean(isUserAdmin(user.mobile) || user.is_admin === true);
    const isApproved = user.is_approved === true || user.is_approved === "true";

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

    await db.collection("guessing_posts").add({
      userId: user.uid,
      username: user.username || "USER",
      guess: guessText,
      parsedData: structuredData,
      quotes: updatedQuotes,
      createdAt: new Date()
    });

    revalidatePath("/guessing-forum");
    return { success: true };
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
