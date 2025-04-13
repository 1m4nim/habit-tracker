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
import {
  db,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "../lib/firebase"; // Firebaseからデータをインポート

type Props = {
  userIds: string[];
};

// グラフデータの型定義
type GraphData = {
  date: string;
  completionRate: number;
};

type CompletedDate = {
  id: string;
  userId: string;
  createdAt: Timestamp;
};

const WeeklyGraph = ({ userIds }: Props) => {
  const [data, setData] = useState<GraphData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userIds.length === 0) return;

        setLoading(true);

        // 過去7日間の日付を生成
        const dates = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dates.push(date);
        }

        // Firestoreからデータを取得
        const habitsQuery = query(
          collection(db, "habits"),
          where("userId", "in", userIds)
        );
        const querySnapshot = await getDocs(habitsQuery);

        // 取得したhabitデータを整理
        const habitsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // completedDatesコレクションからデータを取得
        const completedDatesQuery = query(
          collection(db, "completedDates"),
          where("userId", "in", userIds)
        );
        const completedDatesSnapshot = await getDocs(completedDatesQuery);

        const completedDatesData: CompletedDate[] =
          completedDatesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as CompletedDate[];

        // 日付ごとの完了率を計算
        const graphData = dates.map((date) => {
          const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD形式
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);

          // その日に完了したhabitの数をカウント
          const completedCount = completedDatesData.filter((item) => {
            const itemDate =
              item.createdAt instanceof Timestamp
                ? item.createdAt.toDate()
                : new Date(item.createdAt || "");
            return itemDate >= startOfDay && itemDate <= endOfDay;
          }).length;

          // その日のhabitの総数（userIdsに関連するすべてのhabit）
          const totalHabits = habitsData.length;

          // 完了率を計算（0～100%）
          const completionRate =
            totalHabits > 0
              ? Math.round((completedCount / totalHabits) * 100)
              : 0;

          return {
            date: dateString,
            completionRate: completionRate,
            // 日本語表示用のフォーマット
            displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
          };
        });

        setData(graphData);
      } catch (error) {
        console.error("データの取得中にエラーが発生しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userIds]);

  if (userIds.length === 0) {
    return <div>ユーザーIDが指定されていません</div>;
  }

  if (loading) {
    return <div>データを読み込み中...</div>;
  }

  return (
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
  );
};

export default WeeklyGraph;
