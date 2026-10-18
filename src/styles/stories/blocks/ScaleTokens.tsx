import type { CSSProperties } from "react";

import { parseTokens } from "~/styles/stories/utils/parseTokens";

import panel from "./panel.module.css";
import styles from "./ScaleTokens.module.css";

type PreviewKind =
  | "fontSize"
  | "fontWeight"
  | "lineHeight"
  | "spacing"
  | "size"
  | "radius"
  | "elevation"
  /** 見本を描かず、名前と値だけを並べる */
  | "plain";

type ScaleTokensProps = {
  /** トークンの CSS ファイルの中身（?raw で読み込んだ文字列） */
  css: string;
  /** 一覧にするトークンの名前の始まり（例: "--spacing-"） */
  prefix: string;
  /** 見本の描き方 */
  kind: PreviewKind;
};

/** 色以外のトークン。1 行に「名前・値・見本」を並べる。見本は、種類ごとに値を当てて描く */
export function ScaleTokens({ css, prefix, kind }: ScaleTokensProps) {
  const tokens = parseTokens(css, prefix);
  return (
    <div className={`${panel.panel} ${styles.rows}`}>
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
    size: { className: styles.square, style: { width: value, height: value } },
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
