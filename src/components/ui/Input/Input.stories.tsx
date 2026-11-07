import type { Meta, StoryObj } from "@storybook/react-vite";
import { EyeIcon, SearchIcon, SendIcon } from "lucide-react";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";

import { Button } from "~/components/ui/Button/Button";
import { Field, FieldError, FieldLabel } from "~/components/ui/Field/Field";

import { Input, Textarea } from "./Input";

/**
 * 枠の見た目は、中の入力欄を :has() で見て変わる（docs/23）。
 * play 関数で、枠の計算後のスタイルを本物のブラウザ（vp test の Chromium）で確かめる。
 */
const meta = {
  title: "UI/Input",
  component: Input,
  args: {
    "aria-label": "検索",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "24rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 枠の要素。入力欄の親 */
const getFrame = (input: HTMLElement) => {
  const frame = input.parentElement;
  if (!frame) {
    throw new Error("入力欄の親が見つかりません");
  }
  return frame;
};

/** 何も打っていないとき */
export const Default: Story = {};

/** 例を薄い文字で出す。打つと消えるので、ラベルの代わりにしない */
export const Placeholder: Story = {
  args: {
    placeholder: "例: デザイントークン",
  },
};

/** アイコンは押せない。押すと、下の入力欄にフォーカスする */
export const WithIcon: Story = {
  args: {
    icon: <SearchIcon />,
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "検索" });
    const icon = getFrame(input).querySelector("svg");
    if (!icon) {
      throw new Error("アイコンが見つかりません");
    }

    // userEvent は pointer-events を無視して要素を直接押すので、その場所を本当に押すと何に当たるかを確かめる
    const { x, y, width, height } = icon.getBoundingClientRect();
    await expect(document.elementFromPoint(x + width / 2, y + height / 2)).toBe(input);
  },
};

/**
 * 入力欄にフォーカスすると枠に輪が出る。右端のボタンにフォーカスすると、枠の輪は消え、ボタンの輪だけになる
 */
export const WithAction: Story = {
  args: {
    "aria-label": "パスワード",
    type: "password",
    action: (
      <Button aria-label="パスワードを表示する">
        <EyeIcon />
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("パスワード");
    const button = canvas.getByRole("button", { name: "パスワードを表示する" });
    const frame = getFrame(input);

    await userEvent.tab();
    await expect(input).toHaveFocus();
    await expect(getComputedStyle(frame).outlineStyle).toBe("solid");

    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(getComputedStyle(frame).outlineStyle).toBe("none");

    // ボタンを置いても、枠の高さは押せる部品の最小（44px）のまま
    await expect(frame.getBoundingClientRect().height).toBe(44);
  },
};

/** 無効のときは、枠も控えめな色になる。打てない */
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "変更できない値",
  },
};

/**
 * 検証で失敗すると、枠が赤くなる（枠は Base UI の管理の外にあるので、:has() で中の data-invalid を見る）。
 * 色だけに頼らないように、文でも伝える
 */
export const Invalid: Story = {
  render: () => (
    <Field invalid>
      <FieldLabel>メールアドレス</FieldLabel>
      <Input type="email" defaultValue="taro" />
      <FieldError match>メールアドレスの形で入力してください（例: name@example.com）。</FieldError>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "メールアドレス" });
    const frame = getFrame(input);
    const border = document.createElement("div");
    border.style.color = "var(--color-error)";
    canvasElement.append(border);
    const errorColor = getComputedStyle(border).color;
    border.remove();

    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(getComputedStyle(frame).borderTopColor).toBe(errorColor);
  },
};

/**
 * IME の変換を確定する Enter では検証しない。確定のたびにエラーが出ると、打っている途中で責められることになる。
 * 本物の IME は動かせないので、変換中の keydown（isComposing が true）を送って確かめる
 */
export const ImeEnter: Story = {
  render: () => (
    <Field>
      <FieldLabel>メールアドレス</FieldLabel>
      <Input type="email" defaultValue="やまだ" />
      <FieldError match="typeMismatch">メールアドレスの形で入力してください。</FieldError>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "メールアドレス" });

    await fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    await expect(input).not.toHaveAttribute("aria-invalid");

    // 変換中でない Enter では検証する
    await fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(input).toHaveAttribute("aria-invalid", "true"));
    await expect(canvas.getByText("メールアドレスの形で入力してください。")).toBeVisible();
  },
};

/** 複数行の入力欄。打った分だけ高くなり、10 行を超えるとスクロールする */
export const MultiLine: Story = {
  render: () => <Textarea aria-label="メッセージ" />,
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole("textbox", { name: "メッセージ" });
    const heightOf = () => textarea.getBoundingClientRect().height;
    const empty = heightOf();

    // 3 行までは、何も打っていないときと同じ高さ
    await userEvent.type(textarea, "1{enter}2{enter}3");
    await expect(heightOf()).toBe(empty);

    await userEvent.type(textarea, "{enter}4{enter}5");
    const fiveLines = heightOf();
    await expect(fiveLines).toBeGreaterThan(empty);

    await userEvent.type(textarea, "{enter}".repeat(10));
    const maxHeight = heightOf();
    await expect(maxHeight).toBeGreaterThan(fiveLines);
    await expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);

    await userEvent.type(textarea, "{enter}{enter}");
    await expect(heightOf()).toBe(maxHeight);
  },
};

/** 複数行の入力欄の右下にボタンを置く。行が増えても、ボタンは右下に残る */
export const MultiLineWithAction: Story = {
  render: () => (
    <Textarea
      aria-label="メッセージ"
      defaultValue={"1 行目\n2 行目\n3 行目\n4 行目\n5 行目"}
      action={
        <Button variant="primary" aria-label="送信する">
          <SendIcon />
        </Button>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "メッセージ" });
    const frameBottom = getFrame(textarea).getBoundingClientRect().bottom;
    const buttonBottom = canvas
      .getByRole("button", { name: "送信する" })
      .getBoundingClientRect().bottom;

    // ボタンは枠の線の上まで広がるので、下端が枠と重なる
    await expect(buttonBottom).toBeCloseTo(frameBottom, 0);
  },
};
