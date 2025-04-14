import HabitList from "./HabitList";
import WeeklyGraph from "./WeeklyGraph";
import { useState } from "react";

const HabitDashboard = () => {
  const [refreshGraph, setRefreshGraph] = useState(false);
  const [userIds, setUserIds] = useState<string[]>(["ユーザーID1"]); // userIdsを状態として管理

  // グラフを更新するためのトリガー
  const triggerGraphRefresh = () => {
    setRefreshGraph((prev) => !prev);
  };

  return (
    <div style={{ border: "2px solid #ccc", padding: "20px" }}>
      <h2>✅ 1週間の完了率</h2>
      <div style={{ height: "300px" }}>
        <WeeklyGraph userIds={userIds} refreshKey={refreshGraph} />
      </div>

      {/* HabitListにonCompleteを渡し、完了処理時にグラフを更新 */}
      <HabitList onComplete={triggerGraphRefresh} userIds={userIds} />
    </div>
  );
};

export default HabitDashboard;
