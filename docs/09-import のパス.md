# import のパス

記録日: 2026-10-18

`src/` の中のファイルは、`~/` から書いて import する。ts-monorepo-orpc-prac と同じ書き方。

```tsx
// 後
import { Card } from "~/components/ui/Card/Card";

// 前
import { Card } from "../../ui/Card/Card";
```

- `../../` を数えなくてよい。ファイルを別のフォルダに動かしても、import を書き換えなくて済む
- どこから読んでも同じ書き方になるので、検索しやすい
- 同じフォルダのファイル（`./Card.module.css` など）は `./` のまま書く。部品のフォルダの中で閉じていることが分かるため

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
import { CardItem } from "../CardItem/CardItem";
```

`warn`（警告だけ）にしなかったのは、警告はだれも読まなくなり、いつの間にか `../` が増えるため。何も書かなければ止まり、例外にするなら理由が残る形にした。

## 循環参照を dependency-cruiser で止める

**循環参照**は、A が B を import し、B も A を import する状態。A → B → C → A のように、遠回りして自分に戻る形も含む。読み込みの順番によっては、import した値が `undefined` になり、画面が真っ白になる。

循環参照は、`../` と `~/` のどちらで書いても起きる。指しているファイルは同じだから。起きやすいのは、フォルダの入口に**まとめ役のファイル**（barrel、`index.ts`）を置いたとき。

```ts
// features/Card/index.ts（まとめ役）
export { CardList } from "./CardList/CardList";
export { CardItem } from "./CardItem/CardItem";

// features/Card/CardList/CardList.tsx
import { CardItem } from "~/components/features/Card"; // まとめ役を通して、自分のフォルダを読む
```

`CardList.tsx` → `index.ts` → `CardList.tsx` と、自分が自分を読む循環になる。まとめ役を通さずに `../CardItem/CardItem` を直接指せば避けられる。これが `../` を例外にする典型的な場面。

`.dependency-cruiser.jsonc` の `no-circular` で、循環参照を見つけたら止める。上の形をわざと作ると、こう出る。

```
  error no-circular: src/components/features/Card/CardList/CardList.tsx →
      src/components/features/Card/index.ts →
      src/components/features/Card/CardList/CardList.tsx
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

`vite.config.ts` の `fmt` で、Oxfmt の `sortImports` を有効にしている（ts-monorepo-orpc-prac の `.oxfmtrc.jsonc` と同じ設定）。保存したときと、`vp check --fix`（コミット時も）で並べ替わる。

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

import styles from "./Header.module.css"; // 同じフォルダ
```

**副作用だけの import は動かさない。** `import "./styles/global.css"` のように、値を受け取らない import は、読み込む順番そのものに意味がある（後に読んだ CSS が勝つ）。並べ替えると見た目が変わることがあるので、書いた位置に残る。
