import type { ReactNode } from "react";

import styles from "./Card.module.css";

type CardProps = {
  title: string;
  children: ReactNode;
  /** カードの下に置く操作（ボタンなど） */
  footer?: ReactNode;
};

export const Card = ({ title, children, footer }: CardProps) => {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </article>
  );
};
