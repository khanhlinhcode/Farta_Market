import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SafeHtml from ".";

describe("SafeHtml", () => {
  it("keeps safe product markup and removes executable XSS content", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const { container } = render(
      <SafeHtml
        html={'<strong>Cam</strong><img src="x" onerror="alert(1)"><script>alert(2)</script>'}
      />
    );

    expect(container.querySelector("strong")).toHaveTextContent("Cam");
    expect(container.querySelector("img")).not.toHaveAttribute("onerror");
    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("strips javascript: protocol", () => {
    const { container } = render(
      <SafeHtml html={'<a href="javascript:alert(1)">click</a>'} />
    );
    const link = container.querySelector("a");

    expect(link?.href).not.toMatch(/^javascript:/i);
  });

  it("strips iframe tags", () => {
    const { container } = render(
      <SafeHtml html={'<iframe src="https://example.com"></iframe>'} />
    );

    expect(container.querySelector("iframe")).toBeNull();
  });
});
