"use client";

// Declare global variables provided by the Canvas environment.
declare var __app_id: string;
declare var __firebase_config: string;
declare var __initial_auth_token: string;

import { useState, useEffect, useMemo } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

/**
 * Admin component to generate and store new invitation codes in Firestore.
 */
const AdminInviteGenerator: React.FC = () => {
  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [numInvites, setNumInvites] = useState<number>(1);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Memoized Firebase configuration and app ID
  const firebaseConfig = useMemo(() => {
    try {
      return JSON.parse(
        typeof __firebase_config !== "undefined" ? __firebase_config : "{}"
      );
    } catch (e) {
      console.error("Failed to parse Firebase config:", e);
      return null;
    }
  }, []);

  const appId = useMemo(
    () => (typeof __app_id !== "undefined" ? __app_id : "default-app-id"),
    []
  );

  // Effect to initialize Firebase and authenticate the user
  useEffect(() => {
    if (!firebaseConfig) {
      setError("Failed to initialize the application. Please try again.");
      setLoading(false);
      return;
    }

    const initFirebase = async () => {
      try {
        const app = !getApps().length
          ? initializeApp(firebaseConfig)
          : getApp();
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);
        setDb(firestoreDb);
        setAuth(firebaseAuth);

        // Sign in with the provided custom token, or anonymously as a fallback
        if (typeof __initial_auth_token !== "undefined") {
          await signInWithCustomToken(firebaseAuth, __initial_auth_token);
          console.log("Signed in with custom token.");
        } else {
          // This path may be restricted by Firebase rules.
          await signInAnonymously(firebaseAuth);
          console.log("Signed in anonymously.");
        }

        // Listen for authentication state changes after sign-in attempt
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
          if (user) {
            setUserId(user.uid);
          } else {
            setUserId(null);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (e: any) {
        console.error(
          "Firebase initialization or authentication error:",
          e.message
        );
        setError(`Initialization failed: ${e.message}`);
        setLoading(false);
      }
    };

    initFirebase();
  }, [firebaseConfig]);

  // Handle the invitation code generation and Firestore write operation
  const handleGenerateInvites = async () => {
    if (!db) {
      setError("Database service not available.");
      return;
    }

    if (numInvites <= 0) {
      setError("Please enter a number greater than 0.");
      return;
    }

    setIsGenerating(true);
    setGeneratedCodes([]);
    setError(null);
    let successfulGenerations: string[] = [];

    try {
      const invitationsCollection = collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "invitations"
      );

      for (let i = 0; i < numInvites; i++) {
        // Generate a new UUID as the invitation code
        const newInviteCode = uuidv4().split("-").join("");

        // Create a new document in Firestore for the invitation
        await addDoc(invitationsCollection, {
          code: newInviteCode,
          status: "active",
          createdAt: new Date(),
        });
        successfulGenerations.push(newInviteCode);
      }
      setGeneratedCodes(successfulGenerations);
    } catch (err) {
      console.error("Error generating invites:", err);
      setError("Failed to generate invitations. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-center text-gray-600">
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Admin Invite Generator
        </h1>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            This tool allows administrators to generate new invitation codes for
            user registration. The codes will be stored in Firestore with an
            "active" status.
          </p>
          <div>
            <label
              htmlFor="num-invites"
              className="block text-sm font-medium text-gray-700"
            >
              Number of Invitations to Generate
            </label>
            <input
              type="number"
              id="num-invites"
              value={numInvites}
              onChange={(e) => setNumInvites(parseInt(e.target.value))}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              disabled={isGenerating}
            />
          </div>
          <button
            onClick={handleGenerateInvites}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Invitations"}
          </button>
        </div>

        {generatedCodes.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Generated Codes
            </h2>
            <div className="bg-gray-50 p-4 rounded-md shadow-inner max-h-64 overflow-y-auto">
              {generatedCodes.map((code, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded-md shadow-sm border border-gray-200 mb-2 flex justify-between items-center"
                >
                  <span className="font-mono text-sm text-gray-800 break-all">
                    {code}
                  </span>
                  <a
                    href={`/register?invite=${code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 text-blue-500 hover:underline text-sm"
                  >
                    Link
                  </a>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Share these links with new users for registration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInviteGenerator;
