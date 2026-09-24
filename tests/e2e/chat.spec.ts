import { expect, test } from "@playwright/test";

const apiBaseUrl = `http://127.0.0.1:${process.env.E2E_BACKEND_PORT || "8001"}/api`;
async function loginVerifiedCustomer(page) {
  await page.goto("/dang-nhap");
  await page.locator(".user-login__tabs").getByRole("button", { name: "Đăng nhập" }).click();
  await page.getByLabel("Email").fill("qa.customer@example.test");
  await page.locator('input[name="password"]').fill("SiviE2EPass123!");

  await Promise.all([
    page.waitForURL(url => url.pathname === "/"),
    page.locator(".user-login__form").getByRole("button", { name: "Đăng nhập" }).click(),
  ]);
}

test("chat responds to product query", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("chat-bubble").click();
  await page.getByTestId("chat-input").fill("Cam tươi còn không?");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("chat-message-bot").last()).toContainText(
    "Cam",
    { timeout: 15_000 }
  );
  await expect(page.getByTestId("chat-product-card").first()).toContainText("Cam");
});

test("guest product-card add redirects to login without creating a cart", async ({ page }) => {
  await page.goto("/");
  const firstProduct = page.locator(".featured__item").first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.hover();
  await firstProduct.getByRole("button", { name: "Thêm vào giỏ" }).click();

  await expect(page).toHaveURL(/\/dang-nhap\?redirect=%2F/);
  expect(await page.evaluate(() => window.sessionStorage.getItem("cart"))).toBeNull();
  expect(await page.evaluate(() => window.sessionStorage.getItem("farta_cart_owner"))).toBeNull();
});

test("verified product proposal changes the cart only after confirmation and becomes cart context", async ({ page }) => {
  await loginVerifiedCustomer(page);
  await page.getByTestId("chat-bubble").click();
  await page.getByTestId("chat-input").fill("Mua 2 Cam Tươi");
  await page.keyboard.press("Enter");

  const card = page.getByTestId("chat-product-card").last();
  await expect(card).toContainText("Cam Tươi", { timeout: 15_000 });
  await card.getByRole("button", { name: /Thêm 2 Cam Tươi vào giỏ hàng/i }).click();
  await expect(page.getByTestId("chat-message-bot").last()).toContainText("Đã thêm 2 Cam Tươi");

  await page.getByTestId("chat-input").fill("Trong giỏ của tôi có gì?");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("chat-message-bot").last()).toContainText("2 × Cam Tươi", { timeout: 15_000 });
});

test("rapid confirmation cannot add the same chat proposal twice", async ({ page }) => {
  await loginVerifiedCustomer(page);
  await page.getByTestId("chat-bubble").click();
  await page.getByTestId("chat-input").fill("Mua 2 Cam Tươi");
  await page.keyboard.press("Enter");

  const action = page.getByTestId("chat-product-card").last()
    .getByRole("button", { name: /Thêm 2 Cam Tươi vào giỏ hàng/i });
  await expect(action).toBeVisible({ timeout: 15_000 });
  await action.evaluate((button) => {
    button.click();
    button.click();
  });

  await expect(page.getByTestId("chat-message-bot").last()).toContainText("Đã thêm 2 Cam Tươi");
  const quantity = await page.evaluate(() => {
    const raw = window.sessionStorage.getItem("cart");
    if (!raw) return 0;
    const stored = JSON.parse(raw);
    const cart = stored?.value ?? stored;
    return cart?.totalQuantity ?? 0;
  });
  expect(quantity).toBe(2);
});

test("reload preserves the current owner cart and logout clears it", async ({ page }) => {
  await loginVerifiedCustomer(page);
  await page.getByTestId("chat-bubble").click();
  await page.getByTestId("chat-input").fill("Mua 2 Cam Tươi");
  await page.keyboard.press("Enter");
  const action = page.getByTestId("chat-product-card").last()
    .getByRole("button", { name: /Thêm 2 Cam Tươi vào giỏ hàng/i });
  await expect(action).toBeVisible({ timeout: 15_000 });
  await action.click();

  await page.reload();
  await expect(page.locator(".header__top__auth").getByRole("button", { name: "Đăng xuất" })).toBeVisible();
  expect(await page.evaluate(() => window.sessionStorage.getItem("cart"))).not.toBeNull();

  await page.locator(".header__top__auth").getByRole("button", { name: "Đăng xuất" }).click();
  await expect.poll(() => page.evaluate(() => window.sessionStorage.getItem("cart"))).toBeNull();
  await expect.poll(() => page.evaluate(() => window.sessionStorage.getItem("farta_cart_owner"))).toBeNull();
});

test("one server purchase offer can be confirmed only once under concurrent requests", async ({ page }) => {
  await loginVerifiedCustomer(page);
  await page.getByTestId("chat-bubble").click();
  await page.getByTestId("chat-input").fill("Bạn có muốn mua Cam Tươi không?");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("chat-message-bot").last()).toContainText("Bạn muốn mua 1 Cam Tươi");

  const actions = await page.evaluate(async (apiBase) => {
    const token = decodeURIComponent(document.cookie.split("; ").find(row => row.startsWith("XSRF-TOKEN="))?.split("=").slice(1).join("=") || "");
    const send = () => fetch(`${apiBase}/chat`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json", "Accept-Language": "vi", "X-XSRF-TOKEN": token },
      body: JSON.stringify({ message: "có", history: [] }),
    }).then(response => response.json());
    return Promise.all([send(), send()]);
  }, apiBaseUrl);

  expect(actions.filter(result => result.suggested_actions?.[0]?.type === "ADD_TO_CART")).toHaveLength(1);
  expect(actions.filter(result => (result.suggested_actions || []).length === 0)).toHaveLength(1);
});

test("a guest receives a login CTA and cannot carry a purchase action through login", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("chat-bubble").click();
  await page.getByTestId("chat-input").fill("Bạn có muốn mua Cam Tươi không?");
  await page.keyboard.press("Enter");
  const guestMessage = page.getByTestId("chat-message-bot").last();
  await expect(guestMessage).toContainText("đăng nhập tài khoản khách hàng đã xác minh");
  await expect(guestMessage.getByRole("button", { name: /Đăng nhập để thêm Cam Tươi/i })).toBeVisible();
  expect(await page.evaluate(() => window.sessionStorage.getItem("cart"))).toBeNull();

  const result = await page.evaluate(async ({ apiBase, apiRoot }) => {
    const token = () => decodeURIComponent(document.cookie.split("; ").find(row => row.startsWith("XSRF-TOKEN="))?.split("=").slice(1).join("=") || "");
    const request = (url: string, csrfToken: string, body: object) => fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-XSRF-TOKEN": csrfToken },
      body: JSON.stringify(body),
    });
    const login = await request(`${apiBase}/login`, token(), { email: "qa.customer@example.test", password: "SiviE2EPass123!" });
    const renewCsrf = async () => {
      await fetch(`${apiRoot}/sanctum/csrf-cookie`, { credentials: "include", headers: { Accept: "application/json" } });
      return token();
    };
    let chat = await request(`${apiBase}/chat`, await renewCsrf(), { message: "có", history: [] });
    if (chat.status === 419) {
      chat = await request(`${apiBase}/chat`, await renewCsrf(), { message: "có", history: [] });
    }
    return { login: login.status, chatStatus: chat.status, chat: await chat.json() };
  }, { apiBase: apiBaseUrl, apiRoot: `http://127.0.0.1:${process.env.E2E_BACKEND_PORT || "8001"}` });

  expect(result.login).toBe(200);
  expect(result.chatStatus).toBe(200);
  expect(result.chat.action?.type).toBe("none");
  expect(result.chat.suggested_actions || []).toHaveLength(0);
});
