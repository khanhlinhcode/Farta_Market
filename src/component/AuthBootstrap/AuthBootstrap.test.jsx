import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import store from "../../redux/store";
import { SESSION_KEYS } from "utils/constant";
import AuthBootstrap from ".";

vi.mock("api/auth", () => ({
  getMeAPI: vi.fn().mockResolvedValue({}),
}));

const createStorageMock = () => {
  const values = new Map();

  return {
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
};

describe("AuthBootstrap", () => {
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
  });

  it("removes legacy persisted order details on startup", async () => {
    window.localStorage.setItem(
      SESSION_KEYS.LAST_ORDER_SUCCESS,
      JSON.stringify({ address: "PII must not persist" })
    );

    render(
      <Provider store={store}>
        <AuthBootstrap />
      </Provider>
    );

    await waitFor(() => {
      expect(window.localStorage.getItem(SESSION_KEYS.LAST_ORDER_SUCCESS)).toBeNull();
    });
  });
});
