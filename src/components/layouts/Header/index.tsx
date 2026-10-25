import { Link } from "@tanstack/react-router";

import { ThemeToggle } from "~/components/features/Theme/ThemeToggle";
import { PAGES } from "~/constants/pages";
import { URLS } from "~/constants/urls";

import styles from "./index.module.css";

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={PAGES.HOME} className={styles.logo}>
          design-system-prac
        </Link>
        <div className={styles.end}>
          <nav aria-label="メイン">
            <ul className={styles.navList}>
              <li>
                <Link to={PAGES.PRACTICE} className={styles.link}>
                  練習
                </Link>
              </li>
              <li>
                {/* 外部のサイトは別のタブで開く。noreferrer で、開いた先に元のページの URL と window.opener を渡さない */}
                <a
                  href={URLS.GITHUB_REPOSITORY}
                  className={styles.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                  <span aria-hidden="true">↗</span>
                  <span className={styles.visuallyHidden}>（新しいタブで開く）</span>
                </a>
              </li>
            </ul>
          </nav>
          {/* 配色の切り替えはナビゲーション（ページの移動）ではないので、nav の外に置く */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
