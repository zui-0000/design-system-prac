# design-system-prac

React で自分のデザインシステムを作り、[Storybook](https://storybook.js.org/) で一覧にするための学習用リポジトリ。ツールチェーンは [Vite+](https://viteplus.dev/)（`vp`）を使う。

## フォルダ構成

```text
.
├── .claude/rules/          # Claude Code に読ませるルール（UX・コンポーネント・ルーティング）
├── .dependency-cruiser.jsonc  # import の決まり（依存の向き）の検査
├── .storybook/             # Storybook の設定
├── .vite-hooks/
│   ├── pre-commit          # コミット前に実行する Git フック（整形・lint・型チェック・依存の検査）
│   └── commit-msg          # コミットメッセージを検査する Git フック（commitlint）
├── docs/                   # 学んだことのメモ
├── public/                 # そのまま配信する静的ファイル
├── src/
│   ├── main.tsx            # #root に App を描く
│   ├── App.tsx             # ルーターを作る
│   ├── routeTree.gen.ts    # 経路の一覧（自動生成。手で触らない）
│   ├── routes/             # 経路の宣言（ファイル名が URL になる）
│   ├── constants/          # 定数（ページの URL の pages.ts、外部サイトの URL の urls.ts）
│   ├── components/
│   │   ├── ui/             # どこでも使う部品（Card/Card.tsx の形）
│   │   ├── features/       # 機能ごとの部品（Card/CardList/index.tsx の形）
│   │   ├── layouts/        # ページの枠になる部品（Header/index.tsx の形）
│   │   └── pages/          # ページ（Practice/index.tsx の形）
│   └── styles/             # 全体に効く CSS
├── commitlint.config.js    # コミットメッセージの決まり
├── package.json         # 依存関係と、Node.js・pnpm のバージョン（devEngines）
├── pnpm-workspace.yaml  # catalog（Vite+ と Vitest のバージョンをそろえる）
└── vite.config.ts       # Vite・lint・format・テストの設定
```

## セットアップ（初回のみ）

Node.js と pnpm は `vp` が自動で用意するので、事前にインストールしておく必要はない。必要なのは Git と `vp` だけ。

### 1. `vp` をインストールする

```zsh
curl -fsSL https://vite.plus | bash
```

インストールが終わったら**新しいターミナルを開き**、次のコマンドでバージョンを確認する。

1.1.0 以上になっていれば OK。

```zsh
vp --version

# すでに古い vp を入れている場合は、以下のコマンドで更新する
vp upgrade
```

### 2. Node.js・pnpm・依存関係をインストールする

```zsh
vp env install   # Node.js 24.21.0 と pnpm 12.11.2 を入れる
vp install       # 依存関係をインストールする
```

- `vp install` は中で pnpm 12.11.2 の `pnpm install` を実行するので、`pnpm install` を別に実行する必要はない

- Node.js のバージョンは `package.json` の `devEngines.runtime` に書いてあり、`onFail` を `"error"` にしている。違うバージョンの Node.js で実行するとエラーになる
- `vp install` の最後に `prepare` スクリプト（`vp config`）が動き、Git フックも有効になる

### 3. Git フックが有効になっているか確かめる

```zsh
vp hooks status   # 「Hooks dir: .vite-hooks」と表示されれば OK
```

Git フックの有効・無効は各 PC のローカル設定（`git config core.hooksPath`）なので、クローンしただけでは引き継がれない。

表示されなければ `vp hooks enable` を実行する。

### 4. テスト用のブラウザを入れる（任意）

`vp test` を使うときだけ必要。Storybook で部品を見るだけなら飛ばしてよい。

```zsh
vp exec playwright install chromium
```

`vp test` は、Storybook のストーリーを 1 つずつテストとして、Playwright の Chromium で動かす。ストーリーが壊れずに表示されるかと、アクセシビリティの違反がないかを確かめる。テストコードを書く必要はない。入れていないと `vp test` が失敗する。

`vite.config.ts` の `test.projects` には `storybook` プロジェクトしかないので、普通の単体テスト（`*.test.ts`）を置いても今は実行されない。単体テストを書くときは、`projects` に単体テスト用のプロジェクトを足す。

### 5. Storybook を起動する

```zsh
vp run storybook
```

ブラウザで <http://localhost:6006/> を開く。部品はこの画面で確認する。

## よく使うコマンド

| やりたいこと                     | コマンド                             | 補足                                                                                            |
| -------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Storybook を起動する             | `vp run storybook`                   | <http://localhost:6006/>                                                                        |
| Storybook を静的にビルドする     | `vp run build-storybook`             | 出力先は `storybook-static/`                                                                    |
| 開発サーバーを起動する           | `vp dev`                             | <http://localhost:5173/>。                                                                      |
| 本番用にビルドする               | `vp run build`                       | 型チェック（`tsc -b`）をしてからビルドする。出力先は `dist/`                                    |
| 依存の向きを検査する             | `vp run lint:deps`                   | `ui/`・`features/`・`pages/` の import の決まり（[docs/06](docs/06-コンポーネントの置き方.md)） |
| lint + フォーマット + 型チェック | `vp check`                           | 確認だけ。ファイルは書き換えない                                                                |
| 上記をまとめて自動修正           | `vp check --fix`                     | フォーマットと lint の自動修正をしてから型チェックする                                          |
| テストを実行する                 | `vp test`                            | ストーリーをテストとして実行する（単体テストは未設定）。Chromium が必要                         |
| テストを監視モードで実行する     | `vp test watch`                      | ファイルを保存するたびに再実行する                                                              |
| 依存関係をインストールする       | `vp install`                         | clone した直後や、`git pull` で lockfile が変わった後に実行する                                 |
| パッケージを追加する             | `vp add <名前>` / `vp add -D <名前>` | `-D` は devDependencies に追加する                                                              |
| 更新できるパッケージを確認する   | `vp outdated`                        | Vitest は Vite+ 同梱版に合わせているので、`vp update -L` を一括で使わない                       |
| 環境の状態を診断する             | `vp env doctor`                      | Node.js や pnpm が想定どおりに選ばれているかを確認する                                          |

### `vp <名前>` と `vp run <名前>` の違い

- `vp <名前>` は **Vite+ の組み込みコマンド**を実行する
- `vp run <名前>` は **`package.json` の scripts** を実行する

Storybook は組み込みコマンドではないので、`vp run storybook` で起動する。ビルドも、`vp run build` は型チェックをしてからビルドし、`vp build` は型チェックをしない。

## コミット時に自動で実行されること

コミットすると、pre-commit フック（`.vite-hooks/pre-commit`）が `vp staged` を実行する。`vp staged` は、ステージされたファイルに対して `vp check --fix` を実行する（設定は `vite.config.ts` の `staged` ブロック）。

- フォーマットや lint で自動修正できるものは、修正された内容がそのままコミットされる
- 型エラーなど自動で直せない問題があると、コミットが中止される
- `src/` の `.ts`・`.tsx` をステージしていれば、依存の向きの検査（`vp run lint:deps`）も動く。違反があるとコミットが中止される

コミットメッセージは、commit-msg フック（`.vite-hooks/commit-msg`）が commitlint で検査する。`feat: ヘッダーを作る` のように `<type>: <説明>` の形で書く。形が違うとコミットが中止される（[docs/11](docs/11-コミットメッセージの決まり.md)）。

一時的にフックを飛ばしたいときは、環境変数を付けてコミットする。

```bash
VP_GIT_HOOKS=0 git commit -m "..."
```

## ドキュメント

- [docs/01 学習の進め方](docs/01-学習の進め方.md): このリポジトリの目的、5 段階の進め方、CSS で勉強すること、使うツール
- [docs/02 Storybook を Vite+ で動かす](docs/02-Storybook%20を%20Vite+%20で動かす.md): Storybook を入れる手順と、つまずいたところ
- [docs/03 UX のルール](docs/03-UX%20のルール.md): `.claude/rules/ux.md` の理由と、元にした心理学の法則の仕分け
- [docs/04 Flexbox で並べる](docs/04-Flexbox%20で並べる.md): `display: flex` の基本、コンテナとアイテム、`gap` と margin の使い分け
- [docs/05 px と rem](docs/05-px%20と%20rem.md): rem を使う理由、em との違い、ズームと文字サイズの設定の違い
- [docs/06 コンポーネントの置き方](docs/06-コンポーネントの置き方.md): `ui/`・`features/`・`pages/` の分け方と、ファイル名の付け方を変える理由
- [docs/07 ルーティング](docs/07-ルーティング.md): TanStack Router の構成、`routeTree.gen.ts` の扱い、型が効く仕組み
- [docs/08 Grid で並べる](docs/08-Grid%20で並べる.md): `auto-fit` と `minmax()` で列の数を自動で変える方法、ボタンの位置がそろう仕組み、部品が自分の幅を決めない理由
- [docs/09 import のパス](docs/09-import%20のパス.md): `~/` で src を参照する設定、`../` を原則禁止にする方法、循環参照の検査、import の並べ替え
- [docs/10 ヘッダーを作る](docs/10-ヘッダーを作る.md): `space-between` と `flex-wrap`、押せる範囲、`aria-current`、外部リンクを別のタブで開くときの伝え方
- [docs/11 コミットメッセージの決まり](docs/11-コミットメッセージの決まり.md): commitlint の入れ方、Vite+ のフックで commit-msg を動かす方法、既定から変えたルール
