import "@testing-library/jest-dom/vitest";
import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import store from "../../redux/store";
import { calculateCart, setCart } from "../../redux/cartSlice";
import { clearAuth, setAuthenticatedUser } from "../../redux/authSlice";
import i18n from "../../i18n";
import ChatWidget from ".";
import { CART_SESSION_TTL_MS, SESSION_KEYS } from "utils/constant";
import { getExpiringSessionItem, setExpiringSessionItem } from "utils/session";

const mocks = vi.hoisted(() => ({ api: vi.fn(), success: vi.fn(), error: vi.fn(), notice: vi.fn() }));
vi.mock("api/axios", () => ({ default: mocks.api }));
vi.mock("react-hot-toast", () => ({ default: Object.assign(mocks.notice, { success: mocks.success, error: mocks.error }) }));

const product = { id: 1, name: "Cam Tươi", img: "/cam.png", price: 45000, inventory: 30 };
const verifiedProduct = {
  id: 1,
  slug: "cam-tuoi",
  name: "Cam Tươi",
  image_url: "/cam.png",
  price: 45000,
  inventory: 30,
  inventory_status: "in_stock",
  category: { id: 1, name: "Trái Cây" },
};
const proposal = (message = "Hãy xác nhận để thêm 2 Cam Tươi vào giỏ.") => ({
  message,
  products: [verifiedProduct],
  suggested_actions: [{ type: "ADD_TO_CART", product_id: 1, quantity: 2 }],
});
const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
};

beforeEach(async () => {
  vi.clearAllMocks();
  Object.defineProperty(window, "localStorage", { configurable: true, value: storage() });
  Object.defineProperty(window, "sessionStorage", { configurable: true, value: storage() });
  store.dispatch(setCart(calculateCart([])));
  store.dispatch(clearAuth());
  store.dispatch(setAuthenticatedUser({
    id: 1,
    role: "customer",
    email_verified_at: "2026-09-24T00:00:00Z",
  }));
  setExpiringSessionItem(SESSION_KEYS.CART_OWNER, 1, CART_SESSION_TTL_MS);
  await i18n.changeLanguage("vi");
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => ({ status: "online" }) });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const send = async () => {
  render(<Provider store={store}><ChatWidget /></Provider>);
  fireEvent.click(screen.getByRole("button", { name: "Farta Assistant" }));
  fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "mua 2 Cam Tươi" } });
  fireEvent.click(screen.getByRole("button", { name: i18n.t("chat.send") }));
  await waitFor(() => expect(document.querySelector(".chat-widget__messages")).toHaveAttribute("aria-busy", "false"));
};

it("does not mutate the cart until the user confirms the proposed action", async () => {
  mocks.api.mockResolvedValue(proposal());
  await send();

  expect(store.getState().commonSlide.cart.totalQuantity).toBe(0);
  fireEvent.click(screen.getByRole("button", { name: "Thêm 2 Cam Tươi vào giỏ hàng" }));

  expect(store.getState().commonSlide.cart.totalQuantity).toBe(2);
  expect(screen.getByText("Đã thêm 2 Cam Tươi vào giỏ hàng.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Đã thêm" })).toBeDisabled();
});

it.each([29, 30])("reports the real cart delta when %i units already exist", async (existingQuantity) => {
  const previous = calculateCart([{ product, quantity: existingQuantity }]);
  setExpiringSessionItem(SESSION_KEYS.CART, previous, CART_SESSION_TTL_MS);
  store.dispatch(setCart(previous));
  mocks.api.mockResolvedValue(proposal());
  await send();
  fireEvent.click(screen.getByRole("button", { name: "Thêm 2 Cam Tươi vào giỏ hàng" }));

  const cart = getExpiringSessionItem(SESSION_KEYS.CART);
  const added = 30 - existingQuantity;
  expect(cart.totalQuantity).toBe(30);
  expect(screen.getByText(i18n.t(added === 0 ? "chat.cartLimit" : "chat.cartPartial", {
    count: added,
    name: product.name,
    limit: 30,
  }))).toBeInTheDocument();
});

it("sends only product IDs and quantities as cart context", async () => {
  const previous = calculateCart([{ product: { ...product, secret: "ignore-me" }, quantity: 3 }]);
  setExpiringSessionItem(SESSION_KEYS.CART, previous, CART_SESSION_TTL_MS);
  store.dispatch(setCart(previous));
  mocks.api.mockResolvedValue({ message: "Giỏ hàng đã xác minh.", products: [], suggested_actions: [] });
  await send();

  expect(mocks.api.mock.calls[0][0].data.cart).toEqual([{ product_id: 1, quantity: 3 }]);
  expect(JSON.stringify(mocks.api.mock.calls[0][0].data.cart)).not.toContain("secret");
});

it("renders assistant content as text rather than executable HTML", async () => {
  const reply = '<img src=x onerror="alert(1)">';
  mocks.api.mockResolvedValue({ message: reply, products: [], suggested_actions: [] });
  const { container } = render(<Provider store={store}><ChatWidget /></Provider>);
  fireEvent.click(screen.getByRole("button", { name: "Farta Assistant" }));
  fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "Xin chào" } });
  fireEvent.click(screen.getByRole("button", { name: "Gửi tin nhắn" }));
  expect(await screen.findByText(reply)).toBeInTheDocument();
  expect(container.querySelector(".chat-widget__message img")).toBeNull();
});

it("a response received after unmount cannot mutate Redux or storage", async () => {
  let resolve;
  mocks.api.mockImplementation(() => new Promise(done => { resolve = done; }));
  const view = render(<Provider store={store}><ChatWidget /></Provider>);
  fireEvent.click(screen.getByTestId("chat-bubble"));
  fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "mua 2 Cam Tươi" } });
  fireEvent.click(screen.getByRole("button", { name: i18n.t("chat.send") }));
  view.unmount();
  expect(mocks.api.mock.calls[0][0].signal.aborted).toBe(true);
  await act(async () => resolve(proposal()));
  expect(store.getState().commonSlide.cart.totalQuantity).toBe(0);
  expect(window.sessionStorage.getItem(SESSION_KEYS.CART)).toBeNull();
});

it("changing account aborts the previous conversation and ignores its late proposal", async () => {
  let resolve;
  mocks.api.mockImplementation(() => new Promise(done => { resolve = done; }));
  render(<Provider store={store}><ChatWidget /></Provider>);
  fireEvent.click(screen.getByTestId("chat-bubble"));
  fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "mua 2 Cam Tươi" } });
  fireEvent.click(screen.getByRole("button", { name: i18n.t("chat.send") }));
  await act(async () => store.dispatch(setAuthenticatedUser({
    id: 2,
    role: "customer",
    email_verified_at: "2026-09-23T00:00:00Z",
  })));
  expect(mocks.api.mock.calls[0][0].signal.aborted).toBe(true);
  await act(async () => resolve(proposal()));
  expect(store.getState().commonSlide.cart.totalQuantity).toBe(0);
  expect(screen.queryByText("mua 2 Cam Tươi")).toBeNull();
});

it("keeps a guest cart empty, sends no cart context, and offers a login CTA", async () => {
  store.dispatch(clearAuth());
  const stale = calculateCart([{ product, quantity: 3 }]);
  setExpiringSessionItem(SESSION_KEYS.CART, stale, CART_SESSION_TTL_MS);
  setExpiringSessionItem(SESSION_KEYS.CART_OWNER, 1, CART_SESSION_TTL_MS);
  store.dispatch(setCart(stale));
  window.history.replaceState({}, "", "/san-pham/chi-tiet/1");
  mocks.api.mockResolvedValue({
    ...proposal("Vui lòng đăng nhập để thêm sản phẩm vào giỏ."),
    suggested_actions: [],
    auth: { required: true, reason: "cart_mutation" },
  });

  await send();

  expect(mocks.api.mock.calls[0][0].data.cart).toEqual([]);
  expect(store.getState().commonSlide.cart.totalQuantity).toBe(0);
  expect(window.sessionStorage.getItem(SESSION_KEYS.CART)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Đăng nhập để thêm Cam Tươi vào giỏ hàng" }));
  expect(window.location.pathname).toBe("/dang-nhap");
  expect(new URLSearchParams(window.location.search).get("redirect")).toBe("/san-pham/chi-tiet/1");
});

it("cannot execute a stale suggested action after logout", async () => {
  mocks.api.mockResolvedValue(proposal());
  await send();
  expect(screen.getByRole("button", { name: "Thêm 2 Cam Tươi vào giỏ hàng" })).toBeEnabled();

  await act(async () => store.dispatch(clearAuth()));

  expect(screen.queryByRole("button", { name: "Thêm 2 Cam Tươi vào giỏ hàng" })).toBeNull();
  expect(store.getState().commonSlide.cart.totalQuantity).toBe(0);
});
