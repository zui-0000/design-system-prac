import { Form as BaseForm } from "@base-ui/react/form";
import type { ReactNode } from "react";

import styles from "./Form.module.css";

type FormProps<FormValues extends Record<string, unknown>> = Omit<
  BaseForm.Props<FormValues>,
  "className" | "style" | "render"
>;

/**
 * 入力のまとまり。Base UI の Form を包む（docs/23）。
 * 送信すると全部の Field を検証し、失敗があれば最初の入力欄にフォーカスして、onFormSubmit を呼ばない。
 */
export const Form = <FormValues extends Record<string, unknown>>(props: FormProps<FormValues>) => {
  return <BaseForm {...props} className={styles.form} />;
};

/** 送信ボタンなどの置き場。最後の項目の下に、左端をそろえて置く */
export const FormActions = ({ children }: { children: ReactNode }) => {
  return <div className={styles.actions}>{children}</div>;
};
