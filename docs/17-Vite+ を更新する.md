# Vite+ を更新する

記録日: 2026-10-20 / 対象: Vite+ 1.1.0 → 1.3.0

Vite+ を新しいバージョンに上げる手順と、このリポジトリで追加で確かめること。最後に、1.3.0 に上げたときの記録を残す。

## 手順

```zsh
vp upgrade --check   # 新しいバージョンがあるかだけを確かめる（入れない）
vp upgrade           # 1. グローバルの vp を上げる（PC 全体の vp が変わる）
vp migrate           # 2. プロジェクトの vite-plus を、グローバルの vp と同じバージョンにそろえる（install までする）
vp toolchain vitest  # 3. 同梱の Vitest のバージョンを確かめる
```

- **グローバルを先に上げる**。`vp migrate` は「プロジェクトを、グローバルの `vp` と同じバージョンにそろえる」コマンドなので、グローバルが古いままだと何も変わらない
- `vp migrate` が書き換えるのは、`pnpm-workspace.yaml` の catalog の `vite-plus`・`vite`（`@voidzero-dev/vite-plus-core` の別名）と、`vitest` の固定のバージョン。Git フックなど、最初に一度だけ行う設定には触らない
- 上げたあとに困ったら、`vp upgrade --rollback` でグローバルの `vp` を前のバージョンに戻せる（直近の 3 つが残っている）

TS で言えば、グローバルの `vp` は `npm i -g` で入れた CLI、プロジェクトの `vite-plus` は `package.json` の依存。Gradle で言えば、Gradle Wrapper のバージョンを上げるのと、`build.gradle.kts` のプラグインのバージョンを上げるのを、別々に行う感じ。

## このリポジトリで追加で確かめること

| 確かめること                                                                | 理由                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| catalog の `@vitest/browser-playwright`・`@vitest/coverage-v8` のバージョン | Storybook のテストのために、このリポジトリで足したもの。`vp toolchain vitest` の同梱のバージョンと同じにする。ずれると Vitest が 2 つ入る（[docs/02](02-Storybook%20を%20Vite+%20で動かす.md)）                                                            |
| `pnpm-workspace.yaml` に `minimumReleaseAgeExclude` が足されていないか      | `vp migrate` は、`minimumReleaseAge` を書いていると、Vite+ の道具（`vite-plus`・`@voidzero-dev/*`・`oxlint`・`vitest` など 10 個）を自動で足す（[docs/18](18-pnpm%20の設定.md)）。足されていたら消す。2 日たっていない版で止まったら、2 日待ってから上げる |
| `CLAUDE.md`                                                                 | Vite+ の目印を外して日本語にしたので、自動では新しくならない。`node_modules/vite-plus/AGENTS.md` と見比べて、変わったところを手で直す（[docs/02](02-Storybook%20を%20Vite+%20で動かす.md)）                                                                |
| リリースノート                                                              | 間のバージョンも含めて、このリポジトリに関係する変更がないかを読む（`gh release view v1.3.0 -R voidzero-dev/vite-plus`）                                                                                                                                   |
| 全部の検査                                                                  | `vp check`・`vp test`・`vp run build`・`vp run lint:deps`・`vp run lint:css`・`vp run build-storybook`                                                                                                                                                     |

## 1.3.0 に上げたとき（2026-10-20）

1.1.0 から、1.2.0（2026-10-14）を飛ばして 1.3.0（2026-10-16）に上げた。

### 変わったもの

| もの                                                          | 前             | 後             |
| ------------------------------------------------------------- | -------------- | -------------- |
| `vite-plus`・`@voidzero-dev/vite-plus-core`                   | 1.1.0          | 1.3.0          |
| `vitest`・`@vitest/browser-playwright`・`@vitest/coverage-v8` | 5.0.3          | 5.0.5          |
| 同梱の Vite                                                   | 8.3.3          | 8.3.4          |
| 同梱の Oxlint・Oxfmt                                          | 1.87.0・0.72.0 | 1.88.0・0.73.0 |
| 同梱の oxlint-tsgolint（型を使う lint）                       | 7.0.2003       | 7.0.2004       |
| `react`・`react-dom`（`package.json` の範囲）                 | `^19.3.0`      | `^19.3.1`      |
| `playwright`（`package.json` の範囲）                         | `^1.64.0`      | `^1.64.1`      |

- catalog の `vitest` と `@vitest/*` の 3 つは、どれも同梱の 5.0.5 にそろっていた。`vp why vitest` でも 5.0.5 の 1 つだけだった
- `pnpm-workspace.yaml` の変更は catalog だけで、`minimumReleaseAgeExclude` は足されていなかった
- `AGENTS.md` は、1.1.0 と 1.3.0 で中身が同じだった（npm から 1.1.0 を落として比べた）。`CLAUDE.md` は、先頭のコメントのバージョンだけを直した
- `vp install` のときに出ていた「非推奨のサブ依存が 24 個ある」（`@yuku-parser`・`@yuku-codegen` 0.9.5）の警告は、`@yuku-core` 0.19.0 に変わって出なくなった
- Storybook の peerDependencies の警告（`vite-plus` に `^0.1.15 || ^0.2.0` を求める）は、上げる前から出ていたもので、変わらない

### リリースノートで、このリポジトリに関係しそうなもの

| バージョン | 変わったこと                                                                                               | このリポジトリでは                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1.2.0      | Oxlint・Oxfmt が上がり、前は通ったコードが引っかかることがある                                             | `vp check` は通った                                                                               |
| 1.2.0      | 型を使う lint で、行ごとの除外のコメント（`oxlint-disable-next-line`）の効く位置が元に戻った               | 除外のコメントを使っていないので、関係ない                                                        |
| 1.2.0      | Vitest が、結果のキャッシュをディスクに残すようになった                                                    | `vp test` は通った。作業ツリーに余計なファイルは増えていない                                      |
| 1.2.0      | Git フックが、`~/.vite-plus/bin` を `PATH` に足さなくなった。プロジェクトの `node_modules/.bin` を先に使う | このリポジトリは `vite-plus` を依存に入れているので、フックはそのまま動いた（コミットで確かめた） |
| 1.3.0      | `vp staged`（コミットのとき）の表示が、検査ごとに 1 行になった                                             | 表示が短くなっただけ                                                                              |
| 1.3.0      | `vp create`・`vp migrate` で選べる AI の道具から、`CLAUDE.md` が消えた（今ある `CLAUDE.md` は使える）      | 今ある `CLAUDE.md` をそのまま使う                                                                 |

### 確かめたこと

| 検査                     | 結果                                                      |
| ------------------------ | --------------------------------------------------------- |
| `vp check`               | 通った                                                    |
| `vp test`                | 27 件（ストーリー 12 件、単体テスト 15 件）がすべて通った |
| `vp run build`           | 通った                                                    |
| `vp run lint:deps`       | 違反なし                                                  |
| `vp run lint:css`        | 通った                                                    |
| `vp run build-storybook` | 通った                                                    |

### まだ決めていないこと

1.3.0 の docs（`node_modules/vite-plus/docs/guide/env.md`）は、pnpm 11 以降で Vite+ に Node.js と pnpm のバージョンを任せるなら、`pnpm-workspace.yaml` に次の 2 つを書くよう勧めている。

```yaml
runtimeOnFail: ignore # pnpm が、宣言された Node.js などを自分で用意しない
pmOnFail: ignore # pnpm が、package.json に書いた pnpm のバージョンに切り替えない
```

このリポジトリは、`package.json` の `devEngines.runtime` を `onFail: "error"` にして、違うバージョンの Node.js ならエラーにしている（[docs/01](01-学習の進め方.md) の「ツールの決まり」）。今の形で困っていないので、今回は入れていない。入れるかどうかは、別に確かめてから決める。

2026-10-20 に決めた: `pmOnFail: ignore` は入れ、`runtimeOnFail` は入れない（[docs/18](18-pnpm%20の設定.md)）。

## Node.js を上げる

Node.js は、`package.json` の `devEngines.runtime` に具体的な版で書き、Vite+ が nodejs.org から落とす（[docs/20](20-フルスタックのモノレポを試す.md) の「`vp install` 1 回で、3 つともそろう」）。npm のパッケージではないので、pnpm の 2 日のルール（[docs/18](18-pnpm%20の設定.md)）は効かない。

```zsh
# package.json の devEngines.runtime.version を書き換えてから
vp install            # 書いた版の Node.js が無ければ、Vite+ が落とす
vp exec node --version
```

README の「`vp env install` で入る版」も一緒に直す。

### 24.22.1 に上げたとき（2026-10-21）

24.21.0 から、セキュリティリリースの 24.22.1 に上げた。公式の一覧（`https://nodejs.org/dist/index.json`）の `security: true` で、セキュリティリリースかどうかが分かる。

| 深刻さ | 場所         | 直ったこと（リリースノートの要約）                                    |
| ------ | ------------ | --------------------------------------------------------------------- |
| High   | tls          | 普通でない書き方の IP アドレスを弾く。IP アドレスをそろえる処理のバグ |
| High   | dns          | 名前を引くときの入力のヌル文字を確かめる                              |
| High   | Brotli       | 依存しているライブラリの修正を取り込む                                |
| Medium | http・crypto | 接続の使い回しの見張り、スナップショットをまたぐ乱数のキャッシュ      |
| Low    | permission   | `realpathSync` で権限の決まりを確かめる                               |

上げたあと、`vp check`・`vp test`・`vp run build`・`vp run lint:deps`・`vp run lint:css` が通った。

## pnpm を上げる

pnpm も、`package.json` の `devEngines.packageManager` に具体的な版で書き、Vite+ が落とす。上げ方は Node.js と同じ。

```zsh
# package.json の devEngines.packageManager.version を書き換えてから
vp install            # 書いた版の pnpm が無ければ、Vite+ が落とす
vp exec pnpm --version
```

- 選ぶのは、npm の `latest` の版。`next` は先行版なので選ばない
- pnpm 自身を落とすときに、`pnpm-workspace.yaml` の `minimumReleaseAge` が効くかは確かめていない。公開から 2 日たった版を、自分で選ぶ（[docs/18](18-pnpm%20の設定.md)）
- セキュリティの修正があるかは、GitHub のセキュリティ勧告（`gh api repos/pnpm/pnpm/security-advisories`）とリリースノートで確かめる

README の「`vp env install` で入る版」と、docs/01 のツールの表も一緒に直す。

### 12.14.0 に上げたとき（2026-10-22）

12.11.2 から、`latest` の 12.14.0 に上げた（公開は 10/15）。12.15.0 は `next` で、公開から 2 日たっていなかったので見送った。9 月からあとに、pnpm のセキュリティ勧告は出ていない。

| 版      | このリポジトリに関係しそうなもの                                                                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12.12.0 | `dangerouslyAllowAllBuilds` が `allowBuilds` の `false` を無視していた。このリポジトリは `dangerouslyAllowAllBuilds` を使っていない                |
| 12.13.0 | `pnpm audit signatures` が、`devEngines.runtime` で入れた Node.js を npm のパッケージと照合して、署名がおかしいと言っていた                        |
| 12.14.0 | `overrides` で差し替えている catalog の項目があると、毎回すべてを解決し直していた（このリポジトリは `vite@*`・`vitest@*` を catalog に向けている） |

`pnpm-lock.yaml` は変わらなかった。上げたあと、`vp check`・`vp test`・`vp run build`・`vp run lint:deps`・`vp run lint:css` が通った。

### 12.15.0 に上げたとき（2026-10-25）

Vite+ 1.4.0 への migrate のあと、`package.json` が 12.15.0 になっていた。12.15.0 は `latest` になり、公開（10/21）から 2 日たっていたので、そのまま使う。セキュリティ勧告は出ていない。

| このリポジトリに関係しそうなもの                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| レジストリが、頼んだものと違う名前のパッケージの情報を返したら、エラーにする（`ERR_PNPM_REGISTRY_NAME_MISMATCH`）。前は、`allowBuilds` の決まりをすり抜けられた |
| 依存を解決し直すとき、同じ install ですでに選んだ版を使い回す。前は、lockfile の版を残して、同じパッケージを 2 つ入れていた                                     |
| `pnpm-workspace.yaml` の設定を、`include` で別のファイルに分けられる                                                                                            |

インストールのときに、依存の skill を承認するかを聞かれたので、拒否した（[docs/18](18-pnpm%20の設定.md) の `permissions`）。この仕組みは 12.11.0 からある。
