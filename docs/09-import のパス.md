# import のパス

記録日: 2026-10-18

`src/` の中のファイルは、`~/` から書いて import する。

```tsx
// 後
import { Card } from "~/components/ui/Card/Card";

// 前
import { Card } from "../../ui/Card/Card";
```

- `../../` を数えなくてよい。ファイルを別のフォルダに動かしても、import を書き換えなくて済む
- どこから読んでも同じ書き方になるので、検索しやすい
- 同じフォルダと、1 つ下のフォルダのファイル（`./Card.module.css`・`./hooks/useTheme` など）は `./` で書く。部品のフォルダの中で閉じていることが分かるため

最初は `./` を同じフォルダだけにしていたが、2026-10-19 に 1 つ下まで広げた。部品のフォルダに `hooks/` や `utils/` を置くようになり、すぐ下のファイルを `~/` から書くと、かえって長くなったため。

```tsx
// ThemeToggle/index.tsx から、すぐ下の hooks/useTheme.ts を読む
import { useTheme } from "~/components/features/Theme/ThemeToggle/hooks/useTheme"; // ~/ だと長い
import { useTheme } from "./hooks/useTheme"; // 1 つ下なので ./ で書く
```

| 読む先                                                        | 書き方 | 例                                                                  |
| ------------------------------------------------------------- | ------ | ------------------------------------------------------------------- |
| 同じフォルダ                                                  | `./`   | `./index.module.css`                                                |
| 1 つ下のフォルダ                                              | `./`   | `./hooks/useTheme`、`./blocks/ScaleTokens`                          |
| 同じまとまりの中の隣のフォルダ（`hooks/` から `utils/` など） | `../`  | `../utils/theme`、`../utils/parseTokens`、`../blocks/PaletteTokens` |
| テストの `__tests__/` から、確かめるファイル                  | `../`  | `utils/__tests__/theme.test.ts` から `../theme`                     |
| 2 つ以上下、またはまとまりの外                                | `~/`   | `~/components/ui/Button/Button`、`~/constants/pages`                |

2 つ以上下を `./` にしないのは、`./a/b/c` のように深くなると、`~/` と同じくらい長くなり、どこを指しているか分かりにくくなるため。

**相対パス（`./`・`../`）は、「同じまとまりの中」の印にする。** まとまりは、部品のフォルダ（`ThemeToggle/` など）と、`src/styles/stories/`。部品のフォルダの `hooks/`・`utils/` から 1 つ上がっても、同じ部品のフォルダの中に留まるので、`../` を 1 つだけ許した（2026-10-19）。テストの `__tests__/` も、1 つ上がると確かめるファイルのフォルダなので、同じく許した（[docs/16](16-単体テスト.md)）。部品のフォルダごと別の場所に動かしても、中の相対パスは書き換えなくて済む。

まとまりの外（別の部品、`src/constants/` など）へは、1 つ上がるだけで届く場合も `~/` から書く。`ui/Card/Card.stories.tsx` から `Button` を読むなら `~/components/ui/Button/Button` で、`../Button/Button` とは書かない。相対パスにすると、`~/constants/pages` が読む場所によって `../constants/pages` になったりして、同じファイルの書き方が場所で変わってしまう。

### `../` を許す場所は lint で決める

`vite.config.ts` の lint の `overrides` で、部品のフォルダの `hooks/`・`utils/`、テストの `__tests__/`、`src/styles/stories/` の下のフォルダの中のファイルにだけ、`../` を 1 つ許している。ほかの場所では、今までどおり `../` が止まる。

```ts
overrides: [
  {
    files: ["src/components/**/hooks/**", "src/components/**/utils/**", "src/**/__tests__/**", "src/styles/stories/*/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["../../*", "../../**"], message: "…" }] }],
    },
  },
],
```

わざと書いて確かめた結果。

| 書いた場所                         | import                           | 結果                 |
| ---------------------------------- | -------------------------------- | -------------------- |
| `ThemeToggle/hooks/`               | `../utils/theme`                 | 通る                 |
| `ThemeToggle/hooks/`               | `../../../../../constants/theme` | 止まる（2 つ以上上） |
| `ui/Card/`（部品のフォルダの直下） | `../Button/Button`               | 止まる（別の部品へ） |
| `ThemeToggle/utils/__tests__/`     | `../theme`                       | 通る                 |
| `ThemeToggle/utils/__tests__/`     | `../../index`                    | 止まる（2 つ以上上） |

`.mdx`（Storybook のページ）は Oxlint の対象ではないので、決まりは手で守る（`primitive/color.mdx` から `../blocks/PaletteTokens`）。

`@` ではなく `~` にしたのは、`@storybook/react-vite` のような、スコープ付きの npm パッケージと見分けるため。

## 設定は 2 か所に書く

TS の型チェックと、Vite のバンドルは、パスを別々に解決する。だから両方に書く。TS で言えば、`tsconfig` の `paths` だけ書いても、実行時の解決はされないのと同じ。

```jsonc
// tsconfig.app.json（型チェック用）
"paths": {
  "~/*": ["./src/*"]
}
```

```ts
// vite.config.ts（バンドル用。Storybook とテストもこの設定を使う）
resolve: {
  alias: { "~": path.join(import.meta.dirname, "src") },
},
```

TypeScript 7 では `baseUrl` が廃止された。`paths` は、tsconfig のある場所を基準に解決される。

dependency-cruiser は、`.dependency-cruiser.jsonc` の `tsConfig` で `tsconfig.app.json` を読んでいるので、`~/` の import もたどれる（`~/` から別のページを import して、違反として止まることを確かめた）。

## `../` は原則禁止にする

親のフォルダへさかのぼる import を書くと、`vp check` がエラーにする。コミットも止まる。

```ts
// vite.config.ts の lint.rules
"no-restricted-imports": [
  "error",
  {
    patterns: [
      {
        group: ["../*", "../**"],
        message: "親のフォルダへの相対パスは使わず、~/ から書いてください（例: ~/components/ui/Card/Card）",
      },
    ],
  },
],
```

```
x eslint(no-restricted-imports): '../../ui/Card/Card' import is restricted from being used by a pattern.
  help: 親のフォルダへの相対パスは使わず、~/ から書いてください（例: ~/components/ui/Card/Card）
```

`group` は `.gitignore` と同じ書き方で照合する。最初は `"../*"` だけにしたところ、`../routeTree.gen` は止まったが、`../../../constants/pages` は止まらなかった。`*` はフォルダの区切り（`/`）をまたがないため。`"../**"` を足して、何段さかのぼっても止まるようにした。

自動生成の `src/routeTree.gen.ts` は lint の対象から外しているので、中の `./routes/...` はそのまま。

### 例外にするときは、理由を書く

`../` が必要な場面もある（下の「循環参照」）。そのときは、その行の上に、理由付きで lint の除外を書く。

```ts
// oxlint-disable-next-line no-restricted-imports -- まとめ役の index.ts を通すと循環参照になるため
import { CardItem } from "../CardItem";
```

`warn`（警告だけ）にしなかったのは、警告はだれも読まなくなり、いつの間にか `../` が増えるため。何も書かなければ止まり、例外にするなら理由が残る形にした。

## 循環参照を dependency-cruiser で止める

**循環参照**は、A が B を import し、B も A を import する状態。A → B → C → A のように、遠回りして自分に戻る形も含む。読み込みの順番によっては、import した値が `undefined` になり、画面が真っ白になる。

循環参照は、`../` と `~/` のどちらで書いても起きる。指しているファイルは同じだから。起きやすいのは、フォルダの入口に**まとめ役のファイル**（barrel、`index.ts`）を置いたとき。

```ts
// features/Card/index.ts（まとめ役）
export { CardList } from "./CardList";
export { CardItem } from "./CardItem";

// features/Card/CardList/index.tsx
import { CardItem } from "~/components/features/Card"; // まとめ役を通して、自分のフォルダを読む
```

`CardList/index.tsx` → `Card/index.ts` → `CardList/index.tsx` と、自分が自分を読む循環になる。まとめ役を通さずに `../CardItem` を直接指せば避けられる。これが `../` を例外にする典型的な場面。

`.dependency-cruiser.jsonc` の `no-circular` で、循環参照を見つけたら止める。上の形をわざと作ると、こう出る。

```
  error no-circular: src/components/features/Card/CardList/index.tsx →
      src/components/features/Card/index.ts →
      src/components/features/Card/CardList/index.tsx
    循環参照になっています。まとめ役のファイル（index.ts）を通さずに、使うファイルを直接 import してください（docs/09）
```

### `import type` だけの循環は除く

ルールを入れたところ、今のコードにも循環が 1 つ見つかった。

```
src/constants/pages.ts → src/routeTree.gen.ts → src/routes/index.tsx → src/constants/pages.ts
```

`pages.ts` は、`routeTree.gen.ts` から実在する URL の**型**（`FileRoutesByTo`）だけを `import type` で読んでいる。型は実行時に消えるので、読み込みの順番の問題は起きない。

そこで、`import type` だけでつながる循環は除いた。

```jsonc
"to": {
  "circular": true,
  "viaOnly": { "dependencyTypesNot": ["type-only"] }
}
```

`viaOnly` は「循環の途中のつながりが、すべてこの条件を満たすときだけ違反にする」という指定。1 か所でも `import type` が入っていれば違反にしない。除いたあとも、上の `index.ts` の循環はきちんと止まることを確かめた。

## import の順番は整形で並べ替える

`vite.config.ts` の `fmt` で、Oxfmt の `sortImports` を有効にしている。保存したときと、`vp check --fix`（コミット時も）で並べ替わる。

```ts
// vite.config.ts
fmt: {
  sortImports: true,
},
```

並び方は、遠いものから近いものへ、グループごとに空行で分かれる。グループの中は名前順。

```tsx
import { Link } from "@tanstack/react-router"; // 外部パッケージ

import { PAGES } from "~/constants/pages"; // ~/（src の中）
import { URLS } from "~/constants/urls";

import styles from "./index.module.css"; // 同じフォルダ
```

**副作用だけの import は動かさない。** `import "./styles/global.css"` のように、値を受け取らない import は、読み込む順番そのものに意味がある（後に読んだ CSS が勝つ）。並べ替えると見た目が変わることがあるので、書いた位置に残る。
