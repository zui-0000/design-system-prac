import { Link } from "@tanstack/react-router";

import { PAGES } from "~/constants/pages";
import { URLS } from "~/constants/urls";

import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <Link to={PAGES.HOME} className={styles.logo}>
        design-system-prac
      </Link>
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
              <span className="global-visually-hidden">（新しいタブで開く）</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
