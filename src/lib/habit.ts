import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Habit } from "../types/Habit";

const habitsRef = collection(db, "habits");

export const addHabit = async (title: string): Promise<void> => {
  const newHabit: Omit<Habit, "id"> = {
    title,
    createdAt: new Date(),
    completedDates: [],
  };
  await addDoc(habitsRef, {
    ...newHabit,
    createdAt: Timestamp.fromDate(newHabit.createdAt),
  });
};

export const getHabits = async (): Promise<Habit[]> => {
  const snapshot = await getDocs(habitsRef);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      createdAt: data.createdAt.toDate(),
      completedDates: data.completedDates || [],
    };
  });
};

export const updateHabitCompletedDates = async (
  id: string,
  completedDates: string[]
) => {
  const habitDoc = doc(db, "habits", id);
  await updateDoc(habitDoc, { completedDates });
};
