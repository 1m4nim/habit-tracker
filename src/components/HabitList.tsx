import React, {use, useEffect,useState} from "react";
import {addHabit,getHabits} from "../lib/habit";// Firestore操作関数
import {Habit} from "../types/Habit";// 型定義

export const HabitList:React.FC=()=>{
    const [habits,setHabits]=useState<Habit[]>([]);
    const [newTitle,setNewTitle]=useState("");


  // 🔹 初回マウント時に習慣を取得
  useEffect(()=>{
    const fetchHabits=async()=>{
        const data=await getHabits();
        setHabits(data); // 状態更新
    };
    fetchHabits();
  },[]);

   // 🔹 習慣を追加する処理
   const handleAdd=async()=>{
    if(newTitle.trim()==="") return;// 空白は無視

     // 1. ローカルに即座に追加（UI反映を早くする）
    const tempHabit:Habit={
        id: Math.random().toString(),// 仮ID（Firestore用でなく表示用）
        title:newTitle,
        createdAt:new Date(),
        completedDates:[]
    };
    setHabits((prev)=>[...prev,tempHabit]);

    // 2. Firestore に追加
    await addHabit(newTitle);

    // 3. 最新のFirestore状態を再取得して整合性をとる
    const updated =await getHabits();
    setHabits(updated);

    // 4. 入力欄リセット
    setNewTitle("");
};

//     await addHabit(newTitle);// Firestoreに追加
//     const updated=await getHabits(); // 更新後の一覧を再取得
//     setHabits(updated);// 状態更新
//     setNewTitle("");// 入力欄をクリア
//    };

   return(
    <div>
    <h2>習慣リスト</h2>

    {/* 習慣入力欄と追加ボタン */}
    <input
      type="text"
      value={newTitle}
      onChange={(e) => setNewTitle(e.target.value)}
      placeholder="新しい習慣"
    />
    <button onClick={handleAdd}>追加</button>

    {/* 習慣のリスト表示 */}
    <ul>
      {habits.map((habit) => (
        <li key={habit.id}>{habit.title}</li>
      ))}
    </ul>
  </div>
   );

};