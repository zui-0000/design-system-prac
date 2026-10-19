// useTheme は utils/theme.ts を React につなぐだけなので、つなぎ（描き直し・登録を外す）だけを確かめる。
// 配色を決める中身（選んだ配色と OS の配色のどちらを使うか、保存など）は utils/__tests__/theme.test.ts で確かめる
import { act, renderHook } from "@testing-library/react";

import { mockOsTheme } from "~/__setup__/mocks/osTheme";
import { THEMES } from "~/constants/theme";

import { useTheme } from "../useTheme";

describe("useTheme", () => {
  test("描いた場合、今の配色を返すこと", () => {
    mockOsTheme(THEMES.DARK);

    const { result } = renderHook(() => useTheme());

    expect(result.current[0]).toBe(THEMES.DARK);
  });

  test("setTheme を呼んだ場合、選んだ配色で描き直すこと", () => {
    mockOsTheme(THEMES.LIGHT);
    const { result } = renderHook(() => useTheme());

    act(() => {
      const [, setTheme] = result.current;
      setTheme(THEMES.DARK);
    });

    expect(result.current[0]).toBe(THEMES.DARK);
  });

  test("OS の配色が変わった場合、新しい配色で描き直すこと", () => {
    const os = mockOsTheme(THEMES.LIGHT);
    const { result } = renderHook(() => useTheme());

    act(() => {
      os.changeOsTheme(THEMES.DARK);
    });

    expect(result.current[0]).toBe(THEMES.DARK);
  });

  test("2 つの部品で使った場合、片方で選んだ配色がもう片方にも届くこと", () => {
    mockOsTheme(THEMES.LIGHT);
    const first = renderHook(() => useTheme());
    const second = renderHook(() => useTheme());

    act(() => {
      const [, setTheme] = first.result.current;
      setTheme(THEMES.DARK);
    });

    expect(second.result.current[0]).toBe(THEMES.DARK);
  });

  test("部品が消えた場合、OS の配色の見張りを外すこと", () => {
    const os = mockOsTheme(THEMES.LIGHT);
    const { unmount } = renderHook(() => useTheme());
    expect(os.countOsThemeListeners()).toBe(1);

    unmount();

    expect(os.countOsThemeListeners()).toBe(0);
  });
});
