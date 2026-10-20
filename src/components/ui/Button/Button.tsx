import { Button as BaseButton } from "@base-ui/react/button";

import styles from "./Button.module.css";

type ButtonProps = Omit<BaseButton.Props, "className" | "style"> & {
  /**
   * ボタンの種類。何も指定しなければ secondary。
   * primary（目立たせるボタン）は、1 つの領域に 1 つだけにする（.claude/rules/ux.md の「見た目の強弱」）。
   * danger は、削除などの取り消せない操作。確認ダイアログの中でだけ使う（docs/19）。
   */
  variant?: "primary" | "secondary" | "danger";
};

/**
 * ボタン。Base UI の Button を包み、見た目をこの部品で決める。
 * 見た目をそろえるため、使う側からは className と style を渡せない。置く位置や間隔は親が決める。
 */
export const Button = ({ variant = "secondary", ...props }: ButtonProps) => {
  return <BaseButton {...props} className={`${styles.button} ${styles[variant]}`} />;
};
