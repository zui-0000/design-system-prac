import { Menu as BaseMenu } from "@base-ui/react/menu";
import type { ReactElement, ReactNode } from "react";

import styles from "./Menu.module.css";

type MenuProps = {
  /** 押すとメニューを開くボタン（<Button aria-label="…"><EllipsisIcon /></Button> など） */
  trigger: ReactElement;
  /** MenuItem・MenuSeparator を並べる */
  children: ReactNode;
};

/**
 * 押すと開く操作の一覧。Base UI の Menu を包む（docs/21）。
 * 開くと、矢印キーで項目を選べる。Esc キーと、外側を押すと閉じ、フォーカスは trigger に戻る。
 */
export const Menu = ({ trigger, children }: MenuProps) => {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        {/* trigger の下に、左端をそろえて出す。画面の端にぶつかるときは、Base UI が反対側に出す */}
        <BaseMenu.Positioner className={styles.positioner} sideOffset={8} align="start">
          <BaseMenu.Popup className={styles.popup}>{children}</BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
};

type MenuItemProps = {
  children: ReactNode;
  /** 押したときの処理。処理のあと、メニューは閉じる */
  onClick: () => void;
  /** 削除などの取り消せない操作は danger。ほかの項目と線（MenuSeparator）で分け、一番下に置く */
  variant?: "default" | "danger";
  disabled?: boolean;
};

/** メニューの項目 */
export const MenuItem = ({ children, onClick, variant = "default", disabled }: MenuItemProps) => {
  return (
    <BaseMenu.Item
      className={`${styles.item} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </BaseMenu.Item>
  );
};

/** 項目のまとまりを分ける線 */
export const MenuSeparator = () => {
  return <BaseMenu.Separator className={styles.separator} />;
};
