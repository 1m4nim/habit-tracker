import { useState, useEffect } from "react";
import { getHabits, addHabit, getCurrentUserId } from "../lib/firebase";
import HabitList from "./HabitList";
import WeeklyGraph from "./WeeklyGraph";
import { Timestamp } from "firebase/firestore"; // Timestamp型のインポート

// Habit型の定義。Firestoreから取得するデータと一致させる。
export type Habit = {
  id: string;
  title: string;
  completedDates: string[];
  userId: string;
  createdAt: Date;
};

const HabitDashboard = () => {
  // ステートの初期化
  const [habits, setHabits] = useState<Habit[]>([]); // 習慣の一覧
  const [newTitle, setNewTitle] = useState(""); // 新しい習慣のタイトル
  const [refreshGraph, setRefreshGraph] = useState(false); // グラフを再描画するためのトリガー
  const [userId, setUserId] = useState<string | null>(null); // ユーザーID（ログイン状態によって変化）

  // 初期化時にユーザーIDを取得して、そのIDに紐づく習慣を取得
  useEffect(() => {
    const uid = getCurrentUserId(); // 現在のユーザーIDを取得
    if (uid) {
      setUserId(uid); // ユーザーIDをステートにセット
      fetchHabits(uid); // ユーザーIDに基づいて習慣を取得
    }
  }, []); // 初回マウント時に実行

  // ユーザーIDに基づいて習慣をFirestoreから取得
  const fetchHabits = async (uid: string) => {
    const habitsFromFirestore = await getHabits(uid); // Firestoreから習慣を取得

    // `createdAt`をFirestoreのTimestampからDateに変換する処理
    const formattedHabits = habitsFromFirestore.map((habit: any) => ({
      ...habit,
      createdAt:
        habit.createdAt instanceof Timestamp
          ? habit.createdAt.toDate()
          : habit.createdAt, // FirestoreのTimestampをDate型に変換
    }));

    setHabits(formattedHabits); // 取得した習慣をステートに保存
  };

  // 新しい習慣を追加する関数
  const handleAddHabit = async () => {
    const trimmedTitle = newTitle.trim(); // タイトルの前後の空白を削除
    if (!trimmedTitle || !userId) return; // タイトルが空だったり、ユーザーIDがなければ何もしない

    // 新しい習慣をFirestoreに追加
    await addHabit(trimmedTitle, userId);
    await fetchHabits(userId); // 習慣を再度取得してリストを更新
    setNewTitle(""); // 入力フィールドをクリア
  };

  // グラフ更新用のトリガー（例えば習慣を完了した際にグラフを更新する）
  const triggerGraphRefresh = () => {
    setRefreshGraph((prev) => !prev); // 現在の状態を反転させてグラフを再描画
  };

  // ユーザーがログインしていない場合はログインを促すメッセージを表示
  if (!userId) return <div>ログインしてください...</div>;

  return (
    <div style={{ border: "2px solid #ccc", padding: "20px" }}>
      {/* 1週間の完了率を表示するセクション */}
      <h2>✅ 1週間の完了率</h2>
      <div style={{ height: "300px", marginBottom: "20px" }}>
        {/* WeeklyGraphコンポーネント：グラフにユーザーIDと更新トリガーを渡す */}
        <WeeklyGraph userIds={[userId]} refreshKey={refreshGraph} />
      </div>

      {/* 新しい習慣を追加するフォーム */}
      <div style={{ marginBottom: "20px" }}>
        <h3>新しい習慣を追加</h3>
        <input
          type="text"
          value={newTitle} // 入力フィールドの値はnewTitleステートにバインド
          onChange={(e) => setNewTitle(e.target.value)} // 入力内容をステートに反映
          placeholder="習慣のタイトル" // プレースホルダーに説明文
        />
        <button onClick={handleAddHabit}>追加</button>{" "}
        {/* ボタンを押すと習慣が追加される */}
      </div>

      {/* HabitListコンポーネント：習慣のリストを表示 */}
      <HabitList
        habits={habits} // 取得した習慣のリストを渡す
        onComplete={triggerGraphRefresh} // 完了時にグラフを更新するためのコールバック
        userIds={[userId]} // ユーザーIDを渡す（必要に応じて使う）
      />
    </div>
  );
};

export default HabitDashboard;
