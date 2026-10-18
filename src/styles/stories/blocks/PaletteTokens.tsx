import { parseTokens } from "~/styles/stories/utils/parseTokens";

import styles from "./PaletteTokens.module.css";
import panel from "./panel.module.css";

type PaletteTokensProps = {
  /** トークンの CSS ファイルの中身（?raw で読み込んだ文字列） */
  css: string;
  /** 一覧にするトークンの名前の始まり（例: "--color-primitive-blue-"）。見本の名前は、ここを除いて出す */
  prefix: string;
  /** prefix に当てはまっても、一覧から外すトークンの名前の始まり（例: 白と黒の欄で、灰色を外す） */
  exclude?: string[];
};

/** 色の材料。1 色の段階を 1 行に並べる */
export function PaletteTokens({ css, prefix, exclude = [] }: PaletteTokensProps) {
  const tokens = parseTokens(css, prefix).filter(
    (token) => !exclude.some((excluded) => token.name.startsWith(excluded)),
  );
  return (
    <div className={`${panel.panel} ${styles.grid}`}>
      {tokens.map((token) => (
        <div key={token.name} className={styles.item}>
          <div className={styles.swatch} style={{ backgroundColor: token.value }} />
          <code className={styles.value}>{token.name.replace(prefix, "")}</code>
          <code className={styles.value}>{token.value}</code>
        </div>
      ))}
    </div>
  );
}
