# styles

全体に効く CSS と、デザイントークン（CSS 変数）を置く。仕組みと理由は [docs/12 デザイントークン](../../docs/12-デザイントークン.md) にある。

## 構成

```text
styles/
├── main.css                 入口。トークンと reset.css を読み込み、body と #root の土台を書く（main.tsx と .storybook/preview.tsx が読み込む）
├── reset.css                ブラウザの見た目の癖を消す。中身は kiso.css（npm）に任せ、変えるものだけを書く。トークンは使わない
├── tokens/                  トークンだけを置く
│   ├── primitive/
│   │   └── base-color.css   色の材料。部品からは使わない
│   ├── color.css            色（意味のトークン）
│   ├── font.css             書体・文字サイズ・文字の太さ
│   ├── line-height.css      行の高さ
│   ├── border-radius.css    角丸
│   ├── elevation.css        影
│   ├── spacing.css          余白
│   ├── size.css             部品の大きさ（押せる部品の最小の大きさ、アイコンの大きさ）
│   ├── z-index.css          重なりの順番
│   └── DADS-LICENSE.txt     デジタル庁デザインシステムを元にした値のライセンス
└── stories/                 Storybook のトークンのページ（Design Tokens）。トークンのファイルと 1 対 1
    ├── color.mdx            Design Tokens/Color
    ├── font.mdx             Design Tokens/Font
    ├── line-height.mdx      Design Tokens/Line Height
    ├── border-radius.mdx    Design Tokens/Border Radius
    ├── elevation.mdx        Design Tokens/Elevation
    ├── spacing.mdx          Design Tokens/Spacing
    ├── size.mdx             Design Tokens/Size
    ├── z-index.mdx          Design Tokens/Z Index
    ├── primitive/
    │   └── base-color.mdx   Design Tokens/Primitive/Base Color
    ├── blocks/              ページに置く部品（見本を描く）
    │   ├── ColorTokens.tsx      Color のページ
    │   ├── PaletteTokens.tsx    Primitive/Base Color のページ
    │   ├── ScaleTokens.tsx      残りの 7 ページ（見本の描き方を kind で選ぶ）
    │   ├── panel.module.css     一覧を囲む、今の配色の面
    │   └── *.module.css         部品ごとの見た目
    └── utils/               部品が使う関数
        └── parseTokens.ts       CSS の文字列からトークンを取り出す
```

## 部品から使うトークン

**`tokens/primitive/base-color.css` のトークンは、部品から使わない。** 色は `tokens/color.css` のトークンだけを使う。

`primitive` は、TS のプリミティブ型（`string`・`number`）と同じ言葉で、意味の名前が付く前の材料の値のこと。部品が使うのは、意味の名前が付いた `tokens/color.css` のほう。TS で、`string` のまま使い回さずに `type Email = string` を作って使うのと同じ（[docs/12](../../docs/12-デザイントークン.md) の「primitive という名前」）。

部品の CSS では、`tokens/` の直下の CSS のトークンを `var()` で使う。import は要らない（`main.css` が読み込むトークンのファイルが `:root` に定義している）。

ファイル名は、トークンの名前の始まりにそろえている（`--font-*` は `font.css`、`--line-height-*` は `line-height.css`）。名前を見れば、どのファイルにあるか分かる。トークンを足すときも、この決まりで置き場所を決める。

| 決めたいもの           | ファイル            | 例                                              |
| ---------------------- | ------------------- | ----------------------------------------------- |
| 色                     | `color.css`         | `var(--color-primary)`、`var(--color-border)`   |
| 余白                   | `spacing.css`       | `var(--spacing-16)`                             |
| 部品の大きさ           | `size.css`          | `var(--size-touch-target)`、`var(--size-icon)`  |
| 書体・文字サイズ・太さ | `font.css`          | `var(--font-size-20)`、`var(--font-weight-700)` |
| 行の高さ               | `line-height.css`   | `var(--line-height-130)`                        |
| 角丸                   | `border-radius.css` | `var(--border-radius-8)`                        |
| 影                     | `elevation.css`     | `var(--elevation-1)`                            |
| 重なり                 | `z-index.css`       | `var(--z-index-header)`                         |

VS Code では、おすすめの拡張機能（CSS Variable Autocomplete）を入れると、`var(--` で候補が出て、Cmd + クリックで定義に飛べる（[docs/12](../../docs/12-デザイントークン.md) の「VS Code で定義に飛ぶ」）。

## 検査

```zsh
vp run lint:css
```

部品の CSS に、色の値（`#fff` など）や色の材料（`--color-primitive-*` など）を書いていないか、定義のない CSS 変数（打ち間違い。Base UI が付ける `--available-height` などは定義のある名前として扱う）を使っていないか、配色ごとの書き分け（`@media (prefers-color-scheme)` など）をしていないかを、Stylelint で確かめる。コミット時にも動く。VS Code では、おすすめの拡張機能（Stylelint）を入れると、書いている最中に赤線が出る。

検査するルールは、リポジトリのルートの [`stylelint.config.js`](../../stylelint.config.js) を参照。
