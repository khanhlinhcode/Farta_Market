import { defineConfig, devices } from "@playwright/test";

const frontendPort = process.env.E2E_FRONTEND_PORT || "5175";
const backendPort = process.env.E2E_BACKEND_PORT || "8001";
if (![frontendPort, backendPort].every((port) => /^\d+$/.test(port) && Number(port) > 1023 && Number(port) < 65536) ||
    backendPort === "8000" || frontendPort === backendPort) throw new Error("Choose separate valid E2E ports.");
const frontendUrl = "http://127.0.0.1:" + frontendPort;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 15_000 },
  workers: 1,
  use: { baseURL: frontendUrl, trace: "retain-on-failure" },
  webServer: [
    {
      command: "node tests/e2e/start-backend.mjs",
      url: "http://127.0.0.1:" + backendPort + "/up",
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --strictPort --port " + frontendPort,
      env: {
        VITE_API_URL: "http://127.0.0.1:" + backendPort + "/api",
      },
      url: frontendUrl,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
