"use client";

import React, { useState } from "react";

export default function UserLoginSection({ initialUser = null }) {
  const [user, setUser] = useState(initialUser);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);

      window.location.reload();
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Logout Error: " + error.message);
    } finally {
      setLogoutLoading(false);
    }
  };

  const displayName =
    user?.username ||
    user?.mobile ||
    "USER";

  const isActive = user?.is_approved === true;

  return (
    <div className="w-full bg-white border-2 border-[#5c245c] rounded-[4px] overflow-hidden my-3 shadow-sm">
      <div className="bg-[#5c245c] text-white text-center font-bold text-base py-2 tracking-wider font-sans">
        ✻ USER PANEL ✻
      </div>

      {user ? (
        <div className="p-3 bg-white flex flex-col md:flex-row items-center justify-between gap-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-black uppercase">
              👤 {displayName}
            </span>

            {isActive ? (
              <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2 py-0.5 rounded border border-green-400">
                🟢 ACTIVE
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded border border-red-400">
                🔴 INACTIVE / UNAPPROVED
              </span>
            )}
          </div>

          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="bg-red-600 text-white px-5 py-1 rounded-[6px] font-bold text-xs shadow hover:bg-red-700 disabled:bg-gray-400 transition-colors"
          >
            {logoutLoading ? "LOGGING OUT..." : "LOGOUT"}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3 py-2.5 bg-white">
          <a
            href="/login"
            className="bg-[#1a73e8] text-white px-6 py-1.5 rounded-[6px] font-bold text-sm shadow-md inline-block text-center hover:opacity-95 transition-opacity"
          >
            Login
          </a>

          <span className="text-[#666666] font-bold text-base select-none">
            //
          </span>

          <a
            href="/register"
            className="bg-[#ff0055] text-white px-6 py-1.5 rounded-[6px] font-bold text-sm shadow-md inline-block text-center hover:opacity-95 transition-opacity"
          >
            Register
          </a>
        </div>
      )}
    </div>
  );
}
