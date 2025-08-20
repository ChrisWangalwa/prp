"use client";

// Declare global variables provided by the Canvas environment.
declare var __app_id: string;
declare var __firebase_config: string;
declare var __initial_auth_token: string;

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth";

/**
 * Main registration page component that handles invitation code validation.
 * It checks for a 'invite' query parameter in the URL and validates it
 * against the Firestore 'invitations' collection.
 */
const RegistrationPage: React.FC = () => {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite");

  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteValid, setIsInviteValid] = useState<boolean>(false);
  const [invitationDocId, setInvitationDocId] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
        const unsubscribe = onAuthStateChanged(
          firebaseAuth,
          (user: User | null) => {
            if (user) {
              setUserId(user.uid);
            } else {
              setUserId(null);
            }
            setLoading(false);
          }
        );

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

  // Effect to validate the invitation code
  useEffect(() => {
    const validateCode = async () => {
      if (!inviteCode || !db || !userId) {
        setValidationStatus("invalid");
        return;
      }

      setValidationStatus("validating");
      try {
        const invitationsCollection = collection(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "invitations"
        );
        const q = query(
          invitationsCollection,
          where("code", "==", inviteCode),
          where("status", "==", "active")
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.docs.length > 0) {
          setIsInviteValid(true);
          setInvitationDocId(querySnapshot.docs[0].id);
          setValidationStatus("valid");
        } else {
          setIsInviteValid(false);
          setValidationStatus("invalid");
        }
      } catch (err) {
        console.error("Error validating invitation code:", err);
        setValidationStatus("invalid");
        setError("Failed to validate invitation code. Please try again.");
      }
    };

    if (db && userId) {
      validateCode();
    }
  }, [inviteCode, db, userId, appId]);

  // Handler to update the invitation status to 'redeemed'
  const handleRedeemInvitation = useCallback(async () => {
    if (!db || !invitationDocId) {
      setError("Database or invitation ID not available.");
      return;
    }
    try {
      const invitationRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "invitations",
        invitationDocId
      );
      await updateDoc(invitationRef, { status: "redeemed" });
      console.log("Invitation redeemed successfully.");
    } catch (err) {
      console.error("Failed to redeem invitation:", err);
      // Even if this fails, we want the user to be able to register.
      // The admin can manually clean up invalid entries later.
    }
  }, [db, invitationDocId, appId]);

  // Handle user registration using Firebase Authentication
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInviteValid) {
      setError("Cannot register without a valid invitation code.");
      return;
    }
    if (!auth) {
      setError("Authentication service not available.");
      return;
    }

    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("User registered successfully:", user.uid);

      // After successful registration, redeem the invitation code
      await handleRedeemInvitation();

      // Show a success message
      setShowSuccessMessage(true);

      // Optional: You could redirect the user here after a delay
      // setTimeout(() => {
      //   window.location.href = "/dashboard";
      // }, 2000);
    } catch (err: any) {
      console.error("Registration failed:", err);
      // Display a user-friendly error message
      if (err.code === "auth/email-already-in-use") {
        setError("The email address is already in use.");
      } else if (err.code === "auth/weak-password") {
        setError("The password is too weak. Please use a stronger password.");
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  const renderContent = () => {
    if (loading || validationStatus === "validating") {
      return (
        <div className="text-center text-gray-600">
          Validating invitation code...
        </div>
      );
    }

    if (showSuccessMessage) {
      return (
        <div className="text-center text-green-600">
          <p className="font-semibold text-lg">Registration Successful!</p>
          <p className="text-sm text-gray-500 mt-2">
            Your account has been created.
          </p>
        </div>
      );
    }

    if (validationStatus === "invalid") {
      return (
        <div className="text-center text-red-500">
          Invalid or expired invitation link.
          <p className="mt-2 text-gray-500 text-sm">
            Please contact an administrator for a valid invitation link.
          </p>
        </div>
      );
    }

    if (validationStatus === "valid" && isInviteValid) {
      return (
        <form
          onSubmit={handleRegistration}
          className="bg-white p-6 rounded-lg shadow-md space-y-4"
        >
          <div className="flex items-center space-x-2 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-green-600 font-semibold">
              Invitation code validated!
            </p>
          </div>
          <p className="text-gray-500">
            Please complete the form below to create your account.
          </p>
          {/* Email input field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="you@example.com"
              required
            />
          </div>
          {/* Password input field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Account
          </button>
        </form>
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Register
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
        {renderContent()}
      </div>
    </div>
  );
};

export default RegistrationPage;
