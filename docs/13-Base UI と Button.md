# Base UI と Button

記録日: 2026-10-18

段階 3 の始まり。最初の部品として、[Base UI](https://base-ui.com/) の Button を包んだ Button を作った。

## Base UI とは

スタイルを持たない（headless な）React の部品集。キーボードでの操作や、スクリーンリーダーへの伝え方（WAI-ARIA）など、部品の「動き」だけを持ち、見た目は使う側が付ける。Radix・Floating UI・Material UI を作ってきたチームが作っている。

| 入れたもの       | バージョン | メモ                                                                |
| ---------------- | ---------- | ------------------------------------------------------------------- |
| `@base-ui/react` | 1.9.0      | 2026-10-09 公開。必須の依存は React だけ（`date-fns` は任意の依存） |

### `node_modules` に入るものと、完成品に入るもの

`@base-ui/react` は 1 つのパッケージなので、入れると全部の部品が `node_modules` に入る。

| 項目               | 実際の数                                            |
| ------------------ | --------------------------------------------------- |
| パッケージの大きさ | 20MB                                                |
| 部品などのフォルダ | 49 個（accordion・dialog・menu・select・tooltip …） |
| JS のファイル      | 841 個                                              |

しかし、アプリの完成品（バンドル）に入るのは、import したものだけ。ソースマップ（完成品の JS が、どの元のファイルから作られたかの記録）を出してビルドし、中を数えたところ、Base UI のファイルは 20 個だけだった（Button 本体と、Button が使う共通の小さな関数）。Dialog や Menu は入っていない。

```zsh
vp build --sourcemap --outDir <確かめる用のフォルダ>
# できた *.js.map の sources に、どの元のファイルが入ったかが並ぶ
```

使った分だけになる仕組みは 2 つ。

- **部品ごとの入口（サブパス）から import する。** `import { Button } from "@base-ui/react/button"` と書けば、最初から Button のファイルしか読まない。Base UI の `package.json` の `exports` には、入口が 80 個ある
- **`package.json` に `"sideEffects": false` がある。** バンドラ（Vite の中の Rolldown）への「使われていないファイルは消しても問題ない」という約束。まとめて import しても、使わなかったものは完成品から消える（tree-shaking）

TS/npm で言えば lodash と同じ。`lodash` を入れると全部の関数が `node_modules` に入るが、`import get from "lodash/get"` と書けば、完成品には `get` しか入らない。

`node_modules` の 20MB も気にしなくてよい。pnpm は、同じバージョンのパッケージを PC の中の 1 か所（ストア）に置き、各プロジェクトからはそこを指すだけなので、ほかのプロジェクトで同じ Base UI を入れてもディスクは増えない。

### shadcn/ui との違い

|              | Base UI                               | shadcn/ui                                                                              |
| ------------ | ------------------------------------- | -------------------------------------------------------------------------------------- |
| 入れ方       | npm のパッケージとして入れる          | CLI が、部品のソースコードを自分のリポジトリにコピーする（`components/ui/button.tsx`） |
| 部品のコード | `node_modules` の中。自分では直さない | 自分のリポジトリの中。自由に書き換える                                                 |
| 中身         | 動き（アクセシビリティ）だけ          | Base UI の上に、Tailwind の見た目を足したもの                                          |

shadcn/ui は「部品のパッケージ」ではなく、「部品のソースを配る仕組み」。段階 4 で比べる。

### docs はパッケージの中にもある

`node_modules/@base-ui/react/docs/` に、Base UI の docs が Markdown で入っている（入口は `index.md`）。入れたバージョン（1.9.0）とぴったり合った docs なので、Claude Code が部品を作るときに読めるよう、`CLAUDE.md` に場所を書いた。Vite+ の `node_modules/vite-plus/docs` と同じ考え方。

## Button の作り

```
src/components/ui/Button/
├── Button.tsx            Base UI の Button を包む
├── Button.module.css
└── Button.stories.tsx    Secondary・Primary・Disabled・並べたところ
```

```tsx
import { Button as BaseButton } from "@base-ui/react/button";

type ButtonProps = Omit<BaseButton.Props, "className" | "style"> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "secondary", ...props }: ButtonProps) {
  return <BaseButton {...props} className={`${styles.button} ${styles[variant]}`} />;
}
```

| 決めたこと                            | 理由                                                                                                                                                                                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 種類は `primary` と `secondary`       | 主な操作と、それ以外。削除などの危ない操作の `danger` は、確認ダイアログを作るときに足す                                                                                                                                                        |
| 何も指定しなければ `secondary`        | 目立たせるボタン（primary）は 1 つの領域に 1 つだけにする（docs/03 のフォン・レストルフ効果）。主な操作にだけ、わざわざ `variant="primary"` と書く形にした。shadcn/ui は何も指定しないと目立つボタンになるので、段階 4 で比べるときに違いになる |
| `className` と `style` を受け付けない | 見た目をそろえるのがデザインシステムの役目。使う側で色や大きさを上書きできると、だんだんばらばらになる。置く位置や間隔は、親が `gap` などで決める                                                                                               |
| 大きさは 1 種類                       | 押せる範囲を 44px（`--size-touch-target`）以上にする                                                                                                                                                                                            |

Base UI の Button は、普通の `<button>` を描き、`type="button"` も付けてくれる（フォームの中に置いても、勝手に送信しない）。

### Base UI の作法

| 作法                       | 中身                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `data-*` 属性で状態を表す  | 無効のときに `data-disabled` が付く。CSS は `[data-disabled]` で見た目を変える。ヘッダーの `aria-current` と同じ「状態を属性で表す」考え方 |
| `focusableWhenDisabled`    | 無効でもフォーカスできるようにする。送信中のように一時的に押せないとき、フォーカスが消えないようにする                                     |
| `className` に関数を渡せる | 状態を受け取って、クラスを返せる（`className={(state) => ...}`）                                                                           |
| `render`                   | 描く要素を差し替える。ただし、リンク（`<a>`）を Button で描かない。ボタンに見せたいリンクは、`<a>` に直接 CSS を当てる（公式の docs より） |

正直なところ、ボタンは普通の `<button>` でもアクセシビリティは十分。Base UI の力が出るのは、Dialog や Menu のような複雑な部品。Button は、Base UI の作法をいちばん小さく練習できる部品として選んだ。

## CSS

### 並べ方: `inline-flex` にして、真ん中寄せを書き直す

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-8);
}
```

- **外は inline**: `<button>` の初期値（`inline-block`）と同じく、文章の中やほかのボタンの隣に、同じ行で並ぶ。`flex` にすると、前後で改行される
- **中は flex**: アイコンを入れたときに、文字と縦の真ん中でそろえ、間を `gap` であける。アイコンと文字は flex がなくても横に並ぶが、文字の下の線（ベースライン）にそろうので、アイコンが上にずれる

外と中の考え方は、docs/04 の「`inline-flex`: 外への並び方と、中の並べ方」にある。

`<button>` は、何も書かなくても中身を縦横の真ん中に寄せる。ところが flex にすると、この寄せ方が効かなくなる。そこで `align-items` と `justify-content` で書き直している。Storybook の Button で、チェックを外して文字の位置を測った。

| 状態                                      | 文字の位置                                |
| ----------------------------------------- | ----------------------------------------- |
| そのまま                                  | 縦も横も真ん中                            |
| `align-items` のチェックを外す            | 上に寄る（上の空き 1px、下の空き 25px）   |
| 幅 400px の、縦に並べる flex の子に置く   | ボタンが 400px に伸びる。文字は横の真ん中 |
| さらに `justify-content` のチェックを外す | 左に寄る（左の空き 17px、右の空き 324px） |

`justify-content` が効くのは、ボタンが中身より広くなったとき。縦に並べる flex（`.card` など）の直接の子に置くと、ボタンは横いっぱいに伸びる（docs/04 の `align-items` の初期値 `stretch`）。

試し方: Storybook の UI/Button → Secondary で、`.button` の `align-items: center` のチェックを外す。文字がボタンの上に寄る。

### 種類ごとの色は、部品の中だけの CSS 変数に入れる

```css
.primary {
  --button-background: var(--color-primary);
  --button-foreground: var(--color-primary-foreground);
}

.button {
  color: var(--button-foreground);
  background-color: var(--button-background);
}

.button:hover:not([data-disabled]) {
  background-color: color-mix(in oklab, var(--button-background), var(--color-foreground) 12%);
}
```

種類（`.primary`・`.secondary`）は `--button-*` に意味のトークンを入れるだけ。マウスを乗せたときなどの計算は `.button` に 1 回だけ書けば、すべての種類に効く。種類を足しても、状態の CSS を書き足さなくてよい。

### マウスを乗せたとき・押したとき: `color-mix()` を oklab で

背景の色を `--color-foreground`（ページの文字の色）に少し寄せる。乗せたら 12%、押したら 24%。明るい配色では暗く、暗い配色では明るくなる。

最初は `color-mix(in oklch, ...)` にしたところ、明るい配色の secondary（薄い青 `#e8f1fe`）が、乗せたときに**赤みのある灰色**（`#decfd3`）になった。oklch は色相（色の角度）を持つ色空間で、灰色に近い色（`--color-foreground` の `#1a1a1a`）と混ぜると、色相が思わぬ向きに回ることがある。色相を持たない oklab に変えたら、青みのある灰色（`#ccd4df`）になった。**灰色と混ぜるときは oklab** と覚えておく。

### 状態ごとのコントラストを測った

Storybook のストーリーをブラウザで開き、マウスを乗せた・押した状態で、文字と背景のコントラストを計算した（`getComputedStyle` で色を取り、canvas に塗って sRGB の値にしてから、WCAG の式で計算）。

| 配色   | 種類      | 通常 | 乗せた | 押した |
| ------ | --------- | ---- | ------ | ------ |
| 明るい | primary   | 11.1 | 11.76  | 12.38  |
| 明るい | secondary | 9.75 | 7.42   | 5.5    |
| 暗い   | primary   | 6.14 | 7.08   | 8.14   |
| 暗い   | secondary | 13.5 | 9.78   | 6.65   |

- primary は、乗せる・押すほどコントラストが上がる。濃い背景に白い文字（明るい配色）、明るい背景に濃い文字（暗い配色）なので、背景を文字の反対側に寄せることになるため
- secondary は下がる。薄い背景に濃い文字（明るい配色）の背景を暗くするので、文字に近づくため。それでも、どの状態も普通の文字に求められる 4.5 : 1 以上

アクセシビリティのチェック（下の「a11y のチェックをエラーにした」）は、止まっている状態しか見ない。マウスを乗せた状態や、暗い配色の色は見ないので、こうして自分で確かめる。

### 無効のとき

種類に関係なく、`--color-muted` の背景と `--color-muted-foreground` の文字にした（明るい配色で 7.55 : 1、暗い配色で 6.03 : 1）。

`opacity: 0.5` で薄くする方法もよく使われるが、文字まで薄くなって読みにくい。WCAG は無効の部品をコントラストの基準から外しているが、何のボタンかは読めたほうがよい。

### フォーカスの輪と、動きを減らす設定

```css
.button:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: no-preference) {
  .button {
    transition: background-color 150ms;
  }
}
```

- `:focus-visible` は、キーボードで選んだときだけ当たる（マウスで押したときは出ない）。`outline-offset` でボタンとの間を 2px あけて、輪を見分けやすくする
- 色の切り替えのアニメーションは、「動きを減らす」設定をしていない人にだけ付ける。docs/10 で学んだ「ユーザーの設定はメディアクエリで見る」の使いどころ

### ボタンの書体を受け継がせる

ボタンや入力欄は、ブラウザの初期設定では、親の書体と文字サイズを受け継がない。`global.css` に次を足した。

```css
button,
input,
select,
textarea {
  font: inherit;
}
```

## a11y のチェックをエラーにした

Storybook のアクセシビリティのチェックを、`.storybook/preview.tsx` で `test: "error"` にした。違反があると `vp test` が失敗する（コミット時には動かない。`vp test` を自分で実行する）。

わざと名前のないボタン（`children: ""`）のストーリーを足して、止まることを確かめた。

```
FAIL  src/components/ui/Button/Button.stories.tsx > Probe No Name
Expected the HTML found at $('._button_ovcwq_5') to have no violations:
"Buttons must have discernible text (button-name)"
```

このチェック（axe）が見るのは、テストのブラウザ（明るい配色）で、止まっている状態だけ。暗い配色や、マウスを乗せた状態は、上のように自分で確かめる。

## 置き換えたところ

Card のストーリー（`WithFooter`）と、練習ページの「詳しく見る」を、この Button（secondary）にした。
