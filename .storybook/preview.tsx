import type { Preview } from "@storybook/react-vite";

import "~/styles/global.css";

const preview: Preview = {
  parameters: {
    options: {
      // サイドバーの並び順。何も決めないと、Storybook がファイルを読み込んだ順になる。
      // トークンのページは global.css で読み込む順に並べ、部品から使わない材料（Primitive）を最後にする
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
