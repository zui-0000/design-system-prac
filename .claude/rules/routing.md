---
paths:
  - "src/routes/**"
  - "src/main.tsx"
  - "src/App.tsx"
---

# ルーティング

TanStack Router のファイルベースルーティングを使う。理由は `docs/07-ルーティング.md` にある。

- `src/routes/` には経路の宣言（`createFileRoute`）だけを書く。画面の中身は `src/components/pages/` に置き、`component` に渡す
- ファイル名がそのまま URL になる（`practice.tsx` → `/practice`）。経路でないファイルを `routes/` に置かない。どうしても置くなら名前の先頭に `-` を付ける
- `src/routes/__root.tsx` は必須で、名前も変えられない
- `src/routeTree.gen.ts` は自動生成。手で書き換えない。コミットはする
