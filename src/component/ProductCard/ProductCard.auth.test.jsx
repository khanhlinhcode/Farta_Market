import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import store from "../../redux/store";
import { clearAuth } from "../../redux/authSlice";
import { emptyCart, setCart } from "../../redux/cartSlice";
import { SESSION_KEYS } from "../../utils/constant";
import "../../i18n";
import ProductCard from ".";

vi.mock("hooks/useWishlist", () => ({
  default: () => ({ isWishlisted: () => false, toggleWishlist: vi.fn() }),
}));
vi.mock("react-hot-toast", () => ({ default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));

const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
};

beforeEach(() => {
  Object.defineProperty(window, "localStorage", { configurable: true, value: storage() });
  Object.defineProperty(window, "sessionStorage", { configurable: true, value: storage() });
  store.dispatch(setCart(emptyCart));
  store.dispatch(clearAuth());
});
afterEach(cleanup);

it("guest add from ProductCard never changes Redux or sessionStorage", () => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ProductCard product={{ id: 1, name: "Cam Tươi", img: "/cam.png", price: 45000, inventory: 5 }} />
      </MemoryRouter>
    </Provider>
  );

  fireEvent.click(screen.getByRole("button", { name: "Thêm vào giỏ" }));
  expect(store.getState().commonSlide.cart).toEqual(emptyCart);
  expect(window.sessionStorage.getItem(SESSION_KEYS.CART)).toBeNull();
});
