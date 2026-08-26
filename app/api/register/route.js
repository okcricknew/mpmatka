import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase-admin";

export async function POST(request) {
  try {
    const body = await request.json();

    const uid = body?.uid;
    const username = body?.username?.trim();
    const phone = body?.phone?.trim();
    const email = body?.email?.trim();

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!uid) {
      return NextResponse.json(
        {
          error: "User ID is missing.",
        },
        {
          status: 400,
        }
      );
    }

    if (!username || username.length < 3) {
      return NextResponse.json(
        {
          error: "Invalid username.",
        },
        {
          status: 400,
        }
      );
    }

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          error: "Invalid mobile number.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CREATE PROFILE
    // ==========================================

    await db
      .collection("profiles")
      .doc(uid)
      .set({
        uid: uid,
        username: username,
        phone: phone,
        email: email || `${phone}@mpmatka.com`,
        role: "user",

        // 1. New users ko default post allow karne ke liye isse true rakhein
        // (Agar Admin Approval chahiye toh isse false hi rehne dein)
        is_approved: true, 

        // 2. Guessing Forum ki permission add ki gayi hai
        permissions: {
          guessing_forum: true,  // <--- YEH ADD HUA HAI
          market_update: false,
          add_results: false,
        },

        createdAt: new Date(),
      });

    // ==========================================
    // SUCCESS
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Register API Error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to create profile.",
      },
      {
        status: 500,
      }
    );
  }
}
