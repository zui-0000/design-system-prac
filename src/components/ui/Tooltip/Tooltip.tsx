import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ReactElement } from "react";

import styles from "./Tooltip.module.css";

type TooltipProps = {
  /**
   * 出す文字。短い名前にする（「操作」など）。
   * 読み上げには出ないので、children の aria-label と同じ文字か、その一部にする（docs/22）
   */
  label: string;
  /** 説明を付ける部品（<Button aria-label="…"><EllipsisIcon /></Button> など） */
  children: ReactElement;
};

/**
 * マウスを乗せる・キーボードでフォーカスすると、少し待ってから出る短い説明。Base UI の Tooltip を包む（docs/22）。
 * 見える人向けの補足なので、なくても困らない情報だけを出す。タッチの画面では出ない。
 *
 * Menu の trigger に渡すと、Menu が付ける属性（onClick・aria-expanded・ref など）がこの部品に届く。
 * 受け取ったものは、そのまま Tooltip.Trigger に渡し、Tooltip.Trigger が children の部品に渡す
 */
export const Tooltip = ({ label, children, ...props }: TooltipProps) => {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger {...props} render={children} />
      <BaseTooltip.Portal>
        {/* 上に出す。画面の端にぶつかるときは、Base UI が反対側に出す */}
        <BaseTooltip.Positioner className={styles.positioner} sideOffset={8}>
          <BaseTooltip.Popup className={styles.popup}>{label}</BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
};
