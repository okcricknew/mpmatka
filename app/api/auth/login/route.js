import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "../../../../lib/firebase-admin";
import {
  createSessionToken,
  COOKIE_NAME,
} from "../../../../lib/auth-session";

export const runtime = "nodejs";

function normalizeMobile(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .replace(/^91/, "")
    .replace(/^0+/, "");
}

function verifyPassword(password, salt, storedHash) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      64,
      {
        N: 16384,
        r: 8,
        p: 1,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        const hash = derivedKey.toString("hex");

        try {
          const hashBuffer = Buffer.from(hash, "hex");
          const storedBuffer = Buffer.from(storedHash, "hex");

          if (hashBuffer.length !== storedBuffer.length) {
            resolve(false);
            return;
          }

          resolve(
            crypto.timingSafeEqual(
              hashBuffer,
              storedBuffer
            )
          );
        } catch {
          resolve(false);
        }
      }
    );
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const mobile = normalizeMobile(body.mobile);
    const password = String(body.password || "");

    if (!mobile || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Mobile number and password are required.",
        },
        { status: 400 }
      );
    }

    const snapshot = await db
      .collection("profiles")
      .where("mobile", "==", mobile)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid mobile number or password.",
        },
        { status: 401 }
      );
    }

    const profileDoc = snapshot.docs[0];
    const profile = profileDoc.data();

    const passwordCorrect = await verifyPassword(
      password,
      profile.passwordSalt,
      profile.passwordHash
    );

    if (!passwordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid mobile number or password.",
        },
        { status: 401 }
      );
    }

    // Manual activation check
    if (profile.is_approved !== true) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account is not activated yet. Please wait for admin approval.",
        },
        { status: 403 }
      );
    }

    const token = createSessionToken({
      uid: profileDoc.id,
      mobile: profile.mobile,
      username: profile.username,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Login failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
