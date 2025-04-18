import React from "react";
import styles from "./Modal.module.css";

interface ModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  customButtons?: React.ReactNode; // customButtonsをオプションで受け取る
}

const Modal: React.FC<ModalProps> = ({
  message,
  onConfirm,
  onCancel,
  customButtons,
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttons}>
          {customButtons || (
            <>
              <button onClick={onCancel} className={styles.confirmButton}>
                キャンセル
              </button>
              <button onClick={onConfirm} className={styles.cancelButton}>
                削除
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
