import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }
}

export async function POST(request) {
  try {
    const { phone, newPassword } = await request.json();

    if (!phone || phone.length !== 10 || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Invalid details provided.' }, { status: 400 });
    }

    if (!getApps().length) {
      return NextResponse.json({ error: 'Server configuration error (Firebase Admin missing).' }, { status: 500 });
    }

    const fakeEmail = `${phone}@mpmatka.com`;
    const authAdmin = getAuth();

    try {
      const userRecord = await authAdmin.getUserByEmail(fakeEmail);

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
