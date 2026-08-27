import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth-session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          user: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        username: user.username,
        mobile: user.mobile,
        is_approved: user.is_approved,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);

    return NextResponse.json(
      {
        success: false,
        user: null,
      },
      { status: 500 }
    );
  }
}
