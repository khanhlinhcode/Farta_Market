import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SearchBar from "./index";

const mocks = vi.hoisted(() => ({
  suggestions: vi.fn(),
  navigate: vi.fn(),
  location: { pathname: "/", search: "" },
}));
vi.mock("api/homePage", () => ({ getProductSuggestionsAPI: mocks.suggestions }));
vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
  useLocation: () => mocks.location,
  generatePath: (path, params) => path.replace(":id", params.id),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
vi.mock("utils/i18nLabels", () => ({
  translateProductName: (product) => product.name,
}));

const cam = { id: 1, name: "Cam QA", price: 45000 };
const tao = { id: 2, name: "Táo QA", price: 55000 };
const deferred = () => {
  let resolve;
  const promise = new Promise((r) => { resolve = r; });
  return { promise, resolve };
};
const type = (value) => fireEvent.change(screen.getByRole("textbox"), { target: { value } });
const tick = () => act(() => vi.advanceTimersByTime(300));
const resolve = async (request, data) => {
  await act(async () => { request.resolve({ data }); await request.promise; });
};

beforeEach(() => {
  vi.useFakeTimers();
  mocks.suggestions.mockReset();
  mocks.navigate.mockReset();
  mocks.location = { pathname: "/", search: "" };
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

it("QA: rapid input fetches only the last keyword at 300ms", async () => {
  mocks.suggestions.mockResolvedValue({ data: [tao] });
  render(<SearchBar />);
  type("cam"); type("tao");
  act(() => vi.advanceTimersByTime(299));
  expect(mocks.suggestions).not.toHaveBeenCalled();
  await act(async () => { vi.advanceTimersByTime(1); });
  expect(mocks.suggestions).toHaveBeenCalledTimes(1);
  expect(mocks.suggestions).toHaveBeenCalledWith("tao");
});

it("QA: clearing input before deadline cancels its timer", () => {
  render(<SearchBar />);
  type("cam"); type(""); tick();
  expect(mocks.suggestions).not.toHaveBeenCalled();
});

it("QA: unmount before deadline cancels its timer", () => {
  const view = render(<SearchBar />);
  type("cam"); view.unmount(); tick();
  expect(mocks.suggestions).not.toHaveBeenCalled();
});

it("QA: an older response cannot overwrite a newer response", async () => {
  const old = deferred(), next = deferred();
  mocks.suggestions.mockReturnValueOnce(old.promise).mockReturnValueOnce(next.promise);
  render(<SearchBar />);
  type("cam"); tick(); type("tao"); tick();
  await resolve(next, [tao]); await resolve(old, [cam]);
  expect(screen.queryByRole("button", { name: /Cam QA/ })).toBeNull();
  expect(screen.getByRole("button", { name: /Táo QA/ })).toBeTruthy();
});

it("QA: clearing an in-flight search must invalidate its response", async () => {
  const old = deferred();
  mocks.suggestions.mockReturnValueOnce(old.promise);
  render(<SearchBar />);
  type("cam"); tick(); type("");
  await resolve(old, [cam]);
  type("tao");
  expect(screen.queryByRole("button", { name: /Cam QA/ })).toBeNull();
});

it("QA: changing location must invalidate an in-flight search", async () => {
  const old = deferred();
  mocks.suggestions.mockReturnValueOnce(old.promise);
  const view = render(<SearchBar qaVersion={1} />);
  type("cam"); tick();
  mocks.location = { pathname: "/san-pham", search: "?q=tao" };
  view.rerender(<SearchBar qaVersion={2} />);
  await resolve(old, [cam]);
  expect(screen.getByRole("textbox").value).toBe("tao");
  expect(screen.queryByRole("button", { name: /Cam QA/ })).toBeNull();
});
