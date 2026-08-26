'use client'

import React, { useState, useEffect } from 'react'
import { auth, db } from '../lib/firebase' // Apne firebase path ke hisab se adjust karein
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export default function UserLoginSection() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        try {
          const userDocRef = doc(db, 'profiles', currentUser.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            setProfile(userDoc.data())
          }
        } catch (error) {
          console.error("Error fetching profile in LoginSection:", error)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.clear()
      window.location.reload()
    } catch (error) {
      alert("Logout Error: " + error.message)
    }
  }

  // Boolean helper function
  const checkIsApproved = (val) => val === true || val === 'true';

  if (loading) {
    return (
      <div className="w-full bg-white border-2 border-[#5c245c] rounded-[4px] py-3 text-center text-xs font-bold text-gray-500">
        Checking Auth State...
      </div>
    )
  }

  // Check if active: role admin ho YA is_approved true ho
  const isActive = profile ? (profile.role === 'admin' || checkIsApproved(profile.is_approved)) : false;

  return (
    <div className="w-full bg-white border-2 border-[#5c245c] rounded-[4px] overflow-hidden my-3 shadow-sm">
      {/* Header Title */}
      <div className="bg-[#5c245c] text-white text-center font-bold text-base py-2 tracking-wider font-sans">
        ✻ USER PANEL ✻
      </div>

      {/* Container */}
      {user ? (
        /* LOGGED IN USER VIEW */
        <div className="p-3 bg-white flex flex-col md:flex-row items-center justify-between gap-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-black uppercase">
              👤 {profile?.username || user.displayName || 'USER'}
            </span>

            {/* Status Badge */}
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
            className="bg-red-600 text-white px-5 py-1 rounded-[6px] font-bold text-xs shadow hover:bg-red-700 transition-colors"
          >
            LOGOUT
          </button>
        </div>
      ) : (
        /* LOGGED OUT USER VIEW */
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
  )
}
