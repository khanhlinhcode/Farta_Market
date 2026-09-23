import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import HomePage from ".";

vi.mock("api/homePage", () => ({
  useGetCategoriesUS: () => ({ isLoading: true, refetch: vi.fn() }),
  useGetProductsUS: () => ({ isLoading: true, refetch: vi.fn() }),
  useGetSiteContentUS: () => ({ isLoading: true }),
  useRecommendedProductsUS: () => ({ data: [] }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: { resolvedLanguage: "vi" },
    t: (key) => key,
  }),
}));

it("reserves the full home layout while API data is loading", () => {
  const { container } = render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );

  expect(screen.getByRole("main", { name: "common.loading" }))
    .toHaveAttribute("aria-busy", "true");
  expect(container.querySelectorAll(".homepage-loading__category")).toHaveLength(4);
  expect(container.querySelectorAll(".product-card-skeleton")).toHaveLength(4);
  expect(container.querySelectorAll(".homepage-loading__banner")).toHaveLength(2);
  expect(container.querySelector(".banner img")).not.toBeInTheDocument();
});
