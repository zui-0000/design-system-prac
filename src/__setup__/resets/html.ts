// テストごとに、jsdom の <html> の属性を全部消す。全部のテストに効く（setup.ts から読む）。
// <html> は同じテストのファイルの中では続いているので、前のテストが付けた data-theme などが残ると、
// 次のテストが正しくない理由で通ってしまう。jsdom の <html> は最初は属性が無いので、全部消せば最初の状態に戻る（docs/16）
afterEach(() => {
  const html = document.documentElement;
  html.getAttributeNames().forEach((name) => html.removeAttribute(name));
});
