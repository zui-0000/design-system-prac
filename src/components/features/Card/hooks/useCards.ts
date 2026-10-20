import { useSyncExternalStore } from "react";

import { deleteCard, getCardsState, subscribeCards } from "../utils/cards";

/**
 * カードの一覧と、最後に削除したカード、カードを削除する関数を返す。
 * 一覧は React の外（utils/cards.ts）にあるので、useSyncExternalStore で React の state のように読む。
 * ページと DeleteConfirmDialog のどちらで使っても、同じ一覧を指す（docs/19）
 */
export const useCards = () => {
  const { cards, lastDeletedCard } = useSyncExternalStore(subscribeCards, getCardsState);
  return { cards, lastDeletedCard, deleteCard };
};
