import { defineConfig, devices } from "@playwright/test";

// Runs against the real deployed site after every Pages deploy - "I
// test the deployed artifact, not just the build."
export default defineConfig({
  testDir: "./tests/e2e/production",
  fullyParallel: true,
  retries: 2,
  reporter: "html",
  use: {
    baseURL: "https://krishnaharshap.github.io/contribution-limits-tool/",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
