import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import store from "../../../redux/store";
import { CART_SESSION_TTL_MS, SESSION_KEYS } from "utils/constant";
import { setExpiringSessionItem } from "utils/session";
import "../../../i18n";
import CheckoutPage from ".";
import * as orderApi from "api/orderPage";
import { clearAuth, setAuthenticatedUser } from "../../../redux/authSlice";

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
    vi.restoreAllMocks();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createStorageMock(),
    });
    window.localStorage.clear();
    window.localStorage.setItem("lang", "vi");
    window.sessionStorage.clear();
    store.dispatch(clearAuth());
    store.dispatch(setAuthenticatedUser({ id: 1, role: "customer", email_verified_at: "2026-09-24T00:00:00Z" }));
    setExpiringSessionItem(SESSION_KEYS.CART_OWNER, 1, CART_SESSION_TTL_MS);
    setExpiringSessionItem(
      SESSION_KEYS.CART,
      {
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
      },
      CART_SESSION_TTL_MS
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

  it("submits a valid order only once when the form fires twice", async () => {
    const postOrder = vi
      .spyOn(orderApi, "postOrderAPI")
      .mockReturnValue(new Promise(() => {}));
    const { container } = renderCheckout();

    fireEvent.change(container.querySelector('input[name="customer_name"]'), {
      target: { value: "Nguyen Van A" },
    });
    fireEvent.change(container.querySelector('input[name="address"]'), {
      target: { value: "123 Nguyen Trai, Can Tho" },
    });
    fireEvent.change(container.querySelector('input[name="customer_phone"]'), {
      target: { value: "0900000000" },
    });
    fireEvent.change(container.querySelector('input[name="email"]'), {
      target: { value: "customer@example.test" },
    });

    const form = screen.getByTestId("place-order").closest("form");
    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => expect(postOrder).toHaveBeenCalledTimes(1));
  });
});
