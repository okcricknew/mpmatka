"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase"; // Aapke firebase config ka path
import { isUserAdmin } from "../utils/admins"; // Step 1 me banayi gayi file

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase Auth State Observer: Har page refresh par automatically user aur admin role check karega
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser && currentUser.email) {
        // Firebase me email format: "9876543210@mpmatka.com" se phone number nikalenge
        const phoneNumber = currentUser.email.split("@")[0];
        
        // Admin list check
        const adminStatus = isUserAdmin(phoneNumber);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

