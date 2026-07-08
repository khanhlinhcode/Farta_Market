import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../i18n";
import i18n from "../../i18n";

const { addToCartMock, axiosMock } = vi.hoisted(() => ({
  addToCartMock: vi.fn(),
  axiosMock: vi.fn(),
}));

vi.mock("hooks/useShoppingCart", () => ({
  default: () => ({
    addToCart: addToCartMock,
  }),
}));

vi.mock("api/axios", () => ({
  default: axiosMock,
}));

import ChatWidget from ".";

const jsonResponse = (data, options = {}) => ({
  ok: options.ok ?? true,
  status: options.status ?? 200,
  json: async () => data,
});

describe("ChatWidget", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("vi");
    addToCartMock.mockReset();
    axiosMock.mockReset();
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("checks server health and does not show a fake unread badge", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ status: "online" })
    );

    const { container } = render(<ChatWidget />);

    expect(container.querySelector(".chat-widget__badge")).toBeNull();

    await userEvent.click(
      screen.getByRole("button", { name: "Farta Assistant" })
    );

    expect(await screen.findByText("Đang trực tuyến")).toBeInTheDocument();
  });

  it("does not send the local welcome message as chat history", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ status: "online" })
    );
    axiosMock.mockResolvedValue({ reply: "Cam tươi có giá 50.000đ." });

    render(<ChatWidget />);

    await userEvent.click(
      screen.getByRole("button", { name: "Farta Assistant" })
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Nhập câu hỏi..." }),
      "Cam tươi giá bao nhiêu?"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Gửi tin nhắn" })
    );

    await screen.findByText("Cam tươi có giá 50.000đ.");

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/chat",
        method: "POST",
        data: {
          message: "Cam tươi giá bao nhiêu?",
          history: [],
        },
      })
    );
  });

  it("aborts a slow chat request and allows the UI to recover", async () => {
    const nativeSetTimeout = window.setTimeout.bind(window);
    vi.spyOn(window, "setTimeout").mockImplementation((callback, delay, ...args) => {
      if (delay === 30000) {
        return nativeSetTimeout(callback, 0, ...args);
      }

      return nativeSetTimeout(callback, delay, ...args);
    });
    vi.spyOn(globalThis, "fetch").mockImplementation((url, options = {}) => {
      if (String(url).endsWith("/chat/health")) {
        return Promise.resolve(jsonResponse({ status: "online" }));
      }

      return new Promise((resolve, reject) => {
        const rejectAbort = () =>
          reject(new DOMException("The operation was aborted", "AbortError"));

        if (options.signal?.aborted) {
          rejectAbort();
          return;
        }

        options.signal?.addEventListener("abort", rejectAbort, { once: true });
      });
    });
    axiosMock.mockImplementation(({ signal }) => {
      return new Promise((resolve, reject) => {
        const rejectAbort = () =>
          reject(new DOMException("The operation was aborted", "AbortError"));

        if (signal?.aborted) {
          rejectAbort();
          return;
        }

        signal?.addEventListener("abort", rejectAbort, { once: true });
      });
    });

    render(<ChatWidget />);
    await userEvent.click(
      screen.getByRole("button", { name: "Farta Assistant" })
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Nhập câu hỏi..." }),
      "Xin chào"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Gửi tin nhắn" })
    );

    expect(
      await screen.findByText(
        "Trợ lý phản hồi quá lâu. Vui lòng gửi lại câu hỏi."
      )
    ).toBeInTheDocument();
    await userEvent.type(
      screen.getByRole("textbox", { name: "Nhập câu hỏi..." }),
      "Thử lại"
    );
    expect(
      screen.getByRole("button", { name: "Gửi tin nhắn" })
    ).not.toBeDisabled();
  });

  it("adds a product to the cart when the chat API returns an add_to_cart action", async () => {
    const product = {
      id: 1,
      name: "Cam Tươi",
      img: "/cam.png",
      price: 45000,
      inventory: 30,
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ status: "online" })
    );
    axiosMock.mockResolvedValue({
      reply: "Đã thêm 2 Cam Tươi vào giỏ hàng.",
      action: {
        type: "add_to_cart",
        product_id: 1,
        quantity: 2,
        product,
      },
    });

    render(<ChatWidget />);

    await userEvent.click(
      screen.getByRole("button", { name: "Farta Assistant" })
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Nhập câu hỏi..." }),
      "đặt cho tôi 2 quả cam"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Gửi tin nhắn" })
    );

    await screen.findByText("Đã thêm 2 Cam Tươi vào giỏ hàng.");

    expect(addToCartMock).toHaveBeenCalledWith(product, 2);
  });
});
