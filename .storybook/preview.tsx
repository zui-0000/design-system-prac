import type { Preview } from "@storybook/react-vite";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";

import { THEMES } from "~/constants/theme";

import "~/styles/main.css";

/**
 * 選んだ配色を、アプリと同じく <html data-theme> で付ける（docs/15）。
 * 「OS に合わせる」のときは外して、color.css の color-scheme: light dark に任せる
 */
const applyTheme = (theme: unknown) => {
  const root = document.documentElement;
  if (theme === THEMES.LIGHT || theme === THEMES.DARK) {
    root.dataset.theme = theme;
  } else {
    delete root.dataset.theme;
  }
};

// トークンのページ（ストーリーのない MDX）では、下の decorator が動かない。
// そこでもツールバーの配色が効くように、Storybook の通知（イベント）でも付ける。
// SET_GLOBALS は開いたとき、GLOBALS_UPDATED はツールバーで選び直したときに届く。
// storybook/internal は、アドオンを作る人向けの API で、Storybook を上げたときに変わることがある（docs/15）
const channel = addons.getChannel();
channel.on(SET_GLOBALS, ({ globals }) => applyTheme(globals.theme));
channel.on(GLOBALS_UPDATED, ({ globals }) => applyTheme(globals.theme));

const preview: Preview = {
  // 上のツールバーに「配色」を出す。選んだ値は globals.theme に入る。
  // ストーリーごとに globals: { theme: "dark" } と書くと、そのストーリーだけ暗い配色になる
  globalTypes: {
    theme: {
      description: "配色",
      toolbar: {
        title: "配色",
        icon: "mirror",
        items: [
          // "os" は、このツールバーだけの値（<html data-theme> を外す）
          { value: "os", title: "OS に合わせる", icon: "browser" },
          { value: THEMES.LIGHT, title: "ライト", icon: "sun" },
          { value: THEMES.DARK, title: "ダーク", icon: "moon" },
        ],
        // 選んだ値の title を、ツールバーの表示にする
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "os",
  },

  decorators: [
    // ストーリーを描くたびに、配色を付ける。ストーリーごとの globals（Switch の CheckedInDark など）も、ここで効く。
    // vp test は Storybook の画面を開かずにストーリーを動かすので、上の通知が届かない。こちらは vp test でも効く
    (Story, { globals }) => {
      applyTheme(globals.theme);
      return <Story />;
    },
  ],

  parameters: {
    options: {
      // サイドバーの並び順。何も決めないと、Storybook がファイルを読み込んだ順になる。
      // トークンのページは main.css で読み込む順に並べ、部品から使わない材料（Primitive）を最後にする
      storySort: {
        order: [
          "Design Tokens",
          [
            "Color",
            "Font",
            "Line Height",
            "Border Radius",
            "Elevation",
            "Spacing",
            "Size",
            "Z Index",
            "Primitive",
          ],
          "UI",
        ],
      },
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // アクセシビリティの違反（文字と背景のコントラスト不足など）があれば、vp test を失敗させる。
      // 'todo' は画面に出すだけ、'off' は検査しない
      test: "error",
    },
  },
};

export default preview;
