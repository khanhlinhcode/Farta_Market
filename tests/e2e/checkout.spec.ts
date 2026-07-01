import { expect, test } from "@playwright/test";

test("user can complete purchase flow", async ({ page }) => {
  await page.goto("/san-pham?in_stock=1");
  await page.getByTestId("product-card").first().click();
  await page.getByTestId("add-to-cart").click();
  await page.goto("/gio-hang");
  await page.getByTestId("checkout-btn").click();
  await page.fill('[name="customer_name"]', "Test User");
  await page.fill('[name="customer_phone"]', "0901234567");
  await page.fill('[name="address"]', "123 Đường Test, Quận 1, TP.HCM");
  await page.fill('[name="email"]', "test@example.com");
  await page.getByTestId("place-order").click();
  await expect(page).toHaveURL(/dat-hang-thanh-cong/);
});
