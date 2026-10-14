# Storybook を Vite+ で動かす

記録日: 2026-10-14 / 対象: Vite+ 1.1.0、pnpm 12.11.2、Storybook 10.6.2

docs/01 の「最初にやること」で決めたとおり、Storybook が Vite+ の上で動くかを確かめた。結論として、**動いた**。ただし、Storybook の初期化（`create-storybook`）が途中で 2 回止まった。手順と、止まった原因・対処をまとめる。

## まとめ

```bash
# 1. React + TypeScript のプロジェクトを作る
vp create vite --no-interactive --package-manager pnpm --editor vscode --agent claude -- . --template react-ts
vp env pin 24.21.0                          # Node.js を固定する（onFail は手で "error" に変える）
vp update -L typescript                     # TypeScript 7 にする
vp add -D oxc-transform-react@^0.152.0      # React Compiler（Rust 版）

# 2. Storybook を入れる（devEngines.packageManager.onFail を一時的に "warn" にしてから）
vp dlx create-storybook@10.6.2 --features docs test a11y --no-dev --yes --package-manager pnpm --disable-telemetry
pnpm approve-builds '!esbuild'              # esbuild の postinstall を明示的に拒否する

# 3. Vitest のバージョンを Vite+ 同梱版にそろえる
vp migrate --no-interactive --no-agent --no-editor
```

- Storybook の初期化は、内部で `npm` を呼ぶところで止まる。`devEngines.packageManager` に pnpm と書いてあると、npm が自分の実行を拒否するため。初期化の間だけ `onFail` を `"warn"` にして通した
- pnpm 12 は、許可も拒否もしていない依存の postinstall があるとエラーで止まる。esbuild は postinstall なしでも動くので、`allowBuilds` で拒否した
- 初期化は Vitest の最新版（5.0.4）を入れる。Vite+ 1.1.0 が同梱しているのは 5.0.3 なので、`vp migrate` で 5.0.3 にそろえた
- 終わった後、次のコマンドがすべて成功した

| コマンド                 | 結果                                                                      |
| ------------------------ | ------------------------------------------------------------------------- |
| `vp check`               | format・lint・型チェックが通る                                            |
| `vp test`                | Vitest 5.0.3 が、ストーリー 8 個を Chromium（ヘッドレス）でテストして成功 |
| `vp run build`           | アプリのビルドが通る                                                      |
| `vp run storybook`       | 開発サーバーが起動し、ストーリー 8 個とドキュメント 3 ページが表示される  |
| `vp run build-storybook` | Storybook の静的ビルドが通る                                              |

## なぜ Storybook が Vite+ の上で動くのか

Storybook の `@storybook/react-vite` は、Vite を使ってストーリーをビルドする（Storybook では「ビルダー」と呼ぶ）。このとき、プロジェクトの `vite` パッケージを読み込み、`vite.config.ts` も読む。

Vite+ のプロジェクトでは、`vite` パッケージの中身が `@voidzero-dev/vite-plus-core` に置き換わっている。`pnpm-workspace.yaml` の catalog と overrides でそうしている（docs/01）。

```yaml
catalog:
  vite: npm:@voidzero-dev/vite-plus-core@1.1.0
overrides:
  vite@*: "catalog:"
```

npm で言えば、`overrides` で `vite` を別のパッケージ（フォーク）に差し替えているのと同じ。Storybook は `vite` を読んでいるつもりで、実際には Vite+ の中の Vite を使う。中身は Vite 8.3.3 なので、Storybook 10.6.2 の peerDependencies（`vite` ^5〜^8）を満たしている。

Storybook は `vite.config.ts` も読むので、React Compiler も Storybook の中で効く。開発サーバーで `Header.tsx` の変換結果を見ると、React Compiler が入れるキャッシュの処理（`_c(6)`）が入っていた。

## 止まったところ 1: Storybook の初期化が npm を呼ぶ

### 起きたこと

`create-storybook` が、次のエラーで止まった。

```text
SB_CLI_0003 (ExecaCommandFailedError): Command failed: npm config get registry --workspaces=false --include-workspace-root
npm error EBADDEVENGINES Invalid name "pnpm" does not match "npm" for "packageManager"
```

`--package-manager pnpm` を指定しているのに、npm が呼ばれている。npm 11 は `package.json` の `devEngines.packageManager` を読み、pnpm 用と書いてあると自分の実行を止める（vite-plus-prac の docs/04）。うっかり `npm install` したときのためのガードが、ここでは邪魔になった。

### 原因（Storybook のバグ）

Storybook の pnpm 用の処理（`PNPMProxy`）は、レジストリの URL を調べるところ（`getRegistryURL()`）だけ、`npm config get registry` を直接呼んでいる。このコマンドは、初期化がフレームワークのパッケージ（`@storybook/react-vite`）の場所を見つけられなかったときに、一時的にダウンロードする処理の中で使われる。

それなら、先に `@storybook/react-vite` をインストールしておけば npm は呼ばれないはず。試したが、それでも止まった。パッケージを探す処理（`resolvePackageDir`）が、探し始める場所として `process.cwd()` を `createRequire` などに渡しているのが原因。`process.cwd()` は末尾に `/` が付かないので、`createRequire` はこれを「プロジェクトのディレクトリ」ではなく「1 つ上のディレクトリにあるファイル」と受け取る。`createRequire(import.meta.url)` にファイルの場所を渡すのと同じ扱いになる。そのため **1 つ上のディレクトリ**から `node_modules` を探し始め、プロジェクトに入っているパッケージが見つからない。

どちらも Storybook 側のバグ。Storybook に報告する価値がある（まだしていない）。

### 対処

初期化の間だけ、`package.json` の `devEngines.packageManager.onFail` を `"warn"` にした。npm は警告を出すだけで動くようになる。初期化が終わったら `"download"` に戻した。

```jsonc
// package.json の devEngines（抜粋）
"packageManager": {
  "name": "pnpm",
  "version": "12.11.2",
  "onFail": "warn" // 初期化の間だけ。終わったら "download" に戻す
}
```

## 止まったところ 2: pnpm 12 が esbuild の postinstall を止める

### 起きたこと

```text
Error: ERR_PNPM_IGNORED_BUILDS

  × adding a new package
  ╰─▶ Ignored build scripts: esbuild@0.28.2
  help: Run "pnpm approve-builds" to pick which dependencies should be allowed
        to run scripts.
```

esbuild は、Storybook 本体（`storybook`）が依存している。

pnpm は 10 から、依存パッケージの postinstall などのスクリプトを、許可したものしか実行しなくなった。悪意のあるパッケージが、インストールしただけでコードを実行するのを防ぐため。さらに今の pnpm は `strictDepBuilds` が標準で有効なので、許可も拒否もしていないスクリプトがあると、エラーで止まる。npm で言えば、`--ignore-scripts` が標準になり、パッケージごとに許可を書く形。

### esbuild の postinstall は要らない

esbuild の本体は Go で書かれたバイナリで、OS ごとのパッケージ（macOS の Apple Silicon なら `@esbuild/darwin-arm64`）として、optionalDependencies から入る。postinstall は、そのバイナリが正しく入ったかの確認と、起動を少し速くするための処理をするだけ。

postinstall を実行しない状態で、`@esbuild/darwin-arm64` が入っていること、esbuild の JavaScript の API が動くことを確かめた。

### 対処

`pnpm approve-builds '!esbuild'` で、esbuild のスクリプトを明示的に拒否した（`!` を付けると拒否）。`pnpm-workspace.yaml` に次の設定が入る。

```yaml
allowBuilds:
  esbuild: false
```

`true` にすれば許可になる。許可も拒否も、ここに書いておけばエラーにならない。`vp pm approve-builds` でも同じことができる。

## Vitest が 2 つ入りかけた: `vp migrate` でそろえる

`--features test` を付けると、ストーリーを Vitest のテストとして実行する `@storybook/addon-vitest` が入る。テストはブラウザ（Playwright の Chromium）で動く。このとき初期化は、`vitest`・`@vitest/browser-playwright`・`@vitest/coverage-v8` の最新版（5.0.4）を入れる。

一方、Vite+ 1.1.0 が同梱している Vitest は 5.0.3。このままだと Vitest が 2 つ入る。`vite-plus` の peerDependencies も、`@vitest/browser-playwright` を 5.0.3 ちょうどに指定している。

`vp migrate` を実行すると、次のように直してくれた。

- `pnpm-workspace.yaml` の catalog に `vitest`・`@vitest/browser-playwright`・`@vitest/coverage-v8` を 5.0.3 で追加し、`package.json` は `catalog:` を参照する
- overrides に `vitest@*: "catalog:"` を追加する。ほかのパッケージが依存している Vitest も 5.0.3 になる
- `vite.config.ts` と `vitest.shims.d.ts` の import を、`@vitest/browser-playwright` から `vite-plus/test/browser-playwright` に書き換える
- `.gitignore` に `.vitest/` を追加する

`vite` と同じ仕組みで、Vitest も Vite+ に合わせて固定したことになる。

### 警告が 1 件出たが、後の片付けで消えた

`vp migrate` は、確認が必要なものとして次の 1 件を出した。

```text
[global-api-ownership] Storybook test ownership is unresolved (vite.config.ts): dynamic configDir
```

`vp migrate` は、Vitest のグローバルな API（`import` せずに使う `expect` など）を書き換えるために、どのテストファイルがどの Vitest のプロジェクトに属するかを調べる。Storybook のプロジェクトなら、`storybookTest()` の `configDir` から `.storybook/main.ts` を見つけ、そこに書かれたストーリーの場所を読む。

初期化が書いた `configDir` は、次のように条件で分かれていた。`vp migrate` はコードを実行せずに読むだけなので、条件の式だとどちらになるか分からない。

```ts
const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));
// ...
storybookTest({ configDir: path.join(dirname, ".storybook") });
```

後で `path.join(import.meta.dirname, ".storybook")` に書き換えたら（次の節）、`vp migrate` が場所を読めるようになった。コピーしたプロジェクトで `vp migrate` をやり直して、警告が出ないことを確かめた。このプロジェクトはグローバルな API を使っていないので、警告が出ていた間も動きには影響がない。

## 初期化の後に直したところ

| ファイル                               | 直したこと                                                                                                                                                                                                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vite.config.ts`                       | 初期化が書いた `/// <reference types="vitest/config" />`（`vp migrate` が `vite-plus` に書き換えた）を消した。lint の `triple-slash-reference` に引っかかるし、`vite-plus` の `defineConfig` を import していれば `test` の型は付く             |
| `vite.config.ts`                       | `__dirname` がなければ `import.meta.url` から作る、という CommonJS 向けの分岐を消して、`import.meta.dirname` にした。このファイルは ESM で、Node.js 24 なら使える。`configDir` を省くと実行したディレクトリが基準になるので、明示する形は残した |
| `src/stories/Button.tsx`・`Header.tsx` | 使っていない `import React from "react"` を消した。React 17 からは JSX のために `React` を import しなくてよい                                                                                                                                  |
| `package.json`                         | 初期化が `"latest"` と書いたパッケージを、具体的なバージョンにした（`playwright` は `^1.64.0`）                                                                                                                                                 |
| `package.json`・`.storybook/main.ts`   | `@chromatic-com/storybook` を外した。Chromatic（Storybook の画面の差分を見るクラウドサービス）の addon で、今は使わない                                                                                                                         |

`@vitest/coverage-v8` は、addon ではなく、Storybook の画面からテストのカバレッジを見るためのパッケージ。初期化が入れたものを残してある。使わなければ消してよい。

## 初期化が作ったもの

| ファイル                    | 中身                                                                                                                 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `.storybook/main.ts`        | ストーリーの場所（`src/**/*.stories.*` と `*.mdx`）、addon（vitest・a11y・docs）、フレームワーク                     |
| `.storybook/preview.tsx`    | すべてのストーリーに共通の設定。a11y のチェックは `test: "todo"`（違反を画面に表示するだけで、テストは失敗にしない） |
| `src/stories/*`             | サンプルのストーリー（Button・Header・Page など）。段階 1 に入るときに消す                                           |
| `vite.config.ts` の `test`  | ストーリーを Chromium で実行する Vitest のプロジェクト                                                               |
| `vitest.shims.d.ts`         | Vitest のブラウザモードの型                                                                                          |
| `package.json` の `scripts` | `storybook`（開発サーバー、ポート 6006）と `build-storybook`                                                         |

`storybook` と `build-storybook` は `vp` の組み込みコマンドではないので、`vp run storybook` で実行する。

### 初期化に 40 分かかった

テンプレートのファイルが書かれたのは 13:10 で、Playwright のブラウザ（Chromium など）のダウンロードが始まったのは 13:44 だった。ログの最後の部分しか残していなかったので、その間に何をしていたかは分からない。次に初期化するときは、`--logfile` を付けてログをファイルに残す。

## CLAUDE.md を日本語にする

`vp create` に `--agent claude` を付けると、Vite+ の使い方を書いた `CLAUDE.md` が作られる。これを日本語にした。

`package.json` の `"prepare": "vp config"` によって、`vp install` のたびに `vp config` が動く。`vp config` は、`CLAUDE.md` の中で次の 2 つの目印に挟まれた部分を、英語の元の文章（`node_modules/vite-plus/AGENTS.md`）で**上書きする**。

```text
<!--VITE PLUS START-->
（ここが上書きされる）
<!--VITE PLUS END-->
```

目印を残したまま日本語にすると、次の `vp install` で英語に戻る。そこで目印を外した。目印がなければ、`vp config` は `CLAUDE.md` を書き換えない。どちらの動きも、別の場所で試して確かめた。

その代わり、Vite+ を更新しても `CLAUDE.md` は自動で新しくならない。ファイルの先頭に、元のファイルと Vite+ のバージョンをコメントで書いておいた。Vite+ を更新したら、元のファイルと見比べて手で直す。

## `vp update` と `vp update -L`

作業の後、`package.json` のバージョンが古く見えたので `vp update` を実行した。`react` などの範囲の下限（`^19.2.8` → `^19.3.0`）が上がっただけで、入っているバージョンは変わらなかった。理由は vite-plus-prac の docs/02 と同じで、`^` の範囲の中で最新版がもう入っていたため。

`vp update` を実行しても、`vp outdated` には次の 5 つが残る。どれもわざと上げていない。

| パッケージ                                                    | 今 → 最新         | 上げない理由                                                                                          |
| ------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| `vitest`・`@vitest/browser-playwright`・`@vitest/coverage-v8` | 5.0.3 → 5.0.4     | Vite+ 1.1.0 が同梱しているのが 5.0.3。Vite+ を上げるとき（`vp upgrade` → `vp migrate`）に一緒に上げる |
| `oxc-transform-react`                                         | 0.152.0 → 0.153.0 | `@vitejs/plugin-react` 6.1.2 の peerDependencies が `^0.152.0`                                        |
| `@types/node`                                                 | 24 → 26           | Node.js 本体が 24 なので、型も 24 にそろえる                                                          |

**`vp update -L` を一括で実行してはいけない。** `-L`（`--latest`）は `package.json` の範囲を無視して最新版にする。コピーしたプロジェクトで試すと、上の 5 つがすべて上がり、catalog の Vitest も 5.0.4 になった。peerDependencies の警告も出た。範囲を超えて上げたいときは、`vp update -L react` のようにパッケージを指定する。

`vp install` のときに「非推奨のサブ依存が 24 個ある」（`@yuku-parser/*` など）という警告が出る。`vp why` で調べると、Vite+ 本体（`@voidzero-dev/vite-plus-core` 1.1.0）の依存だった。こちらでは直せないので、Vite+ の更新を待つ。

## 残っていること

- `.storybook/*.ts` が、どの tsconfig の `include` にも入っていない。`vp check` は通るが、`vp run build`（`tsc -b`）はこのファイルを型チェックしない
- Storybook のバグ 2 つ（npm を直接呼ぶ、`createRequire` が 1 つ上のディレクトリから探す）の報告
- `src/stories/` のサンプルを消す（段階 1 に入るとき）

## 参考

- [Storybook: Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon)
- [pnpm: allowBuilds](https://pnpm.io/settings/build#allowbuilds)
- [pnpm: strictDepBuilds](https://pnpm.io/settings/build#strictdepbuilds)
- vite-plus-prac の docs/02（`vp update`）、docs/04（`vp install` と pnpm）、docs/05（React Compiler）、docs/06（Vite+ の更新）
