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
  userIds: string[]; // ユーザーのIDのリスト
  refreshKey?: boolean; // 再読み込みのためのフラグ
};

type GraphData = {
  date: string; // グラフの日付
  displayDate: string; // 表示用の日付（月/日形式）
  completionRate: number; // 完了率（%）
};

type CompletedDate = {
  id: string; // 完了日データのID
  userId: string; // ユーザーID
  habitId: string; // 完了した習慣のID
  createdAt: Timestamp; // 完了した日時
};

const WeeklyGraph = ({ userIds, refreshKey }: Props) => {
  const [data, setData] = useState<GraphData[]>([]); // グラフ用データ
  const [loading, setLoading] = useState(true); // データ読み込み中かどうかのフラグ

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // データ読み込み中にする
        console.log("データ取得処理が開始されました"); // 処理開始の確認

        // ✅ 過去7日分の日付を生成する
        const dates = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i); // 今日からi日前の日付を取得
          dates.push(date);
        }
        console.log("過去7日間の日付:", dates);

        // ✅ 現在の習慣（habits）を取得する
        const habitsQuery = query(
          collection(db, "habits"),
          where("userId", "in", userIds) // ユーザーIDが一致する習慣を取得
        );
        const habitsSnapshot = await getDocs(habitsQuery);
        const habitsData = habitsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("取得した習慣データ:", habitsData); // 取得した習慣データをログに出力

        // 現在の習慣IDをリスト化
        const currentHabitIds = habitsData.map((habit) => habit.id);
        console.log("現在の習慣ID:", currentHabitIds); // 現在の習慣IDをログに出力

        // ✅ 完了日データ（completedDates）を取得する
        const completedQuery = query(
          collection(db, "completedDates"),
          where("userId", "in", userIds) // ユーザーIDが一致する完了データを取得
        );
        const completedSnapshot = await getDocs(completedQuery);
        const completedData: CompletedDate[] = completedSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<CompletedDate, "id">),
          })
        );

        console.log("取得した完了データ:", completedData); // 取得した完了データをログに出力

        // ✅ グラフ用のデータに整形する
        const graphData: GraphData[] = dates.map((date) => {
          const dateString = date.toISOString().split("T")[0]; // 日付をISO形式にして年月日を取得
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0); // その日の開始時刻
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999); // その日の終了時刻

          // 完了した習慣の数をカウントする
          const completedCount = completedData.filter((item) => {
            // 完了日データがその日の範囲内か確認
            const itemDate =
              item.createdAt instanceof Timestamp
                ? item.createdAt.toDate()
                : new Date(item.createdAt);

            const isInDateRange =
              itemDate >= startOfDay && itemDate <= endOfDay;

            // 現在の習慣のIDと一致する完了データかどうか
            const isCurrentHabit = currentHabitIds.includes(item.habitId);

            // 両方の条件を満たした場合にカウントする
            return isInDateRange && isCurrentHabit;
          }).length;

          // 現在の習慣の総数
          const totalHabits = habitsData.length;

          // 完了率を計算
          const completionRate =
            totalHabits > 0
              ? Math.round((completedCount / totalHabits) * 100)
              : 0; // 完了率 = (完了した習慣数 / 総習慣数) * 100

          // グラフ用のデータを返す
          return {
            date: dateString, // 日付
            displayDate: `${date.getMonth() + 1}/${date.getDate()}`, // 月/日形式の日付
            completionRate, // 完了率
          };
        });

        console.log("グラフデータ:", graphData); // グラフデータをログに出力

        setData(graphData); // グラフデータをセット
      } catch (error) {
        console.error("❌ データ取得中のエラー:", error);
      } finally {
        setLoading(false); // 読み込み完了
      }
    };

    fetchData();
  }, [userIds, refreshKey]); // userIds または refreshKey が変わったときに再実行

  // ユーザーIDが指定されていない場合
  if (userIds.length === 0) {
    return <div>ユーザーIDが指定されていません</div>;
  }

  // データが読み込まれていない場合
  if (loading) {
    return <div>データを読み込み中...</div>;
  }

  // グラフの描画部分
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
