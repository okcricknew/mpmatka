// lib/firebase-admin.js

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const apps = getApps();

const firebaseAdminApp =
  apps.length > 0
    ? apps[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
            : undefined,
        }),
      });

export const db = getFirestore(firebaseAdminApp);
export const adminAuth = getAuth(firebaseAdminApp);
