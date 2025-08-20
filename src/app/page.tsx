"use client";

import React, { useState, useEffect } from "react";
import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  Auth,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  Firestore,
  orderBy,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";

// Declare global variables provided by the Canvas environment for runtime
declare const __app_id: string | undefined;
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;

// Define the shape of a press release document
interface PressRelease {
  id: string;
  title: string;
  organization: string;
  content: string;
  createdAt: any; // Firestore Timestamp is an object, so 'any' is safe here
}

const PublicHome: React.FC = () => {
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dbInstance, setDbInstance] = useState<Firestore | null>(null);
  const [authInstance, setAuthInstance] = useState<Auth | null>(null);

  // Initialise Firebase and Auth listener
  useEffect(() => {
    const initFirebase = async () => {
      try {
        // Determine Firebase config and app ID based on environment
        const isCanvas =
          typeof __firebase_config !== "undefined" && !!__firebase_config;
        let app: FirebaseApp;
        let auth: Auth;
        let db: Firestore;
        let currentAppId: string;

        if (isCanvas) {
          // Use Canvas-provided globals
          const firebaseConfig = JSON.parse(__firebase_config as string);
          app = initializeApp(firebaseConfig);
          auth = getAuth(app);
          db = getFirestore(app);
          currentAppId = __app_id as string;

          // Authenticate with custom token if available
          if (typeof __initial_auth_token !== "undefined") {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } else {
          // Use local environment variables for development
          const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId:
              process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
          };

          if (!firebaseConfig.apiKey) {
            setError(
              "Firebase configuration is missing from environment variables."
            );
            return;
          }

          app = initializeApp(firebaseConfig as any);
          auth = getAuth(app);
          db = getFirestore(app);
          currentAppId = firebaseConfig.projectId as string;
        }

        setAuthInstance(auth);
        setDbInstance(db);
      } catch (e: any) {
        console.error("Error during Firebase initialization:", e);
        setError(`Failed to initialize the application: ${e.message}`);
      } finally {
        // Set loading to false regardless of success or failure
        setLoading(false);
      }
    };
    initFirebase();
  }, []);

  // Fetch public press releases in real-time
  useEffect(() => {
    // Only run this effect if Firestore is ready
    if (!dbInstance || loading) {
      return;
    }

    // Determine the app ID based on the environment
    const currentAppId =
      typeof __app_id !== "undefined"
        ? __app_id
        : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!currentAppId) {
      setError("App ID is missing. Please check your configuration.");
      return;
    }

    // This query fetches documents from the public collection
    const publicCollectionRef = collection(
      dbInstance,
      `artifacts/${currentAppId}/public/data/pressReleases`
    );

    // Use onSnapshot for real-time updates and orderBy to sort by createdAt
    const q = query(publicCollectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const fetchedReleases: PressRelease[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || "Untitled",
          organization: doc.data().organization || "Unknown",
          content: doc.data().content || "",
          createdAt: doc.data().createdAt,
        }));
        setPressReleases(fetchedReleases);
      },
      (err) => {
        console.error("Failed to fetch public press releases:", err);
        setError("Failed to load news articles. Check Firestore permissions.");
      }
    );

    return () => unsubscribe();
  }, [dbInstance, loading]);

  // Render loading, error, or content based on state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-800">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 p-4 rounded-md shadow-md">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans antialiased text-gray-800">
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .card {
                    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
                }
                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                }
            `}</style>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PRP News</h1>
          <p className="text-gray-600">
            Your trusted source for verified news and press releases.
          </p>
        </header>
        <main>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pressReleases.length > 0 ? (
              pressReleases.map((release) => (
                <div
                  key={release.id}
                  className="card bg-white p-6 rounded-lg shadow-md"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {release.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    <span className="font-medium">Published by:</span>{" "}
                    {release.organization || "Unknown"}
                  </p>
                  <div className="text-gray-700">
                    {/* Display only a snippet of the content */}
                    <p>{release.content?.substring(0, 150)}...</p>
                  </div>
                  <a
                    href={`#article-${release.id}`}
                    className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Read More &rarr;
                  </a>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                No press releases available at the moment.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicHome;
