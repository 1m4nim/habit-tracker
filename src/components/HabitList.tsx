import React, { useEffect, useState } from "react";
import { addHabit, getHabits } from "../lib/habit"; // Firestore操作関数
import { Habit } from "../types/Habit"; // 型定義
import styles from "./HabitList.module.css";

export const HabitList: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTitle, setNewTitle] = useState("");

  // 🔸 localStorage のキー名（必要に応じて userId を加えてもOK）
  const STORAGE_KEY = "habits";

  // 🔹 初回マウント時に localStorage→Firestore の順で取得
  useEffect(() => {
    // 1. localStorage から先に読み込み
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHabits(parsed);
        }
      } catch (e) {
        console.error("ローカルストレージの読み込みエラー:", e);
      }
    }

    // 2. Firestore から取得し、ローカルと同期
    const fetchHabits = async () => {
      const data = await getHabits();
      setHabits(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };
    fetchHabits();
  }, []);

  // 🔹 習慣を追加する処理
  const handleAdd = async () => {
    if (newTitle.trim() === "") return;

    // 1. ローカル表示用に即座に追加
    const tempHabit: Habit = {
      id: Math.random().toString(),
      title: newTitle,
      createdAt: new Date(),
      completedDates: [],
    };

    setHabits((prev) => {
      const updated = [...prev, tempHabit];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); // localStorage 更新
      return updated;
    });

    // 2. Firestore に追加 → 完全な状態で再取得
    await addHabit(newTitle);
    const updated = await getHabits();
    setHabits(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); // localStorage 更新

    setNewTitle(""); // 入力欄リセット
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.habitList}>習慣リスト</h2>

      {/* 習慣入力欄と追加ボタン */}
      <div className={styles.inputArea}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="新しい習慣"
          className={styles.input}
        />
        <button onClick={handleAdd} className={styles.addButton}>
          追加
        </button>
      </div>

      {/* 習慣のリスト表示 */}
      <ul className={styles.list}>
        {habits.map((habit) => (
          <li key={habit.id} className={styles.listItem}>
            {habit.title}
          </li>
        ))}
      </ul>
    </div>
  );
};
