import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

// Firebase 初期化
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google プロバイダ
const googleProvider = new GoogleAuthProvider();

// ログイン（Google）
export const loginWithGoogle = async (): Promise<string | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google ログイン成功", result.user);
    return result.user.uid;
  } catch (error) {
    console.error("Google ログインエラー", error);
    return null;
  }
};

// ログイン（匿名）
export const loginAnonymously = async (): Promise<string | null> => {
  try {
    const result = await signInAnonymously(auth);
    console.log("匿名ログイン成功", result.user);
    return result.user.uid;
  } catch (error) {
    console.error("匿名ログインエラー", error);
    return null;
  }
};

// ログアウト
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("ログアウト成功");
  } catch (error) {
    console.error("ログアウトエラー", error);
  }
};

// 現在のユーザーIDを取得
export const getCurrentUserId = (): string | null => {
  const user = auth.currentUser;
  return user ? user.uid : null;
};

// ユーザー状態の監視
export const onUserStateChange = (
  callback: (userId: string | null, user: User | null) => void
) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? user.uid : null, user);
  });
};

// 習慣データの取得（ユーザーIDごと）
export const getHabits = async (userId: string): Promise<Habit[]> => {
  const q = query(collection(db, "habits"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Habit[];
};

// 型定義（必要なら共通化してもOK）
export type Habit = {
  id: string;
  title: string;
  completedDates: string[];
  userId: string;
};

// 必要なものをエクスポート
export { auth, db, collection, getDocs, query, where, Timestamp };
