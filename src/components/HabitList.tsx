import React, { useEffect, useState } from "react";
import {
  addHabit,
  getHabits,
  updateHabitCompletedDates,
  deleteHabit,
  addCompletedDate,
} from "../lib/habit";
import { Habit } from "../types/Habit";
import { format } from "date-fns";
import Modal from "./Modal";
import styles from "./HabitList.module.css";

const STORAGE_KEY = "habits";

type HabitListProps = {
  onComplete: () => void;
  userIds: string[]; // ← Firestoreに保存するためにユーザーIDを受け取る
};

const HabitList: React.FC<HabitListProps> = ({ onComplete, userIds }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"complete" | "delete" | null>(
    null
  );
  const [targetHabit, setTargetHabit] = useState<Habit | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const initializeHabits = async () => {
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
      await loadHabitsFromFirestore();
    };

    initializeHabits();

    const resetAtMidnight = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      if (hours === 0 && minutes === 0) {
        resetHabits();
      }
    };

    const intervalId = setInterval(resetAtMidnight, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const loadHabitsFromFirestore = async () => {
    const data = await getHabits();
    setHabits(data);
    syncLocalStorage(data);
  };

  const syncLocalStorage = (data: Habit[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const addNewHabit = async () => {
    if (newTitle.trim() === "") return;

    await addHabit(newTitle, userIds[0]); // ← userIdを渡す
    await loadHabitsFromFirestore();
    setNewTitle("");
  };

  const markAsCompleted = async () => {
    if (!targetHabit) return;

    const updatedDates = [...targetHabit.completedDates, today];
    await updateHabitCompletedDates(targetHabit.id!, updatedDates);

    // Firestoreに完了記録を追加
    await addCompletedDate(targetHabit.userId); // ← userIdが必須！

    const updatedHabits = habits.map((h) =>
      h.id === targetHabit.id ? { ...h, completedDates: updatedDates } : h
    );

    setHabits(updatedHabits);
    syncLocalStorage(updatedHabits);
    closeModal();

    onComplete(); // グラフなどを更新するためのコールバック
  };

  const deleteTargetHabit = async () => {
    if (!targetHabit) return;

    await deleteHabit(targetHabit.id!);

    const updatedHabits = habits.filter((h) => h.id !== targetHabit.id);
    setHabits(updatedHabits);
    syncLocalStorage(updatedHabits);
    closeModal();
  };

  const openModal = (habit: Habit, type: "complete" | "delete") => {
    setTargetHabit(habit);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTargetHabit(null);
    setModalType(null);
  };

  const resetHabits = () => {
    const updatedHabits = habits.map((habit) => ({
      ...habit,
      completedDates: [],
    }));

    setHabits(updatedHabits);
    syncLocalStorage(updatedHabits);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.habitList}>📋 習慣リスト</h2>

      <div className={styles.habitSection}>
        <div className={styles.inputArea}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="新しい習慣を入力"
            className={styles.input}
          />
          <button onClick={addNewHabit} className={styles.addButton}>
            追加
          </button>
        </div>

        <ul className={styles.list}>
          {habits.map((habit) => {
            const isCompletedToday = habit.completedDates.includes(today);

            return (
              <li key={habit.id} className={styles.listItem}>
                <span>🔵</span>
                <span>{habit.title}</span>

                <button
                  onClick={() => openModal(habit, "complete")}
                  disabled={isCompletedToday}
                  className={styles.completeButton}
                  style={{
                    marginLeft: "auto",
                    backgroundColor: isCompletedToday
                      ? "lightgray"
                      : "lightblue",
                    color: "black",
                    cursor: isCompletedToday ? "default" : "pointer",
                    marginRight: "8px",
                  }}
                >
                  {isCompletedToday ? "完了！" : "今日やる！"}
                </button>

                <button
                  onClick={() => openModal(habit, "delete")}
                  className={styles.deleteButton}
                >
                  削除
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {showModal && (
        <Modal
          message={
            modalType === "complete"
              ? "本当にやりましたか？"
              : "本当に削除しますか？"
          }
          onConfirm={
            modalType === "complete" ? markAsCompleted : deleteTargetHabit
          }
          onCancel={closeModal}
          customButtons={
            modalType === "complete" && (
              <div>
                <button
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    borderRadius: "8px",
                    fontSize: "16PX",
                  }}
                  onClick={markAsCompleted}
                  className={styles.confirmButton}
                >
                  はい
                </button>
                <button
                  style={{ borderRadius: "8PX", fontSize: "16px" }}
                  onClick={closeModal}
                  className={styles.cancelButton}
                >
                  いいえ
                </button>
              </div>
            )
          }
        />
      )}
    </div>
  );
};

export default HabitList;
