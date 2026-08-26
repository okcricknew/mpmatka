'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export default function RegisterClient() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Password validation (min 6 chars)
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    // Safety timeout: Agar 15 second tak response na aaye toh loading rok dein
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('Request timed out. Please check your internet connection.')
    }, 15000)

    try {
      // 1. Firebase Auth mein real email aur password se user create karein
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)
      const user = userCredential.user

      // 2. Firestore profiles collection mein user data save karein
      await setDoc(doc(db, 'profiles', user.uid), {
        username: username.trim(),
        email: email.trim(),
        is_approved: false, // Default inactive jab tak admin approve na kare
        permissions: {
          market_update: false,
          add_results: false
        },
        createdAt: serverTimestamp()
      })

      clearTimeout(timeoutId)

      // Success alert aur redirect
      alert('Registration Successful! Account created.')
      router.push('/')
      router.refresh()
      
    } catch (err) {
      clearTimeout(timeoutId)
      console.error('Registration Error:', err)
      let errorMessage = 'Registration failed. Try again.'
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already registered!'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.'
      } else if (err.code === 'permission-denied') {
        errorMessage = 'Firestore Permission Denied! Check your database rules.'
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      alert(errorMessage)
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
            <label className="block text-xs font-bold text-black mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full border border-gray-400 rounded p-2 text-sm font-semibold text-black outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">Password</label>
            <input
              type="password"
              value={password}
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
