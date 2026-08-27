import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "../../../../../../lib/firebase-admin";

export const runtime = "nodejs";

function normalizeMobile(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .replace(/^91/, "")
    .replace(/^0+/, "");
}

function isValidMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile);
}

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");

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

        resolve({
          salt,
          hash: derivedKey.toString("hex"),
        });
      }
    );
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const username = String(body.username || "").trim();
    const mobile = normalizeMobile(body.mobile);
    const password = String(body.password || "");

    if (!username || !mobile || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        {
          success: false,
          message: "Username must be between 3 and 30 characters.",
        },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_ ]+$/.test(username)) {
      return NextResponse.json(
        {
          success: false,
          message: "Username contains invalid characters.",
        },
        { status: 400 }
      );
    }

    if (!isValidMobile(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid 10 digit mobile number.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const existingUser = await db
      .collection("profiles")
      .where("mobile", "==", mobile)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return NextResponse.json(
        {
          success: false,
          message: "This mobile number is already registered.",
        },
        { status: 409 }
      );
    }

    const passwordData = await hashPassword(password);

    const userRef = db.collection("profiles").doc();

    await userRef.set({
      uid: userRef.id,

      username,
      mobile,

      passwordHash: passwordData.hash,
      passwordSalt: passwordData.salt,

      // Admin manually changes this to true
      is_approved: false,

      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Registration successful. Your account is waiting for admin approval.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Registration failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
