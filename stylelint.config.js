// ==========================================================================
// CSS の lint（Stylelint）。部品の CSS に、色の値やトークンの材料を直接書かせない。
// 部品の色は src/styles/tokens/color.css の意味のトークンだけを使う。理由は docs/12 にある。
// 整形は Oxfmt（vp check）が受け持つので、ここでは見た目の書き方のルールは入れない。
// ==========================================================================

const useColorToken =
  "src/styles/tokens/color.css の意味のトークン（--color-primary など）を使ってください（docs/12）";

/** @type {import('stylelint').Config} */
export default {
  // トークンの定義そのものは、色の値や材料を書く場所なので検査しない
  ignoreFiles: ["src/styles/tokens/**"],

  rules: {
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
      { "/.*/": ["/--color-(primitive|neutral|semantic)-/"] },
      {
        message: `色の材料（--color-primitive-* など）は使わず、${useColorToken}`,
      },
    ],
  },
};
