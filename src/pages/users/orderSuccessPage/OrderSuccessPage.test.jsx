import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import i18n from "../../../i18n";
import OrderSuccessPage from "./index";

const mocks = vi.hoisted(() => ({
  clearCart: vi.fn(),
  getOrder: vi.fn(),
  getSepayStatus: vi.fn(),
}));

vi.mock("hooks/useShoppingCart", () => ({
  default: () => ({ clearCart: mocks.clearCart }),
}));

vi.mock("api/orderPage", () => ({
  getMyOrderAPI: mocks.getOrder,
  getSepayPaymentStatusAPI: mocks.getSepayStatus,
}));

const pendingOrder = {
  id: 42,
  payment_method: "sepay",
  payment_status: "pending",
  status: "pending",
  grand_total: "110000.00",
  address: "Da Nang City",
};

const payment = {
  amount: 110000,
  bank_code: "Vietcombank",
  account_number: "0010000000355",
  account_holder: "FARTA MARKET",
  reference: "FM42ABC123",
  expires_at: "2099-09-23T12:00:00+07:00",
  qr_url: "https://vietqr.app/img?acc=0010000000355",
};

const renderPage = () => render(
  <MemoryRouter
    initialEntries={[{
      pathname: "/dat-hang-thanh-cong",
      search: "?orderId=42&payment=sepay",
      state: { order: pendingOrder, payment },
    }]}
  >
    <OrderSuccessPage />
  </MemoryRouter>
);

beforeEach(async () => {
  await i18n.changeLanguage("vi");
  mocks.clearCart.mockReset();
  mocks.getOrder.mockReset();
  mocks.getSepayStatus.mockReset();
});

afterEach(cleanup);

it("shows a pending VietQR payment without clearing the cart", async () => {
  mocks.getSepayStatus.mockResolvedValue({ data: pendingOrder, payment });

  renderPage();

  expect(screen.getByRole("img", { name: "Mã VietQR thanh toán đơn hàng" }))
    .toHaveAttribute("src", payment.qr_url);
  expect(screen.getByText(payment.reference)).toBeInTheDocument();
  await waitFor(() => expect(mocks.getSepayStatus).toHaveBeenCalledWith("42", expect.any(Object)));
  expect(mocks.clearCart).not.toHaveBeenCalled();
});

it("clears the cart only after the server confirms the SePay payment", async () => {
  mocks.getSepayStatus.mockResolvedValue({
    data: { ...pendingOrder, payment_status: "paid", status: "confirmed" },
    payment,
  });

  renderPage();

  await waitFor(() => expect(mocks.clearCart).toHaveBeenCalledTimes(1));
  expect(screen.getByRole("heading", { name: "Đặt hàng thành công" })).toBeInTheDocument();
});
