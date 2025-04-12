import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import {
  loginAnonymously,
  loginWithGoogle,
  logout,
  auth,
} from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth"; // authの状態監視用

const Header = () => {
  const [user, setUser] = useState<any>(null); // user状態を追加
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // 認証状態を更新
    });
    return () => unsubscribe(); // クリーンアップ
  }, []);

  // 外クリックでメニューを閉じる処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.left}>習慣トラッカー</div>

      {/* PC用ログインボタン */}
      <div className={styles.loginButtonsPC}>
        {user ? (
          <>
            <span className={styles.userText}>
              ログイン中：{user.isAnonymous ? "匿名ユーザー" : user.displayName}
            </span>
            <button className={styles.button} onClick={logout}>
              ログアウト
            </button>
          </>
        ) : (
          <>
            <button className={styles.button} onClick={loginAnonymously}>
              匿名でログイン
            </button>
            <button className={styles.button} onClick={loginWithGoogle}>
              Googleでログイン
            </button>
          </>
        )}
      </div>

      {/* スマホ用ハンバーガーメニュー */}
      <div className={styles.hamburgerMenu} ref={menuRef}>
        <button
          className={styles.menuButton}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="メニューを開く"
        >
          <img
            src="/hamburger.png"
            className={styles.hamburgerImage}
            alt="メニュー"
          />
        </button>

        {menuOpen && (
          <div className={styles.dropdownMenu}>
            {user ? (
              <>
                <p className={styles.menuText}>
                  ログイン中：
                  {user.isAnonymous ? "匿名ユーザー" : user.displayName}
                </p>
                <button className={styles.menuButtonItem} onClick={logout}>
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <button
                  className={styles.menuButtonItem}
                  onClick={loginAnonymously}
                >
                  匿名でログイン
                </button>
                <button
                  className={styles.menuButtonItem}
                  onClick={loginWithGoogle}
                >
                  Googleでログイン
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
