import { Input as BaseInput } from "@base-ui/react/input";
import type { ReactElement } from "react";

import styles from "./Input.module.css";

type InputProps = Omit<BaseInput.Props, "className" | "style" | "render"> & {
  /** 頭に置く飾りのアイコン（<SearchIcon /> など）。押せない。意味はラベルで伝える */
  icon?: ReactElement;
  /** 右端に置くボタン（パスワードの表示の切り替えなど） */
  action?: ReactElement;
};

/**
 * 1 行の入力欄。Base UI の Input を包む（docs/23）。
 * Field の中に置くと、ラベル・説明・エラーと結び付く。Field なしで使うときは aria-label で名前を付ける。
 */
export const Input = ({ icon, action, onKeyDown, ...props }: InputProps) => {
  return (
    <div className={styles.frame}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <BaseInput
        {...props}
        className={styles.control}
        onKeyDown={(event) => {
          // IME の変換を確定する Enter を、Base UI に送信の Enter と間違えさせない（docs/23）。
          // Safari は変換の終わったあとに keydown を出すので、isComposing が false になる。keyCode の 229 で見分ける
          if (event.nativeEvent.isComposing || event.keyCode === 229) {
            event.preventBaseUIHandler();
          }
          onKeyDown?.(event);
        }}
      />
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};

type TextareaProps = Omit<BaseInput.Props, "className" | "style" | "render" | "type"> & {
  /** 右下に置くボタン（送信など） */
  action?: ReactElement;
};

/**
 * 複数行の入力欄。打った分だけ高くなり、10 行を超えるとスクロールする（docs/23）。
 * Base UI に Textarea はないので、Input の描く要素を render で <textarea> に替える。
 */
export const Textarea = ({ action, ...props }: TextareaProps) => {
  return (
    <div className={styles.frame}>
      <BaseInput
        {...props}
        className={`${styles.control} ${styles.textarea}`}
        render={<textarea />}
      />
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};
