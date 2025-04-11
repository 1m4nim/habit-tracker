// Firebase Firestoreとのやりとりに関するロジック


import {db} from "./firebase";
import {collection,addDoc,getDocs,Timestamp} from "firebase/firestore";
import {Habit} from "../types/Habit";

// "habits" コレクションへの参照
const habitsRef=collection(db,"habits");

// 🔸 新しい習慣を追加する関数
export const addHabit=async (title:string):Promise<void>=>{
    const newHabit:Omit<Habit,"id">={
        title,
        createdAt:new Date(),
        completedDates:[],
    };
    await addDoc(habitsRef,{
        ...newHabit,
           // Firestoreでは Date → Timestamp に変換する必要あり
        createdAt:Timestamp.fromDate(newHabit.createdAt),
    });
};

// 🔸 Firestoreから全ての習慣を取得する関数
export const getHabits= async():Promise<Habit[]>=>{
    const snapshot=await getDocs(habitsRef);// habitsコレクションの全ドキュメントを取得
 
    return snapshot.docs.map((doc)=>({
        id:doc.id,
        ...(doc.data()as Omit<Habit,"id">),
        createdAt:doc.data().createdAt.toDate(),
    }));
};