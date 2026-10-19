# テストの書き方

単体テストは Vitest（`vp test` の `unit` のプロジェクト）で、jsdom の上で動かす。理由は `docs/16-単体テスト.md` にある。

- 確かめるファイルと同じ階層に `__tests__/` を作り、その中に `<名前>.test.ts` で置く。部品を描くなら `.test.tsx`（`utils/theme.ts` なら `utils/__tests__/theme.test.ts`）。`__tests__/` の外に置くと、テストは動かず、型チェックで止まる
- 確かめるファイルは `../` で読む（`../theme`）。`__tests__/` からは `../` を 1 つだけ使える。それより外は `~/` から書く
- `it` ではなく `test` を使う。名前は日本語で「〜の場合、〜すること」
- `describe`・`test`・`expect`・`vi` は import しない（`globals: true`。型は `tsconfig.test.json` で、テストのファイルにだけ読ませている）
- テストのためだけに export しない。外に出した関数の動きを通して確かめる
- jsdom に無いもの（`window.matchMedia` など）は、テストの中で偽物を用意する
- テストは `vp test` で、ストーリーのテストと一緒に動かす。単体テストだけを動かすときは `vp test --project unit`
- テストのための設定（`include`・`environment`・`setupFiles` など）は、`vite.config.ts` の `unit` のプロジェクトの中に書く。`test` の直下に書くと、storybook のプロジェクトにも引き継がれる
