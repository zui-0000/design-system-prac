# Flexbox で並べる

記録日: 2026-10-17

段階 1 で Card を作ったときに学んだ、`display: flex` の基本。

## 何が起きるのか

`display: flex` を付けた要素を **flex コンテナ**、その**直接の子**を **flex アイテム**と呼ぶ。flex アイテムが、決めた向きに並ぶ。

```html
<!-- .row が flex コンテナ、A・B・C が flex アイテム -->
<div class="row">
  <div>A</div>
  <div>B</div>
  <div>C</div>
</div>
```

```css
.row {
  display: flex;
}
```

| 指定            | 見た目                                       |
| --------------- | -------------------------------------------- |
| なし            | `div` は 1 つで 1 行を使うので、縦に積まれる |
| `display: flex` | 横一列に並ぶ                                 |

`display: flex` は**親**に付ける。子に付けると、その子の中身が並ぶだけになる。

## 並べ方を決めるプロパティ

どれも親（コンテナ）に書く。

| プロパティ        | 決めること                     | よく使う値                                                                |
| ----------------- | ------------------------------ | ------------------------------------------------------------------------- |
| `flex-direction`  | 並べる向き                     | `row`（横、初期値）／`column`（縦）                                       |
| `gap`             | アイテムの間の余白             | `0.5rem` など                                                             |
| `justify-content` | 並ぶ方向での寄せ方             | `flex-start`／`center`／`space-between`（両端に寄せて、間を均等にあける） |
| `align-items`     | 並ぶ方向と直角の方向での揃え方 | `stretch`（初期値、伸ばす）／`center`                                     |
| `flex-wrap`       | 入りきらないときに折り返すか   | `nowrap`（初期値）／`wrap`                                                |

`justify-content` と `align-items` は、`flex-direction` によって向きが入れ替わる。

- 横並び（`row`）: `justify-content` が横の寄せ方、`align-items` が縦の揃え方
- 縦並び（`column`）: その逆

覚え方: **`justify` は並ぶ方向、`align` はその直角**。

## 余白は子の margin ではなく `gap` で決める

子に `margin` を付けて回ると、最初や最後の子だけ余白を消す、といった調整が必要になる。`gap` はアイテムの**間**にだけ余白を入れるので、1 か所で決まり、崩れにくい。

### 1 か所だけ間隔を変えたいとき

`gap` はすべての間に同じ余白を入れるので、1 か所だけ変えることはできない。基本の考え方は「**`gap` で揃えて、例外だけ margin**」。

**やり方 1: その要素にだけ margin を足す**

flex アイテムの margin は `gap` に**足し算**される。

```css
.card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* 基本の間隔 */
}

.footer {
  margin-top: 0.5rem; /* footer の上だけ 0.75 + 0.5 = 1.25rem になる */
}
```

Card の `.footer` の `padding-top: 0.5rem` も同じ考え方で、本文と操作の間だけを広くしている（関係のあるものは近く、別のまとまりとは広く）。

足し算になるのは flex アイテムだから。flex を使わない普通の縦積みでは、上下に並んだ margin は足されず、大きいほうだけが残る（**margin の相殺**）。flex アイテムでは相殺が起きない。

**やり方 2: まとまりごとに包む**

違う間隔が何種類もあるときは、要素をまとまりで包み、それぞれに `gap` を付ける。

```html
<!-- .card は gap: 1.5rem（まとまり同士は広く）、.header は gap: 0.25rem（見出しと補足は近く） -->
<article class="card">
  <div class="header">
    <h2>見出し</h2>
    <p>補足</p>
  </div>
  <div class="body">本文</div>
</article>
```

どの間隔も `gap` で決まるので、margin で個別に調整する場所がなくなる。「この要素同士は仲間」という構造が HTML に表れるのも利点。

| 状況                   | やり方                                     |
| ---------------------- | ------------------------------------------ |
| 1 か所だけ少し変えたい | `gap` + その要素に margin を足す           |
| 間隔が何種類もある     | まとまりごとに包んで、それぞれに `gap`     |
| 一番下（端）に寄せたい | `margin-top: auto`（余った空きを全部取る） |

## Card での使い方

`src/components/ui/Card/Card.module.css` より。

```css
.card {
  display: flex;
  flex-direction: column; /* 見出し・本文・操作を縦に並べる */
  gap: 0.75rem;
}

.footer {
  display: flex; /* ボタンを横に並べる（向きは初期値の row） */
  gap: 0.5rem;
  margin-top: auto; /* 余った高さを上に取って、一番下へ寄せる */
}
```

- 縦に並べる flex の中に、横に並べる flex を入れている。この**入れ子**が Flexbox の普通の使い方
- `margin-top: auto` は flex アイテムで使える技。`auto` の margin が余った空きを全部取るので、`.footer` はカードの一番下に押し出される。高さの違うカードを並べても、ボタンの位置がそろう

### flex は直接の子にしか効かない

```
.card（flex・縦）        ← title・body・footer を縦に並べる
├── .title  「見出し」
├── .body   「本文」
└── .footer（flex・横）  ← ボタンたちを横に並べる
    ├── <button>
    └── <button>
```

- `.card` の flex が並べるのは、直接の子の `title`・`body`・`footer` だけ。footer の中のボタンは `.card` から見ると**孫**なので、`.card` の flex は効かない
- ボタンを並べるには、ボタンの直接の親の `.footer` に `display: flex` を付ける

footer にだけ flex を付けたのは、**中に並べたいものが複数あるのが footer だけ**だから。

| 要素      | 中身                 | flex が必要か                           |
| --------- | -------------------- | --------------------------------------- |
| `.title`  | 文字だけ             | いらない。文字は普通に流れて表示される  |
| `.body`   | 文字だけ             | いらない                                |
| `.footer` | ボタンが複数入る想定 | いる。横に並べて、間を `gap` で揃えたい |

### 1 つの要素が「アイテム」と「コンテナ」を兼ねる

`.footer` は 2 つの役を同時に持っている。

- **`.card` から見ると flex アイテム**: `margin-top: auto` で、カードの一番下に寄せられる
- **ボタンから見ると flex コンテナ**: `display: flex` と `gap` で、ボタンを横に並べられる

それぞれの箱は「自分の直接の中身をどう並べるか」だけに責任を持つ。外側の `.card` は footer の中身を知らなくてよい。React のコンポーネントを組み合わせるのと同じ考え方。

## Grid との使い分け

|         | 得意なこと                                                              |
| ------- | ----------------------------------------------------------------------- |
| Flexbox | **1 方向**に並べる。ボタンの列、カードの中身の縦積みなど                |
| Grid    | **縦と横の 2 方向**を同時に揃える。カードの一覧、ページ全体の枠組みなど |

## 試し方

Storybook の UI/Card → WithFooter を開き、ブラウザの開発者ツールで `.footer` の `display: flex` のチェックを外す。ボタンが縦に積まれる。

## 参考

- [MDN: フレックスボックスの基本概念](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox)
- [web.dev: Learn CSS - Flexbox](https://web.dev/learn/css/flexbox)
