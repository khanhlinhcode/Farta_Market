import "@testing-library/jest-dom/vitest";
import React from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import store from "../redux/store";
import { emptyCart, setCart } from "../redux/cartSlice";
import { clearAuth, setAuthBootstrapped, setAuthenticatedUser } from "../redux/authSlice";
import { CART_SESSION_TTL_MS, SESSION_KEYS } from "../utils/constant";
import { getExpiringSessionItem, setExpiringSessionItem } from "../utils/session";
import useShoppingCart from "./useShoppingCart";

const product = { id: 1, name: "Cam Tươi", price: 45000, inventory: 10 };
const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
const storage = () => {
  const values = new Map();
  return {
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
};

vi.mock("react-hot-toast", () => ({ default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));

beforeEach(() => {
  Object.defineProperty(window, "localStorage", { configurable: true, value: storage() });
  Object.defineProperty(window, "sessionStorage", { configurable: true, value: storage() });
  window.history.replaceState({}, "", "/san-pham/chi-tiet/1?ref=chat");
  store.dispatch(setCart(emptyCart));
  store.dispatch(clearAuth());
});
afterEach(cleanup);

it("rejects every guest mutation and removes stale persisted cart", () => {
  const stale = { products: [{ product, quantity: 2 }], totalPrice: 90000, totalQuantity: 2 };
  setExpiringSessionItem(SESSION_KEYS.CART, stale, CART_SESSION_TTL_MS);
  setExpiringSessionItem(SESSION_KEYS.CART_OWNER, 7, CART_SESSION_TTL_MS);
  store.dispatch(setCart(stale));

  const { result } = renderHook(() => useShoppingCart(), { wrapper });
  let response;
  act(() => { response = result.current.addToCart(product, 1); });

  expect(response).toMatchObject({ ok: false, reason: "AUTH_REQUIRED", addedCount: 0 });
  expect(store.getState().commonSlide.cart).toEqual(emptyCart);
  expect(window.sessionStorage.getItem(SESSION_KEYS.CART)).toBeNull();
  expect(window.location.pathname).toBe("/dang-nhap");
  expect(new URLSearchParams(window.location.search).get("redirect")).toBe("/san-pham/chi-tiet/1?ref=chat");
});

it("does not read, write, or delete cart storage before auth bootstrap completes", () => {
  store.dispatch(setAuthBootstrapped(false));
  const stale = { products: [{ product, quantity: 2 }], totalPrice: 90000, totalQuantity: 2 };
  setExpiringSessionItem(SESSION_KEYS.CART, stale, CART_SESSION_TTL_MS);
  const rawBefore = window.sessionStorage.getItem(SESSION_KEYS.CART);

  const { result } = renderHook(() => useShoppingCart(), { wrapper });
  let response;
  act(() => { response = result.current.addToCart(product, 1); });

  expect(response).toMatchObject({ ok: false, reason: "AUTH_PENDING", addedCount: 0 });
  expect(window.sessionStorage.getItem(SESSION_KEYS.CART)).toBe(rawBefore);
  expect(store.getState().commonSlide.cart).toEqual(emptyCart);
});

it("allows a verified customer and clears the cart when the owner changes", () => {
  store.dispatch(setAuthenticatedUser({ id: 7, role: "customer", email_verified_at: "2026-09-24T00:00:00Z" }));
  const { result, rerender } = renderHook(() => useShoppingCart(), { wrapper });
  let response;
  act(() => { response = result.current.addToCart(product, 2); });

  expect(response).toMatchObject({ ok: true, addedCount: 2 });
  expect(getExpiringSessionItem(SESSION_KEYS.CART).totalQuantity).toBe(2);
  expect(getExpiringSessionItem(SESSION_KEYS.CART_OWNER)).toBe(7);

  act(() => {
    store.dispatch(setAuthenticatedUser({ id: 8, role: "customer", email_verified_at: "2026-09-24T00:00:00Z" }));
  });
  rerender();
  expect(store.getState().commonSlide.cart).toEqual(emptyCart);
  expect(window.sessionStorage.getItem(SESSION_KEYS.CART)).toBeNull();
});
