/**
 * localStorage のキー。localStorage を読み書きするときは、キーを直接書かずにここから参照する。
 * localhost:5173 は、ほかの Vite のプロジェクトとも同じ置き場（オリジン）になる。
 * キーの先頭にプロジェクトの名前を付けて、ほかのプロジェクトのキーと重ならないようにする。
 */
export const LOCAL_STORAGE_KEYS = {
  /** ヘッダーのスイッチで選んだ配色（"light" か "dark"）。index.html の script も、同じキーを読む */
  THEME: "design-system-prac-theme",
} as const;
