// cards.ts は一覧をモジュールの中に持つので、テストどうしで続いてしまう。
// テストごとに vi.resetModules() で読み込み直し、最初の一覧から始める（docs/19）
const loadCards = async () => {
  vi.resetModules();
  return import("../cards");
};

describe("getCardsState", () => {
  test("最初の場合、4 枚のカードを返し、削除したカードはないこと", async () => {
    const { getCardsState } = await loadCards();

    expect(getCardsState().cards).toHaveLength(4);
    expect(getCardsState().lastDeletedCard).toBeUndefined();
  });
});

describe("deleteCard", () => {
  test("削除した場合、一覧から外し、最後に削除したカードにすること", async () => {
    const { deleteCard, getCardsState } = await loadCards();
    const [first] = getCardsState().cards;

    deleteCard(first);

    expect(getCardsState().cards).not.toContainEqual(first);
    expect(getCardsState().cards).toHaveLength(3);
    expect(getCardsState().lastDeletedCard).toBe(first);
  });

  test("削除した場合、状態を新しいオブジェクトに置き換えること", async () => {
    // useSyncExternalStore は、前と同じオブジェクトなら描き直さない
    const { deleteCard, getCardsState } = await loadCards();
    const before = getCardsState();

    deleteCard(before.cards[0]);

    expect(getCardsState()).not.toBe(before);
  });

  test("削除した場合、登録した相手に知らせること", async () => {
    const { deleteCard, getCardsState, subscribeCards } = await loadCards();
    const onChange = vi.fn();
    subscribeCards(onChange);

    deleteCard(getCardsState().cards[0]);

    expect(onChange).toHaveBeenCalledOnce();
  });

  test("登録を外した場合、削除しても知らせないこと", async () => {
    const { deleteCard, getCardsState, subscribeCards } = await loadCards();
    const onChange = vi.fn();
    const unsubscribe = subscribeCards(onChange);

    unsubscribe();
    deleteCard(getCardsState().cards[0]);

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("duplicateCard", () => {
  test("複製した場合、元のカードのすぐ後ろに、新しい id とコピーの見出しで足すこと", async () => {
    const { duplicateCard, getCardsState } = await loadCards();
    const [first, second] = getCardsState().cards;

    duplicateCard(first);

    const { cards } = getCardsState();
    expect(cards).toHaveLength(5);
    expect(cards[0]).toBe(first);
    expect(cards[1]).toMatchObject({ id: 5, title: `${first.title}のコピー`, body: first.body });
    expect(cards[2]).toBe(second);
  });

  test("複製した場合、登録した相手に知らせ、最後に削除したカードは変えないこと", async () => {
    const { deleteCard, duplicateCard, getCardsState, subscribeCards } = await loadCards();
    const [first, second] = getCardsState().cards;
    deleteCard(first);
    const onChange = vi.fn();
    subscribeCards(onChange);

    duplicateCard(second);

    expect(onChange).toHaveBeenCalledOnce();
    expect(getCardsState().lastDeletedCard).toBe(first);
  });
});
