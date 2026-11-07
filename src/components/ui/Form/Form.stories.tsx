import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Button } from "~/components/ui/Button/Button";
import { Field, FieldDescription, FieldError, FieldLabel } from "~/components/ui/Field/Field";
import { Input, Textarea } from "~/components/ui/Input/Input";

import { Form, FormActions } from "./Form";

/**
 * 送信したときの動きを play 関数で確かめる（docs/23）。
 * 打つ前には責めず、送信して初めてエラーを出す。直し終えると、その場でエラーが消える。
 */
const meta = {
  title: "UI/Form",
  component: Form,
  args: {
    "aria-label": "お問い合わせ",
    onFormSubmit: fn(),
    children: (
      <>
        <Field name="name">
          <FieldLabel>お名前</FieldLabel>
          <Input required autoComplete="name" />
          <FieldError match="valueMissing">お名前を入力してください。</FieldError>
        </Field>
        <Field name="email">
          <FieldLabel>メールアドレス</FieldLabel>
          <FieldDescription>返信の宛先に使います。</FieldDescription>
          <Input type="email" required autoComplete="email" />
          <FieldError match="valueMissing">メールアドレスを入力してください。</FieldError>
          <FieldError match="typeMismatch">
            メールアドレスの形で入力してください（例: name@example.com）。
          </FieldError>
        </Field>
        <Field name="message">
          <FieldLabel>内容</FieldLabel>
          <Textarea />
        </Field>
        <FormActions>
          <Button type="submit" variant="primary">
            送信する
          </Button>
        </FormActions>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "24rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 打つ前は、required の欄にもエラーを出さない */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText("お名前を入力してください。")).not.toBeInTheDocument();
    await expect(canvas.getByRole("textbox", { name: "お名前" })).not.toHaveAttribute(
      "aria-invalid",
    );
  },
};

/** 空のまま送信すると、エラーが出て、最初の失敗した欄にフォーカスが移る。onFormSubmit は呼ばれない */
export const SubmitEmpty: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole("textbox", { name: "お名前" });
    const email = canvas.getByRole("textbox", { name: "メールアドレス" });

    await userEvent.click(canvas.getByRole("button", { name: "送信する" }));

    await waitFor(() => expect(name).toHaveFocus());
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAccessibleDescription("お名前を入力してください。");
    await expect(email).toHaveAttribute("aria-invalid", "true");
    // 説明とエラーの両方が読まれる
    await expect(email).toHaveAccessibleDescription(
      "返信の宛先に使います。 メールアドレスを入力してください。",
    );
    await expect(args.onFormSubmit).not.toHaveBeenCalled();
  },
};

/**
 * 形が違うまま送信するとエラーが出る。1 回送信したあとは、打つたびに検証する（Base UI の onSubmit の動き）。
 * 間違っている間はエラーが残り、正しくなった瞬間に消えるので、もう一度送信しなくても直ったと分かる
 */
export const FixError: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByRole("textbox", { name: "メールアドレス" });
    const submit = canvas.getByRole("button", { name: "送信する" });
    const message = "メールアドレスの形で入力してください（例: name@example.com）。";

    await userEvent.type(canvas.getByRole("textbox", { name: "お名前" }), "山田 太郎");
    await userEvent.type(email, "taro");
    await userEvent.click(submit);
    await waitFor(() => expect(email).toHaveFocus());
    await expect(canvas.getByText(message)).toBeVisible();

    // 失敗した欄は Base UI が全部を選ぶので、そのまま打つと置き換わる。途中はまだ形が違うので、エラーが残る
    await userEvent.keyboard("taro@");
    await expect(email).toHaveValue("taro@");
    await expect(canvas.getByText(message)).toBeVisible();

    await userEvent.keyboard("example.com");
    await waitFor(() => expect(canvas.queryByText(message)).not.toBeInTheDocument());

    await userEvent.click(submit);
    await waitFor(() =>
      expect(args.onFormSubmit).toHaveBeenCalledWith(
        { name: "山田 太郎", email: "taro@example.com", message: "" },
        expect.anything(),
      ),
    );
  },
};

/** 正しく入力して送信すると、onFormSubmit に name ごとの値が渡る。Enter キーでも送信できる */
export const SubmitWithEnter: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole("textbox", { name: "お名前" }), "山田 太郎");
    await userEvent.type(
      canvas.getByRole("textbox", { name: "メールアドレス" }),
      "taro@example.com{enter}",
    );

    await waitFor(() => expect(args.onFormSubmit).toHaveBeenCalledOnce());
  },
};

/** サーバーが返したエラーは、Form の errors に渡す。FieldError は match を省くと、その文を出す。打ち直すと消える */
export const ServerError: Story = {
  render: () => {
    const ServerErrorForm = () => {
      const [errors, setErrors] = useState<Record<string, string>>({});
      return (
        <Form
          aria-label="クーポン"
          errors={errors}
          onFormSubmit={() => {
            setErrors({ code: "このクーポンは期限が切れています。別のコードを入力してください。" });
          }}
        >
          <Field name="code">
            <FieldLabel>クーポンコード</FieldLabel>
            <Input />
            <FieldError />
          </Field>
          <FormActions>
            <Button type="submit">適用する</Button>
          </FormActions>
        </Form>
      );
    };
    return <ServerErrorForm />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const code = canvas.getByRole("textbox", { name: "クーポンコード" });
    const message = "このクーポンは期限が切れています。別のコードを入力してください。";

    await userEvent.type(code, "OLD");
    await userEvent.click(canvas.getByRole("button", { name: "適用する" }));
    await waitFor(() => expect(canvas.getByText(message)).toBeVisible());
    await expect(code).toHaveFocus();

    await userEvent.type(code, "2");
    await waitFor(() => expect(canvas.queryByText(message)).not.toBeInTheDocument());
  },
};
