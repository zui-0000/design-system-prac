import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import { Button } from "~/components/ui/Button/Button";

import styles from "./AlertDialog.module.css";

type AlertDialogProps = Pick<
  BaseAlertDialog.Root.Props,
  "open" | "onOpenChange" | "defaultOpen"
> & {
  /**
   * 押すとダイアログを開くボタン（<Button>削除</Button> など）。
   * メニューの項目から開くときは渡さず、open と onOpenChange で開け閉めする（docs/21）
   */
  trigger?: ReactElement;
  /** AlertDialogTitle・AlertDialogDescription・AlertDialogActions を並べる */
  children: ReactNode;
};

/**
 * 取り消せない操作の前に、確認を挟むダイアログ。Base UI の AlertDialog を包む（docs/19）。
 * 外側を押しても閉じない（うっかり閉じない）。Esc キーとキャンセルで閉じる。
 * 開くと、中の最初のボタン（キャンセル）にフォーカスが移り、閉じると trigger に戻る。
 */
export const AlertDialog = ({ trigger, children, ...props }: AlertDialogProps) => {
  return (
    <BaseAlertDialog.Root {...props}>
      {trigger && <BaseAlertDialog.Trigger render={trigger} />}
      <BaseAlertDialog.Portal>
        <BaseAlertDialog.Backdrop className={styles.backdrop} />
        <BaseAlertDialog.Popup className={styles.popup}>{children}</BaseAlertDialog.Popup>
      </BaseAlertDialog.Portal>
    </BaseAlertDialog.Root>
  );
};

/** 何をするかを、問いかけの形で書く（「「4 枚目」を削除しますか？」）。読み上げソフトは、ダイアログの名前として読む */
export const AlertDialogTitle = ({ children }: { children: ReactNode }) => {
  return <BaseAlertDialog.Title className={styles.title}>{children}</BaseAlertDialog.Title>;
};

/** 押すと何が起きるかと、キャンセルするとどうなるかを書く（.claude/rules/ux.md の「取り消せない操作」） */
export const AlertDialogDescription = ({ children }: { children: ReactNode }) => {
  return (
    <BaseAlertDialog.Description className={styles.description}>
      {children}
    </BaseAlertDialog.Description>
  );
};

/** ボタンの置き場。キャンセルを先に、実行するボタンを後に置く */
export const AlertDialogActions = ({ children }: { children: ReactNode }) => {
  return <div className={styles.actions}>{children}</div>;
};

/** 何もせずに閉じるボタン。開いたときに、最初にフォーカスが移る */
export const AlertDialogCancel = ({ children }: { children: ReactNode }) => {
  return <BaseAlertDialog.Close render={<Button />}>{children}</BaseAlertDialog.Close>;
};

type AlertDialogActionProps = {
  children: ReactNode;
  /** 押したときの処理。処理のあと、ダイアログは閉じる */
  onClick: () => void;
  /** 削除などは danger（何も指定しなければ）。公開など、壊さない操作は primary */
  variant?: Extract<ComponentProps<typeof Button>["variant"], "danger" | "primary">;
};

/** 操作を実行して閉じるボタン */
export const AlertDialogAction = ({
  children,
  onClick,
  variant = "danger",
}: AlertDialogActionProps) => {
  return (
    <BaseAlertDialog.Close render={<Button variant={variant} />} onClick={onClick}>
      {children}
    </BaseAlertDialog.Close>
  );
};
