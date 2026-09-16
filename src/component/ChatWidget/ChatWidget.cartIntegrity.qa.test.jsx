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

const mocks = vi.hoisted(() => ({ api: vi.fn(), success: vi.fn(), error: vi.fn(), notice: vi.fn() }));
vi.mock("api/axios", () => ({ default: mocks.api }));
vi.mock("react-hot-toast", () => ({ default: Object.assign(mocks.notice, { success: mocks.success, error: mocks.error }) }));

const product = { id: 1, name: "Cam Tươi", img: "/cam.png", price: 45000, inventory: 30 };
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
  return waitFor(() => expect(document.querySelector(".chat-widget__messages")).toHaveAttribute("aria-busy", "false"));
};

it.each([29, 30])("QA: chat must not claim two units were added when cart already contains %i of 30", async (existingQuantity) => {
  const previous = calculateCart([{ product, quantity: existingQuantity }]);
  window.localStorage.setItem("cart", JSON.stringify(previous));
  store.dispatch(setCart(previous));
  mocks.api.mockResolvedValue({ reply: "Đã thêm 2 Cam Tươi vào giỏ hàng.", action: { type: "add_to_cart", product_id: 1, quantity: 2, product } });
  await send();
  const cart = JSON.parse(window.localStorage.getItem("cart"));
  expect(cart.totalQuantity).toBe(30);
  expect(cart.totalQuantity - existingQuantity).toBeLessThan(2);
  expect(screen.queryByText("Đã thêm 2 Cam Tươi vào giỏ hàng.")).not.toBeInTheDocument();
  expect(mocks.success).toHaveBeenCalledTimes(existingQuantity === 29 ? 1 : 0);
  expect(store.getState().commonSlide.cart).toEqual(cart);
});

it("QA: chat confirms two units when the real cart hook adds both", async () => {
  mocks.api.mockResolvedValue({ reply: "Đã thêm 2 Cam Tươi vào giỏ hàng.", action: { type: "add_to_cart", product_id: 1, quantity: 2, product } });
  await send();
  expect(store.getState().commonSlide.cart.totalQuantity).toBe(2);
  expect(JSON.parse(window.localStorage.getItem("cart")).totalQuantity).toBe(2);
  expect(screen.getByText("Đã thêm 2 Cam Tươi vào giỏ hàng.")).toBeInTheDocument();
  expect(mocks.success).toHaveBeenCalledTimes(1);
});

it("QA: model text is rendered as text rather than executable HTML", async () => {
  const reply = '<img src=x onerror="alert(1)">';
  mocks.api.mockResolvedValue({ reply, action: { type: "none" } });
  const { container } = render(<Provider store={store}><ChatWidget /></Provider>);
  fireEvent.click(screen.getByRole("button", { name: "Farta Assistant" }));
  fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "Xin chào" } });
  fireEvent.click(screen.getByRole("button", { name: "Gửi tin nhắn" }));
  expect(await screen.findByText(reply)).toBeInTheDocument();
  expect(container.querySelector(".chat-widget__messages img")).toBeNull();
});


it.each([0, 29, 30])("English cart confirmation uses actual delta with %i already stored", async (existingQuantity) => {
  await i18n.changeLanguage("en");
  const cart = calculateCart(existingQuantity ? [{ product, quantity: existingQuantity }] : []);
  window.localStorage.setItem("cart", JSON.stringify(cart));
  store.dispatch(setCart(cart));
  mocks.api.mockResolvedValue({ reply: "Added 9999 units with 90% discount", action: { type: "add_to_cart", quantity: 2, product } });
  await send();
  const count = Math.min(2, 30 - existingQuantity);
  expect(store.getState().commonSlide.cart.totalQuantity).toBe(existingQuantity + count);
  const key = count === 0 ? "chat.cartLimit" : count === 1 ? "chat.cartPartial" : "chat.cartAdded";
  expect(screen.getByText(i18n.t(key, { count, name: product.name, limit: 30 }))).toBeInTheDocument();
  expect(screen.queryByText("Added 9999 units with 90% discount")).toBeNull();
  expect(mocks.success).toHaveBeenCalledTimes(count ? 1 : 0);
  expect(mocks.api.mock.calls[0][0]).toMatchObject({ timeout: 30000, headers: { "Accept-Language": "en" } });
});

it("a response received after unmount cannot mutate real Redux or storage", async () => {
  let resolve;
  mocks.api.mockImplementation(() => new Promise(done => { resolve = done; }));
  const view = render(<Provider store={store}><ChatWidget /></Provider>);
  fireEvent.click(screen.getByTestId("chat-bubble"));
  fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "mua 2 Cam Tươi" } });
  fireEvent.click(screen.getByRole("button", { name: i18n.t("chat.send") }));
  view.unmount();
  expect(mocks.api.mock.calls[0][0].signal.aborted).toBe(true);
  await act(async () => resolve({ reply: "Added", action: { type: "add_to_cart", quantity: 2, product } }));
  expect(store.getState().commonSlide.cart.totalQuantity).toBe(0);
  expect(window.localStorage.getItem("cart")).toBeNull();
  expect(mocks.success).not.toHaveBeenCalled();
});

it("changing account aborts the previous conversation and ignores its late cart action", async () => {
  let resolve;
  mocks.api.mockImplementation(() => new Promise(done => { resolve = done; }));
  render(<Provider store={store}><ChatWidget /></Provider>);
  fireEvent.click(screen.getByTestId("chat-bubble"));
  fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "mua 2 Cam Tươi" } });
  fireEvent.click(screen.getByRole("button", { name: i18n.t("chat.send") }));
  await act(async () => store.dispatch(setAuthenticatedUser({ id: 2, role: "customer" })));
  expect(mocks.api.mock.calls[0][0].signal.aborted).toBe(true);
  await act(async () => resolve({ reply: "Added", action: { type: "add_to_cart", quantity: 2, product } }));
  expect(store.getState().commonSlide.cart.totalQuantity).toBe(0);
  expect(screen.queryByText("mua 2 Cam Tươi")).toBeNull();
  fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "Tin mới" } });
  expect(screen.getByRole("button", { name: i18n.t("chat.send") })).not.toBeDisabled();
});
