import { Field as BaseField } from "@base-ui/react/field";
import type { ReactNode } from "react";

import styles from "./Field.module.css";

type FieldProps = Omit<BaseField.Root.Props, "className" | "style" | "render">;

/**
 * 入力欄 1 つ分のまとまり。Base UI の Field を包む（docs/23）。
 * FieldLabel・FieldDescription・Input・FieldError の順に並べると、Base UI がラベルや説明を入力欄に結び付ける。
 */
export const Field = (props: FieldProps) => {
  return <BaseField.Root {...props} className={styles.field} />;
};

/**
 * 入力欄の名前。中の入力欄に required があると「必須」を添える。
 * 「必須」は見える人向けの印で、読み上げソフトには required が伝えるので、aria-hidden で隠す。
 */
export const FieldLabel = ({ children }: { children: ReactNode }) => {
  return (
    <BaseField.Label className={styles.label}>
      {children}
      <span className={styles.required} aria-hidden="true">
        必須
      </span>
    </BaseField.Label>
  );
};

/** 入力の前に知っておきたいことを書く（形式の例など）。入力欄の上に置く */
export const FieldDescription = ({ children }: { children: ReactNode }) => {
  return <BaseField.Description className={styles.description}>{children}</BaseField.Description>;
};

type FieldErrorProps = Pick<BaseField.Error.Props, "match" | "children">;

/**
 * エラーの文。match に合う失敗のときだけ出す（valueMissing・typeMismatch・validate の失敗は customError）。
 * match を省くと、失敗のたびに出る。children も省くと、Form の errors か、ブラウザの言語の文が出る。
 * 何が起きたかと、どう直せばよいかを書く。入力欄の下に置く
 */
export const FieldError = (props: FieldErrorProps) => {
  return <BaseField.Error {...props} className={styles.error} />;
};
