import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyIcon, EllipsisIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { Button } from "~/components/ui/Button/Button";

import { Menu, MenuItem, MenuSeparator } from "./Menu";

/** 項目を押したかを数える関数。ストーリーを開き直しても数え直せるよう、play の始めに mockClear する */
const onDuplicate = fn();
const onDelete = fn();
const onRename = fn();

/**
 * play 関数で、操作したあとの動きを本物のブラウザ（vp test の Chromium）で確かめる（docs/21）。
 * メニューは <body> の直下に出る（ポータル）ので、screen で探す。
 */
const meta = {
  title: "UI/Menu",
  component: Menu,
  args: {
    trigger: (
      <Button aria-label="「4 枚目」の操作">
        <EllipsisIcon />
      </Button>
    ),
    // 中身は render で組み立てるので、args では渡さない（型のために null を入れる）
    children: null,
  },
  render: (args) => (
    <Menu {...args}>
      <MenuItem onClick={onDuplicate}>
        <CopyIcon />
        複製する
      </MenuItem>
      <MenuItem onClick={onRename} disabled>
        <PencilIcon />
        名前を変える
      </MenuItem>
      <MenuSeparator />
      <MenuItem variant="danger" onClick={onDelete}>
        <Trash2Icon />
        削除…
      </MenuItem>
    </Menu>
  ),
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 閉じているとき。押すボタンだけが見える */
export const Default: Story = {};

/** 開いたとき。開いている間の見た目も、アクセシビリティの検査にかける */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "「4 枚目」の操作" }));

    const menu = await screen.findByRole("menu");
    await expect(within(menu).getAllByRole("menuitem")).toHaveLength(3);
  },
};

/**
 * キーボードだけで開き、矢印キーで選んで、Enter で実行する。
 * 無効の項目も飛ばさずに止まる（何の操作があるかを、読み上げソフトの人にも伝えるため。aria-disabled が付く）
 */
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    onDelete.mockClear();
    onRename.mockClear();
    const trigger = within(canvasElement).getByRole("button", { name: "「4 枚目」の操作" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");

    const menu = await screen.findByRole("menu");
    const duplicate = within(menu).getByRole("menuitem", { name: "複製する" });
    const rename = within(menu).getByRole("menuitem", { name: "名前を変える" });
    const remove = within(menu).getByRole("menuitem", { name: "削除…" });
    // 開いた直後は、最初の項目を選んでいる
    await waitFor(() => expect(duplicate).toHaveFocus());

    // 無効の「名前を変える」にも止まる。Enter を押しても何も起きない
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(rename).toHaveFocus());
    await expect(rename).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{Enter}");
    await expect(onRename).not.toHaveBeenCalled();

    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(remove).toHaveFocus());
    await userEvent.keyboard("{Enter}");

    await expect(onDelete).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** Esc キーで閉じると、何も実行せず、開いたボタンにフォーカスが戻る */
export const EscapeCloses: Story = {
  play: async ({ canvasElement }) => {
    onDuplicate.mockClear();
    onDelete.mockClear();
    const trigger = within(canvasElement).getByRole("button", { name: "「4 枚目」の操作" });
    await userEvent.click(trigger);
    await screen.findByRole("menu");

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(onDuplicate).not.toHaveBeenCalled();
    await expect(onDelete).not.toHaveBeenCalled();
  },
};

/** 項目を押すと、処理を呼んでから閉じる */
export const ClickRunsAction: Story = {
  play: async ({ canvasElement }) => {
    onDuplicate.mockClear();
    await userEvent.click(within(canvasElement).getByRole("button", { name: "「4 枚目」の操作" }));
    const menu = await screen.findByRole("menu");

    await userEvent.click(within(menu).getByRole("menuitem", { name: "複製する" }));

    await expect(onDuplicate).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  },
};

/** 無効の項目は、押しても何も起きず、メニューも閉じない */
export const DisabledItemDoesNothing: Story = {
  play: async ({ canvasElement }) => {
    onRename.mockClear();
    await userEvent.click(within(canvasElement).getByRole("button", { name: "「4 枚目」の操作" }));
    const menu = await screen.findByRole("menu");

    await userEvent.click(within(menu).getByRole("menuitem", { name: "名前を変える" }));

    await expect(onRename).not.toHaveBeenCalled();
    await expect(menu).toBeInTheDocument();
  },
};
