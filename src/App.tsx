import React, { useEffect, useState } from "react";
import {
  auth,
  loginWithGoogle,
  loginAnonymously,
  logout,
} from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import HabitList from "./components/HabitList";
import { getHabits } from "./lib/habit";
import GraphButton from "./components/GraphButton";

// `Habit`型のインポート
import { Habit } from "./types/Habit";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]); // habitsのステートを追加
  const [refreshKey, setRefreshKey] = useState(false); // グラフ更新用のキー

  const triggerRefresh = () => {
    setRefreshKey((prev) => !prev); // refreshKeyを切り替えて再描画
    console.log(triggerRefresh);
  };

  // ユーザーのログイン状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) {
        const habitsData = await getHabits(); // Firestoreから習慣を取得
        setHabits(habitsData); // 取得した習慣をステートに保存
      }
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

          {/* HabitListに習慣データを渡す */}
          <HabitList
            habits={habits} // ここで習慣データを渡す
            userIds={[user.uid]}
            onComplete={() => console.log("ばっちり！")}
          />
          <GraphButton
            userIds={[user.uid]}
            refreshKey={refreshKey} // グラフ更新のためにrefreshKeyを渡す
          />
        </>
      )}
    </div>
  );
};

export default App;
