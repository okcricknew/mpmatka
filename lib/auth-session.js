import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "./firebase-admin";

const COOKIE_NAME = "okcrick_session";

const SESSION_SECRET = process.env.AUTH_SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("AUTH_SESSION_SECRET is missing");
}

function base64urlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64urlDecode(value) {
  value = value.replace(/-/g, "+").replace(/_/g, "/");

  while (value.length % 4) {
    value += "=";
  }

  return Buffer.from(value, "base64").toString("utf8");
}

function createSignature(data) {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");
}

export function createSessionToken(user) {
  const payload = {
    uid: user.uid,
    mobile: user.mobile,
    username: user.username,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };

  const encodedPayload = base64urlEncode(JSON.stringify(payload));

  const signature = createSignature(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token) {
  try {
    if (!token) return null;

    const parts = token.split(".");

    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;

    const expectedSignature = createSignature(encodedPayload);

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return null;
    }

    if (
      !crypto.timingSafeEqual(
        signatureBuffer,
        expectedBuffer
      )
    ) {
      return null;
    }

    const payload = JSON.parse(
      base64urlDecode(encodedPayload)
    );

    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    if (!payload.uid) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get(COOKIE_NAME)?.value;

    const session = verifySessionToken(token);

    if (!session) {
      return null;
    }

    const profileSnap = await db
      .collection("profiles")
      .doc(session.uid)
      .get();

    if (!profileSnap.exists) {
      return null;
    }

    const profile = profileSnap.data();

    const isApproved =
  profile.is_approved === true ||
  profile.is_approved === "true";

if (!isApproved) {
  return null;
}

    return {
  uid: session.uid,
  username: profile.username || "",
  mobile: profile.mobile || "",

  is_approved:
    profile.is_approved === true ||
    profile.is_approved === "true",

  role: profile.role || "",

  is_admin:
    profile.is_admin === true ||
    profile.is_admin === "true",

  permissions: profile.permissions || {},
};
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

export { COOKIE_NAME };
