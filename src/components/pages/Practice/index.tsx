import { CardList } from "~/components/features/Card/CardList";
import { Header } from "~/components/layouts/Header";
import { Button } from "~/components/ui/Button/Button";
import { Card } from "~/components/ui/Card/Card";

import styles from "./index.module.css";

const action = <Button>詳しく見る</Button>;

/** CSS の練習に使うページ */
export const PracticePage = () => {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <h1>練習ページ</h1>
        <CardList>
          <Card title="短い本文" footer={action}>
            1 行だけ。
          </Card>
          <Card title="長い本文" footer={action}>
            本文が長いカード。Grid
            は同じ行の高さをそろえるので、短いカードも同じ高さに伸び、ボタンは一番下にそろう。
          </Card>
          <Card title="中くらいの本文" footer={action}>
            2 行くらいになる長さの本文を入れておく。
          </Card>
          <Card title="4 枚目" footer={action}>
            画面の幅が足りなければ、次の行に回る。
          </Card>
        </CardList>
      </main>
    </>
  );
};
