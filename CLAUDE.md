<!--
vite-plus 1.3.0 の node_modules/vite-plus/AGENTS.md を日本語にしたもの（元のファイルは 1.1.0 から 1.3.0 で変わっていない）。
Vite+ の目印（VITE PLUS START / END のコメント）を外してあるので、
vp config（vp install のたびに prepare で動く）が英語のテンプレートで上書きしない。
Vite+ を更新したら、元のファイルと見比べて、変わったところを手で反映する。
最後の「Base UI を使う」は、このリポジトリで足したもの（元のファイルにはない）。
-->

# Vite+ を使う

このプロジェクトは Vite+ を使っている。Vite+ は、Vite・Rolldown・Vitest・tsdown・Oxlint・Oxfmt・Vite Task をまとめたツールチェーン。Node.js とパッケージマネージャーの管理、フロントエンドのツールを、`vp` という 1 つのグローバルな CLI で扱う。Vite+ は Vite とは別のもので、Vite は `vp dev` や `vp build` を通して呼び出す。コマンドの一覧は `vp help`、コマンドごとの説明は `vp <command> --help` で確認する。

ドキュメントは `node_modules/vite-plus/docs` か <https://viteplus.dev/guide/> にある。

## 組み込みコマンドとスクリプト

`vp <name>` は組み込みコマンドを実行する。`vp run <name>` は `package.json` のスクリプトか `vite.config.ts` のタスクを実行する。スクリプトで組み込みコマンドを上書きすることはできないので、`vp dev` と `vp run dev` は別の動きになることがある。先に `package.json` と `vite.config.ts` を確認し、同じ名前のスクリプトやタスクがあれば `vp run <name>` で実行する。

## ツールのバージョン

`vp toolchain` で、今の Vite+ に含まれるツールのバージョンと、ツール同士の関係を表示できる。ツール名を付けると、その部分だけを表示する（例: `vp toolchain vite`）。`--global` を付けると、ローカルの `vite-plus` パッケージを無視する。パッケージの依存関係は `vp why <package>` で表示する。

## 作業のチェックリスト

- [ ] リモートの変更を取り込んだ後と、作業を始める前に `vp install` を実行する
- [ ] `vp check` と `vp test` で、変更のフォーマット・lint・型チェック・テストを行う
- [ ] 確認に必要な `vite.config.ts` のタスクや `package.json` のスクリプトがあれば、`vp run <script>` で実行する
- [ ] セットアップ・Node.js・パッケージマネージャーの動きがおかしいときは `vp env doctor` を実行し、相談するときにその出力を添える

# Base UI を使う

UI の部品は、Base UI（`@base-ui/react`）に同じ役目の部品があれば、それを包んで作る。入れているバージョンの docs が `node_modules/@base-ui/react/docs/` にある（入口は `index.md`）。Base UI の API や作法は、推測せずにここを読んで確かめる。
