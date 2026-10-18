type Token = { name: string; value: string };

/**
 * トークンの CSS ファイルの中身（?raw で読み込んだ文字列）から、`--名前: 値;` を取り出す。
 * 名前が prefix で始まるものだけを返す。一覧を CSS から作るので、トークンを足しても、ページを書き直さなくてよい。
 */
export function parseTokens(css: string, prefix: string): Token[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...withoutComments.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)]
    .map(([, name, value]) => ({ name, value: value.replace(/\s+/g, " ").trim() }))
    .filter((token) => token.name.startsWith(prefix));
}
