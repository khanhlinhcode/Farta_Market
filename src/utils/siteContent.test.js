import { describe, expect, it } from "vitest";
import {
  DEFAULT_CUSTOMER_PHONE,
  isExternalUrl,
  localizedValue,
  resolveCustomerPhone,
} from "./siteContent";

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

  it("uses one canonical customer phone across public surfaces", () => {
    expect(
      resolveCustomerPhone({
        contact_phone: "0977232232",
        support_phone: "0393886668",
      })
    ).toBe("0393886668");
    expect(resolveCustomerPhone({ contact_phone: "0977232232" })).toBe(
      "0977232232"
    );
    expect(resolveCustomerPhone()).toBe(DEFAULT_CUSTOMER_PHONE);
  });
});
