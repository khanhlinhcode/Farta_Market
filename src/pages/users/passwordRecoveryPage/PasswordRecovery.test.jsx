import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import PasswordRecoveryPage from ".";

const mocks = vi.hoisted(() => ({
  forgot: vi.fn(),
  reset: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("api/auth", () => ({
  forgotPasswordAPI: mocks.forgot,
  resetPasswordAPI: mocks.reset,
}));
vi.mock("react-hot-toast", () => ({ default: { success: mocks.toast } }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const renderPage = (entry, mode) => render(
  <MemoryRouter initialEntries={[entry]}>
    <Routes>
      <Route path="/forgot-password" element={<PasswordRecoveryPage mode={mode} />} />
      <Route path="/reset-password" element={<PasswordRecoveryPage mode={mode} />} />
      <Route path="/dang-nhap" element={<h1>login-destination</h1>} />
    </Routes>
  </MemoryRouter>
);

beforeEach(() => {
  mocks.forgot.mockReset();
  mocks.reset.mockReset();
  mocks.toast.mockReset();
});

it("submits a generic forgot-password request without storing account data", async () => {
  mocks.forgot.mockResolvedValue({ message: "accepted" });
  const localWrite = vi.spyOn(Storage.prototype, "setItem");

  renderPage("/forgot-password", "forgot");
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "customer@example.test" } });
  fireEvent.click(screen.getByRole("button", { name: "auth.sendResetLink" }));

  await waitFor(() => expect(mocks.forgot).toHaveBeenCalledWith({ email: "customer@example.test" }));
  expect(screen.getByRole("status")).toHaveTextContent("auth.forgotPasswordSent");
  expect(localWrite).not.toHaveBeenCalled();
  localWrite.mockRestore();
});

it("resets a strong password, keeps credentials in memory only, and returns to login", async () => {
  mocks.reset.mockResolvedValue({ message: "reset" });
  const localWrite = vi.spyOn(Storage.prototype, "setItem");
  const sessionWrite = vi.spyOn(window.sessionStorage, "setItem");

  renderPage("/reset-password?token=one-time-token&email=customer%40example.test", "reset");
  fireEvent.change(screen.getByLabelText("auth.newPassword"), { target: { value: "NewPass456" } });
  fireEvent.change(screen.getByLabelText("auth.passwordConfirmation"), { target: { value: "NewPass456" } });
  fireEvent.click(screen.getByRole("button", { name: "auth.resetPasswordButton" }));

  await waitFor(() => expect(screen.getByRole("heading", { name: "login-destination" })).toBeInTheDocument());
  expect(mocks.reset).toHaveBeenCalledWith({
    email: "customer@example.test",
    password: "NewPass456",
    password_confirmation: "NewPass456",
    token: "one-time-token",
  });
  expect(localWrite).not.toHaveBeenCalled();
  expect(sessionWrite).not.toHaveBeenCalled();
  localWrite.mockRestore();
  sessionWrite.mockRestore();
});

it("rejects weak or mismatched passwords before contacting the API", () => {
  renderPage("/reset-password?token=one-time-token&email=customer%40example.test", "reset");

  fireEvent.change(screen.getByLabelText("auth.newPassword"), { target: { value: "aaaaaaaa" } });
  fireEvent.change(screen.getByLabelText("auth.passwordConfirmation"), { target: { value: "aaaaaaaa" } });
  fireEvent.click(screen.getByRole("button", { name: "auth.resetPasswordButton" }));
  expect(screen.getByRole("alert")).toHaveTextContent("auth.passwordHint");

  fireEvent.change(screen.getByLabelText("auth.newPassword"), { target: { value: "NewPass456" } });
  fireEvent.change(screen.getByLabelText("auth.passwordConfirmation"), { target: { value: "Different456" } });
  fireEvent.click(screen.getByRole("button", { name: "auth.resetPasswordButton" }));
  expect(screen.getByRole("alert")).toHaveTextContent("auth.passwordMismatch");
  expect(mocks.reset).not.toHaveBeenCalled();
});

it("fails closed when the reset link has no token", () => {
  renderPage("/reset-password?email=customer%40example.test", "reset");

  expect(screen.getByRole("alert")).toHaveTextContent("auth.resetLinkInvalid");
  expect(screen.getByRole("button", { name: "auth.resetPasswordButton" })).toBeDisabled();
});

it("shows a server validation error next to the password field", async () => {
  mocks.reset.mockRejectedValue({
    response: { data: { errors: { password: ["Password was found in a breach."] } } },
  });
  renderPage("/reset-password?token=one-time-token&email=customer%40example.test", "reset");
  fireEvent.change(screen.getByLabelText("auth.newPassword"), { target: { value: "NewPass456" } });
  fireEvent.change(screen.getByLabelText("auth.passwordConfirmation"), { target: { value: "NewPass456" } });
  fireEvent.click(screen.getByRole("button", { name: "auth.resetPasswordButton" }));

  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Password was found in a breach."));
  expect(screen.getByLabelText("auth.newPassword")).toHaveAttribute("aria-invalid", "true");
});
