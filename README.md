# design-system-prac

React で自分のデザインシステムを作り、[Storybook](https://storybook.js.org/) で一覧にするための学習用リポジトリ。
ツールチェーンは [Vite+](https://viteplus.dev/)（`vp`）を使う。

## セットアップ（初回のみ）

Node.js と pnpm は `vp` が自動で用意するので、事前にインストールしておく必要はない。必要なのは Git と `vp` だけ。

### 1. `vp` をインストールする

```zsh
curl -fsSL https://vite.plus | bash
```

インストールが終わったら**新しいターミナルを開き**、次のコマンドでバージョンを確認する。

1.3.0 以上になっていれば OK。

```zsh
vp --version

# すでに古い vp を入れている場合は、以下のコマンドで更新する
vp upgrade
```

### 2. Node.js・pnpm・依存関係をインストールする

```zsh
vp env install   # Node.js 24.22.1 と pnpm 12.11.2 を入れる
vp install       # 依存関係をインストールする
```

- `vp install` は中で pnpm 12.11.2 の `pnpm install` を実行するので、`pnpm install` を別に実行する必要はない

- Node.js のバージョンは `package.json` の `devEngines.runtime` に書いてあり、`onFail` を `"error"` にしている。違うバージョンの Node.js で実行するとエラーになる
- `vp install` の最後に `prepare` スクリプトが動く。`vp config` で Git フックを有効にし、`playwright install chromium` でテスト用のブラウザ（Chromium）を入れる

### 3. Git フックが有効になっているか確かめる

```zsh
vp hooks status   # 「Hooks dir: .vite-hooks」と表示されれば OK
```

Git フックの有効・無効は各 PC のローカル設定（`git config core.hooksPath`）なので、クローンしただけでは引き継がれない。

表示されなければ `vp hooks enable` を実行する。

### 4. テスト用のブラウザが入ったか確かめる

`vp test` を動かすために必要。2 の `vp install` で、`prepare` スクリプトが自動で入れる。

- 初回は、Chromium など 3 つ（約 570MB）をダウンロードするので、`vp install` に 1 分半ほどかかる
- 入れる先は、PC 全体で 1 か所（macOS では `~/Library/Caches/ms-playwright/`）。ほかのプロジェクトと共有する
- ネットにつながっていないと、初回の `vp install` が `Failed to download` で失敗する。つながってから、もう一度 `vp install` を実行する

`vp test` が通れば OK。

ブラウザだけを消してしまったときは、手で入れ直す。依存が変わっていないと `vp install` は `Already up to date` で終わり、`prepare` が動かないため。

```zsh
vp exec playwright install chromium
```

`vp test` は、次の 2 つをまとめて動かす。ブラウザが入っていないと、ストーリーのテストで失敗し、`vp test` が通らない。

- ストーリーのテスト: Storybook のストーリーを 1 つずつテストとして、Playwright の Chromium で動かす。ストーリーが壊れずに表示されるかと、アクセシビリティの違反がないかを確かめる。テストコードを書く必要はない
- 単体テスト（`__tests__/` の `*.test.ts`）: jsdom で動かす（[docs/16](docs/16-単体テスト.md)）

### 5. VS Code の拡張機能を入れる（任意）

VS Code を使うときだけ。拡張機能の画面で `@recommended` と検索すると、このリポジトリのおすすめ（`.vscode/extensions.json`）が出る。

| 拡張機能                  | できること                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| Vite Plus Extension Pack  | Oxc（lint と整形）と Vitest の拡張機能をまとめて入れる                                     |
| CSS Variable Autocomplete | `var(--` でトークンの候補が出る。Cmd + クリックでトークンの定義に飛ぶ                      |
| Stylelint                 | CSS の決まりの違反に、書いている最中に赤線が出る（[docs/12](docs/12-デザイントークン.md)） |

## よく使うコマンド

| やりたいこと                     | コマンド                             | 補足                                                                                                         |
| -------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Storybook を起動する             | `vp run storybook`                   | <http://localhost:6006/>                                                                                     |
| Storybook を静的にビルドする     | `vp run build-storybook`             | 出力先は `storybook-static/`                                                                                 |
| 開発サーバーを起動する           | `vp dev`                             | <http://localhost:5173/>。                                                                                   |
| 本番用にビルドする               | `vp run build`                       | 型チェック（`tsc -b`）をしてからビルドする。出力先は `dist/`                                                 |
| 依存の向きを検査する             | `vp run lint:deps`                   | `ui/`・`features/`・`pages/` の import の決まり（[docs/06](docs/06-コンポーネントの置き方.md)）              |
| CSS の決まりを検査する           | `vp run lint:css`                    | 部品の CSS に色の値や色の材料、定義のない CSS 変数を書いていないか（[docs/12](docs/12-デザイントークン.md)） |
| lint + フォーマット + 型チェック | `vp check`                           | 確認だけ。ファイルは書き換えない                                                                             |
| 上記をまとめて自動修正           | `vp check --fix`                     | フォーマットと lint の自動修正をしてから型チェックする                                                       |
| テストを実行する                 | `vp test`                            | ストーリーのテストと単体テストを実行する。Chromium が必要                                                    |
| 単体テストだけを実行する         | `vp test --project unit`             | `__tests__/` の `*.test.ts(x)` だけを jsdom で実行する                                                       |
| テストを監視モードで実行する     | `vp test watch`                      | ファイルを保存するたびに再実行する                                                                           |
| 依存関係をインストールする       | `vp install`                         | clone した直後や、`git pull` で lockfile が変わった後に実行する                                              |
| パッケージを追加する             | `vp add <名前>` / `vp add -D <名前>` | `-D` は devDependencies に追加する                                                                           |
| 更新できるパッケージを確認する   | `vp outdated`                        | Vitest は Vite+ 同梱版に合わせているので、`vp update -L` を一括で使わない                                    |
| 環境の状態を診断する             | `vp env doctor`                      | Node.js や pnpm が想定どおりに選ばれているかを確認する                                                       |

### `vp <名前>` と `vp run <名前>` の違い

- `vp <名前>` は **Vite+ の組み込みコマンド**を実行する
- `vp run <名前>` は **`package.json` の scripts** を実行する

Storybook は組み込みコマンドではないので、`vp run storybook` で起動する。ビルドも、`vp run build` は型チェックをしてからビルドし、`vp build` は型チェックをしない。

`vp build` を実行すると「`vpr build` を使って」という note が出る。`package.json` に同じ名前の `build` スクリプトがあることを知らせているだけで、エラーではない（[docs/02](docs/02-Storybook%20を%20Vite+%20で動かす.md)）。

## コミット時に自動で実行されること

コミットすると、pre-commit フック（`.vite-hooks/pre-commit`）が `vp staged` を実行する。
`vp staged` は、ステージされたファイルに対して `vp check --fix` を実行する（設定は `vite.config.ts` の `staged` ブロック）。

- フォーマットや lint で自動修正できるものは、修正された内容がそのままコミットされる
- 型エラーなど自動で直せない問題があると、コミットが中止される
- `src/` の `.ts`・`.tsx` をステージしていれば、依存の向きの検査（`vp run lint:deps`）も動く。違反があるとコミットが中止される
- `src/` の CSS をステージしていれば、Stylelint で色の決まりと、定義のない CSS 変数も検査する。違反があるとコミットが中止される

コミットメッセージは、commit-msg フック（`.vite-hooks/commit-msg`）が commitlint で検査する。
`feat: ヘッダーを作る` のように `<type>: <説明>` の形で書く。形が違うとコミットが中止される（[docs/11](docs/11-コミットメッセージの決まり.md)）。

一時的にフックを飛ばしたいときは、環境変数を付けてコミットする。

```bash
VP_GIT_HOOKS=0 git commit -m "..."
```

## ドキュメント

- [docs/01 学習の進め方](docs/01-学習の進め方.md): このリポジトリの目的、5 段階の進め方、CSS で勉強すること、使うツール
- [docs/02 Storybook を Vite+ で動かす](docs/02-Storybook%20を%20Vite+%20で動かす.md): Storybook を入れる手順と、つまずいたところ、組み込みコマンドと同じ名前のスクリプトを消した理由
- [docs/03 UX のルール](docs/03-UX%20のルール.md): `.claude/rules/ux.md` の理由と、元にした心理学の法則の仕分け
- [docs/04 Flexbox で並べる](docs/04-Flexbox%20で並べる.md): `display: flex` の基本、コンテナとアイテム、`gap` と margin の使い分け
- [docs/05 px と rem](docs/05-px%20と%20rem.md): rem を使う理由、em との違い、ズームと文字サイズの設定の違い
- [docs/06 コンポーネントの置き方](docs/06-コンポーネントの置き方.md): `ui/`・`features/`・`pages/` の分け方と、ファイル名の付け方を変える理由
- [docs/07 ルーティング](docs/07-ルーティング.md): TanStack Router の構成、`routeTree.gen.ts` の扱い、型が効く仕組み
- [docs/08 Grid で並べる](docs/08-Grid%20で並べる.md): `auto-fit` と `minmax()` で列の数を自動で変える方法、ボタンの位置がそろう仕組み、部品が自分の幅を決めない理由
- [docs/09 import のパス](docs/09-import%20のパス.md): `~/` で src を参照する設定、`../` を原則禁止にする方法、循環参照の検査、import の並べ替え
- [docs/10 ヘッダーを作る](docs/10-ヘッダーを作る.md): `space-between` と `flex-wrap`、押せる範囲、`aria-current`、外部リンクを別のタブで開くときの伝え方
- [docs/11 コミットメッセージの決まり](docs/11-コミットメッセージの決まり.md): commitlint の入れ方、Vite+ のフックで commit-msg を動かす方法、既定から変えたルール
- [docs/12 デザイントークン](docs/12-デザイントークン.md): 基本と意味の 2 段の構造、デジタル庁デザインシステムを元にした値、ダークモードの切り替え
- [docs/13 Base UI と Button](docs/13-Base%20UI%20と%20Button.md): 段階 3 の始まり。Base UI の作法、ボタンの状態ごとの色とコントラスト、a11y のチェックをエラーにしたこと、アイコン（Lucide）の選び方と置き方
- [docs/14 TS の値で見た目を変える](docs/14-TS%20の値で見た目を変える.md): CSS Modules で、状態は data 属性、種類はクラス、連続した値は CSS 変数で伝える使い分けと、その落とし穴
- [docs/15 ダークモードを切り替える](docs/15-ダークモードを切り替える.md): 部品の CSS を変えずに `<html data-theme>` で配色を切り替える仕組み、`localStorage` に保存して画面を描く前に付ける理由、zustand を使わない理由、Toggle から Switch に変えた理由、Storybook の「配色」
- [docs/16 単体テスト](docs/16-単体テスト.md): jsdom で動く `unit` のプロジェクトの設定、`globals: true` と tsconfig を分ける理由、テストの置き場所と名前の決まり
- [docs/17 Vite+ を更新する](docs/17-Vite+%20を更新する.md): `vp upgrade` → `vp migrate` の手順、このリポジトリで追加で確かめること、1.3.0 に上げたときの記録
- [docs/18 pnpm の設定](docs/18-pnpm%20の設定.md): `pnpm-workspace.yaml` に足した設定（`pmOnFail`・`autoDedupe`・`minimumReleaseAge`・`trustPolicy`）と、入れなかった設定、新しすぎる版で止まったときの直し方
- [docs/19 確認ダイアログ](docs/19-確認ダイアログ.md): Dialog ではなく AlertDialog を包む理由、パーツの分け方、`isolation: isolate` と z-index、削除したあとのフォーカス、`play` 関数で動きを確かめる方法
- [docs/20 フルスタックのモノレポを試す](docs/20-フルスタックのモノレポを試す.md): Vite+ のモノレポで、oRPC の約束・CSS Modules の共有・MSW 3 の偽物の API・Hono の本物の API が組めるかを試した結果
