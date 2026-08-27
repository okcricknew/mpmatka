"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../lib/firebase"; // db import add kiya hai

export default function LoginClient() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const cleanPhone = phone.replace(/\D/g, "");

    // ==========================================
    // MOBILE VALIDATION
    // ==========================================

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // ==========================================
    // PASSWORD VALIDATION
    // ==========================================

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const fakeEmail = `${cleanPhone}@mpmatka.com`;

      // 1. FIREBASE LOGIN
      const userCredential = await signInWithEmailAndPassword(
        auth,
        fakeEmail,
        password
      );

      const user = userCredential.user;

      // 2. USERNAME AUTO-SYNC (Agla Screen Load Hone Se Pehle Name Fix Karega)
      if (!user.displayName) {
        try {
          const userDocRef = doc(db, "profiles", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data()?.username) {
            await updateProfile(user, {
              displayName: userDoc.data().username,
            });
          }
        } catch (syncErr) {
          console.error("Name sync error:", syncErr);
        }
      }

      // 3. HARD NAVIGATION (Static state break karne ke liye)
      window.location.href = "/";
    } catch (err) {
      console.error("Login error:", err);

      let message = "Invalid mobile number or password.";

      if (
        err?.code === "auth/invalid-credential" ||
        err?.code === "auth/wrong-password" ||
        err?.code === "auth/user-not-found"
      ) {
        message = "Invalid mobile number or password.";
      } else if (err?.code === "auth/too-many-requests") {
        message = "Too many login attempts. Please try again later.";
      } else if (err?.code === "auth/network-request-failed") {
        message = "Network error. Please check your internet connection.";
      } else if (err?.code === "auth/user-disabled") {
        message = "This account has been disabled.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center px-4">
      <div className="bg-white w-full max-w-md rounded-lg border-2 border-red-600 p-6 shadow-xl">

        <h2 className="text-xl font-bold text-blue-900 text-center border-b pb-2 mb-4">
          Login with Mobile
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          {/* MOBILE NUMBER */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Mobile Number
            </label>

            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-gray-400 bg-gray-100 text-black text-sm font-bold rounded-l">
                +91
              </span>

              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);

                  setPhone(value);
                }}
                placeholder="Enter 10 digit number"
                maxLength={10}
                required
                disabled={loading}
                className="w-full border border-gray-400 rounded-r p-2 text-sm font-semibold text-black"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              className="w-full border border-gray-400 rounded p-2 text-sm font-semibold text-black"
            />
          </div>

          {/* FORGOT PASSWORD */}
          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-xs text-red-600 font-bold hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 rounded text-sm disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-xs text-gray-600 mt-4">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-red-600 font-bold hover:underline"
          >
            Register here
          </a>
        </p>

      </div>
    </div>
  );
}
