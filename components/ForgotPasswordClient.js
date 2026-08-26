"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordClient() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setMessage("");

    const cleanPhone = phone.replace(/\D/g, "");

    // ==========================================
    // MOBILE VALIDATION
    // ==========================================

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    // ==========================================
    // PASSWORD VALIDATION
    // ==========================================

    if (newPassword.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    setLoading(true);

    try {
      // ==========================================
      // RESET PASSWORD API
      // ==========================================

      const res = await fetch(
        "/api/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            phone: cleanPhone,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Failed to reset password."
        );
      }

      // ==========================================
      // SUCCESS
      // ==========================================

      setMessage(
        "Password updated successfully! Redirecting to login..."
      );

      setPhone("");
      setNewPassword("");

      setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 2000);
    } catch (err) {
      console.error(
        "Reset password error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center px-4">
      <div className="bg-white w-full max-w-md rounded-lg border-2 border-red-600 p-6 shadow-xl">

        <h2 className="text-xl font-bold text-blue-900 text-center border-b pb-2 mb-4">
          Reset Password
        </h2>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs mb-3">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-xs mb-3">
            {message}
          </div>
        )}

        <form
          onSubmit={handleReset}
          className="space-y-4"
        >

          {/* MOBILE */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Registered Mobile Number
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
                  const value =
                    e.target.value
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

          {/* NEW PASSWORD */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              placeholder="Enter new password (min 6 chars)"
              minLength={6}
              required
              disabled={loading}
              className="w-full border border-gray-400 rounded p-2 text-sm font-semibold text-black"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 rounded text-sm disabled:opacity-50"
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>

        </form>

        <p className="text-center text-xs text-gray-600 mt-4">
          Remembered your password?{" "}

          <a
            href="/login"
            className="text-red-600 font-bold hover:underline"
          >
            Login here
          </a>
        </p>

      </div>
    </div>
  );
}
