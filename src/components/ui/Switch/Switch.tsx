import { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ReactNode } from "react";

import styles from "./Switch.module.css";

type SwitchProps = Omit<BaseSwitch.Root.Props, "className" | "style" | "children"> & {
  /** つまみの中に置くアイコン。今の状態を表すものを渡す（例: ダークモードなら、オンのとき月）。なくてもよい */
  thumbIcon?: ReactNode;
};

/**
 * オンとオフを切り替える部品。押すと、つまみが横に動く。Base UI の Switch を包み、見た目をこの部品で決める。
 * オンかオフかは、Base UI が付ける role="switch" と aria-checked で読み上げに伝わる。
 * 名前は aria-label で付けるか、外側を <label> で包んで文字を添える。名前は状態で変えない。
 * 見た目をそろえるため、使う側からは className と style を渡せない。置く位置や間隔は親が決める。
 */
export const Switch = ({ thumbIcon, ...props }: SwitchProps) => {
  return (
    <BaseSwitch.Root {...props} className={styles.switch}>
      <BaseSwitch.Thumb className={styles.thumb}>{thumbIcon}</BaseSwitch.Thumb>
    </BaseSwitch.Root>
  );
};
