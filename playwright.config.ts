import { defineConfig, devices } from "@playwright/test";

const backendDir =
  "/Users/tolinh/Documents/Programming/sivicode/SVC01072023BE/SVC01072023BE";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: `cd ${backendDir} && php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=127.0.0.1 --port=8000`,
      url: "http://127.0.0.1:8000/up",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5173",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
