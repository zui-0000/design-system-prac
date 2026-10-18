/**
 * 配色。<html data-theme> と localStorage に入れる値で、文字列を直接書かずにここから参照する。
 * color.css の :root[data-theme="…"] と index.html の script は TS を import できないので、同じ文字列を書いている
 */
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
} as const;

/** 配色の値（"light" か "dark"）。THEMES から作るので、配色を足すと型も増える */
export type Theme = (typeof THEMES)[keyof typeof THEMES];
