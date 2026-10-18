import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoonIcon, SunIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";

import { THEMES } from "~/constants/theme";

import { Switch } from "./Switch";

const meta = {
  title: "UI/Switch",
  component: Switch,
  args: {
    "aria-label": "通知",
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** オフのとき。文字を添えないので、aria-label で名前を付ける */
export const Default: Story = {};

/** オンのとき。つまみが右に動き、溝がメインの色になる */
export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

/** 無効のとき */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/**
 * 押すと、つまみの中のアイコンも入れ替わる Switch（WithThumbIcon で使う）。
 * useState を使うので、render の中に書かずに部品として分ける（hook は部品か hook の中でしか呼べない）
 */
const SwitchWithStateIcon = (props: ComponentProps<typeof Switch>) => {
  const [checked, setChecked] = useState(false);
  return (
    <Switch
      {...props}
      checked={checked}
      onCheckedChange={setChecked}
      thumbIcon={checked ? <MoonIcon /> : <SunIcon />}
    />
  );
};

/**
 * つまみの中にアイコンを置いたとき。今の状態を表すアイコンを渡す（ヘッダーのダークモードの切り替えと同じ形）。
 * 押すと、アイコンも入れ替わる
 */
export const WithThumbIcon: Story = {
  args: {
    "aria-label": "ダークモード",
  },
  render: (args) => <SwitchWithStateIcon {...args} />,
};

/**
 * 暗い配色でオンのとき。globals で、上のツールバーの「配色」をこのストーリーだけダークにする。
 * vp test の a11y のチェックも、暗い配色で行われる
 */
export const CheckedInDark: Story = {
  args: {
    defaultChecked: true,
  },
  globals: {
    theme: THEMES.DARK,
  },
};
