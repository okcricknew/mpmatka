import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../../../../lib/firebase-admin";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      name,
      result,
      time,
      message,
    } = body;

    if (!name) {
      return NextResponse.json(
        {
          error: "Market name is required",
        },
        { status: 400 }
      );
    }

    const docRef = db
      .collection("results")
      .doc(name);

    await docRef.set(
      {
        name,
        result:
          result || "140-55-140",
        time: time || "",
        message: message || "",
        updatedAt:
          FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    const updatedData = {
      name,
      result:
        result || "140-55-140",
      time: time || "",
      message: message || "",
    };

    return NextResponse.json({
      success: true,
      result: updatedData,
    });

  } catch (error) {
    console.error(
      "Update result error:",
      error
    );

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
