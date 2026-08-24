import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const apps = getApps();

const firebaseAdminApp =
  apps.length > 0
    ? apps[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Private key ke \n ko properly format karne ke liye regex use karein
          privateKey: process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
            : undefined,
        }),
      });

// Yahan 'db' export karna zaroori hai taaki service file isko match kar sake
export const db = getFirestore(firebaseAdminApp);
