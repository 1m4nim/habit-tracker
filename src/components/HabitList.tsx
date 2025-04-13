// HabitList.tsx
import React, { useEffect, useState } from "react";
import { addHabit, getHabits, updateHabitCompletedDates } from "../lib/habit";
import { Habit } from "../types/Habit";
import { format } from "date-fns";
import Modal from "./Modal"; // モーダルをインポート

import "./HabitList.module.css";

const STORAGE_KEY = "habits";

const HabitList: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [showModal, setShowModal] = useState(false); // モーダルの表示状態を管理
  const [habitToComplete, setHabitToComplete] = useState<Habit | null>(null); // 完了ボタンを押した習慣を保持

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const fetchFromFirestore = async () => {
      const data = await getHabits();
      setHabits(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHabits(parsed);
        }
      } catch (e) {
        console.error("ローカルストレージの読み込みに失敗:", e);
      }
    }

    fetchFromFirestore();
  }, []);

  const handleAdd = async () => {
    if (newTitle.trim() === "") return;

    const tempHabit: Habit = {
      id: Math.random().toString(),
      title: newTitle,
      createdAt: new Date(),
      completedDates: [],
    };

    const updatedLocal = [...habits, tempHabit];
    setHabits(updatedLocal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocal));

    await addHabit(newTitle);
    const updatedFromFirestore = await getHabits();
    setHabits(updatedFromFirestore);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFromFirestore));

    setNewTitle("");
  };

  const handleToggleComplete = async (habit: Habit) => {
    // モーダルを表示して確認を行う
    setHabitToComplete(habit);
    setShowModal(true);
  };

  const handleConfirmCompletion = async () => {
    if (!habitToComplete) return;

    // 完了日を更新
    const updated = {
      ...habitToComplete,
      completedDates: [...habitToComplete.completedDates, today],
    };

    // Firestoreとローカルストレージを更新
    await updateHabitCompletedDates(
      habitToComplete.id!,
      updated.completedDates
    );

    const newHabits = habits.map((h) =>
      h.id === habitToComplete.id ? updated : h
    );
    setHabits(newHabits);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHabits));

    // 完了後にモーダルを閉じる
    setHabitToComplete(null);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false); // モーダルを閉じる
  };

  return (
    <div className="container">
      <h2 className="habitList">📋 習慣リスト</h2>

      <div className="habitSection">
        <div className="inputArea">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="新しい習慣を入力"
            className="input"
          />
          <button onClick={handleAdd} className="addButton">
            追加
          </button>
        </div>

        <ul className="list">
          {habits.map((habit) => {
            const isCompletedToday = habit.completedDates.includes(today);

            return (
              <li key={habit.id} className="listItem">
                <span>🔵</span>
                <span>{habit.title}</span>
                <button
                  onClick={() => handleToggleComplete(habit)}
                  disabled={isCompletedToday}
                  className="completeButton"
                  style={{
                    marginLeft: "auto",
                    backgroundColor: isCompletedToday
                      ? "lightgray"
                      : "lightgreen",
                    cursor: isCompletedToday ? "default" : "pointer",
                  }}
                >
                  {isCompletedToday ? "完了！" : "今日やる！"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* モーダル表示 */}
      {showModal && (
        <Modal
          message="本当にやりましたか？"
          onConfirm={handleConfirmCompletion}
          onCancel={handleCloseModal}
        />
      )}
    </div>
  );
};

export default HabitList;
