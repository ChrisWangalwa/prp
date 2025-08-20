"use client";
import { useState } from "react";
import { auth, db } from "@/config/firebase";
import {
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export function useAuthActions() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Keep session even after refresh
      await setPersistence(auth, browserLocalPersistence);

      // ✅ Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // ✅ Send email verification
      await sendEmailVerification(userCredential.user);

      // ✅ Save profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName,
        email,
        role: "comm_professional",
        verified: false,
        createdAt: new Date().toISOString(),
      });

      return userCredential.user;
    } catch (err: any) {
      setError(err.message || "Signup failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Keep session even after refresh
      await setPersistence(auth, browserLocalPersistence);

      // ✅ Sign in
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // ✅ Check if email verified
      if (!userCredential.user.emailVerified) {
        throw new Error("Please verify your email before logging in");
      }

      return userCredential.user;
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signUp, logIn, error, loading };
}
