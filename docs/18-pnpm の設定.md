# pnpm の設定

記録日: 2026-10-20（2026-10-25 に `permissions` を追記） / 対象: pnpm 12.11.2・12.15.0、Vite+ 1.3.0

`pnpm-workspace.yaml` に足した設定と、その理由。pnpm の docs（pnpm.io の Settings。12 系の最新）と、Vite+ 1.3.0 の docs（`node_modules/vite-plus/docs/guide/env.md`）を読んで決めた。

`pnpm-workspace.yaml` は、pnpm の設定ファイル。TS で言えば `.npmrc` の役目も兼ねた、リポジトリ全体の設定。`vp install` は中で pnpm を動かすので、ここに書いた設定がそのまま効く。

## 足した設定

```yaml
pmOnFail: ignore
autoDedupe: true
minimumReleaseAge: 2880
trustPolicy: no-downgrade
trustPolicyExclude:
  - semver@6.3.1
permissions:
  "@tanstack/router-plugin":
    skills: false
```

| 設定                        | 既定       | 何をするか                                                                                 |
| --------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| `pmOnFail: ignore`          | `download` | pnpm が、`package.json` に書いた pnpm の版に自分で切り替えない                             |
| `autoDedupe: true`          | `false`    | 同じパッケージが複数の版で入っていて、1 つの版で全員の範囲を満たせるなら、その版にまとめる |
| `minimumReleaseAge: 2880`   | `1440`     | 公開から 2 日（2880 分）たっていない版を入れない                                           |
| `trustPolicy: no-downgrade` | `off`      | 前に公開された版より、公開の証明が弱い版を入れない                                         |
| `permissions`               | なし       | 依存が持つ AI エージェント向けの skill を、リンクしてよいか                                |

### `pmOnFail: ignore`

pnpm の版を、Vite+ と pnpm の両方が管理していた。

- Vite+ は、`package.json` の `devEngines.packageManager` を読んで、pnpm 12.11.2 を動かす
- pnpm も、同じ欄を読んで、自分で版を合わせようとする（既定の `download`）

Vite+ 1.3.0 の docs も、Vite+ に版を任せるなら `ignore` にするよう勧めている。入れたあとも、lockfile は変わらなかった（コピーしたリポジトリで試した）。

### `runtimeOnFail` は入れない

Vite+ の docs は `runtimeOnFail: ignore` も勧めている。pnpm が Node.js を自分でダウンロードして、Vite+ と二重に管理するのを止めるため。

このリポジトリは、`devEngines.runtime` を `onFail: "error"` にしている。pnpm は版を確かめるだけで、Node.js をダウンロードしない（lockfile にも Node.js の記録はない）。二重の管理は起きていない。

`runtimeOnFail` を書くと、`package.json` の `onFail` を上書きする。`ignore` にすると、版がずれていても止まらなくなる。この PC では `node` が mise の shim を指していて、Vite+ と mise の 2 つが Node.js を出せる。版がずれたときに止める見張りとして、`"error"` を残した。

### `autoDedupe: true`

pnpm 12.6.0 で入った設定。`pnpm install`・`pnpm add`（`vp install`・`vp add`）のたびに、まとめられる版をまとめる。lockfile を変えない入れ方（`--frozen-lockfile`）では、まとめない。

入れた時点では、まとめられるものは無かった（`pnpm dedupe --check` が何も変えなかった）。これから依存を足したときに、同じパッケージの版が増えないようにするための予防。

依存を 1 つ足したときに、関係のないパッケージの版も動くことがある。lockfile の差分を見れば分かる。

### `minimumReleaseAge: 2880`

公開されたばかりの版は、乗っ取られたアカウントから公開された悪い版かもしれない。見つかって取り下げられるまでの間に入れないよう、2 日待つ。

既定（1440 分 = 1 日）のままだと、「ゆるい」動きになる。範囲の中に 1 日たった版が無いと、新しすぎる版でもそのまま入れる。自分で `minimumReleaseAge` を書くと、`minimumReleaseAgeStrict` が `true` になり、「厳しい」動きになる。新しすぎる版しか無ければ、エラーで止まる。

| 書き方           | 新しすぎる版しか無いとき |
| ---------------- | ------------------------ |
| 書かない（既定） | そのまま入れる           |
| 自分で書く       | エラーで止まる           |

### `trustPolicy: no-downgrade`

パッケージの版には、公開のしかたの証明がある。強い順に、trusted publishing（CI から、登録した手順でだけ公開できる）、provenance（どこでビルドしたかの証明）、証明なし。

`no-downgrade` は、前に公開された版より証明が弱い版を入れない。作者のアカウントが乗っ取られて、手元から公開された版を防ぐ。比べるのは公開された日付の順で、semver の順ではない。

入れると、`semver@6.3.1` で止まった。

| 版             | 公開日     | provenance |
| -------------- | ---------- | ---------- |
| `semver@7.5.4` | 2023-07-07 | あり       |
| `semver@6.3.1` | 2023-07-10 | なし       |

6.3.1 は、古い 6 系に後から出た修正版。日付の順で 7.5.4 の後なので、証明が下がったように見える。乗っ取りではないので、`trustPolicyExclude` でこの版だけを外した。`@babel/core` が使っていて、TanStack Router のプラグインや Storybook の部品から入っている。

### `permissions`（依存の skill を拒否する）

pnpm 12.11.0 で入った仕組み。パッケージが `skills/<名前>/SKILL.md` を持っていると、pnpm は、それを AI エージェント（Claude Code など）が読む skill として見つける。承認すると、`.claude/skills/pnpm-<パッケージ>-<skill>` にリンクを作る。承認するまでは何もリンクせず、インストールも止めない。

```
Agent skills awaiting approval: @tanstack/router-plugin.
Run "pnpm approve" to review them.
```

2026-10-25 に、`@tanstack/router-plugin` 1.168.46 でこの表示が出た。中身は、TanStack Router の Vite プラグインの設定方法を書いた 250 行の `SKILL.md`。拒否した。

```zsh
vp exec pnpm approve '!@tanstack/router-plugin'   # ! を付けると拒否。pnpm-workspace.yaml の permissions に書かれる
vp exec pnpm permissions list                     # 承認・拒否した一覧と、待っているもの
```

- skill は、エージェントが作業のたびに従う指示になる。中にスクリプトがあれば、エージェントが動かすこともある
- 一度承認すると、**後の版もずっと承認したまま**になる。版が上がって中身が変わっても、もう一度は聞かれない。`allowBuilds` でスクリプトを止めているのと同じ考え方で、知らない間に増える指示を入れない
- 書いてある `library_version` は 1.168.23 で、入っている版とずれていた。TanStack Router の設定も済んでいる

`allowBuilds` で止めているもの（`esbuild`・`@swc/core`）も、`pnpm permissions list` では「build を拒否」として並ぶ。`pnpm approve` は `permissions` をファイルの最後に `'` で書いたので、`allowBuilds` の隣に動かし、`"` にそろえた。

## 入れなかった設定

| 設定                 | 入れなかった理由                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `runtimeOnFail`      | 上の「`runtimeOnFail` は入れない」                                                                                                                                                                      |
| `savePrefix`         | 版を指定せずに `vp add` したとき、`^` を付けずに入れる設定。`"="` だと `"=2.1.3"`、`""` だと `"2.1.3"` と書かれた。`vp update`・`vp update -L` の動きは変わらなかった。`vp add -E` で足りるので入れない |
| `blockExoticSubdeps` | 既定で `true`（依存の依存は、Git や URL から入れない）                                                                                                                                                  |
| `strictDepBuilds`    | 既定で `true`（入れるときに動くスクリプトを持つパッケージが `allowBuilds` に無ければ、エラーで止まる）                                                                                                  |

## 新しすぎる版で止まったときの直し方

`minimumReleaseAge` を入れたとき、lockfile に 2 日たっていない版が入っていて、`vp install` が止まった。

```
Error: ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION
  seroval@1.6.11 was published at 2026-10-18T11:47:50.822Z, within the minimumReleaseAge cutoff
```

引っかかったのは、`@commitlint/lint`・`@commitlint/load` の 21.2.4 と、`seroval` の 1.6.11。どれも直接は入れていない、依存の依存。2 日たった版に入れ直した。

```zsh
vp update seroval -- --depth 10 --config.trust-lockfile=true
```

- `--depth 10`: 依存の依存も更新の対象にする（`vp update` は `--depth` を受け取らないので、`--` の後ろで pnpm に渡す。`Infinity` は `vp` に数字でないと言われた）
- `--config.trust-lockfile=true`: いまの lockfile の検査を、この 1 回だけ飛ばす。飛ばさないと、検査で止まって更新まで進まない。更新のときは新しい規則で版を選ぶので、2 日たった版になる

| パッケージ                                    | 前     | 後     |
| --------------------------------------------- | ------ | ------ |
| `@commitlint/lint`・`load`・`ensure`・`rules` | 21.2.4 | 21.2.3 |
| `seroval`・`seroval-plugins`                  | 1.6.11 | 1.6.9  |

入れ直したあと、`node_modules` を消して `vp install` すると、`Lockfile passes supply-chain policies` と出て通った。`vp check`・`vp test`・`vp run build`・`vp run lint:deps`・commitlint も通った。

**`minimumReleaseAgeExclude` には足さない。** pnpm の案内（`help:`）は、`minimumReleaseAgeExclude` に足す方法も出すが、足すと、その版だけ待つ仕組みが効かなくなる。2 日たった版に入れ直すか、2 日待つ。

## コメントと空行は消えない

`pnpm-workspace.yaml` は、pnpm や Vite+ のコマンドが書き換えることがある。コメントや空行が消えないかを、コピーしたリポジトリで確かめた。

| コマンド                                         | コメント・空行 | ほかの変化                                                                                               |
| ------------------------------------------------ | -------------- | -------------------------------------------------------------------------------------------------------- |
| `vp install`・`vp add`・`vp update`・`vp remove` | 残った         | なし                                                                                                     |
| `vp add --save-catalog`                          | 残った         | catalog に 1 行足された                                                                                  |
| `vp fmt`・`vp check --fix`（コミットのとき）     | 残った         | なし（YAML は整形しない）                                                                                |
| `vp migrate`（1.2.0 → 1.3.0）                    | 残った         | catalog の版が変わった。`"catalog:"` が `'catalog:'` になった。**`minimumReleaseAgeExclude` が足された** |
| `pnpm approve`                                   | 残った         | `permissions` がファイルの最後に足された                                                                 |

そこで、空行と見出しのコメントで、設定をまとまりごとに分けた（Vite+ がそろえる版、pnpm の版の管理、依存の入れ方、サプライチェーン攻撃への備え）。

### `vp migrate` は `minimumReleaseAgeExclude` を足す

`minimumReleaseAge` を書いた状態で `vp migrate` を動かすと、次の 10 個が自動で足された。1.3.0 は公開から 4 日たっていて、2 日のルールには引っかからないのに足された。

```yaml
minimumReleaseAgeExclude:
  - vite-plus
  - '@voidzero-dev/*'
  - oxlint
  - '@oxlint/*'
  - oxlint-tsgolint
  - '@oxlint-tsgolint/*'
  - oxfmt
  - '@oxfmt/*'
  - vitest
  - '@vitest/*'
```

足したままにすると、Vite+ の道具だけは 2 日待たずに入るようになる。**`vp migrate` の後に、足されていたら消す**（[docs/17](17-Vite+%20を更新する.md) の「このリポジトリで追加で確かめること」）。

`"` が `'` に変わるのは、見た目だけで意味は同じ。`vp fmt` も YAML を整形しないので、どちらかにそろえる仕組みはない。

## わかったこと

### `vp install` が何もせずに終わることがある

依存が変わっていないと、`vp install` は `Already up to date` ですぐ終わり、`prepare` も動かない（[docs/16](16-単体テスト.md)）。pnpm の `optimisticRepeatInstall`（既定は `true`）のため。入れる前にさっと調べて、変わっていなければ install ごと飛ばす。

設定（`pnpm-workspace.yaml`）を変えただけでも飛ばすことがあった。新しい設定で確かめたいときは、`node_modules` を消してから `vp install` する。

## 参考

- [pnpm: CLI Settings（`pmOnFail`・`runtimeOnFail`）](https://pnpm.io/settings/cli)
- [pnpm: Dependency Resolution（`minimumReleaseAge`・`trustPolicy`・`autoDedupe`・`blockExoticSubdeps`）](https://pnpm.io/settings/dependency-resolution)
- [pnpm: Build Settings（`allowBuilds`・`strictDepBuilds`）](https://pnpm.io/settings/build)
- [pnpm: Agent Skills（`permissions`・`pnpm approve`）](https://pnpm.io/agent-skills)
- [pnpm: Other Settings（`savePrefix`・`optimisticRepeatInstall`）](https://pnpm.io/settings/other)
