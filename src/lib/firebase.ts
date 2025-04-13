import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase を初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google ログイン用のプロバイダを作成
const googleProvider = new GoogleAuthProvider();

// Google ログイン関数
const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google ログイン成功", result.user);
  } catch (error) {
    console.error("Google ログインエラー", error);
  }
};

// 匿名ログイン関数
const loginAnonymously = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log("匿名ログイン成功", result.user);
  } catch (error) {
    console.error("匿名ログインエラー", error);
  }
};

// ログアウト関数
const logout = async () => {
  try {
    await signOut(auth);
    console.log("ログアウト成功");
  } catch (error) {
    console.error("ログアウトエラー", error);
  }
};

export {
  auth,
  loginWithGoogle,
  loginAnonymously,
  logout,
  db,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
};
