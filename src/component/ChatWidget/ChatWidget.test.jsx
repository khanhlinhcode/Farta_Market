import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../i18n";
import i18n from "../../i18n";
import { Provider } from "react-redux";
import store from "../../redux/store";

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
    addToCartMock.mockReturnValue({ addedCount: 2, totalQuantity: 2, maxInventory: 30 });
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

    const { container } = render(<Provider store={store}><ChatWidget /></Provider>);

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

    render(<Provider store={store}><ChatWidget /></Provider>);

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
          cart: [],
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

    render(<Provider store={store}><ChatWidget /></Provider>);
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

  it("adds a verified product only after the user clicks the suggested action", async () => {
    const product = {
      id: 1,
      name: "Cam Tươi",
      image_url: "/cam.png",
      price: 45000,
      inventory: 30,
      inventory_status: "in_stock",
      category: { id: 2, name: "Trái Cây" },
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ status: "online" })
    );
    axiosMock.mockResolvedValue({
      message: "Hãy xác nhận để thêm 2 Cam Tươi vào giỏ.",
      products: [product],
      suggested_actions: [{ type: "ADD_TO_CART", product_id: 1, quantity: 2 }],
    });

    render(<Provider store={store}><ChatWidget /></Provider>);

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

    await screen.findByText("Hãy xác nhận để thêm 2 Cam Tươi vào giỏ.");
    expect(addToCartMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Thêm 2 vào giỏ" }));

    expect(addToCartMock).toHaveBeenCalledWith({
      id: 1,
      name: "Cam Tươi",
      img: "/cam.png",
      price: 45000,
      inventory: 30,
      category_id: 2,
      category: { id: 2, name: "Trái Cây" },
    }, 2);
  });

  it("renders verified product cards without deriving commerce data from prose", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ status: "online" }));
    axiosMock.mockResolvedValue({
      message: "Sản phẩm phù hợp trong danh mục: Trà Nhẹ.",
      products: [{
        id: 7,
        name: "Trà Nhẹ",
        image_url: "/tea.png",
        price: 75000,
        inventory: 6,
        inventory_status: "in_stock",
        category: { id: 3, name: "Đồ uống" },
      }],
      suggested_actions: [],
    });

    render(<Provider store={store}><ChatWidget /></Provider>);
    await userEvent.click(screen.getByRole("button", { name: "Farta Assistant" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Nhập câu hỏi..." }), "Gợi ý trà nhẹ");
    await userEvent.click(screen.getByRole("button", { name: "Gửi tin nhắn" }));

    expect(await screen.findByTestId("chat-product-card")).toHaveTextContent("Trà Nhẹ");
    expect(screen.getByTestId("chat-product-card")).toHaveTextContent("75.000 ₫");
    expect(screen.getByTestId("chat-product-card")).toHaveTextContent("Còn 6 sản phẩm");
  });

  it("shows a recoverable provider error and retries the same question", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ status: "online" }));
    axiosMock
      .mockRejectedValueOnce({ response: { status: 503 } })
      .mockResolvedValueOnce({ message: "Đã kết nối lại.", products: [], suggested_actions: [] });

    render(<Provider store={store}><ChatWidget /></Provider>);
    await userEvent.click(screen.getByRole("button", { name: "Farta Assistant" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Nhập câu hỏi..." }), "Gợi ý bữa sáng");
    await userEvent.click(screen.getByRole("button", { name: "Gửi tin nhắn" }));

    expect(await screen.findByText("Trợ lý AI đang tạm gián đoạn. Vui lòng thử lại sau.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText("Đã kết nối lại.")).toBeInTheDocument();
    expect(axiosMock).toHaveBeenCalledTimes(2);
    expect(axiosMock.mock.calls[1][0].data.message).toBe("Gợi ý bữa sáng");
  });

  it("renders a no-results response without an empty product shell", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ status: "online" }));
    axiosMock.mockResolvedValue({
      message: "Farta Market chưa có thông tin phù hợp.",
      products: [],
      suggested_actions: [],
    });

    render(<Provider store={store}><ChatWidget /></Provider>);
    await userEvent.click(screen.getByRole("button", { name: "Farta Assistant" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Nhập câu hỏi..." }), "Robot vũ trụ");
    await userEvent.click(screen.getByRole("button", { name: "Gửi tin nhắn" }));

    expect(await screen.findByText("Farta Market chưa có thông tin phù hợp.")).toBeInTheDocument();
    expect(screen.queryByTestId("chat-product-card")).toBeNull();
  });

  it("fails closed on a malformed response and offers retry", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ status: "online" }));
    axiosMock.mockResolvedValue({ message: "", products: [{ id: 1 }] });

    render(<Provider store={store}><ChatWidget /></Provider>);
    await userEvent.click(screen.getByRole("button", { name: "Farta Assistant" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Nhập câu hỏi..." }), "Xin chào");
    await userEvent.click(screen.getByRole("button", { name: "Gửi tin nhắn" }));

    expect(await screen.findByText("Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeEnabled();
    expect(addToCartMock).not.toHaveBeenCalled();
  });
});
