// lib/guessingForumService.js

import { db } from "./firebase-admin";

export async function getInitialGuessingPosts() {
  try {
    const snapshot = await db
      .collection("guessing_posts")
      .get();

    const posts = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      let time = Date.now();

      if (data.createdAt?.toMillis) {
        time = data.createdAt.toMillis();
      } else if (data.cachedTime) {
        time = data.cachedTime;
      }

      posts.push({
        id: docSnap.id,
        ...data,

        // Firestore Timestamp ko
        // serializable number bana rahe hain
        createdAt: time,
        cachedTime: time,
      });
    });

    posts.sort((a, b) => {
      return (
        (b.createdAt || 0) -
        (a.createdAt || 0)
      );
    });

    return posts;
  } catch (error) {
    console.error(
      "Guessing Forum SSR error:",
      error
    );

    return [];
  }
}
