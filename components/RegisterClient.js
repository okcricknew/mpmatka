'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export default function RegisterClient() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Validation: Check 10 digit mobile number
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    // Validation: Check password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    try {
      const fakeEmail = `${phone}@mpmatka.com`
      
      // 1. Firebase Auth me user create karein
      const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password)
      const user = userCredential.user

      // 2. Firestore profiles collection me data save karein
      await setDoc(doc(db, 'profiles', user.uid), {
        username: username.trim(),
        phone: phone.trim(),
        is_approved: false,
        permissions: {
          market_update: false,
          add_results: false
        },
        createdAt: serverTimestamp()
      })

      // Success hone par home page par redirect karein
      router.push('/')
      router.router?.refresh ? router.refresh() : window.location.reload()
      
    } catch (err) {
      console.error('Registration Error:', err)
      let errorMessage = 'Registration failed. Try again.'
      
      // Firebase specific user friendly errors
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This mobile number is already registered!'
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.'
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      alert(errorMessage) // Mobile par turant error dikhane ke liye
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center px-4 py-8">
      <div className="bg-white w-full max-w-md rounded-lg border-2 border-red-600 p-6 shadow-xl">
        <h2 className="text-xl font-bold text-blue-900 text-center border-b pb-2 mb-4">
          Register New Account
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs mb-3 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-black mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="w-full border border-gray-400 rounded p-2 text-sm font-semibold text-black outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">Mobile Number</label>
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
                className="w-full border border-gray-400 rounded-r p-2 text-sm font-semibold text-black outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.setup || e.target.value)}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min 6 chars)"
              required
              className="w-full border border-gray-400 rounded p-2 text-sm font-semibold text-black outline-none focus:border-red-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-sm disabled:opacity-50 transition"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-900 font-bold hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  )
}
