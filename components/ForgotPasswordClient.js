"use client";

import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function ForgotPasswordClient() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const fakeEmail = `${phone}@mpmatka.com`;
      await sendPasswordResetEmail(auth, fakeEmail);
      setMessage("Password reset instructions sent to your account.");
    } catch (err) {
      console.error(err);
      setError("Mobile number not found or error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center px-4">
      <div className="bg-white w-full max-w-md rounded-lg border-2 border-red-600 p-6 shadow-xl">
        <h2 className="text-xl font-bold text-blue-900 text-center border-b pb-2 mb-4">
          Forgot Password
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs mb-3">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-xs mb-3">
            {message}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-black mb-1">Registered Mobile Number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-gray-400 bg-gray-100 text-black text-sm font-bold rounded-l">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10 digit number"
                maxLength={10}
                required
                className="w-full border border-gray-400 rounded-r p-2 text-sm font-semibold text-black"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 rounded text-sm disabled:opacity-50"
          >
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-4">
          Remembered your password?{" "}
          <a href="/login" className="text-red-600 font-bold hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
              }

