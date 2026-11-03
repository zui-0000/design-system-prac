# Tooltip

記録日: 2026-10-27 / 対象: Base UI 1.9.0（`@base-ui/react`）、Storybook 10.6.2

段階 3 の 5 つ目の部品。マウスを乗せると出る短い説明（`ui/Tooltip`）を作り、カードの「⋯」のボタンに付けた。

[docs/21](21-Menu.md) の「残っていること」の続き。「⋯」はアイコンだけのボタンで、読み上げソフトには `aria-label`（「「4 枚目」の操作」）で名前を伝えていたが、見える人には何のボタンかを伝える文字がなかった。

```text
              ┌────┐
              │操作│   ← マウスを乗せて 0.6 秒たつと出る。黒の地に白の文字
              └────┘
 [詳しく見る]  [⋯]
```

## Tooltip は「見える人への補足」

Base UI の docs（`node_modules/@base-ui/react/docs/react/components/tooltip.md` の Usage guidelines と Alternatives to tooltips）は、Tooltip を**見える人のための補足**として使うように書いている。

| 使う人                       | Tooltip が届くか                                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| マウスの人                   | 届く。乗せると出る                                                                                                          |
| キーボードの人（見えている） | 届く。Tab でフォーカスすると出る                                                                                            |
| タッチの人                   | 届かない。押す前に乗せる手段がない。Base UI は、タッチの画面では Tooltip を出さない                                         |
| 読み上げソフトの人           | 届かない。Base UI は Tooltip の文字をボタンの名前や説明（`aria-describedby`）にしない（出ている間のボタンの属性で確かめた） |

なので、**Tooltip がなくても困らない情報だけを出す**。ボタンの名前は、Tooltip とは別に `aria-label` で付ける。

TS で言えば、Tooltip は JSDoc のホバー表示のようなもの。読めれば便利だが、型（`aria-label`）の代わりにはならない。

### Tooltip にしないもの

| 出したいもの                                 | 使うもの                                            |
| -------------------------------------------- | --------------------------------------------------- |
| 知らないと操作できない説明                   | 画面に文字で書く（入力欄の下の説明など）            |
| 「ⓘ」を押すと出る説明                        | Popover（押すこと自体が目的なので、Tooltip でない） |
| 「保存しました」のような、操作のあとの知らせ | Toast（読み上げソフトにも伝わる）                   |

見分け方は、Base UI の docs の「trigger の目的は何か」。押すと説明が出るのが目的なら Popover、目的が別にあって（「⋯」ならメニューを開く）、説明はおまけなら Tooltip。

## 部品の形

```tsx
<Tooltip label="操作">
  <Button aria-label="「4 枚目」の操作">
    <EllipsisIcon />
  </Button>
</Tooltip>
```

| props      | 役目                                                              |
| ---------- | ----------------------------------------------------------------- |
| `label`    | 出す文字。短い名前にする                                          |
| `children` | 説明を付ける部品。Base UI の `Tooltip.Trigger` の `render` に渡す |

中身は Base UI の `Root`・`Trigger`・`Portal`・`Positioner`・`Popup`。Menu と同じく、ボタンの上に出し、画面の端にぶつかるときは Base UI が下に出す。

### 出す文字は、`aria-label` の一部にする

「⋯」では、Tooltip に「操作」、`aria-label` に「「4 枚目」の操作」と書いた。

- 見える人は、ボタンがどのカードの中にあるかが見えるので、「操作」だけで足りる。短いほうが読みやすい
- 読み上げソフトでボタンの一覧を聞くと、カードの中にいることが分からないので、どのカードかも名前に入れる（docs/21）
- 見えている文字（「操作」）は、`aria-label` の中に入れる。音声入力の人は、見えている文字を言ってボタンを押す（「操作をクリック」）。名前に入っていないと押せない。WCAG 2.5.3「名前の中のラベル」の考え方

Base UI の docs も「Tooltip の文字と `aria-label` を近づける」と書いている。

## Menu の trigger に重ねる

「⋯」は、Menu を開くボタンでもある。1 つのボタンに、Menu の trigger と Tooltip の trigger の両方の役目を持たせる。

```tsx
<Menu
  trigger={
    <Tooltip label="操作">
      <Button aria-label={`「${card.title}」の操作`}>
        <EllipsisIcon />
      </Button>
    </Tooltip>
  }
>
```

Base UI は、`render` を入れ子にして、1 つの要素に複数の部品の役目を重ねる（`handbook/composition.md` の Composing multiple components）。ここでは次の順に渡っていく。

```text
Menu.Trigger（onClick・aria-expanded・ref などを付ける）
  → Tooltip（受け取ったものを、そのまま Tooltip.Trigger に渡す）
    → Tooltip.Trigger（マウスを乗せたときの処理などを足す）
      → Button（<button> を描く）
```

Spring で言えば、1 つの Bean に `@Transactional` と `@Cacheable` の両方のプロキシをかぶせるのに近い。それぞれが自分の処理を足して、中に渡す。

そのため、`Tooltip` は `label` と `children` のほかに受け取ったもの（`...props`）を、そのまま `Tooltip.Trigger` に渡している。これがないと、Menu の付けた `onClick` がボタンに届かず、押しても開かない。型には書いていない（使う側に渡させたいものではなく、Menu が要素を複製するときに足すもののため）。

Base UI の docs の例は、Tooltip を一番外にしている。このリポジトリの `Menu` は、`Menu.Trigger` を自分の中に持っていて外から包めないので、Menu を外、Tooltip を中にした。どちらの順でも、属性はすべて同じボタンに集まる。

### 確かめた動き（`/practice`）

Playwright で `/practice` を開いて確かめた。

| 操作                                 | 結果                                                           |
| ------------------------------------ | -------------------------------------------------------------- |
| 「⋯」にマウスを乗せる                | 0.6 秒たつと、ボタンの 8px 上に「操作」が出た                  |
| そのまま押す                         | メニューが開き、Tooltip は消えた（メニューの項目に重ならない） |
| Esc でメニューを閉じる               | フォーカスが「⋯」に戻り、Tooltip がもう一度出た                |
| マウスを外す                         | 消えた                                                         |
| Tab で「⋯」に来る                    | 待たずに出た（12ms）。キーボードのときは 0.6 秒待たない        |
| Enter でメニューを開き、Esc で閉じる | 開いている間は消え、閉じてフォーカスが戻ると、また出た         |
| 暗い配色                             | 白の地に黒の文字になった                                       |

メニューを閉じたあとにもう一度出るのは、フォーカスが「⋯」に戻り、マウスもまだ乗っているため。WAI-ARIA の Tooltip の作法（フォーカスしている間は出す）どおりなので、そのままにした。

### `data-popup-open` は、Tooltip でも付く

Tooltip が出ている間、Base UI はボタンに `data-popup-open` を付ける。Menu が開いている間に付けるのと同じ名前。

今は、どの CSS も `data-popup-open` を使っていないので困らない。ただ、後で「メニューが開いている間は、ボタンを押した色にする」と `[data-popup-open]` で書くと、マウスを乗せて Tooltip が出ただけでも、押した色になる。メニューが開いているかで見分けるなら、Menu だけが付ける `[aria-expanded="true"]` を使う。

## 見た目

```css
.popup {
  color: var(--color-background);
  background-color: var(--color-foreground);
}
```

- **色は、ページと逆にした**。ページの文字の色（`--color-foreground`）を地に、ページの背景の色（`--color-background`）を文字にする。ボタンやカードの面と見分けが付き、浮いた説明だと分かる。組み合わせはページの文字と背景と同じなので、コントラストもそのまま足りる。暗い配色では、トークンが入れ替わるので、白の地に黒の文字になる
- **枠線と影は付けなかった**。地の色がページと逆なので、それだけで形が見える
- **矢印（`Tooltip.Arrow`）は付けなかった**。ボタンのすぐ上（8px）に出るので、どのボタンの説明かは位置で分かる
- **長い文字は `max-width: 20rem` で折り返す**。短い名前に使う部品なので、ふつうは 1 行に収まる

### 出るとき・消えるときの動き

Menu と同じく、`prefers-reduced-motion: no-preference` のときだけ、透明から浮かび上がる（`opacity` と `scale`）。

Tooltip だけにあるのが `data-instant`。Base UI が「動きを付けずにすぐ出す・消す」と決めたときに付ける。

| `data-instant` の値 | いつ                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `focus`             | キーボードでフォーカスして出たとき（Tab のあと 12ms で、`data-instant="focus"` が付いて出た） |
| `dismiss`           | Esc キーなどで消したとき                                                                      |
| `delay`             | 隣の Tooltip から続けて出たとき（下の Provider）                                              |

付いているときは `transition: none` にしている。

### 重なりの順番に「ツールチップ」を足した

```css
--z-index-toast: 400;
--z-index-tooltip: 500;
```

ダイアログの中のボタンにも Tooltip を付けることがあるので、ダイアログ（`--z-index-modal`）より上にした。トースト（`--z-index-toast`）よりも上にしたのは、Tooltip はマウスを乗せている間しか出ず、乗せたものの説明を隠されると困るため。トーストは数秒で消えるので、一瞬隠れても困らない。

## ストーリーとテスト

`Tooltip.stories.tsx` に 4 つ置き、`play` 関数で動きを確かめる。

| ストーリー      | 確かめること                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| `Default`       | ボタンだけが見える                                                                                    |
| `Hover`         | 乗せると出て、離すと消える                                                                            |
| `KeyboardFocus` | Tab でフォーカスすると出て、Esc で消える。フォーカスはボタンに残る                                    |
| `WithMenu`      | Menu に重ねても、乗せると出る。押すとメニューが開き、Tooltip は消える。`aria-expanded` がボタンに届く |

Tooltip には `role` が付かないので、`getByRole` ではなく文字（`getByText("操作")`）で探す。

最初は `findByText` で見つけてすぐ `toBeVisible()` を確かめ、3 つとも落ちた。見つけた瞬間は、出始め（`data-starting-style`）で `opacity: 0` だったため。`toBeVisible()` は透明な要素を「見えていない」と判定する。`waitFor` で、見えるまで待つ形にした。メニューの `toBeVisible()` も同じ。

## まだやっていないこと

- **`Tooltip.Provider`**: 隣り合う Tooltip を 1 つのまとまりにし、1 つ目が出たあとは、隣に動かすとすぐ出るようにする部品。カードの一覧で「⋯」から「⋯」に動かすときに効く。アイコンだけのボタンが並ぶ場所（ツールバーなど）を作るときに考える
- **ヘッダーの配色の Switch**: アイコンの付いた Switch で、つまみの絵（太陽・月）が今の状態を表す。Tooltip を付けるかは、ほかのアイコンだけのボタンと一緒に考える

## 参考

- `node_modules/@base-ui/react/docs/react/components/tooltip.md`（Usage guidelines・Alternatives to tooltips・API reference）
- `node_modules/@base-ui/react/docs/react/handbook/composition.md`（Composing multiple components）
- [WAI-ARIA APG: Tooltip Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)
- [WCAG 2.2: 2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)
