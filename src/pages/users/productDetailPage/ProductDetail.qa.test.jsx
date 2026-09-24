import React from "react";
import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import store from "../../../redux/store";
import { emptyCart, setCart } from "../../../redux/cartSlice";
import { SESSION_KEYS } from "utils/constant";
import { getExpiringSessionItem } from "utils/session";
import { clearAuth, setAuthenticatedUser } from "../../../redux/authSlice";
import i18n from "../../../i18n";
import ProductDetailPage from "./index";

const mocks = vi.hoisted(() => ({
  product: null,
  loading: false,
  empty: [],
  frequent: [],
  reviews: vi.fn(),
  eligibility: vi.fn(),
}));
vi.mock("api/productDetailPage", () => ({
  useProductDetailUS: () => ({ data: mocks.product, isLoading: mocks.loading, isError: false }),
  useRelatedProductsUS: () => ({ data: mocks.empty }),
  useFrequentlyBoughtWithUS: () => ({ data: mocks.frequent }),
  getProductReviewsAPI: mocks.reviews,
  getProductReviewEligibilityAPI: mocks.eligibility,
  postProductReviewAPI: vi.fn(),
}));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const renderPage = async () => {
  let view;
  await act(async () => {
    view = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/product/1"]}>
          <Routes><Route path="/product/:id" element={<ProductDetailPage />} /></Routes>
        </MemoryRouter>
      </Provider>
    );
  });
  return view;
};

const createStorageMock = () => {
  const values = new Map();
  return {
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
};

beforeEach(async () => {
  Object.defineProperty(window, "localStorage", { configurable: true, value: createStorageMock() });
  Object.defineProperty(window, "sessionStorage", { configurable: true, value: createStorageMock() });
  window.localStorage.clear(); window.sessionStorage.clear();
  store.dispatch(setCart(emptyCart));
  store.dispatch(clearAuth());
  store.dispatch(setAuthenticatedUser({ id: 1, role: "customer", email_verified_at: "2026-09-24T00:00:00Z" }));
  await i18n.changeLanguage("vi");
  mocks.loading = false;
  mocks.product = { id: 1, name: "Cam Tươi", img: "/qa.png", price: 45000, inventory: 2, category: { name: "Trái Cây" } };
  mocks.frequent = [];
  mocks.reviews.mockResolvedValue({ data: [], meta: { current_page: 1, last_page: 1 }, summary: { avg_rating: 0, review_count: 0 } });
  mocks.eligibility.mockResolvedValue({ can_review: false, has_reviewed: false });
});
afterEach(cleanup);

it("QA: detail quantity flows into real cart state/storage and caps inventory", async () => {
  await renderPage();
  fireEvent.click(screen.getByRole("button", { name: "+" }));
  expect(screen.getByRole("spinbutton").value).toBe("2");
  expect(screen.getByRole("button", { name: "+" }).disabled).toBe(true);
  fireEvent.click(screen.getByTestId("add-to-cart"));
  fireEvent.click(screen.getByTestId("add-to-cart"));
  const cart = store.getState().commonSlide.cart;
  expect(cart.totalQuantity).toBe(2);
  expect(cart.totalPrice).toBe(90000);
  expect(cart.products[0].quantity).toBe(2);
  expect(getExpiringSessionItem(SESSION_KEYS.CART)).toEqual(cart);
});

it("QA: out-of-stock detail disables adding to cart", async () => {
  mocks.product = { ...mocks.product, inventory: 0 };
  await renderPage();
  expect(screen.getByTestId("add-to-cart").disabled).toBe(true);
  expect(store.getState().commonSlide.cart.products).toHaveLength(0);
});

it("QA: loading detail does not offer a purchase action", async () => {
  mocks.loading = true; mocks.product = null;
  const { container } = await renderPage();
  expect(screen.queryByTestId("add-to-cart")).toBeNull();
  expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  expect(container.querySelector(".product-detail-skeleton__image")).not.toBeNull();
  expect(container.querySelectorAll(".product-detail-skeleton__thumbnail")).toHaveLength(4);
});

it("guest cannot add from product detail", async () => {
  store.dispatch(clearAuth());
  await renderPage();
  fireEvent.click(screen.getByTestId("add-to-cart"));
  expect(store.getState().commonSlide.cart).toEqual(emptyCart);
  expect(window.sessionStorage.getItem(SESSION_KEYS.CART)).toBeNull();
});

it("guest cannot add a frequently-bought bundle", async () => {
  store.dispatch(clearAuth());
  mocks.frequent = [{ id: 2, name: "Táo", img: "/apple.png", price: 30000, inventory: 5 }];
  await renderPage();
  fireEvent.click(screen.getByRole("button", { name: /Thêm 1 sản phẩm vào giỏ/i }));
  expect(store.getState().commonSlide.cart).toEqual(emptyCart);
  expect(window.sessionStorage.getItem(SESSION_KEYS.CART)).toBeNull();
});
