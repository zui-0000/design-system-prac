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
- Base UI（`@base-ui/react`）に同じ役目の部品があれば、それを包んで作る（Button など）。見た目は CSS Modules で付け、状態は Base UI が付ける `data-*` 属性（`[data-disabled]` など）で見分ける
- 見た目をそろえるため、`ui/` の部品は `className` と `style` を受け付けない。置く位置や間隔は、使う側の親が決める
- 部品を作ったら、必ずストーリーを書く（Storybook で一覧にするため）。タイトルは `UI/<部品名>`

## `src/components/features/`（機能ごとの部品）

- 特定の機能（データや部品）に結びついた部品を置く。どの機能でも使える部品は `ui/` に置く
- `features/<機能名>/<部品名>/` の形にする。中身は `index.tsx` と `index.module.css`（`pages/` と同じ）

  ```
  features/Card/CardList/
  ├── index.tsx          export function CardList()
  └── index.module.css
  ```

- import はフォルダまで書く（`~/components/features/Card/CardList`）

- `features/` から `ui/` は使ってよい。`ui/` から `features/` は使わない。別の機能（`features/<別の機能名>/`）も使わない
- ストーリーは書かない。Storybook に並べるのは `ui/` の部品だけ。見た目は `/practice` などのページで確かめる

## `src/components/layouts/`（ページの外側の枠）

- ヘッダーなど、ページの枠になる部品を置く。各ページが自分で import して使う（`src/routes/__root.tsx` には置かない）
- 中身は `index.tsx` と `index.module.css`（`Header/index.tsx`）。import はフォルダまで書く（`~/components/layouts/Header`）。ストーリーは書かない
- `ui/` から `layouts/` は使わない

## `src/components/pages/`（ページ）

- 1 ページ 1 フォルダ。フォルダ名はページの名前（PascalCase）、中身は `index.tsx` と `index.module.css`

  ```
  pages/Practice/
  ├── index.tsx          export function PracticePage()
  └── index.module.css
  ```

- ページは `src/routes/` から import して使う。経路の宣言はページに書かない
- 別のページを import しない
- ページは自分で枠を組む。`<Header />` などの `layouts/` の部品と、本文を包む `<main>` をページの中に書く

## 依存の検査

- 上の依存の決まりは `.dependency-cruiser.jsonc` で検査している。import を変えたら `vp run lint:deps` を実行する
- 結果の `modules` が 0 なら、ファイルを読めていない（TypeScript 7 のため `parser: "swc"` にしている）

## リンク

- `Link` の `to` には URL を直接書かず、`src/constants/pages.ts` の `PAGES` を使う（`docs/07-ルーティング.md`）
- 外部サイトの URL も直接書かず、`src/constants/urls.ts` の `URLS` を使う。新しい外部リンクを足すときは `URLS` に足す
- 外部リンクは `target="_blank" rel="noreferrer"` で別のタブで開き、`↗`（`aria-hidden="true"`）と `global-visually-hidden` の「（新しいタブで開く）」を添える

## スタイル

- 部品のスタイルは、部品と同じフォルダの CSS Modules（`<名前>.module.css`）に書く
- トークンは `src/styles/tokens/` の直下の CSS ファイルから使う。`src/styles/tokens/primitive/` の中のトークンは使わない
- 色は `src/styles/tokens/color.css` の意味のトークン（`--color-primary`・`--color-foreground` など）だけを使う。`#fff` のような値や、`--color-primitive-*`・`--color-neutral-*`・`--color-semantic-*` を部品に直接書かない（ダークモードで切り替わらなくなる）
- CSS を変えたら `vp run lint:css` を実行する。色の値や色の材料、定義のない CSS 変数（打ち間違い）を書くと Stylelint が止める
- 余白は `--spacing-*`、部品そのものの大きさは `--size-*`（押せる部品の最小の大きさは `--size-touch-target`）、文字サイズは `--font-size-*`、角丸は `--border-radius-*`、影は `--elevation-*`、重なりは `--z-index-*` から選ぶ。合う値がなければ、値を直接書く前にトークンを足すか相談する
- レイアウトの境目（`minmax(min(16rem, 100%), 1fr)` の `16rem`、`@container (width < 30rem)` の `30rem` など）は、部品ごとの値なので直接書いてよい
- どの部品でも使うクラスだけ `src/styles/global.css` に書く。名前の先頭に `global-` を付ける（例: `global-visually-hidden`）。使うときは `className="global-visually-hidden"` と文字列で書く

## import のパス

- `src/` の中のファイルは `~/` から書く（`~/components/ui/Card/Card`）。親のフォルダへの `../` は原則使わない（lint でエラーになる）
- `../` が必要なとき（まとめ役の `index.ts` を通すと循環参照になるときなど）だけ、`// oxlint-disable-next-line no-restricted-imports -- 理由` を書いて例外にする
- 循環参照は `vp run lint:deps` が止める
- 同じフォルダのファイルだけ `./` で書く（`./Card.module.css`）
