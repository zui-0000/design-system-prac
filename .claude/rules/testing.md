# テストの書き方

単体テストは Vitest（`vp test` の `unit` のプロジェクト）で、jsdom の上で動かす。理由は `docs/16-単体テスト.md` にある。

- 確かめるファイルと同じ階層に `__tests__/` を作り、その中に `<名前>.test.ts` で置く。部品を描くなら `.test.tsx`（`utils/theme.ts` なら `utils/__tests__/theme.test.ts`）。`__tests__/` の外に置くと、テストは動かず、型チェックで止まる
- 確かめるファイルは `../` で読む（`../theme`）。`__tests__/` からは `../` を 1 つだけ使える。それより外は `~/` から書く
- `it` ではなく `test` を使う。名前は日本語で「〜の場合、〜すること」
- `describe`・`test`・`expect`・`vi` は import しない（`globals: true`。型は `tsconfig.test.json` で、テストのファイルにだけ読ませている）
- テストのためだけに export しない。外に出した関数の動きを通して確かめる
- jsdom に無いもの（`window.matchMedia` など）は、偽物を用意する。偽物は `src/__setup__/mocks/` に置き、`~/__setup__/mocks/…` で読む（`mockOsTheme`）。アプリのコードからは import しない（`vp run lint:deps` が止める）。フォルダの名前は `__mocks__` にしない（Vitest の `vi.mock()` が意味を持たせている）
- `vi.stubGlobal`・`vi.spyOn` の差し替えは、テストごとに自動で戻る（`unstubGlobals`・`restoreMocks`）。`<html>` の属性と `localStorage` も、テストごとに自動で空になる（`src/__setup__/resets/`）。テストのファイルに片付けを書かない
- `src/__setup__/setup.ts` は目次にする。処理は書かず、読むファイルを 1 行ずつ説明を付けて並べる
- `setup.ts` から読むのは、全部のテストに同じように効き、特定の機能を知らないものだけ（expect の追加、jsdom の環境を戻す）。機能の名前や `~/constants/…` が出てくるものは、`mocks/` に置いてテストから呼ぶ
- テストどうしで続いてしまうもの（`sessionStorage` など）を戻すときは、`src/__setup__/resets/<戻すもの>.ts` に `afterEach` を 1 つ書き、`setup.ts` に import を 1 行足す
- hook は `renderHook` で描き、値を変える操作は `act` で包む。hook のテストは React とのつなぎ（描き直す、登録を外す）だけにして、中身は `utils/` のテストで確かめる
- テストは `vp test` で、ストーリーのテストと一緒に動かす。単体テストだけを動かすときは `vp test --project unit`
- テストのための設定（`include`・`environment`・`setupFiles` など）は、`vite.config.ts` の `unit` のプロジェクトの中に書く。`test` の直下に書くと、storybook のプロジェクトにも引き継がれる
