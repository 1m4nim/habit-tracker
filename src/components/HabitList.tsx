import React, { useEffect, useState } from "react";
import {
  addHabit,
  getAllCompletedDates,
  updateHabitCompletedDates,
  deleteHabit,
  addCompletedDate,
} from "../lib/habit"; // habitに関するAPIの関数をインポート
import { Habit } from "../types/Habit"; // Habit型をインポート
import { format } from "date-fns"; // 日付をフォーマットするためのdate-fnsライブラリ
import Modal from "./Modal"; // モーダルコンポーネント
import styles from "./HabitList.module.css"; // CSSモジュールのインポート

const STORAGE_KEY = "habits"; // ローカルストレージのキー

// Propsの型定義
type HabitListProps = {
  habits: Habit[]; // 渡される習慣リスト
  onComplete: () => void; // 完了時に呼ばれるコールバック
  userIds: string[]; // ユーザーIDリスト
};

const HabitList: React.FC<HabitListProps> = ({ onComplete, userIds }) => {
  // ステートの定義
  const [habits, setHabits] = useState<Habit[]>([]); // ユーザーの習慣リスト
  const [newTitle, setNewTitle] = useState(""); // 新しい習慣のタイトル
  const [showModal, setShowModal] = useState(false); // モーダルの表示/非表示
  const [modalType, setModalType] = useState<"complete" | "delete" | null>(
    null
  ); // モーダルの種類（完了 or 削除）
  const [targetHabit, setTargetHabit] = useState<Habit | null>(null); // 対象となる習慣

  const today = format(new Date(), "yyyy-MM-dd"); // 今日の日付（フォーマットされた）
  const userId = userIds[0]; // 最初のユーザーIDを使用

  // 初期化処理
  useEffect(() => {
    // 初期化を行う関数
    const initialize = async () => {
      // ローカルストレージに保存された習慣リストを取得
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        try {
          const parsed = JSON.parse(local); // JSON形式で保存されたデータをパース
          if (Array.isArray(parsed)) {
            // 配列であれば習慣リストとして設定
            setHabits(parsed);
          }
        } catch (e) {
          console.error("ローカルストレージ読み込み失敗", e);
        }
      }

      // Firestoreから最新の習慣データを取得
      await fetchHabitsFromFirestore();
    };

    initialize(); // 初期化関数の実行

    // 0時になるたびに習慣リセットを確認
    const intervalId = setInterval(() => {
      const now = new Date();
      // 0時ちょうどにリセット処理を実行
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetHabits();
      }
    }, 60000); // 1分ごとにチェック

    return () => clearInterval(intervalId); // クリーンアップ（コンポーネントがアンマウントされるときに停止）
  }, []);

  // Firestoreから習慣リストを取得する関数
  const fetchHabitsFromFirestore = async () => {
    const allCompleted = await getAllCompletedDates(userId); // ユーザーIDに関連する完了した習慣データを取得
    setHabits(allCompleted); // ステートを更新
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allCompleted)); // ローカルストレージにも保存
  };

  // 新しい習慣を追加する関数
  const handleAddHabit = async () => {
    if (!newTitle.trim()) return; // 空白タイトルを防ぐ
    await addHabit(newTitle, userId); // Firestoreに習慣を追加
    await fetchHabitsFromFirestore(); // 最新データを再取得
    setNewTitle(""); // 入力フォームをクリア
  };

  // 習慣を完了としてマークする関数
  const handleMarkCompleted = async () => {
    if (!targetHabit) return; // 対象習慣がなければ処理しない

    const updatedDates = [...targetHabit.completedDates, today]; // 今日の日付を完了日として追加
    await updateHabitCompletedDates(targetHabit.id!, updatedDates); // Firestoreに完了日を更新
    await addCompletedDate(userId); // ユーザーごとに完了した日を追加

    const updated = habits.map(
      (h) =>
        h.id === targetHabit.id ? { ...h, completedDates: updatedDates } : h // 対象習慣を更新
    );

    setHabits(updated); // ステート更新
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); // ローカルストレージも更新
    closeModal(); // モーダルを閉じる
    onComplete(); // 完了コールバック
  };

  // 習慣を削除する関数
  const handleDeleteHabit = async () => {
    if (!targetHabit) return; // 対象習慣がなければ処理しない

    await deleteHabit(targetHabit.id!); // Firestoreから習慣を削除
    const updated = habits.filter((h) => h.id !== targetHabit.id); // 削除後の習慣リスト
    setHabits(updated); // ステート更新
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); // ローカルストレージも更新
    closeModal(); // モーダルを閉じる
  };

  // 習慣をリセットする関数
  const resetHabits = () => {
    const cleared = habits.map((h) => ({ ...h, completedDates: [] })); // すべての完了日をリセット
    setHabits(cleared); // ステート更新
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleared)); // ローカルストレージも更新
  };

  // モーダルを開く関数（完了 or 削除）
  const openModal = (habit: Habit, type: "complete" | "delete") => {
    setTargetHabit(habit); // 対象習慣を設定
    setModalType(type); // モーダルタイプ（完了 or 削除）を設定
    setShowModal(true); // モーダルを表示
  };

  // モーダルを閉じる関数
  const closeModal = () => {
    setShowModal(false); // モーダルを非表示
    setTargetHabit(null); // 対象習慣をリセット
    setModalType(null); // モーダルタイプをリセット
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.habitList}>📋 習慣リスト</h2>

      <div className={styles.habitSection}>
        <div className={styles.inputArea}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)} // 新しい習慣タイトルの入力
            placeholder="新しい習慣を入力"
            className={styles.input}
          />
          <button onClick={handleAddHabit} className={styles.addButton}>
            追加
          </button>
        </div>

        <ul className={styles.list}>
          {habits.map((habit) => {
            const isCompletedToday = habit.completedDates.includes(today); // 今日完了したかどうか

            return (
              <li key={habit.id} className={styles.listItem}>
                <span>🔵</span>
                <span>{habit.title}</span>
                <button
                  onClick={() => openModal(habit, "complete")}
                  disabled={isCompletedToday} // 今日完了していたらボタン無効
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

      {/* モーダル表示部分 */}
      {showModal && modalType && targetHabit && (
        <Modal
          message={
            modalType === "complete"
              ? "本当にやりましたか？"
              : "本当に削除しますか？"
          }
          onConfirm={
            modalType === "complete" ? handleMarkCompleted : handleDeleteHabit
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
                    fontSize: "16px",
                  }}
                  onClick={handleMarkCompleted}
                  className={styles.confirmButton}
                >
                  はい
                </button>
                <button
                  style={{ borderRadius: "8px", fontSize: "16px" }}
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
