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
  const persistedOrder = await page.evaluate(() => ({
    local: localStorage.getItem("farta_last_order_success"),
    session: sessionStorage.getItem("farta_last_order_success"),
    allValues: JSON.stringify({
      local: Object.values(localStorage),
      session: Object.values(sessionStorage),
    }),
  }));
  expect(persistedOrder.local).toBeNull();
  expect(persistedOrder.session).toBeNull();
  expect(persistedOrder.allValues).not.toContain("test@example.com");
  expect(persistedOrder.allValues).not.toContain("0901234567");
  expect(persistedOrder.allValues).not.toContain("123 Đường Test");
});

test("a forged payment success URL cannot clear an unverified cart", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("cart", JSON.stringify({
    expiresAt: Date.now() + 60 * 60 * 1000,
    value: {
      products: [{ product: { id: 1, name: "Session cart", price: 1, inventory: 10 }, quantity: 2 }],
      totalPrice: 2,
      totalQuantity: 2,
    },
  })));
  await page.goto("/dat-hang-thanh-cong?orderId=999999&payment=vnpay");
  await expect(page.locator(".order-success__panel")).toContainText("Chưa xác minh được đơn hàng hoặc thanh toán");
  const cart = await page.evaluate(() => JSON.parse(sessionStorage.getItem("cart") || "null")?.value);
  expect(cart.totalQuantity).toBe(2);
});

test("checkout sends identifiers and server returns the canonical product price", async ({ page }) => {
  await page.goto("/san-pham/chi-tiet/1");
  await page.getByTestId("add-to-cart").click();
  await page.goto("/thanh-toan");
  await page.fill('[name="customer_name"]', "Canonical Price QA");
  await page.fill('[name="customer_phone"]', "0901234567");
  await page.fill('[name="address"]', "123 Đường Test, Quận 1, TP.HCM");
  await page.fill('[name="email"]', "canonical@example.test");
  const responsePromise = page.waitForResponse(response => response.url().endsWith("/api/order") && response.request().method() === "POST");
  await page.getByTestId("place-order").click();
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(Number(body.data.details[0].unit_price)).toBeGreaterThan(1);
  expect(Number(body.data.grand_total)).toBeGreaterThan(Number(body.data.details[0].quantity));
});
