import { mockOsTheme } from "~/__setup__/mocks/osTheme";
import { LOCAL_STORAGE_KEYS } from "~/constants/localStorage";
import { THEMES } from "~/constants/theme";

import { getTheme, setTheme, subscribeTheme } from "../theme";

describe("getTheme", () => {
  test.each([THEMES.LIGHT, THEMES.DARK])(
    "配色を選んでいない場合、OS の配色（%s）を返すこと",
    (osTheme) => {
      mockOsTheme(osTheme);

      expect(getTheme()).toBe(osTheme);
    },
  );

  test("配色を選んでいる場合、OS の配色より選んだ配色を返すこと", () => {
    mockOsTheme(THEMES.DARK);
    document.documentElement.dataset.theme = THEMES.LIGHT;

    expect(getTheme()).toBe(THEMES.LIGHT);
  });

  test("<html data-theme> に配色でない値が入っている場合、OS の配色を返すこと", () => {
    mockOsTheme(THEMES.DARK);
    document.documentElement.dataset.theme = "purple";

    expect(getTheme()).toBe(THEMES.DARK);
  });
});

describe("setTheme", () => {
  test("配色を選んだ場合、<html data-theme> に付けること", () => {
    mockOsTheme(THEMES.LIGHT);

    setTheme(THEMES.DARK);

    expect(document.documentElement).toHaveAttribute("data-theme", THEMES.DARK);
    expect(getTheme()).toBe(THEMES.DARK);
  });

  test("配色を選んだ場合、localStorage に保存すること", () => {
    mockOsTheme(THEMES.LIGHT);

    setTheme(THEMES.DARK);

    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.THEME)).toBe(THEMES.DARK);
  });

  test("localStorage に保存できない場合も、配色を切り替えて、登録した相手に知らせること", () => {
    mockOsTheme(THEMES.LIGHT);
    // 容量がいっぱいのときと同じ例外を投げる
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("容量がいっぱい", "QuotaExceededError");
    });
    const onChange = vi.fn();
    const unsubscribe = subscribeTheme(onChange);

    expect(() => setTheme(THEMES.DARK)).not.toThrow();

    expect(getTheme()).toBe(THEMES.DARK);
    expect(onChange).toHaveBeenCalledOnce();
    unsubscribe();
  });
});

describe("subscribeTheme", () => {
  test("配色を選んだ場合、登録した相手に知らせること", () => {
    mockOsTheme(THEMES.LIGHT);
    const onChange = vi.fn();
    const unsubscribe = subscribeTheme(onChange);

    setTheme(THEMES.DARK);

    expect(onChange).toHaveBeenCalledOnce();
    unsubscribe();
  });

  test("OS の配色が変わった場合、登録した相手に知らせること", () => {
    const os = mockOsTheme(THEMES.LIGHT);
    const onChange = vi.fn();
    const unsubscribe = subscribeTheme(onChange);

    os.changeOsTheme(THEMES.DARK);

    expect(onChange).toHaveBeenCalledOnce();
    expect(getTheme()).toBe(THEMES.DARK);
    unsubscribe();
  });

  test("登録を外した場合、配色を選んでも OS の配色が変わっても知らせないこと", () => {
    const os = mockOsTheme(THEMES.LIGHT);
    const onChange = vi.fn();
    const unsubscribe = subscribeTheme(onChange);

    unsubscribe();
    setTheme(THEMES.DARK);
    os.changeOsTheme(THEMES.DARK);

    expect(onChange).not.toHaveBeenCalled();
    expect(os.countOsThemeListeners()).toBe(0);
  });
});
