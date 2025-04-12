import React, { useEffect, useState } from "react";
import { addHabit, getHabits } from "../lib/habit";
import { Habit } from "../types/Habit";

const STORAGE_KEY = "habits";

const HabitList: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    // Firestoreからデータを取得
    const fetchFromFirestore = async () => {
      const data = await getHabits();
      setHabits(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); // Firestoreからデータ取得後にローカルストレージに保存
    };

    // ローカルストレージからデータを取得して表示
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHabits(parsed); // ローカルストレージからデータを設定
        }
      } catch (e) {
        console.error("ローカルストレージの読み込みに失敗:", e);
      }
    }

    fetchFromFirestore(); // Firestoreからデータを非同期で取得
  }, []);

  const handleAdd = async () => {
    if (newTitle.trim() === "") return;

    const tempHabit: Habit = {
      id: Math.random().toString(),
      title: newTitle,
      createdAt: new Date(),
      completedDates: [],
    };

    // ローカルストレージに新しい習慣を追加
    const updatedLocal = [...habits, tempHabit];
    setHabits(updatedLocal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocal));

    await addHabit(newTitle);

    // Firestoreからデータを更新
    const updatedFromFirestore = await getHabits();
    setHabits(updatedFromFirestore);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFromFirestore));

    setNewTitle(""); // 入力フィールドをクリア
  };

  return (
    <div style={{ marginTop: "3rem" }}>
      <h2>📋 習慣リスト</h2>
      <div>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="新しい習慣を入力"
        />
        <button onClick={handleAdd}>追加</button>
      </div>
      <ul style={{ marginTop: "1rem" }}>
        {habits.map((habit) => (
          <li key={habit.id}>🟢 {habit.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default HabitList;
