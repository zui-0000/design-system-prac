# Menu

記録日: 2026-10-21 / 対象: Base UI 1.9.0（`@base-ui/react`）、Storybook 10.6.2、Stylelint 17.16.0

段階 3 の 4 つ目の部品。押すと開く操作の一覧（`ui/Menu`）を作り、カードの「削除」をメニューにしまった。

[docs/19](19-確認ダイアログ.md) の「残っていること」の続き。カードの「削除」は、「詳しく見る」と同じ大きさで並んでいた。`.claude/rules/ux.md` の「削除などの取り消せない操作は、押しやすい場所に大きく置かない」に合わせ、「⋯」のボタンで開くメニューの、一番下にしまった。

```text
┌────────────────────────┐
│ 4 枚目                   │
│ 画面の幅が足りなければ…  │
│ [詳しく見る]  [⋯]        │
└────────────────────────┘
                 ┌──────────┐
                 │ 複製する   │
                 │──────────│
                 │ 削除…     │   ← 赤い文字。押すと確認ダイアログ
                 └──────────┘
```

## 部品の形

AlertDialog と同じく、パーツに分けた。

```tsx
<Menu
  trigger={
    <Button aria-label="「4 枚目」の操作">
      <EllipsisIcon />
    </Button>
  }
>
  <MenuItem onClick={handleDuplicate}>
    <CopyIcon />
    複製する
  </MenuItem>
  <MenuSeparator />
  <MenuItem variant="danger" onClick={() => setDeleteDialogOpen(true)}>
    <Trash2Icon />
    削除…
  </MenuItem>
</Menu>
```

| パーツ          | 中身（Base UI）                                    | 役目                                                                         |
| --------------- | -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `Menu`          | `Root`・`Trigger`・`Portal`・`Positioner`・`Popup` | 開け閉めと、trigger のそばに出す枠。`trigger` に押すボタンを渡す             |
| `MenuItem`      | `Item`                                             | 項目。押すと `onClick` を呼んで閉じる。取り消せない操作は `variant="danger"` |
| `MenuSeparator` | `Separator`                                        | 項目のまとまりを分ける線                                                     |

### 取り消せない操作の置き方

- 線（`MenuSeparator`）で、ふつうの操作と分ける
- 一番下に置く。上から順に見ていくと、最後に出てくる
- 文字を赤にする（`--color-error`）。選んでいるときは、確認ダイアログの「削除する」と同じ、赤の背景と白の文字（`--color-destructive`）
- 押すとすぐには消さず、確認ダイアログを開く。続きの画面が出ることを、名前の最後の「…」で示す（「削除…」）。macOS や Windows のメニューと同じ決まり

### 「⋯」のボタンには、名前を付ける

アイコンだけのボタンなので、`aria-label` で「「4 枚目」の操作」と名前を付けた。カードごとに「⋯」が並ぶので、どのカードの操作かも名前に入れた（読み上げソフトで、ボタンの一覧を聞いたときに区別できる）。見える人向けの説明は、次に作る Tooltip で足す。

## 位置は Base UI が決める

メニューは、Base UI がポータルで `<body>` の直下に出し、trigger のそばに置く。置く場所は Positioner の props で決める。

```tsx
<BaseMenu.Positioner sideOffset={8} align="start">
```

| prop                       | 値       | 意味                                                      |
| -------------------------- | -------- | --------------------------------------------------------- |
| `side`（既定）             | `bottom` | trigger の下に出す                                        |
| `align`                    | `start`  | trigger と左端をそろえる                                  |
| `sideOffset`               | `8`      | trigger との間を 8px あける                               |
| `collisionPadding`（既定） | `5`      | 画面の端から 5px は離す。端にぶつかるときは、反対側に出す |

位置を計算したあと、Base UI は Positioner の要素に CSS 変数を付ける。

| CSS 変数             | 中身                                     | 使ったところ                                              |
| -------------------- | ---------------------------------------- | --------------------------------------------------------- |
| `--available-height` | trigger から画面の端までの、残りの高さ   | `max-height` にして、収まらないときは中をスクロールさせる |
| `--transform-origin` | ポップアップが広がる起点（trigger の側） | 開くときに、trigger の側から広がって見える                |

320px の画面でも、メニューは画面に収まり、横にはみ出さなかった。

重なりの順番は `--z-index-dropdown`（100）。確認ダイアログ（`--z-index-modal`、300）より下になる。

### Base UI が付ける CSS 変数と Stylelint

`--available-height` を使ったら、Stylelint が「定義されていない CSS 変数です」と止めた。トークンではなく、Base UI が動いている間に付ける変数なので、`global.css` には無い。

プラグインの `importFrom` は、CSS のファイルだけでなく、`{ customProperties: { … } }` の形のオブジェクトも受け取る（プラグインのソースの `get-custom-properties-from-imports.mjs` で確かめた）。`stylelint.config.js` に、使う変数の名前だけを並べて渡した。

```js
const baseUiCustomProperties = {
  customProperties: Object.fromEntries(
    ["--available-height", "--transform-origin"].map((name) => [name, ""]),
  ),
};
// importFrom: [tokenEntry, baseUiCustomProperties]
```

- 使う変数だけを足す。Base UI の変数を全部足すと、使っていない名前の打ち間違いまで通ってしまう
- 足したあとも、打ち間違い（`--available-heigth`）は止まった

## 選んでいる項目の見せ方

項目は、矢印キーで動くとフォーカスが当たるが、`:focus-visible` の輪は出さない。代わりに、Base UI が付ける `data-highlighted` で背景の色を変える。マウスを乗せたときも、同じ `data-highlighted` が付く。

| 項目                   | 明るい配色                           | 暗い配色 |
| ---------------------- | ------------------------------------ | -------- |
| 選んでいる「複製する」 | 9.75:1（`--color-secondary` の背景） | 13.50:1  |
| 選んでいない「削除…」  | 4.60:1（赤の文字）                   | 4.72:1   |
| 選んでいる「削除…」    | 4.60:1（赤の背景に白の文字）         | 6.51:1   |

最初は、選んでいる「削除…」を、赤の文字のまま `--color-muted`（薄い灰色）の背景にしていた。測ると 2 つの問題があった。

- 明るい配色で 4.11:1 になり、4.5:1 に届かなかった
- 暗い配色では `--color-muted` とカードの面（`--color-card`）が同じ灰 800 なので、選んでいるかどうかが見えなかった

確認ダイアログの「削除する」と同じ、赤の背景と白の文字にして、どちらも直った。

項目の高さは、押しやすさの決まり（ux.md）に合わせて 44px 以上にした。

## メニューから確認ダイアログを開く

「削除…」を押すと、確認ダイアログを開く。Base UI の docs（Menu の「Open a dialog」）のとおり、ダイアログの開け閉めを state で持ち、項目の `onClick` で開く。

```tsx
// features/Card/CardActionsMenu
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

<Menu trigger={…}>
  <MenuItem variant="danger" onClick={() => setDeleteDialogOpen(true)}>削除…</MenuItem>
</Menu>
<DeleteConfirmDialog card={card} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
```

そのため、2 つを変えた。

- `ui/AlertDialog` の `trigger` を、渡さなくてもよい形にした。渡さないときは、`open`・`onOpenChange` で開け閉めする
- `features/Card/DeleteConfirmDialog` は、「削除」ボタンを持たず、`open`・`onOpenChange` を受け取る形にした。開くのは、新しく作った `features/Card/CardActionsMenu`（カードの「⋯」のメニュー）

ページからは、カードを渡すだけ。

```tsx
<CardActionsMenu card={card} />
```

### 閉じたあとのフォーカス

メニューは閉じると、フォーカスを trigger（「⋯」）に戻す。メニューの項目から開いた確認ダイアログを閉じたときも、フォーカスは「⋯」に戻った（Base UI の既定の動き。ダイアログを開いたときにフォーカスがあった場所に戻すが、項目はメニューごと消えているため、メニューの trigger に戻る）。

| 操作                                     | 閉じたあとのフォーカス                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| メニューを Esc で閉じる                  | 「⋯」                                                                                           |
| 「複製する」を押す                       | 「⋯」                                                                                           |
| 「削除…」→ 確認ダイアログを Esc で閉じる | 「⋯」                                                                                           |
| 「削除…」→「削除する」                   | ページの見出し（カードごと「⋯」が消えるので、[docs/19](19-確認ダイアログ.md) のとおり見出しへ） |

## 複製する

カードのストア（`features/Card/utils/cards.ts`）に `duplicateCard` を足した。元のカードのすぐ後ろに、id を今ある一番大きい id の次にして、見出しに「のコピー」を付けて足す。単体テストを 2 件足した（すぐ後ろに足す・知らせて、最後に削除したカードは変えない）。

## 無効の項目にも止まる

`MenuItem` の `disabled` を付けた項目は、押しても何も起きない。ただし、矢印キーで動くと、**無効の項目にも止まる**（`aria-disabled="true"` が付く）。

最初は「無効の項目は飛ばす」と思ってテストを書いたら、落ちた。WAI-ARIA の Authoring Practices（メニューの作り方の指針）でも、無効の項目にフォーカスを当てられるようにして、何の操作があるかを読み上げソフトの人にも伝える形が勧められている。テストのほうを直した。

## play 関数で確かめたこと

| ストーリー                    | 確かめること                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `Default`・`Open`             | 閉じているとき・開いたときの見た目を、アクセシビリティの検査にかける                  |
| `KeyboardNavigation`          | Enter で開くと最初の項目、↓ で無効の項目にも止まり、Enter で実行して閉じ、「⋯」に戻る |
| `EscapeCloses`                | Esc で閉じると何も実行せず、「⋯」に戻る                                               |
| `ClickRunsAction`             | 項目を押すと、処理を呼んでから閉じる                                                  |
| `DisabledItemDoesNothing`     | 無効の項目は、押しても何も起きず、メニューも閉じない                                  |
| AlertDialog の `OpenFromMenu` | メニューの「削除…」から開き、Esc で閉じると「⋯」に戻る                                |

5 回続けて通った。わざと壊すと、失敗した。

| 壊し方                                                     | 失敗したストーリー                      |
| ---------------------------------------------------------- | --------------------------------------- |
| 項目を押しても `onClick` を呼ばない                        | `KeyboardNavigation`・`ClickRunsAction` |
| 項目を押してもメニューを閉じない（`closeOnClick={false}`） | `KeyboardNavigation`・`ClickRunsAction` |

Menu のストーリーを初めて動かしたときは、テストが 1 つも読み込まれなかった。Vite が、新しく使った Base UI の Menu を組み直していたため（[docs/19](19-確認ダイアログ.md) と同じ）。

## 確かめたこと（`/practice`）

Playwright で、`/practice` を開いて確かめた。

- Enter で開くと、最初の項目（複製する）にフォーカスが移った。↓ で「削除…」に動いた
- 「複製する」で、「4 枚目」のすぐ後ろに「4 枚目のコピー」が足された
- 「削除…」で確認ダイアログが開き、フォーカスはキャンセルに移った。Esc で閉じると「⋯」に戻った
- 「削除する」で「4 枚目」が消え、「「4 枚目」を削除しました。」が出て、フォーカスは見出しに移った
- 明るい配色・暗い配色・320px の画面で、見た目を確かめた

## 残っていること

- 「⋯」のボタンに、見える人向けの説明（Tooltip）を付ける。次に作る
- メニューの中の項目を、文字で絞り込む（Base UI の Filtering、まだ Preview）や、入れ子のメニューは、要るようになったら
