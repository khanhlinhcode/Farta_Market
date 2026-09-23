import "@testing-library/jest-dom/vitest";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import authReducer from "../../../redux/authSlice";
import VerifyEmailPage from ".";

const mocks = vi.hoisted(() => ({
  status: vi.fn(),
  resend: vi.fn(),
}));

vi.mock("api/auth", () => ({
  getEmailVerificationStatusAPI: mocks.status,
  resendEmailVerificationAPI: mocks.resend,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const renderPage = (entry = "/verify-email") => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: { user: { id: 7, role: "customer" }, isBootstrapped: true },
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[entry]}>
        <VerifyEmailPage />
      </MemoryRouter>
    </Provider>
  );

  return store;
};

beforeEach(() => {
  mocks.status.mockReset();
  mocks.resend.mockReset();
});

it("shows an expired-session state and clears stale authentication after a 401", async () => {
  mocks.status.mockRejectedValue({ response: { status: 401 } });
  const store = renderPage();

  expect(await screen.findByRole("heading", { name: "auth.verificationSessionExpired" }))
    .toBeInTheDocument();
  expect(screen.getByRole("link", { name: "auth.backToLogin" }))
    .toHaveAttribute("href", "/dang-nhap");
  expect(screen.queryByRole("button", { name: "auth.resendVerification" }))
    .not.toBeInTheDocument();
  await waitFor(() => expect(store.getState().auth.user).toBeNull());
});

it("keeps the signed-link success result visible when no login session exists", async () => {
  mocks.status.mockRejectedValue({ response: { status: 401 } });
  renderPage("/verify-email?status=success");

  expect(await screen.findByRole("heading", { name: "auth.verificationSuccess" }))
    .toBeInTheDocument();
  expect(screen.queryByText("auth.verificationSessionExpiredDetail"))
    .not.toBeInTheDocument();
});
