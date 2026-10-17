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
- 部品を作ったら、必ずストーリーを書く（Storybook で一覧にするため）

## `src/components/pages/`（ページ）

- 1 ページ 1 フォルダ。フォルダ名はページの名前（PascalCase）、中身は `index.tsx` と `index.module.css`

  ```
  pages/Practice/
  ├── index.tsx          export function PracticePage()
  └── index.module.css
  ```

- ページは `src/routes/` から import して使う。経路の宣言はページに書かない
