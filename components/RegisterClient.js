"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../lib/firebase";

export default function RegisterClient() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanUsername = username.trim();
    const cleanPhone = phone.replace(/\D/g, "");

    // Username Validation
    if (!cleanUsername) {
      setError("Please enter your username.");
      return;
    }
    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    // Mobile Validation
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Password Validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const fakeEmail = `${cleanPhone}@mpmatka.com`;

      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        fakeEmail,
        password
      );

      const user = userCredential.user;

      // 2. Save Profile in Firestore (Default is_approved: false)
      await setDoc(doc(db, "profiles", user.uid), {
        uid: user.uid,
        username: cleanUsername,
        phone: cleanPhone,
        email: fakeEmail,
        is_approved: false, // New user is locked until approved by admin
        is_admin: false,
        permissions: {
          market_update: false,
          add_results: false,
        },
        createdAt: serverTimestamp(),
      });

      setSuccessMsg("Registration successful! Account pending admin approval.");
      
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 2000);

    } catch (err) {
      console.error("Registration error:", err);

      let message = "Registration failed. Please try again.";

      if (err?.code === "auth/email-already-in-use") {
        message = "This mobile number is already registered.";
      } else if (err?.code === "auth/invalid-email") {
        message = "Invalid mobile number format.";
      } else if (err?.code === "auth/weak-password") {
        message = "Password must be at least 6 characters.";
      } else if (err?.code === "auth/network-request-failed") {
        message = "Network error. Please check your connection.";
      } else if (err?.code === "permission-denied") {
        message = "Permission denied. Check your Firestore Security Rules.";
      } else if (err?.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center px-4 py-8">
      <div className="bg-white w-full max-w-md rounded-lg border-2 border-red-600 p-6 shadow-xl">
        <h2 className="text-xl font-bold text-blue-900 text-center border-b pb-2 mb-4">
          Register New Account
        </h2>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs mb-3 font-semibold">
            {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {successMsg && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-xs mb-3 font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
              className="w-full border border-gray-400 rounded p-2 text-sm font-semibold text-black bg-white"
            />
          </div>

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
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(value);
                }}
                placeholder="Enter 10 digit number"
                maxLength={10}
                required
                disabled={loading}
                className="w-full border border-gray-400 rounded-r p-2 text-sm font-semibold text-black bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min 6 chars)"
              required
              minLength={6}
              disabled={loading}
              className="w-full border border-gray-400 rounded p-2 text-sm font-semibold text-black bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-sm disabled:opacity-50 transition-colors"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-900 font-bold hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
                }
