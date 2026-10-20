import type { Meta, StoryObj } from "@storybook/react-vite";
import { SaveIcon } from "lucide-react";

import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "保存する",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 何も指定しないときの種類。控えめなボタン */
export const Secondary: Story = {};

/** 主な操作のボタン。1 つの領域に 1 つだけ */
export const Primary: Story = {
  args: {
    variant: "primary",
  },
};

/** 取り消せない操作のボタン。確認ダイアログの中でだけ使う */
export const Danger: Story = {
  args: {
    variant: "danger",
    children: "削除する",
  },
};

/** 無効のボタン。種類に関係なく、控えめな色になる */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/** アイコンと文字を並べたボタン。アイコンは飾りなので読み上げない（Lucide が aria-hidden を付ける） */
export const WithIcon: Story = {
  args: {
    variant: "primary",
    children: (
      <>
        <SaveIcon />
        保存する
      </>
    ),
  },
};

/** 主な操作と、それ以外の操作を並べたところ */
export const WithPrimaryAndSecondary: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--spacing-8)" }}>
      <Button>キャンセル</Button>
      <Button variant="primary">保存する</Button>
    </div>
  ),
};
