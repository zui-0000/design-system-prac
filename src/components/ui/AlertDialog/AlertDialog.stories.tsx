import type { Meta, StoryObj } from "@storybook/react-vite";
import { EllipsisIcon } from "lucide-react";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { Button } from "~/components/ui/Button/Button";
import { Menu, MenuItem } from "~/components/ui/Menu/Menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogActions,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogTitle,
} from "./AlertDialog";

/**
 * 「削除する」を押したかを数える関数。ストーリーを開き直しても数え直せるよう、play の始めに mockClear する
 */
const onDelete = fn();

/**
 * play 関数で、操作したあとの動きを本物のブラウザ（vp test の Chromium）で確かめる（docs/19）。
 * ダイアログは <body> の直下に出る（ポータル）ので、ストーリーの枠（canvas）の外を screen で探す。
 */
const meta = {
  title: "UI/AlertDialog",
  component: AlertDialog,
  args: {
    trigger: <Button>削除</Button>,
    // 中身は render で組み立てるので、args では渡さない（型のために null を入れる）
    children: null,
    onOpenChange: fn(),
  },
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTitle>「4 枚目」を削除しますか？</AlertDialogTitle>
      <AlertDialogDescription>
        削除すると、元に戻せません。キャンセルすると、何も変わりません。
      </AlertDialogDescription>
      <AlertDialogActions>
        <AlertDialogCancel>キャンセル</AlertDialogCancel>
        <AlertDialogAction onClick={fn()}>削除する</AlertDialogAction>
      </AlertDialogActions>
    </AlertDialog>
  ),
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 閉じているとき。押すボタンだけが見える */
export const Default: Story = {};

/** 開いたとき。開いている間の見た目も、アクセシビリティの検査にかける */
export const Open: Story = {
  args: {
    defaultOpen: true,
  },
};

/** 開くと、キャンセルにフォーカスが移る。Esc キーで閉じると、開いたボタンにフォーカスが戻る */
export const FocusMovesInAndBack: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "削除" });
    await userEvent.click(trigger);

    const dialog = await screen.findByRole("alertdialog", { name: "「4 枚目」を削除しますか？" });
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "キャンセル" })).toHaveFocus(),
    );

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

/** Tab キーで進んでも、フォーカスはダイアログの中から出ない */
export const FocusStaysInside: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "削除" }));
    const dialog = await screen.findByRole("alertdialog");
    const cancel = within(dialog).getByRole("button", { name: "キャンセル" });
    // 開いた直後は、フォーカスが移りきっていないことがあるので待つ
    await waitFor(() => expect(cancel).toHaveFocus());

    await userEvent.tab();
    await expect(within(dialog).getByRole("button", { name: "削除する" })).toHaveFocus();
    // 最後のボタンから進むと、Base UI の見えない番人（focus guard）にいったん止まり、
    // 番人がフォーカスを最初のボタンに戻す。戻るのを待つ
    await userEvent.tab();
    await waitFor(() => expect(cancel).toHaveFocus());
  },
};

/** 外側（後ろの幕）を押しても閉じない。うっかり閉じないように */
export const OutsideClickDoesNotClose: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "削除" }));
    const dialog = await screen.findByRole("alertdialog");

    await userEvent.click(document.body, { skipHover: true });

    await expect(dialog).toBeInTheDocument();
  },
};

/** 「削除する」を押すと、処理を呼んでから閉じる */
export const ConfirmRunsAction: Story = {
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTitle>「4 枚目」を削除しますか？</AlertDialogTitle>
      <AlertDialogDescription>
        削除すると、元に戻せません。キャンセルすると、何も変わりません。
      </AlertDialogDescription>
      <AlertDialogActions>
        <AlertDialogCancel>キャンセル</AlertDialogCancel>
        <AlertDialogAction onClick={onDelete}>削除する</AlertDialogAction>
      </AlertDialogActions>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    onDelete.mockClear();
    await userEvent.click(within(canvasElement).getByRole("button", { name: "削除" }));
    const dialog = await screen.findByRole("alertdialog");

    await userEvent.click(within(dialog).getByRole("button", { name: "削除する" }));

    await expect(onDelete).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  },
};

/** キャンセルを押すと、何も呼ばずに閉じる */
export const CancelDoesNothing: Story = {
  render: ConfirmRunsAction.render,
  play: async ({ canvasElement }) => {
    onDelete.mockClear();
    await userEvent.click(within(canvasElement).getByRole("button", { name: "削除" }));
    const dialog = await screen.findByRole("alertdialog");

    await userEvent.click(within(dialog).getByRole("button", { name: "キャンセル" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(onDelete).not.toHaveBeenCalled();
  },
};

/** メニューの項目から開く形。trigger を渡さず、open と onOpenChange で開け閉めする（docs/21） */
const OpenFromMenuExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Menu
        trigger={
          <Button aria-label="「4 枚目」の操作">
            <EllipsisIcon />
          </Button>
        }
      >
        <MenuItem variant="danger" onClick={() => setOpen(true)}>
          削除…
        </MenuItem>
      </Menu>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTitle>「4 枚目」を削除しますか？</AlertDialogTitle>
        <AlertDialogDescription>
          削除すると、元に戻せません。キャンセルすると、何も変わりません。
        </AlertDialogDescription>
        <AlertDialogActions>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>削除する</AlertDialogAction>
        </AlertDialogActions>
      </AlertDialog>
    </>
  );
};

/** メニューの「削除…」から開き、閉じると、メニューを開いたボタンにフォーカスが戻る */
export const OpenFromMenu: Story = {
  render: () => <OpenFromMenuExample />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "「4 枚目」の操作" });
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("menuitem", { name: "削除…" }));

    const dialog = await screen.findByRole("alertdialog", { name: "「4 枚目」を削除しますか？" });
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "キャンセル" })).toHaveFocus(),
    );

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
