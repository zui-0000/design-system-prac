import { HeadingIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { useCards } from "~/components/features/Card/hooks/useCards";
import { Button } from "~/components/ui/Button/Button";
import { Field, FieldDescription, FieldError, FieldLabel } from "~/components/ui/Field/Field";
import { Form, FormActions } from "~/components/ui/Form/Form";
import { Input, Textarea } from "~/components/ui/Input/Input";

import styles from "./index.module.css";

const TITLE_MAX_LENGTH = 30;

/** カードを一覧の最後に足すフォーム（docs/23） */
export const AddCardForm = () => {
  const { addCard } = useCards();
  const [lastAddedTitle, setLastAddedTitle] = useState<string>();
  // 足すたびに変え、Form を作り直して空にする。Base UI の検証の状態（送信の回数など）も最初に戻る
  const [formKey, setFormKey] = useState(0);
  const titleRef = useRef<HTMLInputElement>(null);
  const headingId = useId();

  // 作り直すと、押した「足す」ボタンも消えて、フォーカスが <body> に落ちる。続けて足せるよう、見出しの欄へ移す
  useEffect(() => {
    if (formKey > 0) {
      titleRef.current?.focus();
    }
  }, [formKey]);

  return (
    <section className={styles.section}>
      <h2 id={headingId}>カードを足す</h2>
      <Form
        key={formKey}
        aria-labelledby={headingId}
        onFormSubmit={({ title, body }: { title: string; body: string }) => {
          const added = addCard({ title: title.trim(), body: body.trim() });
          setLastAddedTitle(added.title);
          setFormKey((key) => key + 1);
        }}
      >
        <Field
          name="title"
          // 空のときは required の文だけを出す。1 回送信したあとは、空でも validate が呼ばれるため
          validate={(value) =>
            typeof value === "string" && value !== "" && value.trim() === ""
              ? "空白だけの見出しにはできません。文字を入力してください。"
              : null
          }
        >
          <FieldLabel>見出し</FieldLabel>
          <FieldDescription>
            {TITLE_MAX_LENGTH} 文字まで。一覧のカードの見出しになります。
          </FieldDescription>
          <Input
            ref={titleRef}
            icon={<HeadingIcon />}
            required
            maxLength={TITLE_MAX_LENGTH}
            autoComplete="off"
          />
          <FieldError match="valueMissing">見出しを入力してください。</FieldError>
          <FieldError match="customError" />
        </Field>
        <Field name="body">
          <FieldLabel>本文</FieldLabel>
          <Textarea />
        </Field>
        <FormActions>
          <Button type="submit" variant="primary">
            足す
          </Button>
        </FormActions>
      </Form>
      {/* 足したことを、画面と読み上げソフトに知らせる。Form の外に置き、作り直しても消えないようにする */}
      <p role="status">{lastAddedTitle && `「${lastAddedTitle}」を足しました。`}</p>
    </section>
  );
};
