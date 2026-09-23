import { expect, test } from "@playwright/test";

const apiBaseUrl = `http://127.0.0.1:${process.env.E2E_BACKEND_PORT || "8001"}/api`;
const apiRootUrl = `http://127.0.0.1:${process.env.E2E_BACKEND_PORT || "8001"}`;

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

test("verified product proposal changes the cart only after confirmation and becomes cart context", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("chat-bubble").click();
  await page.getByTestId("chat-input").fill("Mua 2 Cam Tươi");
  await page.keyboard.press("Enter");

  const card = page.getByTestId("chat-product-card").last();
  await expect(card).toContainText("Cam Tươi", { timeout: 15_000 });
  await card.getByRole("button", { name: /Thêm 2 vào giỏ/i }).click();
  await expect(page.getByTestId("chat-message-bot").last()).toContainText("Đã thêm 2 Cam Tươi");

  await page.getByTestId("chat-input").fill("Trong giỏ của tôi có gì?");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("chat-message-bot").last()).toContainText("2 × Cam Tươi", { timeout: 15_000 });
});

test("one server purchase offer can be confirmed only once under concurrent requests", async ({ page }) => {
  await page.goto("/");
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

test("a pending guest purchase cannot be consumed after login changes the session owner", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("chat-bubble").click();
  await page.getByTestId("chat-input").fill("Bạn có muốn mua Cam Tươi không?");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("chat-message-bot").last()).toContainText("Bạn muốn mua 1 Cam Tươi");

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
  }, { apiBase: apiBaseUrl, apiRoot: apiRootUrl });

  expect(result.login).toBe(200);
  expect(result.chatStatus).toBe(200);
  expect(result.chat.action?.type).toBe("none");
});
