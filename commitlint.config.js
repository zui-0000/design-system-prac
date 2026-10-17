// ==========================================================================
// コミットメッセージの決まり（commitlint）。
// 形式: <type>(<scope 任意>): <説明>
//   例: feat: ヘッダーを作る
//       docs(readme): セットアップ手順を書く
// .vite-hooks/commit-msg から、コミットのたびに検査する。理由は docs/11 にある。
// ==========================================================================

/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],

  rules: {
    // --- 文字数の制限: すべて無効にする ---
    // 日本語は 1 文字の情報量が多く、既定の 100 文字だと本文の折り返しで
    // 引っかかりやすいため。
    "header-max-length": [0],
    "body-max-line-length": [0],
    "footer-max-line-length": [0],

    // --- 英語が前提の検査: 無効にする ---
    // 既定では説明の先頭の大文字を弾くため、「feat: UI を直す」のように
    // 英大文字の略語で始まる日本語の説明も弾かれてしまう。
    "subject-case": [0],
  },

  // --- 以下は @commitlint/config-conventional の既定のまま ---
  // type-enum: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test
  // scope-enum: 制限なし（scope は任意で、名前も自由）
  // subject-full-stop: 説明の末尾の半角ピリオドを禁止（全角の「。」は検出されない）
  // merge・revert・fixup のコミットは、commitlint の defaultIgnores で自動で飛ばされる
};
