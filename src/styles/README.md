# styles

全体に効く CSS と、デザイントークン（CSS 変数）を置く。仕組みと理由は [docs/12 デザイントークン](../../docs/12-デザイントークン.md) にある。

## 構成

```text
styles/
├── global.css               トークンを読み込み、全体の土台を整える（main.tsx と .storybook/preview.tsx が読み込む）
└── tokens/
    ├── primitive/
    │   └── color.css        色の材料。部品からは使わない
    ├── color.css            色（意味のトークン）
    ├── font-size.css        文字サイズ・文字の太さ
    ├── font-family.css      書体
    ├── line-height.css      行の高さ
    ├── border-radius.css    角丸
    ├── elevation.css        影
    ├── spacing.css          余白
    ├── size.css             部品の大きさ（押せる部品の最小の大きさなど）
    ├── z-index.css          重なりの順番
    ├── DADS-LICENSE.txt     デジタル庁デザインシステムを元にした値のライセンス
    └── stories/             Storybook のトークン一覧のページ（Foundations/Tokens）
        ├── Tokens.mdx       ページ
        ├── Tokens.tsx       一覧の見本を描く部品（Tokens.mdx だけが使う）
        └── Tokens.module.css
```

## 部品から使うトークン

**`tokens/primitive/color.css` のトークンは、部品から使わない。** 色は `tokens/color.css` のトークンだけを使う。

部品の CSS では、`tokens/` の直下の CSS のトークンを `var()` で使う。import は要らない（`global.css` が `:root` に定義している）。

| 決めたいもの     | ファイル            | 例                                              |
| ---------------- | ------------------- | ----------------------------------------------- |
| 色               | `color.css`         | `var(--color-primary)`、`var(--color-border)`   |
| 余白             | `spacing.css`       | `var(--spacing-16)`                             |
| 部品の大きさ     | `size.css`          | `var(--size-touch-target)`                      |
| 文字サイズ・太さ | `font-size.css`     | `var(--font-size-20)`、`var(--font-weight-700)` |
| 行の高さ         | `line-height.css`   | `var(--line-height-130)`                        |
| 角丸             | `border-radius.css` | `var(--border-radius-8)`                        |
| 影               | `elevation.css`     | `var(--elevation-1)`                            |
| 重なり           | `z-index.css`       | `var(--z-index-header)`                         |

## 検査

```zsh
vp run lint:css
```

部品の CSS に、色の値（`#fff` など）や色の材料（`--color-primitive-*` など）を書いていないかを、Stylelint で確かめる。コミット時にも動く。

検査するルールは、リポジトリのルートの [`stylelint.config.js`](../../stylelint.config.js) を参照。
