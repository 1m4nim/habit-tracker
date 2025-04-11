// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
// 匿名ログイン
export const loginAnonymously = async () => {
  await signInAnonymously(auth);
};

// Googleログイン
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

// ログアウト
export const logout = async () => {
  await auth.signOut();
};

// ユーザーの状態監視（使う場合）
export const subscribeAuth = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("API KEY:", import.meta.env.VITE_FIREBASE_API_KEY);
