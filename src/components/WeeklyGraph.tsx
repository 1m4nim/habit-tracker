import React, { useEffect, useState } from "react";
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
import {
  db,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "../lib/firebase"; // Firebaseの設定ファイル

type Props = {
  userIds: string[];
  refreshKey?: boolean;
};

type GraphData = {
  date: string;
  displayDate: string;
  completionRate: number;
};

type CompletedDate = {
  id: string;
  userId: string;
  createdAt: Timestamp;
};

const WeeklyGraph = ({ userIds, refreshKey }: Props) => {
  const [data, setData] = useState<GraphData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 過去7日間の日付を生成
        const dates = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dates.push(date);
        }

        // habitsコレクションを取得
        const habitsQuery = query(
          collection(db, "habits"),
          where("userId", "in", userIds)
        );
        const habitsSnapshot = await getDocs(habitsQuery);
        const habitsData = habitsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // completedDatesコレクションを取得
        const completedQuery = query(
          collection(db, "completedDates"),
          where("userId", "in", userIds)
        );
        const completedSnapshot = await getDocs(completedQuery);
        const completedData: CompletedDate[] = completedSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        ) as CompletedDate[];

        // グラフ用のデータ整形
        const graphData: GraphData[] = dates.map((date) => {
          const dateString = date.toISOString().split("T")[0];
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);

          const completedCount = completedData.filter((item) => {
            const itemDate =
              item.createdAt instanceof Timestamp
                ? item.createdAt.toDate()
                : new Date(item.createdAt);
            return itemDate >= startOfDay && itemDate <= endOfDay;
          }).length;

          const totalHabits = habitsData.length;

          const completionRate =
            totalHabits > 0
              ? Math.round((completedCount / totalHabits) * 100)
              : 0;

          return {
            date: dateString,
            displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
            completionRate,
          };
        });

        setData(graphData);
      } catch (error) {
        console.error("❌ データ取得中のエラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userIds, refreshKey]);

  if (userIds.length === 0) {
    return <div>ユーザーIDが指定されていません</div>;
  }

  if (loading) {
    return <div>データを読み込み中...</div>;
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="displayDate" />
          <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
          <Tooltip formatter={(value) => [`${value}%`, "完了率"]} />
          <Legend />
          <Line
            name="習慣の完了率"
            type="monotone"
            dataKey="completionRate"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyGraph;
