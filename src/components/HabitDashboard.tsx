import { useState, useEffect } from "react";
import { getHabits, addHabit, getCurrentUserId } from "../lib/firebase";
import HabitList from "./HabitList";
import WeeklyGraph from "./WeeklyGraph";
import { Timestamp } from "firebase/firestore";
import { Habit } from "../types/Habit";

const HabitDashboard = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [refreshGraph, setRefreshGraph] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const uid = getCurrentUserId();
    if (uid) {
      setUserId(uid);
      fetchHabits(uid);
    }
  }, []);

  const fetchHabits = async (uid: string) => {
    const habitsFromFirestore = await getHabits(uid);

    const formattedHabits = habitsFromFirestore.map((habit: any) => ({
      ...habit,
      createdAt:
        habit.createdAt instanceof Timestamp
          ? habit.createdAt.toDate()
          : habit.createdAt,
    }));

    setHabits(formattedHabits);
  };

  const handleAddHabit = async () => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle || !userId) return;

    await addHabit(trimmedTitle, userId);
    await fetchHabits(userId);
    setNewTitle("");
  };

  const triggerGraphRefresh = () => {
    setRefreshGraph((prev) => !prev);
  };

  if (!userId) return <div>ログインしてください...</div>;

  return (
    <div style={{ border: "2px solid #ccc", padding: "20px" }}>
      <h2>✅ 1週間の完了率</h2>

      <button onClick={() => setIsModalOpen(true)}>📊 グラフを見る</button>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "800px",
              maxHeight: "90%",
              overflowY: "auto",
            }}
          >
            <h3 style={{ textAlign: "center" }}>📈 達成率グラフ</h3>
            <div style={{ height: "300px" }}>
              <WeeklyGraph
                userIds={[userId]}
                habitIds={habits.map((habit) => habit.id)}
                refreshKey={refreshGraph}
              />
            </div>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button onClick={() => setIsModalOpen(false)}>閉じる</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "20px", marginTop: "20px" }}>
        <h3>新しい習慣を追加</h3>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="習慣のタイトル"
        />
        <button onClick={handleAddHabit}>追加</button>
      </div>

      <HabitList
        habits={habits}
        onComplete={triggerGraphRefresh}
        userIds={[userId]}
      />
    </div>
  );
};

export default HabitDashboard;
