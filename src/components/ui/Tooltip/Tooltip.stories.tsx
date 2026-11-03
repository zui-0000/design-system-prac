import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyIcon, EllipsisIcon, Trash2Icon } from "lucide-react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import { Button } from "~/components/ui/Button/Button";
import { Menu, MenuItem, MenuSeparator } from "~/components/ui/Menu/Menu";

import { Tooltip } from "./Tooltip";

/**
 * play 関数で、操作したあとの動きを本物のブラウザ（vp test の Chromium）で確かめる（docs/22）。
 * Tooltip は <body> の直下に出る（ポータル）ので、screen で探す。
 * Tooltip には role が付かない（読み上げには出さない）ので、文字で探す。
 * 出始めは透明（opacity: 0）から浮かび上がるので、見えるまで waitFor で待つ。
 */
const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  args: {
    label: "操作",
    children: (
      <Button aria-label="「4 枚目」の操作">
        <EllipsisIcon />
      </Button>
    ),
  },
  // 上に出るので、ストーリーの上に Tooltip の分の場所をあける
  decorators: [
    (Story) => (
      <div style={{ paddingTop: "3rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 何もしていないとき。ボタンだけが見える */
export const Default: Story = {};

/**
 * マウスを乗せると、少し待ってから出る。離すと消える。
 * 出ている間の見た目も、アクセシビリティの検査にかける
 */
export const Hover: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "「4 枚目」の操作" });

    await userEvent.hover(trigger);
    await waitFor(() => expect(screen.getByText("操作")).toBeVisible());

    await userEvent.unhover(trigger);
    await waitFor(() => expect(screen.queryByText("操作")).not.toBeInTheDocument());
  },
};

/**
 * キーボードでフォーカスしても出る（マウスを使わない人も、見えていれば読める）。Esc キーで消える。
 * 消してもフォーカスはボタンに残るので、続けて押せる
 */
export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "「4 枚目」の操作" });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await waitFor(() => expect(screen.getByText("操作")).toBeVisible());

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText("操作")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

/**
 * Menu の trigger に重ねる（カードの「⋯」と同じ形）。マウスを乗せると Tooltip が出て、
 * 押すとメニューが開き、Tooltip は消える（メニューの項目を隠さないため）
 */
export const WithMenu: Story = {
  render: (args) => (
    <Menu trigger={<Tooltip {...args} />}>
      <MenuItem onClick={() => {}}>
        <CopyIcon />
        複製する
      </MenuItem>
      <MenuSeparator />
      <MenuItem variant="danger" onClick={() => {}}>
        <Trash2Icon />
        削除…
      </MenuItem>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "「4 枚目」の操作" });

    await userEvent.hover(trigger);
    await waitFor(() => expect(screen.getByText("操作")).toBeVisible());

    await userEvent.click(trigger);
    const menu = await screen.findByRole("menu");
    await waitFor(() => expect(menu).toBeVisible());
    await waitFor(() => expect(screen.queryByText("操作")).not.toBeInTheDocument());
    // Menu が付ける属性は、Tooltip を通ってボタンまで届く
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};
