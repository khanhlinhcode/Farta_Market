import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getExpiringSessionItem,
  setExpiringSessionItem,
} from "./session";

const createStorageMock = () => {
  const values = new Map();

  return {
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
};

describe("expiring session storage", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createStorageMock(),
    });
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: createStorageMock(),
    });
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("keeps cart data in the current tab and removes legacy persistent data", () => {
    window.localStorage.setItem("cart", JSON.stringify({ products: [{ id: 99 }] }));
    vi.spyOn(Date, "now").mockReturnValue(1_000);

    setExpiringSessionItem("cart", { products: [{ id: 1 }] }, 60_000);

    expect(window.localStorage.getItem("cart")).toBeNull();
    expect(getExpiringSessionItem("cart", null)).toEqual({ products: [{ id: 1 }] });
  });

  it("removes an expired cart instead of restoring a previous session", () => {
    vi.spyOn(Date, "now").mockReturnValueOnce(1_000).mockReturnValue(61_001);
    setExpiringSessionItem("cart", { products: [{ id: 1 }] }, 60_000);

    expect(getExpiringSessionItem("cart", { products: [] })).toEqual({ products: [] });
    expect(window.sessionStorage.getItem("cart")).toBeNull();
  });
});
