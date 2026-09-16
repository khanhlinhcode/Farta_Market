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

  expect(actions.filter(result => result.action?.type === "add_to_cart")).toHaveLength(1);
  expect(actions.filter(result => result.action?.type === "none")).toHaveLength(1);
});

test("a pending guest purchase cannot be consumed after login changes the session owner", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("chat-bubble").click();
  await page.getByTestId("chat-input").fill("Bạn có muốn mua Cam Tươi không?");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("chat-message-bot").last()).toContainText("Bạn muốn mua 1 Cam Tươi");

  const result = await page.evaluate(async ({ apiBase, apiRoot }) => {
    const token = decodeURIComponent(document.cookie.split("; ").find(row => row.startsWith("XSRF-TOKEN="))?.split("=").slice(1).join("=") || "");
    const common = { credentials: "include" as const, headers: { "Content-Type": "application/json", Accept: "application/json", "X-XSRF-TOKEN": token } };
    const login = await fetch(`${apiBase}/login`, { ...common, method: "POST", body: JSON.stringify({ email: "qa.customer@example.test", password: "SiviE2EPass123!" }) });
    await fetch(`${apiRoot}/sanctum/csrf-cookie`, { credentials: "include" });
    const renewedToken = decodeURIComponent(document.cookie.split("; ").find(row => row.startsWith("XSRF-TOKEN="))?.split("=").slice(1).join("=") || "");
    const chat = await fetch(`${apiBase}/chat`, { ...common, headers: { ...common.headers, "X-XSRF-TOKEN": renewedToken }, method: "POST", body: JSON.stringify({ message: "có", history: [] }) });
    return { login: login.status, chatStatus: chat.status, chat: await chat.json() };
  }, { apiBase: apiBaseUrl, apiRoot: apiRootUrl });

  expect(result.login).toBe(200);
  expect(result.chatStatus).toBe(200);
  expect(result.chat.action?.type).toBe("none");
});
