// GraphButton.tsx
import { useState } from "react";
import LineChart from "./LineChart";

type Props = {
  userIds: string[]; // 複数ユーザーに変更
};

export default function GraphButton({ userIds }: Props) {
  return (
    <>
      <button
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
        📊 グラフを見る
      </button>

      <div
        style={{
          position: "fixed",
          bottom: "80px",
          right: "20px",
          width: "360px",
          height: "320px",
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "12px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
          zIndex: 999,
          padding: "12px",
          overflow: "hidden",
        }}
      >
        <h3 style={{ marginBottom: "8px" }}>1週間の完了率</h3>
        <LineChart userIds={userIds} />
      </div>
    </>
  );
}
