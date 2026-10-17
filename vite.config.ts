import path from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

// https://vite.dev/config/
export default defineConfig({
  staged: {
    "*": "vp check --fix",
    // src の TS を変えたときは、依存の向きも検査する（.dependency-cruiser.jsonc）。
    // 関数にすると、ステージしたファイルの名前を引数に付けずに実行する
    "src/**/*.{ts,tsx}": () => "vp run lint:deps",
    // CSS は、ステージしたファイルだけを Stylelint で検査する（stylelint.config.js）。
    // tokens/ だけをステージしたときは検査するファイルが 0 になるので、--allow-empty-input で通す
    "src/**/*.css": "stylelint --allow-empty-input",
  },
  fmt: {
    // import を並べ替える。グループ（外部パッケージ → ~/ → 相対）ごとに分け、グループの中は名前順。
    // 副作用だけの import（import "./x.css" など）は動かさない。読み込む順番に意味があるため
    sortImports: true,
    // Markdown の中のコードブロックは整形しない。docs のコード例は、説明のために書いた形のまま残す
    // （整形すると、JSX の例の行末に ; が付くなどして読みにくくなる）
    embeddedLanguageFormatting: "off",
    // TanStack Router が生成するファイル。整形しても次の生成で書き戻される
    ignorePatterns: ["src/routeTree.gen.ts"],
    overrides: [
      {
        // JSONC は末尾のカンマを書けるが、VS Code は警告を出す。カンマを付けないように整形する
        files: ["**/*.jsonc"],
        options: { trailingComma: "none" },
      },
    ],
  },
  lint: {
    ignorePatterns: ["src/routeTree.gen.ts"],
    plugins: ["react", "typescript", "oxc"],
    rules: {
      "react/rules-of-hooks": "error",
      "react/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
      // ----------------------------------------------------------------------
      // React Compiler 系のルール。
      // 違反があると Compiler が最適化をスキップするので error にする
      // ----------------------------------------------------------------------
      "react/error-boundaries": "error",
      "react/globals": "error",
      "react/immutability": "error",
      "react/incompatible-library": "error",
      "react/preserve-manual-memoization": "error",
      "react/purity": "error",
      "react/refs": "error",
      "react/set-state-in-effect": "error",
      "react/set-state-in-render": "error",
      "react/static-components": "error",
      "react/unsupported-syntax": "error",
      "react/use-memo": "error",
      "vite-plus/prefer-vite-plus-imports": "error",
      // 親のフォルダへさかのぼる import（../）を禁止し、~/ で書かせる。同じフォルダの ./ は許す
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../**"],
              message:
                "親のフォルダへの相対パスは使わず、~/ から書いてください（例: ~/components/ui/Card/Card）",
            },
          ],
        },
      ],
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
  resolve: {
    // tsconfig.app.json の paths と対で必要。tsc は型を、こちらは実際の解決を受け持つ
    alias: { "~": path.join(import.meta.dirname, "src") },
  },
  plugins: lazyPlugins(() => [
    // src/routes/ の構成から src/routeTree.gen.ts を作る。react より前に置く必要がある
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react({
      compiler: true,
    }),
  ]),
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // Storybook のストーリーを Vitest のテストとして実行する
          // https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
          storybookTest({
            configDir: path.join(import.meta.dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
      },
    ],
  },
});
