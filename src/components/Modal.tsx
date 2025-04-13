import { useState } from "react";
import LineChart from "./LineChart"; // LineChartコンポーネントをインポート

type Props = {
  userIds: string[]; // 複数ユーザーID
};

export default function GraphButton({ userIds }: Props) {
  const [showGraph, setShowGraph] = useState(false);

  return (
    <>
      {/* 📊 固定ボタン */}
      <button
        onClick={() => setShowGraph(!showGraph)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000, // 最前面に表示
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "12px 16px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
          fontSize: "16px", // ボタンの文字サイズを少し大きくして視認性を高める
        }}
      >
        📊 グラフを見る
      </button>

      {/* 📈 グラフパネル */}
      {showGraph && (
        <div
          style={{
            position: "fixed",
            bottom: "80px", // ボタンの上に表示されるように調整
            right: "20px", // 右端に固定
            width: "360px",
            height: "320px",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "12px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
            zIndex: 999, // ボタンより少し下
            padding: "12px",
            overflow: "hidden", // グラフが溢れないように調整
          }}
        >
          <h3 style={{ marginBottom: "8px" }}>1週間の完了率</h3>
          <LineChart userIds={userIds} />
        </div>
      )}
    </>
  );
}
