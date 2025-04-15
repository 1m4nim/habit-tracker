import React from "react";
import WeeklyGraph from "./WeeklyGraph";

type Props = {
  onClose: () => void;
  userIds: string[];
  habitIds?: string[];
  refreshKey: boolean;
};

const WeeklyGraphModal: React.FC<Props> = ({
  onClose,
  userIds,
  habitIds,
  refreshKey,
}) => {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeButtonStyle}>
          ✖
        </button>
        <WeeklyGraph
          userIds={userIds}
          habitIds={habitIds}
          refreshKey={refreshKey}
        />
      </div>
    </div>
  );
};

// スタイル
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "80%",
  maxWidth: "600px",
  position: "relative",
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "10px",
  right: "10px",
  fontSize: "16px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
};

export default WeeklyGraphModal;
