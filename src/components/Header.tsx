import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import LoginButtons from "./LoginButtons";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      <div className={styles.right} ref={menuRef}>
        <button
          className={styles.menuButton}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="メニューを開く"
        >
          <img
            src="/hamburger.png"
            className={styles.hamburgerImage}
            alt="ハンバーガーメニュー"
          />
        </button>
        <div
          className={`${styles.dropdownMenu} ${
            menuOpen ? styles.open : styles.closed
          }`}
        >
          <LoginButtons />
        </div>
      </div>
    </header>
  );
};

export default Header;
