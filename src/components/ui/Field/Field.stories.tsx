import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Input } from "~/components/ui/Input/Input";

import { Field, FieldDescription, FieldError, FieldLabel } from "./Field";

/**
 * Field は、ラベル・説明・エラーを入力欄に結び付ける（docs/23）。
 * 読み上げソフトに伝わるかは、役割と名前（getByRole）と、toHaveAccessibleDescription で確かめる。
 */
const meta = {
  title: "UI/Field",
  component: Field,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "24rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ラベルを押すと、入力欄にフォーカスする */
export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel>お名前</FieldLabel>
      <Input />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText("お名前"));
    await expect(canvas.getByRole("textbox", { name: "お名前" })).toHaveFocus();
  },
};

/** required の入力欄には「必須」が出る。読み上げソフトには、名前ではなく required の属性で伝わる */
export const Required: Story = {
  render: () => (
    <Field>
      <FieldLabel>お名前</FieldLabel>
      <Input required />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("必須")).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: "お名前" })).toBeRequired();
  },
};

/** required でなければ「必須」は出ない。Default と見比べる */
export const NotRequired: Story = {
  render: () => (
    <Field>
      <FieldLabel>お名前</FieldLabel>
      <Input />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("必須")).not.toBeVisible();
  },
};

/** 説明は、入力欄を読み上げるときに一緒に読まれる */
export const WithDescription: Story = {
  render: () => (
    <Field>
      <FieldLabel>電話番号</FieldLabel>
      <FieldDescription>ハイフンなしで入力してください（例: 09012345678）。</FieldDescription>
      <Input type="tel" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("textbox", { name: "電話番号" }),
    ).toHaveAccessibleDescription("ハイフンなしで入力してください（例: 09012345678）。");
  },
};

/** Field を無効にすると、中の入力欄も無効になる */
export const Disabled: Story = {
  render: () => (
    <Field disabled>
      <FieldLabel>お名前</FieldLabel>
      <Input defaultValue="山田 太郎" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("textbox", { name: "お名前" })).toBeDisabled();
  },
};

/**
 * validate で独自の検証を足す。入力欄を離れたときに検証し（validationMode="onBlur"）、失敗すると文が出る。
 * エラーの文は、入力欄を読み上げるときに一緒に読まれる
 */
export const CustomValidate: Story = {
  render: () => (
    <Field
      validationMode="onBlur"
      validate={(value) =>
        value === "admin" ? "この名前は使えません。別の名前にしてください。" : null
      }
    >
      <FieldLabel>ユーザー名</FieldLabel>
      <Input />
      <FieldError match="customError" />
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "ユーザー名" });

    await userEvent.type(input, "admin");
    await userEvent.tab();

    await waitFor(() => expect(input).toHaveAttribute("aria-invalid", "true"));
    await expect(input).toHaveAccessibleDescription(
      "この名前は使えません。別の名前にしてください。",
    );
  },
};
