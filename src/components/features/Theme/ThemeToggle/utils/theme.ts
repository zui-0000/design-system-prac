/**
 * 配色の読み書き。React を使わない、ただの関数と状態（登録した相手）だけを置く。
 * React には hooks/useTheme.ts がつなぐ。React を使わないので、単体テストでは関数を呼ぶだけで確かめられる（docs/15）。
 * 外に出すのは getTheme・subscribeTheme・setTheme の 3 つ。ほかは中だけで使い、テストもこの 3 つの動きを通して確かめる
 */
import { LOCAL_STORAGE_KEYS } from "~/constants/localStorage";
import { type Theme, THEMES } from "~/constants/theme";

/** Theme の値（THEMES のどれか）なら true。<html data-theme> の値はただの文字列なので、使う前に絞る */
const isTheme = (value: unknown) => {
  return value === THEMES.LIGHT || value === THEMES.DARK;
};

/**
 * OS の配色を聞くための条件。CSS の @media (prefers-color-scheme: dark) と同じ。
 * prefers-color-scheme の値は light と dark の 2 つだけで、どちらか一方だけが当てはまる
 * （何も選んでいない人は light）。なので「ダークか」だけ聞けば、OS の配色が決まる。
 * ブラウザに配色を直接聞く関数（navigator.preferences）は、まだ使えない（docs/15）
 */
const OS_DARK_QUERY = "(prefers-color-scheme: dark)";

/** OS の配色 */
const getOsTheme = () => {
  return window.matchMedia(OS_DARK_QUERY).matches ? THEMES.DARK : THEMES.LIGHT;
};

/** OS の配色が変わったら、onChange を呼ぶ。登録を外す関数を返す */
const watchOsTheme = (onChange: () => void) => {
  const query = window.matchMedia(OS_DARK_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** 選んだ配色（<html data-theme>）。まだ選んでいなければ undefined */
const getSelectedTheme = () => {
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : undefined;
};

/**
 * 今の配色を返す（useSyncExternalStore の 2 つ目の引数）。最初の描画のときと、onChange の後に React が呼ぶ。
 * 選んだ配色があればそれ、なければ OS の配色
 */
export const getTheme = () => {
  return getSelectedTheme() ?? getOsTheme();
};

/** 配色が変わったことを知らせる相手。subscribeTheme で登録し、setTheme が呼ぶ */
const listeners = new Set<() => void>();

/**
 * 配色が変わったら onChange を呼ぶように登録する（useSyncExternalStore の 1 つ目の引数）。
 * 値は返さない。今の値は getTheme が返す。onChange が呼ばれると、React が getTheme を呼び直して描き直す。
 * 登録を外す関数を返す（部品が消えるときに React が呼ぶ）
 */
export const subscribeTheme = (onChange: () => void) => {
  // 配色を選んだとき（setTheme）
  listeners.add(onChange);

  // まだ選んでいないときは OS の配色に従うので、OS の配色が変わったとき
  const unwatchOsTheme = watchOsTheme(onChange);
  return () => {
    listeners.delete(onChange);
    unwatchOsTheme();
  };
};

/** 配色を選んだとき。画面を切り替え、保存し、React に知らせる */
export const setTheme = (theme: Theme) => {
  // <html data-theme> を付けて、画面の配色を切り替える（色は color.css の :root[data-theme] が変える）
  document.documentElement.dataset.theme = theme;

  // 次に開いたときのために、選んだ配色を保存する。
  // ブラウザの設定で保存が止められている（SecurityError）、容量がいっぱい（QuotaExceededError）ときは例外になる。
  // 捨てないと、下の「知らせる」まで届かず、画面と部品の表示がずれる。保存できなくても今の画面は切り替わっているので、何もしない
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
  } catch {
    // 保存できなくても、そのままにする
  }

  // 配色が変わったことを、subscribeTheme で登録された相手に知らせる
  listeners.forEach((onChange) => onChange());
};
