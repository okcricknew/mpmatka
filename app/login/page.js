"use client";

import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({
    mobile: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!form.mobile.trim() || !form.password) {
      setError("Please enter mobile number and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: form.mobile,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      window.location.href = "/";
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Login
        </h1>

        <p className="text-center text-sm text-gray-500 mt-2 mb-6">
          Login to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mobile Number
            </label>

            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Enter 10 digit mobile number"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="current-password"
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg py-3"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </a>
        </p>
      </div>
    </main>
  );
}
