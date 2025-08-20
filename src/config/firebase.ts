import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDM9iJezoZ5KZMIURIU_6ideS2i-_3lkeQ",
  authDomain: "press-release-portal.firebaseapp.com",
  projectId: "press-release-portal",
  storageBucket: "press-release-portal.firebasestorage.app",
  messagingSenderId: "299194408268",
  appId: "1:299194408268:web:24cfb40352c74df2f9c3e9",
  measurementId: "G-6MMV3HJ0FY",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
