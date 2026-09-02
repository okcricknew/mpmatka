import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth-session";
import { isUserAdmin } from "@/utils/admins";

export async function POST(request) {
  try {
    // 1. Current logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Admin check
    const isAdmin = Boolean(
      isUserAdmin(user.mobile) || user.is_admin === true
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin privilege required" },
        { status: 403 }
      );
    }

    // 3. Request body
    const body = await request.json();

    const {
      startDate,
      endDate,
      weekData,
    } = body;

    // 4. Basic validation
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    if (!weekData || typeof weekData !== "object") {
      return NextResponse.json(
        { error: "Week data is required" },
        { status: 400 }
      );
    }

    // 5. Same document ID logic as existing client code
    const docId = `${startDate}_to_${endDate}`.replace(/\//g, "-");

    // 6. Server-side Firestore write
    const docRef = db
      .collection("sridevi_panna_chart")
      .doc(docId);

    await docRef.set(
      {
        startDate,
        endDate,
        weekData,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 7. Success
    return NextResponse.json({
      success: true,
      message: "Sridevi Panna Chart saved successfully",
      id: docId,
    });
  } catch (error) {
    console.error("Sridevi Panna Chart save error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to save Sridevi Panna Chart",
      },
      { status: 500 }
    );
  }
}
