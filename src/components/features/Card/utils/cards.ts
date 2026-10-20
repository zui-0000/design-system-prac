/**
 * カードの一覧の読み書き。React を使わない、ただの関数と状態だけを置く（ThemeToggle/utils/theme.ts と同じ形）。
 * React には hooks/useCards.ts がつなぐ。一覧を使うのは、ページ（並べる）と DeleteConfirmDialog（消す）なので、
 * どちらからも読めるよう、部品のフォルダではなく features/Card/ の直下に置く（docs/19）。
 * 外に出すのは getCardsState・subscribeCards・deleteCard の 3 つ。
 * 練習ページのための一覧なので、メモリの中だけに持つ。再読み込みすると元に戻る
 */

export type CardData = {
  id: number;
  title: string;
  body: string;
};

const INITIAL_CARDS: CardData[] = [
  { id: 1, title: "短い本文", body: "1 行だけ。" },
  {
    id: 2,
    title: "長い本文",
    body: "本文が長いカード。Grid は同じ行の高さをそろえるので、短いカードも同じ高さに伸び、ボタンは一番下にそろう。",
  },
  { id: 3, title: "中くらいの本文", body: "2 行くらいになる長さの本文を入れておく。" },
  { id: 4, title: "4 枚目", body: "画面の幅が足りなければ、次の行に回る。" },
];

type CardsState = {
  cards: CardData[];
  /** 最後に削除したカード。ページが「削除しました」を出し、フォーカスを移すのに使う */
  lastDeletedCard?: CardData;
};

/**
 * 今の状態。変えるときは、中身を書き換えず、新しいオブジェクトに置き換える。
 * useSyncExternalStore は、前と同じオブジェクトなら「変わっていない」と判断して描き直さないため
 */
let state: CardsState = { cards: INITIAL_CARDS };

/** 今の状態を返す（useSyncExternalStore の 2 つ目の引数） */
export const getCardsState = () => {
  return state;
};

/** 一覧が変わったことを知らせる相手 */
const listeners = new Set<() => void>();

/** 一覧が変わったら onChange を呼ぶように登録する。登録を外す関数を返す（useSyncExternalStore の 1 つ目の引数） */
export const subscribeCards = (onChange: () => void) => {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
};

/** カードを一覧から外し、登録された相手に知らせる */
export const deleteCard = (card: CardData) => {
  state = {
    cards: state.cards.filter(({ id }) => id !== card.id),
    lastDeletedCard: card,
  };
  listeners.forEach((onChange) => onChange());
};
