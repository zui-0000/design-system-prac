import type { Preview } from "@storybook/react-vite";

import "~/styles/global.css";

const preview: Preview = {
  parameters: {
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
