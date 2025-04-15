import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

type WeeklyGraphProps = {
  userIds: string[];
  habitIds?: string[];
  refreshKey: boolean;
};

type CompletionRate = {
  date: string;
  completionRate: number;
};

const getPast7Dates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

const WeeklyGraph: React.FC<WeeklyGraphProps> = ({
  userIds,
  habitIds,
  refreshKey,
}) => {
  const [data, setData] = useState<CompletionRate[]>([]);

  useEffect(() => {
    const fetchCompletionData = async () => {
      if (!userIds.length) return;

      const past7Dates = getPast7Dates();

      const allHabits: any[] = [];

      for (const uid of userIds) {
        const q = query(collection(db, "habits"), where("userId", "==", uid));

        const snapshot = await getDocs(q);
        snapshot.forEach((doc) => {
          const habit = doc.data();
          if (!habitIds || habitIds.includes(doc.id)) {
            allHabits.push({
              id: doc.id,
              ...habit,
            });
          }
        });
      }

      const result: CompletionRate[] = past7Dates.map((date) => {
        let completedCount = 0;
        let total = 0;

        allHabits.forEach((habit) => {
          if (habit.completedDates && Array.isArray(habit.completedDates)) {
            if (habit.completedDates.includes(date)) {
              completedCount++;
            }
          }
          total++;
        });

        const rate = total > 0 ? (completedCount / total) * 100 : 0;

        return {
          date,
          completionRate: Math.round(rate),
        };
      });

      setData(result);
    };

    fetchCompletionData();
  }, [userIds, habitIds, refreshKey]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          stroke="#000"
          tickFormatter={(dateStr) => {
            const date = new Date(dateStr);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
        />

        <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
        <Tooltip formatter={(value) => `${value}%`} />
        <Bar dataKey="completionRate" fill="#4CAF50" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklyGraph;
