import { MoonIcon, SunIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Switch } from "~/components/ui/Switch/Switch";
import { type Theme, THEMES } from "~/constants/theme";

import { useTheme } from "./hooks/useTheme";

import styles from "./index.module.css";

/** 配色ごとの、つまみの中のアイコン。Record<Theme, …> なので、配色を足したらアイコンも足さないと型エラーになる */
const THEME_ICONS = {
  [THEMES.LIGHT]: <SunIcon className={styles.sun} />,
  [THEMES.DARK]: <MoonIcon />,
} satisfies Record<Theme, ReactNode>;

/**
 * ライトとダークを切り替えるスイッチ。つまみには今の配色のアイコン（太陽か月）を出す。
 * 配色の読み書きは useTheme、色を変えるのは color.css の :root[data-theme] で、この部品は見た目だけを受け持つ（docs/15）
 */
export const ThemeToggle = () => {
  const [theme, setTheme] = useTheme();

  // スイッチの名前は「ダークモード」なので、オンがダーク、オフがライト
  return (
    <Switch
      aria-label="ダークモード"
      checked={theme === THEMES.DARK}
      onCheckedChange={(checked) => setTheme(checked ? THEMES.DARK : THEMES.LIGHT)}
      thumbIcon={THEME_ICONS[theme]}
    />
  );
};
