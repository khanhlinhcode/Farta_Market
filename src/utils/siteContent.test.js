import { describe, expect, it } from "vitest";
import { isExternalUrl, localizedValue } from "./siteContent";

describe("site content helpers", () => {
  it("uses the current locale and falls back to the other CMS locale", () => {
    const content = { title_vi: "Tiêu đề", title_en: "" };
    expect(localizedValue(content, "title", "vi")).toBe("Tiêu đề");
    expect(localizedValue(content, "title", "en-US")).toBe("Tiêu đề");
    expect(localizedValue({}, "title", "vi", "Mặc định")).toBe("Mặc định");
  });

  it("only treats HTTPS links as external CMS links", () => {
    expect(isExternalUrl("https://example.com")).toBe(true);
    expect(isExternalUrl("http://example.com")).toBe(false);
    expect(isExternalUrl("/san-pham")).toBe(false);
  });
});
