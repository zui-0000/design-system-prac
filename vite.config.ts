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
  },
  fmt: {
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
      // （vite-plus-prac の docs/05 を参照）
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
