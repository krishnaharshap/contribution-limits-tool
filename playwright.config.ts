import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173/contribution-limits-tool/";

// Chromium always runs. The full cross-browser matrix is opt-in via
// this env var, set on push to main - PRs stay fast on chromium alone.
const runFullMatrix = process.env.PLAYWRIGHT_FULL_MATRIX === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npm run preview",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    ...(runFullMatrix
      ? [
          { name: "firefox", use: { ...devices["Desktop Firefox"] } },
          { name: "webkit", use: { ...devices["Desktop Safari"] } },
          { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
          { name: "Mobile Safari", use: { ...devices["iPhone 13"] } },
        ]
      : []),
  ],
});
