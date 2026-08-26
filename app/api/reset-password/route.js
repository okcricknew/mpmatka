import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";

import { db } from "../../../lib/firebase-admin";

export async function POST(request) {
  try {
    const body = await request.json();

    const phone = body?.phone?.replace(/\D/g, "");
    const newPassword = body?.newPassword;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid 10-digit mobile number.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !newPassword ||
      newPassword.length < 6
    ) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters long.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // FIND PROFILE
    // ==========================================

    const profileSnapshot = await db
      .collection("profiles")
      .where("phone", "==", phone)
      .limit(1)
      .get();

    if (profileSnapshot.empty) {
      return NextResponse.json(
        {
          error:
            "No account found with this mobile number.",
        },
        {
          status: 404,
        }
      );
    }

    const profileDoc =
      profileSnapshot.docs[0];

    const profileData =
      profileDoc.data();

    const uid =
      profileData?.uid ||
      profileDoc.id;

    if (!uid) {
      return NextResponse.json(
        {
          error:
            "User profile is incomplete.",
        },
        {
          status: 500,
        }
      );
    }

    // ==========================================
    // FIREBASE ADMIN AUTH
    // ==========================================

    const adminAuth = getAuth();

    // ==========================================
    // UPDATE PASSWORD
    // ==========================================

    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    // ==========================================
    // SUCCESS
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Password updated successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Reset Password API Error:",
      error
    );

    if (
      error?.code ===
      "auth/user-not-found"
    ) {
      return NextResponse.json(
        {
          error:
            "No account found with this mobile number.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to reset password.",
      },
      {
        status: 500,
      }
    );
  }
}
