/**
 * OS の配色の偽物。テストからだけ使う（docs/16）。
 * jsdom には window.matchMedia が無いので、偽物に差し替えて、OS の配色をテストの中から決める。
 * 差し替えは、テストが終わるたびに元に戻る（vite.config.ts の unstubGlobals）
 */
import { type Theme, THEMES } from "~/constants/theme";

/** utils/theme.ts が OS の配色を聞く条件と同じ */
const OS_DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * window.matchMedia を偽物に差し替え、OS の配色を initialTheme にする。
 * 返す関数で、OS の配色を変えたり、見張っている相手の数を数えたりする
 */
export const mockOsTheme = (initialTheme: Theme) => {
  let osTheme = initialTheme;
  const listeners = new Set<() => void>();

  vi.stubGlobal("matchMedia", (query: string) => ({
    // 本物の matches と同じく、OS の配色が変わったら、読んだときの値も変わる
    get matches() {
      return query === OS_DARK_QUERY && osTheme === THEMES.DARK;
    },
    addEventListener: (_type: "change", listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: "change", listener: () => void) => {
      listeners.delete(listener);
    },
  }));

  return {
    /** OS の配色を変えて、見張っている相手に知らせる（OS の設定を切り替えたときと同じ） */
    changeOsTheme: (theme: Theme) => {
      osTheme = theme;
      listeners.forEach((listener) => listener());
    },
    /** OS の配色を見張っている相手の数。登録が外れたかを確かめる */
    countOsThemeListeners: () => listeners.size,
  };
};
