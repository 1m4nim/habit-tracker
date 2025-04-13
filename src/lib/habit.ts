import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Habit } from "../types/Habit";

// Firestore の habits コレクション参照
const habitsCollection = collection(db, "habits");

// 🔹 新しい習慣を追加
export const addHabit = async (title: string) => {
  const newHabit: Omit<Habit, "id"> = {
    title,
    createdAt: new Date(),
    completedDates: [],
  };

  await addDoc(habitsCollection, newHabit);
};

// 🔹 習慣の一覧を取得
export const getHabits = async (): Promise<Habit[]> => {
  const snapshot = await getDocs(habitsCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Habit[];
};

// 🔹 完了日を更新
export const updateHabitCompletedDates = async (
  id: string,
  completedDates: string[]
) => {
  const habitRef = doc(db, "habits", id);
  await updateDoc(habitRef, { completedDates });
};

// 🔹 習慣を削除
export const deleteHabit = async (id: string) => {
  const habitRef = doc(db, "habits", id);
  await deleteDoc(habitRef);
};
