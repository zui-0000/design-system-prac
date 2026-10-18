import { useSyncExternalStore } from "react";

import { getTheme, setTheme, subscribeTheme } from "../utils/theme";

/**
 * 今の配色と、配色を選ぶ関数を返す。useState と同じ形で使う（const [theme, setTheme] = useTheme()）。
 * 配色は React の外（<html> の属性と OS の配色）にあるので、useSyncExternalStore で React の state のように読む。
 * 値は <html data-theme> にあるので、この hook を使う部品がいくつあっても、同じ配色を指す（docs/15）
 */
export const useTheme = () => {
  const theme = useSyncExternalStore(subscribeTheme, getTheme);
  return [theme, setTheme] as const;
};
