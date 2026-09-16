import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import i18n from "../../i18n";
import ChatWidget from "./index";
import { Provider } from "react-redux";
import store from "../../redux/store";

const mocks = vi.hoisted(() => ({ axios: vi.fn(), addToCart: vi.fn() }));
vi.mock("api/axios", () => ({ default: mocks.axios }));
vi.mock("hooks/useShoppingCart", () => ({ default: () => ({ addToCart: mocks.addToCart }) }));

beforeEach(async () => {
  await i18n.changeLanguage("vi");
  vi.useFakeTimers();
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => ({ status: "online" }) });
  mocks.axios.mockImplementation(({ signal }) => new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
  }));
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

it("QA: the real 30-second widget deadline aborts and recovers the UI", async () => {
  await act(async () => { render(<Provider store={store}><ChatWidget /></Provider>); });
  fireEvent.click(screen.getByTestId("chat-bubble"));
  fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "Xin chào" } });
  fireEvent.click(screen.getByRole("button", { name: "Gửi tin nhắn" }));
  await act(async () => { await vi.advanceTimersByTimeAsync(30000); });
  expect(screen.getByText("Trợ lý phản hồi quá lâu. Vui lòng gửi lại câu hỏi.")).toBeTruthy();
  expect(mocks.axios.mock.calls[0][0].signal.aborted).toBe(true);
  fireEvent.change(screen.getByTestId("chat-input"), { target: { value: "Thử lại" } });
  expect(screen.getByRole("button", { name: "Gửi tin nhắn" }).disabled).toBe(false);
});
