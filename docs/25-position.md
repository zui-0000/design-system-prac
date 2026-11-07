# position

記録日: 2026-11-07 / 確かめたブラウザ: Playwright 1.64.1 の Chromium

`position` は、要素を**ふつうの並びに残すか**と、**どこを基準に置くか**を決める。入力欄のアイコンを、入力欄の上に重ねるのに使った（docs/23）。

## 5 つの値

| 値         | ふつうの並びに | 基準（`inset` をどこから測るか）       | このリポジトリの例                     |
| ---------- | -------------- | -------------------------------------- | -------------------------------------- |
| `static`   | 残る           | なし（`inset` は効かない）             | 初期値。何も書かない要素は全部これ     |
| `relative` | 残る           | 自分の元の位置                         | 入力欄の `.frame`、Switch の `.switch` |
| `absolute` | **外れる**     | 一番近い、`static` でない先祖          | 入力欄のアイコン、Switch の `::after`  |
| `fixed`    | **外れる**     | 画面（スクロールしても動かない）       | 確認ダイアログの幕と本体               |
| `sticky`   | 残る           | スクロールして端に来たら、そこで止まる | 使っていない                           |

「ふつうの並び」は、`display` の block や flex が要素を順に並べること（docs/04）。並びから外れた要素は、ほかの要素から見ると無いのと同じになり、上に重なる。

## `relative`: 基準の印にする

`relative` の要素は、並びに残ったまま、`inset` の分だけ見た目をずらせる。ずらしても、周りの要素は元の位置にあるものとして並ぶ。

ずらすために使うことはほとんどない。主な使い道は、**中の `absolute` の基準になる**こと。`inset` を書かなければ、自分は 1px も動かない。

## `absolute`: 基準の上に重ねる

### 基準は、先祖をさかのぼって探す

`absolute` の要素は、先祖をさかのぼって、`position` が `static` でない一番近い要素を基準にする。

```text
<body>
  <main>                    ← static → 飛ばす
    <div class="frame">     ← relative → ここが基準
      <span class="icon">   ← absolute
```

基準にしたい親に `relative` を付けるのを忘れても、エラーにはならない。もっと外の先祖が基準になり、それもなければ、ページの最初の画面の大きさの箱（initial containing block）が基準になる。「アイコンがページの端に飛んだ」は、たいていこれ。

**`absolute` を使うときは、基準にしたい親に `relative` を付ける**、とセットで覚える。

### 基準の「枠線の内側」から測る

基準になるのは、基準の要素の枠線の内側（padding の外側）。`.frame` は 1px の枠線を持つので、`inset-block: 0` のアイコンは、枠線に重ならず、内側の 42px に収まる。

確かめた結果（`top: 0; left: 0`）: 基準の要素が `left: 50px` にあって 1px の枠線を持つとき、子は `left: 51px` に来た。

### `inset` を書かないと、元の位置に残る

`inset`（`top`・`left` など）を 1 つも書かないと、基準の左上ではなく、**並びから外れる前にいたはずの位置**に置かれる。

確かめた結果: 高さ 30px の `<p>` のあとに `inset` なしの `absolute` を置くと、`<p>` のすぐ下に出た。`top: 0; left: 0` を付けると、基準（このときは先祖に基準がなかったので、ページの左上）に飛んだ。

置き場所は `inset` ではっきり書く。

### このリポジトリでの使い方

| 場所                                       | 基準                    | 何のため                                                                             |
| ------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------ |
| 入力欄のアイコン（`Input.module.css`）     | `.frame`（`relative`）  | 入力欄の上に重ね、押すと下の入力欄に当たるようにする（docs/23）                      |
| Switch の `::after`（`Switch.module.css`） | `.switch`（`relative`） | 見えない箱を上下にはみ出させ、押せる範囲を 44px にする（docs/15）                    |
| ヘッダーの `.visuallyHidden`               | ページ                  | 1px にして画面から隠し、読み上げソフトにだけ読ませる。並びから外して場所を取らせない |

## `fixed`: 画面に貼り付ける

`fixed` の要素は、画面（ブラウザの表示領域）を基準にし、スクロールしても同じ場所に残る。確認ダイアログの後ろの幕は `position: fixed; inset: 0` で、画面全体を覆っている。このあと作る Toast（画面の隅に出る知らせ）も `fixed` を使う。

### `transform` などを持つ先祖があると、画面が基準でなくなる

先祖に次のどれかがあると、`fixed` も `absolute` も、その先祖を基準にする（MDN の Containing block）。

- `transform`・`translate`・`rotate`・`scale`・`perspective`
- `filter`・`backdrop-filter`
- `contain: layout`・`paint` など、`will-change: transform` など、`content-visibility: auto`

確かめた結果: `translate: 0 0` の要素の中に `position: fixed; top: 0; left: 0` を置くと、画面の左上ではなく、その要素の左上に来た。

確認ダイアログの本体（`AlertDialog.module.css`）は、真ん中に置くのに `translate: -50% -50%` を使っている。なので、ダイアログの中に `fixed` を置いても、画面ではなくダイアログが基準になる。

Base UI の Menu・Tooltip・ダイアログは、ポータルで `<body>` の直下に描く。ページのどこに置いても、こうした先祖の中に入らない。

### `container-type` は基準にならなかった

コンテナクエリの `container-type: inline-size`（ヘッダーで使っている）を持つ要素の中に、`position: absolute; top: 0; left: 0` を置くと、ページの左上に来た。基準にはならなかった。ヘッダーの `.visuallyHidden` も、ヘッダーではなくページが基準になっている。

## `sticky`: スクロールして端に来たら止まる

`sticky` の要素は、ふだんは並びに残り、スクロールして `top` などで決めた位置に来ると、そこで止まる。表の見出しの行や、スクロールしても上に残るヘッダーに使う。

- `top` などを書かないと、止まらない
- 止まっていられるのは、親の中にいる間だけ。親がスクロールして画面から出ると、一緒に出ていく

このリポジトリではまだ使っていない。

## `inset` の書き方

`top`・`bottom`・`left`・`right` は、まとめて `inset` と呼ぶ。このリポジトリでは、文字の流れる向きで書く名前を使う（横書きの日本語の場合）。

| 文字の向きで書く名前 | 横書きでの意味      |
| -------------------- | ------------------- |
| `inset-block-start`  | `top`               |
| `inset-block-end`    | `bottom`            |
| `inset-inline-start` | `left`              |
| `inset-inline-end`   | `right`             |
| `inset-block: 0`     | `top: 0; bottom: 0` |
| `inset-inline: 0`    | `left: 0; right: 0` |
| `inset: 0`           | 4 辺とも 0          |

上と下（左と右）を両方 0 にすると、その向きに基準いっぱいに伸びる。入力欄のアイコンは `inset-block: 0` で、`.frame` の高さいっぱいに伸び、その中で svg を真ん中に置いている。

## `z-index` との関係

重なりの順番を決める `z-index` は、`static` の要素には効かない（flex や grid の子は例外で、効く）。重なる部品は、`--z-index-*` のトークンから選ぶ（docs/12・docs/22）。

## 試し方

`vp dev` で `/practice` を開き、開発者ツールで「カードを足す」の見出しの欄を見る。

1. `.frame`（`_frame_` で始まるクラス）の `position: relative` のチェックを外す。アイコンが欄から外れ、最初の画面の高さの真ん中あたり（左端から 12px）へ飛ぶ。基準がページの最初の画面の大きさの箱になり、`inset-block: 0` でその高さいっぱいに伸びて、真ん中に svg を置くため
2. 戻して、`.icon`（`_icon_` で始まるクラス）の `position: absolute` のチェックを外す。アイコンが flex の並びに戻り、入力欄の左に並ぶ。入力欄の左の余白（40px）は残るので、文字がずいぶん右に寄る
3. 戻して、`.icon` の `inset-block: 0` と `inset-inline-start` のチェックを外す。アイコンは元の位置（枠線のすぐ内側の左上）に残る。上下に伸びなくなるので、縦の真ん中からずれる

## 参考

- [MDN: position](https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/position)
- [MDN: Containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Containing_block)
