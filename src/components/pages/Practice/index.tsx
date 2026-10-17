import { Card } from "../../ui/Card/Card";
import styles from "./index.module.css";

/** CSS の練習に使うページ */
export function PracticePage() {
  return (
    <main className={styles.page}>
      <h1>練習ページ</h1>
      <Card title="カードの見出し">カードの本文。ここで部品を組み合わせて試す。</Card>
    </main>
  );
}
