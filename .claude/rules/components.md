---
paths:
  - "src/components/**"
---

# コンポーネントの置き方

理由は `docs/06-コンポーネントの置き方.md` にある。

## `src/components/ui/`（部品）

- 1 部品 1 フォルダ。ファイル名は部品の名前にする。`index.tsx` にしない

  ```
  ui/Card/
  ├── Card.tsx
  ├── Card.module.css
  └── Card.stories.tsx
  ```

- パーツに分かれる部品（`CardTitle` など）も、同じフォルダに置く
- 部品を作ったら、必ずストーリーを書く（Storybook で一覧にするため）。タイトルは `UI/<部品名>`

## `src/components/features/`（機能ごとの部品）

- 特定の機能（データや部品）に結びついた部品を置く。どの機能でも使える部品は `ui/` に置く
- `features/<機能名>/<部品名>/` の形にする。ファイル名の付け方は `ui/` と同じ

  ```
  features/Card/CardList/
  ├── CardList.tsx
  └── CardList.module.css
  ```

- `features/` から `ui/` は使ってよい。`ui/` から `features/` は使わない
- ストーリーは書かない。Storybook に並べるのは `ui/` の部品だけ。見た目は `/practice` などのページで確かめる

## `src/components/pages/`（ページ）

- 1 ページ 1 フォルダ。フォルダ名はページの名前（PascalCase）、中身は `index.tsx` と `index.module.css`

  ```
  pages/Practice/
  ├── index.tsx          export function PracticePage()
  └── index.module.css
  ```

- ページは `src/routes/` から import して使う。経路の宣言はページに書かない
