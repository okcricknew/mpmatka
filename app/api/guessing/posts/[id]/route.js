import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth-session";
import { isUserAdmin } from "@/lib/admins";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request, context) {
  try {
    // -----------------------------------
    // LOGIN SESSION
    // -----------------------------------

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Login required.",
        },
        {
          status: 401,
        }
      );
    }

    // -----------------------------------
    // ADMIN CHECK
    // -----------------------------------

    const admin = isUserAdmin(user.mobile);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    // -----------------------------------
    // POST ID
    // -----------------------------------

    const postId = context?.params?.id;

    if (!postId) {
      return NextResponse.json(
        {
          success: false,
          error: "Post ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------
    // DELETE
    // -----------------------------------

    await db
      .collection("guessing_posts")
      .doc(postId)
      .delete();

    return NextResponse.json(
      {
        success: true,
        deletedId: postId,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Guessing post DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Delete failed",
      },
      {
        status: 500,
      }
    );
  }
}
