import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const backendDir =
  process.env.BACKEND_DIR ||
  path.resolve(__dirname, "../SVC01072023BE/SVC01072023BE");
const frontendPort = process.env.E2E_FRONTEND_PORT || "5174";
const frontendUrl = `http://127.0.0.1:${frontendPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: frontendUrl,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: `cd "${backendDir}" && php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=127.0.0.1 --port=8000`,
      url: "http://127.0.0.1:8000/up",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${frontendPort}`,
      url: frontendUrl,
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
