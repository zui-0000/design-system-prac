import { parseTokens } from "../utils/parseTokens";

import styles from "./ColorTokens.module.css";
import panel from "./panel.module.css";

type ColorTokensProps = {
  /** トークンの CSS ファイルの中身（?raw で読み込んだ文字列） */
  css: string;
  /** 一覧にするトークンの名前の始まり（例: "--color-"） */
  prefix: string;
};

/** 部品が使う色。-foreground の組があれば、その色で「Aa」を重ねて見せる */
export const ColorTokens = ({ css, prefix }: ColorTokensProps) => {
  const tokens = parseTokens(css, prefix);
  const names = new Set(tokens.map((token) => token.name));
  return (
    <div className={`${panel.panel} ${styles.grid}`}>
      {tokens
        .filter((token) => !token.name.endsWith("-foreground"))
        .map((token) => {
          const foreground = `${token.name}-foreground`;
          return (
            <div key={token.name} className={styles.item}>
              <div className={styles.swatch} style={{ backgroundColor: `var(${token.name})` }}>
                {names.has(foreground) && (
                  <span className={styles.sample} style={{ color: `var(${foreground})` }}>
                    Aa
                  </span>
                )}
              </div>
              <code className={styles.name}>{token.name}</code>
              {names.has(foreground) && <code className={styles.value}>文字: {foreground}</code>}
            </div>
          );
        })}
    </div>
  );
};
