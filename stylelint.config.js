// ==========================================================================
// CSS の lint（Stylelint）。部品の CSS に、色の値やトークンの材料を直接書かせない。
// 定義のない CSS 変数（var(--color-primay) のような打ち間違い）も止める。
// 部品の色は src/styles/tokens/color.css の意味のトークンだけを使う。理由は docs/12 にある。
// 整形は Oxfmt（vp check）が受け持つので、ここでは見た目の書き方のルールは入れない。
// ==========================================================================

import path from "node:path";

const useColorToken =
  "src/styles/tokens/color.css の意味のトークン（--color-primary など）を使ってください（docs/12）";

const noThemeBranch =
  "配色（ライト・ダーク）ごとに書き分けないでください。意味のトークン（--color-primary など）を使えば、どちらの配色にも切り替わります（docs/15）";

// トークンの入口。アプリと同じく main.css から @import をたどって、定義のある CSS 変数を集める。
// プラグインは相対パスを実行した場所から探すので、どこから実行しても同じになるよう絶対パスにする
const tokenEntry = path.join(import.meta.dirname, "src/styles/main.css");

// Base UI が、動いている間に部品の要素へ付ける CSS 変数（ポップアップの位置や、使える高さなど）。
// トークンではないので main.css には無いが、使ってよい名前として教える。
// 使うものだけを足す。値は Base UI が入れるので、ここでは名前だけを渡す（docs/21）
const baseUiCustomProperties = {
  customProperties: Object.fromEntries(
    [
      "--available-height", // ポップアップを出せる残りの高さ（Menu など）
      "--transform-origin", // ポップアップが広がる起点（trigger の側）
    ].map((name) => [name, ""]),
  ),
};

/** @type {import('stylelint').Config} */
export default {
  plugins: ["stylelint-value-no-unknown-custom-properties"],

  // tokens/ の中は、トークンを定義する場所（色の値や材料を書く）なので検査しない。
  // styles/stories/（Storybook のトークンの一覧のページ）の CSS は、部品と同じく検査する
  ignoreFiles: ["src/styles/tokens/**"],

  rules: {
    // 定義のない CSS 変数を使わない。打ち間違えても、CSS はエラーにならず、その指定がなかったことになるため。
    // 定義のある名前は、main.css が読み込むトークンと、同じファイルで定義した変数（--button-* など）と、
    // Base UI が付ける変数（baseUiCustomProperties）。
    // 色の材料もトークンとして定義はあるので、ここでは止めない（下の declaration-property-value-disallowed-list が止める）
    "csstools/value-no-unknown-custom-properties": [
      true,
      {
        importFrom: [tokenEntry, baseUiCustomProperties],
        message: (name) =>
          `${name} は定義されていない CSS 変数です。打ち間違いがないか、src/styles/tokens/ のトークンの名前を確かめてください（docs/12）`,
      },
    ],

    // #fff のような色の値を書かない
    "color-no-hex": [true, { message: `色の値を直接書かず、${useColorToken}` }],

    // red や white のような色の名前を書かない
    "color-named": ["never", { message: `色の名前を直接書かず、${useColorToken}` }],

    // rgb() や oklch() で色を作らない。color-mix() は、意味のトークンを混ぜるときに使うので許す
    "function-disallowed-list": [
      ["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch", "color"],
      { message: (name) => `${name}() で色を作らず、${useColorToken}` },
    ],

    // 色の材料（tokens/primitive/color.css のトークン）を使わない。ダークモードで切り替わらなくなる
    "declaration-property-value-disallowed-list": [
      { "/.*/": ["/--color-(primitive|neutral)-/"] },
      {
        message: `色の材料（--color-primitive-* など）は使わず、${useColorToken}`,
      },
    ],

    // 配色（ライト・ダーク）ごとの書き分けを、部品の CSS に書かない。
    // @media (prefers-color-scheme) は OS の設定しか見ないので、ヘッダーのスイッチで選んだ配色では切り替わらない。
    // [data-theme] で書き分けると、部品ごとに 2 重に書くことになる。
    // 意味のトークンを使えば、どちらの配色にも切り替わる（docs/15）
    "media-feature-name-disallowed-list": [["prefers-color-scheme"], { message: noThemeBranch }],
    "selector-attribute-name-disallowed-list": [["data-theme"], { message: noThemeBranch }],
  },
};
