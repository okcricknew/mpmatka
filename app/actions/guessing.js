'use server'

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

    const hyphenMatches = line.match(/(\d{3})\s*-\s*(\d{1})/g);
    if (hyphenMatches) {
      hyphenMatches.forEach(hm => {
        const parts = hm.split('-').map(p => p.trim());
        if (parts.length === 2) {
          const pannaVal = parts[0];
          const singleVal = parts[1];
          if (!/^(\d)\1{2}$/.test(pannaVal)) pannas.push(pannaVal);
          if (currentSession === 'OPEN') openAnks.push(singleVal);
          else closeAnks.push(singleVal);
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

    const hasPermission =
      user.permissions?.market_update === true ||
      user.permissions?.add_results === true;

    if (!user.is_approved || !hasPermission) {
      throw new Error("Posting permission denied.");
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

    const isAdmin = isUserAdmin(user.mobile) || user.is_admin;
    if (!isAdmin) throw new Error("Admin privilege required");

    await db.collection("guessing_posts").doc(postId).delete();
    revalidatePath("/guessing-forum");
    return { success: true };
  } catch (err) {
    console.error("deleteGuessPost error:", err);
    return { error: err.message };
  }
      }

