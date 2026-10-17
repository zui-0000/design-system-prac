import type { CSSProperties } from "react";

import styles from "./Tokens.module.css";

type Token = { name: string; value: string };

/**
 * トークンの CSS ファイルの中身（?raw で読み込んだ文字列）から、`--名前: 値;` を取り出す。
 * 一覧を CSS から作るので、トークンを足しても、このページを書き直さなくてよい。
 */
function parseTokens(css: string, prefix: string): Token[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...withoutComments.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)]
    .map(([, name, value]) => ({ name, value: value.replace(/\s+/g, " ").trim() }))
    .filter((token) => token.name.startsWith(prefix));
}

type ListProps = {
  /** トークンの CSS ファイルの中身 */
  css: string;
  /** 一覧にするトークンの名前の始まり（例: "--spacing-"） */
  prefix: string;
};

/** 部品が使う色。-foreground の組があれば、その色で「Aa」を重ねて見せる */
export function ColorTokens({ css, prefix }: ListProps) {
  const tokens = parseTokens(css, prefix);
  const names = new Set(tokens.map((token) => token.name));
  return (
    <div className={`${styles.panel} ${styles.grid}`}>
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
}

/** 色の材料。1 色を 1 行に並べる */
export function PaletteTokens({ css, prefix }: ListProps) {
  const tokens = parseTokens(css, prefix);
  return (
    <div className={`${styles.panel} ${styles.palette}`}>
      {tokens.map((token) => (
        <div key={token.name} className={styles.paletteItem}>
          <div className={styles.paletteSwatch} style={{ backgroundColor: token.value }} />
          <code className={styles.value}>{token.name.replace(prefix, "")}</code>
          <code className={styles.value}>{token.value}</code>
        </div>
      ))}
    </div>
  );
}

type PreviewKind =
  | "fontSize"
  | "fontWeight"
  | "lineHeight"
  | "spacing"
  | "radius"
  | "elevation"
  /** 見本を描かず、名前と値だけを並べる */
  | "plain";

/** 色以外のトークン。種類ごとに、値を当てた見本を並べる */
export function ScaleTokens({ css, prefix, kind }: ListProps & { kind: PreviewKind }) {
  const tokens = parseTokens(css, prefix);
  return (
    <div className={`${styles.panel} ${styles.rows}`}>
      {tokens.map((token) => (
        <div key={token.name} className={styles.row}>
          <code className={styles.name}>{token.name}</code>
          <code className={styles.value}>{token.value}</code>
          <div>{renderPreview(kind, `var(${token.name})`)}</div>
        </div>
      ))}
    </div>
  );
}

function renderPreview(kind: PreviewKind, value: string) {
  if (kind === "plain") return null;
  const previews: Record<
    Exclude<PreviewKind, "plain">,
    { className: string; style: CSSProperties; text?: string }
  > = {
    fontSize: { className: styles.text, style: { fontSize: value }, text: "デザインシステム" },
    fontWeight: { className: styles.text, style: { fontWeight: value }, text: "デザインシステム" },
    lineHeight: {
      className: styles.lineHeight,
      style: { lineHeight: value },
      text: "行の高さの見本。長い文章を折り返したとき、行と行の間がどれくらいあくかを見る。",
    },
    spacing: { className: styles.bar, style: { width: value } },
    radius: { className: styles.box, style: { borderRadius: value } },
    elevation: { className: styles.box, style: { boxShadow: value } },
  };
  const { className, style, text } = previews[kind];
  return (
    <div className={className} style={style}>
      {text}
    </div>
  );
}
