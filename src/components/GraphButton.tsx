import React, { useState } from "react";
import WeeklyGraph from "./WeeklyGraph";

interface GraphButtonProps {
  userIds: string[];
  refreshKey: boolean; // refreshKeyがどこで使われるかが不明ですが、必要な場合は他のロジックで使う
}

const GraphButton: React.FC<GraphButtonProps> = ({ userIds, refreshKey }) => {
  const [showGraph, setShowGraph] = useState(false); // showGraphの状態を追加

  return (
    <>
      <button
        onClick={() => setShowGraph((prev) => !prev)} // ボタンの切り替え
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "12px 16px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        {showGraph ? "✖️ 閉じる" : "📊 グラフを見る"}
      </button>

      {showGraph && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "400px",
            height: "300px",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "12px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
            zIndex: 999,
            padding: "12px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3 style={{ marginBottom: "8px" }}>1週間の完了率</h3>
          <div style={{ flex: 1 }}>
            <WeeklyGraph userIds={userIds} refreshKey={refreshKey} />{" "}
            {/* WeeklyGraphにrefreshKeyを渡す */}
          </div>
        </div>
      )}
    </>
  );
};

export default GraphButton;
