import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import store from "../../../redux/store";
import { SESSION_KEYS } from "utils/constant";
import "../../../i18n";
import CheckoutPage from ".";

const createStorageMock = () => {
  const values = new Map();

  return {
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
};

const renderCheckout = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CheckoutPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
};

describe("CheckoutFlow", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createStorageMock(),
    });
    window.localStorage.clear();
    window.localStorage.setItem("lang", "vi");
    window.sessionStorage.clear();
    window.localStorage.setItem(
      SESSION_KEYS.CART,
      JSON.stringify({
        products: [
          {
            product: {
              id: 1,
              name: "Cam Tươi",
              price: 45000,
              inventory: 10,
            },
            quantity: 1,
          },
        ],
        totalPrice: 45000,
        totalQuantity: 1,
      })
    );
  });

  it("shows an address error when submitting without address", async () => {
    renderCheckout();

    await userEvent.click(screen.getByRole("button", { name: "Đặt hàng" }));

    expect(screen.getByText("Vui lòng nhập địa chỉ")).toBeInTheDocument();
  });

  it("does not display a fake coupon or discount", () => {
    renderCheckout();

    expect(screen.queryByText("SVC783")).not.toBeInTheDocument();
    expect(screen.queryByText("Giảm giá")).not.toBeInTheDocument();
    expect(screen.getAllByText(/45\.000/).length).toBeGreaterThan(0);
  });
});
