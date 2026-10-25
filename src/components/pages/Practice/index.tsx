import { useEffect, useRef } from "react";

import { CardActionsMenu } from "~/components/features/Card/CardActionsMenu";
import { CardList } from "~/components/features/Card/CardList";
import { useCards } from "~/components/features/Card/hooks/useCards";
import { Header } from "~/components/layouts/Header";
import { Button } from "~/components/ui/Button/Button";
import { Card } from "~/components/ui/Card/Card";

import styles from "./index.module.css";

/** CSS の練習に使うページ */
export const PracticePage = () => {
  // カードは、カードのメニュー（docs/21）から複製・削除できる。再読み込みすると元に戻る
  const { cards, lastDeletedCard } = useCards();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // 削除すると、ダイアログを開いた「削除」ボタンもカードごと消え、閉じたあとのフォーカスの戻り先がなくなる
  // （<body> に落ちて、キーボードの人は今どこにいるか分からなくなる）。代わりにページの見出しへ移す
  useEffect(() => {
    if (lastDeletedCard) {
      headingRef.current?.focus();
    }
  }, [lastDeletedCard]);

  return (
    <>
      <Header />
      <main className={styles.page}>
        {/* tabIndex={-1}: Tab では止まらないが、削除のあとにフォーカスを移せるようにする */}
        <h1 ref={headingRef} tabIndex={-1}>
          練習ページ
        </h1>
        {/* 削除したことを、画面と読み上げソフトに知らせる。中身が変わると読み上げるよう、最初から置いておく */}
        <p role="status">{lastDeletedCard && `「${lastDeletedCard.title}」を削除しました。`}</p>
        {cards.length > 0 ? (
          <CardList>
            {cards.map((card) => (
              <Card
                key={card.id}
                title={card.title}
                footer={
                  <>
                    <Button>詳しく見る</Button>
                    <CardActionsMenu card={card} />
                  </>
                }
              >
                {card.body}
              </Card>
            ))}
          </CardList>
        ) : (
          <p>カードはすべて削除しました。ページを再読み込みすると、元に戻ります。</p>
        )}
      </main>
    </>
  );
};
