import { expect, Page, test } from "@playwright/test";

const authUser = {
  id: 999,
  name: "QA Admin",
  email: "qa.admin@example.test",
  role: "customer",
  email_verified_at: "2026-09-17T00:00:00.000000Z",
};

async function mockSharedAuthRoutes(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("lang", "vi");
  });

  await page.route("**/sanctum/csrf-cookie", async (route) => {
    await route.fulfill({
      status: 204,
      headers: {
        "set-cookie": "XSRF-TOKEN=test-token; Path=/",
      },
    });
  });

  await page.route("**/api/me", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Unauthenticated." }),
    });
  });

  await page.route("**/api/chat/health", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ status: "offline" }),
    });
  });
}

test("forgot password stays generic and is reachable from customer login", async ({ page }) => {
  await mockSharedAuthRoutes(page);
  await page.route("**/api/forgot-password", async (route) => {
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Nếu email thuộc một tài khoản khách hàng, hướng dẫn đặt lại mật khẩu sẽ được gửi.",
      }),
    });
  });

  await page.goto("/dang-nhap");
  await page.getByRole("link", { name: "Quên mật khẩu?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await page.getByLabel("Email").fill("customer@example.test");

  const requestPromise = page.waitForRequest(
    (request) => request.method() === "POST" && new URL(request.url()).pathname.endsWith("/api/forgot-password")
  );
  await page.getByRole("button", { name: "Gửi liên kết đặt lại" }).click();

  expect((await requestPromise).postDataJSON()).toEqual({ email: "customer@example.test" });
  await expect(page.getByRole("status")).toContainText("Nếu email thuộc một tài khoản khách hàng");
  expect(await page.evaluate(() => localStorage.getItem("email") || sessionStorage.getItem("email"))).toBeNull();
});

test("password reset removes the one-time token from browser history and returns to login", async ({ page }) => {
  await mockSharedAuthRoutes(page);
  await page.route("**/api/reset-password", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Password reset." }),
    });
  });

  await page.goto("/reset-password?token=qa-one-time-token&email=customer%40example.test");
  await expect(page.getByRole("heading", { name: "Đặt lại mật khẩu" })).toBeVisible();
  await expect(page).toHaveURL(/\/reset-password$/);
  await page.getByLabel("Mật khẩu mới").fill("NewPass456");
  await page.getByLabel("Nhập lại mật khẩu").fill("NewPass456");

  const requestPromise = page.waitForRequest(
    (request) => request.method() === "POST" && new URL(request.url()).pathname.endsWith("/api/reset-password")
  );
  await page.getByRole("button", { name: "Cập nhật mật khẩu" }).click();
  expect((await requestPromise).postDataJSON()).toMatchObject({
    email: "customer@example.test",
    token: "qa-one-time-token",
  });
  await expect(page).toHaveURL(/\/dang-nhap$/);
});

test("login tab submits to /api/login and never /api/register", async ({ page }) => {
  await mockSharedAuthRoutes(page);

  let registerRequestCount = 0;

  await page.route("**/api/register", async (route) => {
    registerRequestCount += 1;
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Register endpoint should not be used." }),
    });
  });

  await page.route("**/api/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: authUser }),
    });
  });

  await page.goto("/dang-nhap");
  await page
    .locator(".user-login__tabs")
    .getByRole("button", { name: "Đăng nhập" })
    .click();

  await page.getByLabel("Email").fill("qa.admin@example.test");
  await page.locator('input[name="password"]').fill("FartaQa12345");

  const loginRequestPromise = page.waitForRequest(
    (request) =>
      request.method() === "POST" &&
      new URL(request.url()).pathname.endsWith("/api/login")
  );

  await page
    .locator(".user-login__form")
    .getByRole("button", { name: "Đăng nhập" })
    .click();

  const loginRequest = await loginRequestPromise;

  expect(loginRequest.postDataJSON()).toMatchObject({
    email: "qa.admin@example.test",
    password: "FartaQa12345",
  });
  expect(registerRequestCount).toBe(0);
  await expect(page).toHaveURL(/http:\/\/127\.0\.0\.1:\d+\/?$/);
});

test("create account tab submits to /api/register and never /api/login", async ({
  page,
}) => {
  await mockSharedAuthRoutes(page);

  let loginRequestCount = 0;

  await page.route("**/api/login", async (route) => {
    loginRequestCount += 1;
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Login endpoint should not be used." }),
    });
  });

  await page.route("**/api/register", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          ...authUser,
          name: "QA Customer",
          email: "qa.customer.new@example.test",
          email_verified_at: null,
        },
        verification_email_sent: false,
      }),
    });
  });

  await page.goto("/dang-nhap");
  await page
    .locator(".user-login__tabs")
    .getByRole("button", { name: "Tạo tài khoản" })
    .click();

  await page.getByLabel("Họ và tên").fill("QA Customer");
  await page.getByLabel("Email").fill("qa.customer.new@example.test");
  await page.locator('input[name="password"]').fill("FartaQa12345");
  await page.getByLabel("Nhập lại mật khẩu").fill("FartaQa12345");

  const registerRequestPromise = page.waitForRequest(
    (request) =>
      request.method() === "POST" &&
      new URL(request.url()).pathname.endsWith("/api/register")
  );

  await page
    .locator(".user-login__form")
    .getByRole("button", { name: "Tạo tài khoản" })
    .click();

  const registerRequest = await registerRequestPromise;

  expect(registerRequest.postDataJSON()).toMatchObject({
    name: "QA Customer",
    email: "qa.customer.new@example.test",
    password: "FartaQa12345",
    password_confirmation: "FartaQa12345",
  });
  expect(loginRequestCount).toBe(0);
  await expect(page).toHaveURL(/\/verify-email$/);
  await expect(page.getByRole("heading", { name: "Xác minh email" })).toBeVisible();
  await expect(page.locator(".verify-email__card [role='status']")).toContainText(
    "Không gửi được email xác minh"
  );
  await expect(page.getByRole("link", { name: "Tiếp tục mua sắm" })).toBeVisible();
});

test("register validation error is cleared immediately when switching to login tab", async ({
  page,
}) => {
  await mockSharedAuthRoutes(page);

  let loginRequestCount = 0;
  let registerRequestCount = 0;

  await page.route("**/api/login", async (route) => {
    loginRequestCount += 1;
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Login endpoint should not be used." }),
    });
  });

  await page.route("**/api/register", async (route) => {
    registerRequestCount += 1;
    await route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        message: "The email has already been taken.",
        errors: {
          email: ["The email has already been taken."],
        },
      }),
    });
  });

  await page.goto("/dang-nhap");
  await page
    .locator(".user-login__tabs")
    .getByRole("button", { name: "Tạo tài khoản" })
    .click();

  await page.getByLabel("Họ và tên").fill("QA Admin");
  await page.getByLabel("Email").fill("qa.admin@example.test");
  await page.locator('input[name="password"]').fill("FartaQa12345");
  await page.getByLabel("Nhập lại mật khẩu").fill("FartaQa12345");

  await page
    .locator(".user-login__form")
    .getByRole("button", { name: "Tạo tài khoản" })
    .click();

  await expect(page.locator(".user-login__error")).toHaveText(
    "The email has already been taken."
  );

  const urlBeforeTabSwitch = page.url();
  await page
    .locator(".user-login__tabs")
    .getByRole("button", { name: "Đăng nhập" })
    .click();

  expect(page.url()).toBe(urlBeforeTabSwitch);
  await expect(page.locator(".user-login__error")).toHaveCount(0);
  await expect(
    page.getByText("The email has already been taken.")
  ).toHaveCount(0);
  expect(registerRequestCount).toBe(1);
  expect(loginRequestCount).toBe(0);
});

test("password visibility toggle switches the login password field", async ({
  page,
}) => {
  await mockSharedAuthRoutes(page);

  await page.goto("/dang-nhap");

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill("FartaQa12345");

  await expect(passwordInput).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Hiện mật khẩu" }).click();
  await expect(passwordInput).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ẩn mật khẩu" }).click();
  await expect(passwordInput).toHaveAttribute("type", "password");
});
