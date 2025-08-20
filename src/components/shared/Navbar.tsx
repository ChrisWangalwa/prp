"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";

export default function Navbar() {
  const { currentUser, loading } = useAuth();

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-lg font-bold">
          Press Release Portal
        </Link>
        <div className="space-x-4">
          {loading ? (
            <span className="text-gray-300">Loading...</span>
          ) : currentUser ? (
            <>
              <Link
                href="/main/dashboard"
                className="text-white hover:text-gray-300"
              >
                Dashboard
              </Link>
              <Link
                href="/main/submit"
                className="text-white hover:text-gray-300"
              >
                Submit
              </Link>
              <Link
                href="/main/my-releases"
                className="text-white hover:text-gray-300"
              >
                My Releases
              </Link>
              <button
                onClick={() => signOut(auth)}
                className="text-white hover:text-gray-300"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-white hover:text-gray-300"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="text-white hover:text-gray-300"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
