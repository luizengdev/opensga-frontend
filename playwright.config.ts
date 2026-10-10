import {defineConfig, devices} from "@playwright/test";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const MOCK_API_PORT = 3334;
const MOCK_API_URL = `http://127.0.0.1:${MOCK_API_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  expect: {timeout: 10_000},
  reporter: [
    ["list"],
    ["html", {open: "never", outputFolder: "playwright-report"}],
    ["allure-playwright", {resultsDir: "allure-results"}],
  ],
  use: {
    baseURL: BASE_URL,
    locale: "pt-BR",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {...devices["Desktop Chrome"]},
    },
  ],
  webServer: [
    {
      command: "node e2e/mocks/mock-api-server.mjs",
      url: `${MOCK_API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: process.env.PLAYWRIGHT_WEB_SERVER === "dev" ? "npm run dev" : "npm run start",
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        ...process.env,
        API_BASE_URL: MOCK_API_URL,
        NEXT_PUBLIC_API_URL: MOCK_API_URL,
        PORT: String(PORT),
      },
    },
  ],
});

