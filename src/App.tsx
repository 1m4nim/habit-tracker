import React, { useEffect, useState } from "react";
import {
  auth,
  loginWithGoogle,
  loginAnonymously,
  logout,
} from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import HabitList from "./components/HabitList";
import { addHabit } from "./lib/habit";
import GraphButton from "./components/GraphButton";

// `Habit`型のインポート
import { Habit } from "./components/HabitDashboard";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(false);

  const triggerRefresh = () => {
    setRefreshKey((prev) => !prev); // true/falseを切り替えて再描画を促す
  };

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
      <h1 style={{ margin: 0 }}>My Habits</h1>

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

          {/* userIds に user.uid を渡す */}
          <HabitList
            userIds={[user.uid]}
            onComplete={() => console.log("ばっちり！")}
          />
          <GraphButton userIds={[user.uid]} />
        </>
      )}
    </div>
  );
};

export default App;
