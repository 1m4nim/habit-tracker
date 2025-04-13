import React from "react";

interface ModalProps {
  message: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ message, onClose }) => {
  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <p>{message}</p>
        <button onClick={onClose} className="closeButton">
          閉じる
        </button>
      </div>
    </div>
  );
};

export default Modal;
