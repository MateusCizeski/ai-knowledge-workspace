import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTheme } from "@/composables/useTheme";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

Object.defineProperty(globalThis, "document", {
  value: {
    documentElement: {
      setAttribute: vi.fn(),
    },
  },
  writable: true,
});

Object.defineProperty(globalThis, "window", {
  value: {
    matchMedia: vi.fn().mockReturnValue({ matches: false }),
  },
  writable: true,
});

describe("useTheme", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("initializes to light when no preference saved and OS is light", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    const { theme, init } = useTheme();
    init();
    expect(theme.value).toBe("light");
  });

  it("initializes to dark when OS prefers dark and nothing saved", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    const { theme, init } = useTheme();
    init();
    expect(theme.value).toBe("dark");
  });

  it("respects saved theme over OS preference", () => {
    localStorageMock.setItem("theme", "dark");
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    const { theme, init } = useTheme();
    init();
    expect(theme.value).toBe("dark");
  });

  it("toggle switches from light to dark", () => {
    const { theme, apply, toggle } = useTheme();
    apply("light");
    toggle();
    expect(theme.value).toBe("dark");
  });

  it("toggle switches from dark to light", () => {
    const { theme, apply, toggle } = useTheme();
    apply("dark");
    toggle();
    expect(theme.value).toBe("light");
  });

  it("apply saves to localStorage", () => {
    const { apply } = useTheme();
    apply("dark");
    expect(localStorageMock.getItem("theme")).toBe("dark");
  });

  it("apply sets data-theme attribute on documentElement", () => {
    const { apply } = useTheme();
    apply("dark");
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
      "data-theme",
      "dark",
    );
  });
});
