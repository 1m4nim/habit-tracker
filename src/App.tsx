import React, { useEffect, useState } from "react";
import {
  auth,
  loginWithGoogle,
  loginAnonymously,
  logout,
} from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import HabitList from "./components/HabitList";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ユーザーのログイン状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) return <p>読み込み中...</p>;

  return (
    <div style={{ textAlign: "center", paddingTop: "1rem" }}>
      <h1 style={{ margin: 0 }}> My Habits</h1>
      {!user ? (
        <div style={{ marginTop: "3rem" }}>
          <p>ログインして習慣を管理しましょう</p>
          <button onClick={loginWithGoogle}>Googleでログイン</button>
          <button onClick={loginAnonymously}>匿名でログイン</button>
        </div>
      ) : (
        <>
          <p>ログイン中: {user.displayName || "匿名ユーザー"}</p>
          <button onClick={logout}>ログアウト</button>
          <HabitList />
        </>
      )}
    </div>
  );
};

export default App;
