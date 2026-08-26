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

    // Safety timeout: Agar 15 second tak response na aaye toh app freeze na ho
    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('Request timed out. Please check your internet connection.')
    }, 15000)

    try {
      // Background mein mobile number se automatic email create karna
      const fakeEmail = `${phone}@mpmatka.com`
      
      // 1. Firebase Auth mein user create karein
      const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password)
      const user = userCredential.user

      // 2. Firestore profiles collection mein data save karein (For Admin Activation)
      await setDoc(doc(db, 'profiles', user.uid), {
        username: username.trim(),
        phone: phone.trim(),
        is_approved: false, // Default inactive jab tak admin approve na kare
        permissions: {
          market_update: false,
          add_results: false
        },
        createdAt: serverTimestamp()
      })

      clearTimeout(timeoutId)

      // Success hone par home page par redirect karein
      router.push('/')
      router.refresh()
      
    } catch (err) {
      clearTimeout(timeoutId)
      console.error('Registration Error:', err)
      let errorMessage = 'Registration failed. Try again.'
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This mobile number is already registered!'
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.'
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/Password sign-in is not enabled in Firebase Console!'
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      alert(errorMessage) // Mobile screen par turant error dikhane ke liye
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
                  
