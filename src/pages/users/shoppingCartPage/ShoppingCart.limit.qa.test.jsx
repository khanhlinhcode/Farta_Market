import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import store from "../../../redux/store";
import { calculateCart, setCart } from "../../../redux/cartSlice";
import i18n from "../../../i18n";
import ShoppingCartPage from ".";
import { CART_SESSION_TTL_MS, SESSION_KEYS } from "utils/constant";
import { getExpiringSessionItem, setExpiringSessionItem } from "utils/session";
import { clearAuth, setAuthenticatedUser } from "../../../redux/authSlice";

vi.mock("react-hot-toast", () => ({ default: notices }));
const notices = vi.hoisted(() => Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }));
const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
};
beforeEach(async () => {
  Object.defineProperty(window, "localStorage", { configurable: true, value: storage() });
  Object.defineProperty(window, "sessionStorage", { configurable: true, value: storage() });
  await i18n.changeLanguage("vi");
  store.dispatch(clearAuth());
  store.dispatch(setAuthenticatedUser({ id: 1, role: "customer", email_verified_at: "2026-09-24T00:00:00Z" }));
  setExpiringSessionItem(SESSION_KEYS.CART_OWNER, 1, CART_SESSION_TTL_MS);
});
afterEach(cleanup);

it("QA: cart quantity controls must preserve checkout's maximum of 100 per line", () => {
  const product = { id: 1, name: "Cam Tươi", img: "/cam.png", price: 45000, inventory: 1000 };
  const cart = calculateCart([{ product, quantity: 100 }]);
  setExpiringSessionItem(SESSION_KEYS.CART, cart, CART_SESSION_TTL_MS);
  store.dispatch(setCart(cart));
  render(<Provider store={store}><MemoryRouter><ShoppingCartPage /></MemoryRouter></Provider>);
  fireEvent.click(screen.getByRole("button", { name: "+" }));
  expect(getExpiringSessionItem(SESSION_KEYS.CART).products[0].quantity).toBeLessThanOrEqual(100);
  expect(store.getState().commonSlide.cart.products[0].quantity).toBeLessThanOrEqual(100);
});


it("legacy quantity 200 is repaired consistently in UI, Redux and storage", () => {
  const product = { id: 1, name: "Cam Tươi", img: "/cam.png", price: 45000, inventory: 1000 };
  const cart = calculateCart([{ product, quantity: 200 }]);
  setExpiringSessionItem(SESSION_KEYS.CART, cart, CART_SESSION_TTL_MS);
  store.dispatch(setCart(cart));
  render(<Provider store={store}><MemoryRouter><ShoppingCartPage /></MemoryRouter></Provider>);
  expect(screen.getByRole("spinbutton")).toHaveValue(100);
  expect(getExpiringSessionItem(SESSION_KEYS.CART).totalQuantity).toBe(100);
  expect(store.getState().commonSlide.cart.totalQuantity).toBe(100);
  expect(notices).toHaveBeenCalledWith(i18n.t("cart.adjusted"));
});
