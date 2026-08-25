import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin initialize karein (Vercel env variables se)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request) {
  try {
    const { phone, newPassword } = await request.json();

    if (!phone || phone.length !== 10 || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Invalid details provided.' }, { status: 400 });
    }

    const fakeEmail = `${phone}@mpmatka.com`;
    const authAdmin = getAuth();

    try {
      // 1. Check karein user exist karta hai ya nahi
      const userRecord = await authAdmin.getUserByEmail(fakeEmail);

      // 2. Uski user ka password update kar dein
      await authAdmin.updateUser(userRecord.uid, {
        password: newPassword,
      });

      return NextResponse.json({ success: true, message: 'Password updated successfully!' });
    } catch (err) {
      return NextResponse.json({ error: 'Mobile number not registered.' }, { status: 404 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
