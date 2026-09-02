import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth-session";
import { isUserAdmin } from "@/utils/admins";
import { SrideviSeedData } from "@/data/SrideviSeedData";

export async function POST() {
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

    // 3. Validate seed data
    if (!Array.isArray(SrideviSeedData)) {
      return NextResponse.json(
        { error: "Seidevi seed data is not an array" },
        { status: 500 }
      );
    }

    if (SrideviSeedData.length === 0) {
      return NextResponse.json(
        { error: "Sridevi seed data is empty" },
        { status: 400 }
      );
    }

    // 4. Firebase collection
    const collectionRef = db.collection("sridevi_panna_chart");

    // 5. Firestore batch
    let batch = db.batch();
    let operationCount = 0;
    let savedCount = 0;

    for (const row of SrideviSeedData) {
      if (!row?.startDate || !row?.endDate) {
        continue;
      }

      const docId = `${row.startDate}_to_${row.endDate}`
        .replace(/\//g, "-");

      const docRef = collectionRef.doc(docId);

      batch.set(
        docRef,
        {
          startDate: row.startDate,
          endDate: row.endDate,
          weekData: row.weekData || {},
          seedData: true,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      operationCount++;
      savedCount++;

      // Firestore batch limit protection
      if (operationCount === 450) {
        await batch.commit();

        batch = db.batch();
        operationCount = 0;
      }
    }

    // 6. Commit remaining documents
    if (operationCount > 0) {
      await batch.commit();
    }

    // 7. Success
    return NextResponse.json({
      success: true,
      message: "Sridevi seed data imported successfully",
      savedCount,
    });
  } catch (error) {
    console.error("Sridevi seed import error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to import Sridevi seed data",
      },
      { status: 500 }
    );
  }
}
