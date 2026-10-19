// テストごとに、jsdom の localStorage を空にする。全部のテストに効く（setup.ts から読む）。
// localStorage は同じテストのファイルの中では続いているので、前のテストが保存した値が残ると、
// 次のテストが正しくない理由で通ってしまう（docs/16）
afterEach(() => {
  localStorage.clear();
});
