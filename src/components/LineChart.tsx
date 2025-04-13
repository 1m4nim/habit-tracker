import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

// 曜日を表す（Sun〜Sat）
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// 任意の日付から、その週の「日曜〜土曜」のDate配列を返す関数
const getWeekDates = (targetDate: Date) => {
  const dayOfWeek = targetDate.getDay(); // 日曜=0, 月曜=1 ...
  const sunday = new Date(targetDate);
  sunday.setDate(sunday.getDate() - dayOfWeek); // 日曜日に巻き戻す

  return [...Array(7)].map((_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i); // 各曜日に対応する日付をセット
    return d;
  });
};

type Props = {
  userIds: string[]; // 複数ユーザーID
  baseDate?: Date; // 📅 任意の基準日（なければ今日）
};

export default function WeeklyGraph({ userIds, baseDate }: Props) {
  const [data, setData] = useState<{ day: string; ratio: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // ローディング状態

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // データ取得開始時にローディングを有効にする
      const targetDate = baseDate || new Date(); // 📅 デフォルトは今日
      const weekDates = getWeekDates(targetDate); // 対象週の日付配列

      // 各曜日に対して完了率を集計
      const weeklyData = await Promise.all(
        weekDates.map(async (date) => {
          const dateStr = date.toISOString().split("T")[0]; // yyyy-mm-dd 形式

          // 複数ユーザーの全タスクを取得
          const allDocs = await Promise.all(
            userIds.map(async (uid) => {
              const q = query(
                collection(db, "todos"),
                where("date", "==", dateStr),
                where("userId", "==", uid)
              );
              const snap = await getDocs(q);
              return snap.docs.map((doc) => doc.data());
            })
          );

          // フラットにする
          const docs = allDocs.flat();
          const done = docs.filter((d) => d.status === "done").length;
          const total = docs.length;

          return {
            day: weekDays[date.getDay()], // 曜日名
            ratio: total > 0 ? done / total : 0, // 完了率
          };
        })
      );

      setData(weeklyData); // グラフ用データにセット
      setLoading(false); // データ取得終了時にローディングを無効にする
    };

    fetchData();
  }, [userIds, baseDate]);

  if (loading) {
    return <div>Loading...</div>; // ローディング中の表示
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis domain={[0, 1]} tickFormatter={(v) => `${v * 100}%`} />
        <Tooltip formatter={(v) => `${(v as number) * 100}%`} />
        <Legend />
        <Line type="monotone" dataKey="ratio" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
}
