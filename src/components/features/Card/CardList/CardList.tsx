import { Children, type ReactNode } from "react";

import styles from "./CardList.module.css";

type CardListProps = {
  /** 並べるカード */
  children: ReactNode;
};

export function CardList({ children }: CardListProps) {
  return (
    <ul className={styles.list}>
      {Children.map(children, (child) => (
        <li className={styles.item}>{child}</li>
      ))}
    </ul>
  );
}
