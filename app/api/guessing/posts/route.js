import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebase-admin";
import { getCurrentUser } from "../../../../../lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLLECTION_NAME = "guessing_posts";

/**
 * Convert Firestore post into safe JSON.
 */
function serializePost(docSnap) {
  const data = docSnap.data();

  let createdAt = null;

  if (data.createdAt?.toMillis) {
    createdAt = data.createdAt.toMillis();
  } else if (typeof data.cachedTime === "number") {
    createdAt = data.cachedTime;
  }

  return {
    id: docSnap.id,
    userId: data.userId || "",
    username: data.username || "USER",
    guess: data.guess || "",
    parsedData: data.parsedData || null,
    quotes: Array.isArray(data.quotes) ? data.quotes : [],
    cachedTime: createdAt || Date.now(),
    createdAt: createdAt,
  };
}

/**
 * GET
 *
 * Used by client if needed.
 */
export async function GET() {
  try {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .get();

    const posts = [];

    snapshot.forEach((docSnap) => {
      posts.push(serializePost(docSnap));
    });

    posts.sort((a, b) => {
      return (b.cachedTime || 0) - (a.cachedTime || 0);
    });

    return NextResponse.json(
      {
        success: true,
        posts,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Guessing posts GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load posts",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST
 *
 * ONLY ACTIVE / APPROVED USER CAN POST.
 */
export async function POST(request) {
  try {
    // -----------------------------------
    // SERVER-SIDE SESSION CHECK
    // -----------------------------------

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Login required or account is not active.",
        },
        {
          status: 401,
        }
      );
    }

    // -----------------------------------
    // REQUEST DATA
    // -----------------------------------

    const body = await request.json();

    const guess = String(body.guess || "").trim();

    if (!guess) {
      return NextResponse.json(
        {
          success: false,
          error: "Guess text is required.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------
    // QUOTES
    // -----------------------------------

    const quotes = Array.isArray(body.quotes)
      ? body.quotes
          .slice(0, 20)
          .map((quote) => ({
            username: String(quote?.username || "USER"),
            text: String(quote?.text || ""),
          }))
          .filter((quote) => quote.text.trim())
      : [];

    // -----------------------------------
    // PARSED DATA
    // -----------------------------------

    const parsedData =
      body.parsedData && typeof body.parsedData === "object"
        ? body.parsedData
        : {
            market: "GENERAL",
            session: "OPEN",
            pannas: [],
            openAnks: [],
            closeAnks: [],
            jodi: [],
          };

    // -----------------------------------
    // SERVER-CONTROLLED USER DATA
    // -----------------------------------

    const payload = {
      userId: user.uid,

      // IMPORTANT:
      // Username client se nahi lenge.
      username: user.username || "USER",

      guess,

      parsedData,

      quotes,

      cachedTime: Date.now(),

      createdAt: new Date(),
    };

    // -----------------------------------
    // FIRESTORE
    // -----------------------------------

    const docRef = await db
      .collection(COLLECTION_NAME)
      .add(payload);

    return NextResponse.json(
      {
        success: true,
        post: {
          id: docRef.id,
          userId: payload.userId,
          username: payload.username,
          guess: payload.guess,
          parsedData: payload.parsedData,
          quotes: payload.quotes,
          cachedTime: payload.cachedTime,
          createdAt: payload.cachedTime,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Guessing post POST error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create post",
      },
      {
        status: 500,
      }
    );
  }
  }
