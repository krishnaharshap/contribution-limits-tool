import { test, expect } from "@playwright/test";

test("first-time visitor is redirected to the welcome screen", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/");

  await expect(page).toHaveTitle("Contribution Limits Tool");
  await expect(page.getByTestId("welcome-screen")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("nav links move between screens once a profile exists", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "contribution-limits-tool:state",
      JSON.stringify({
        schemaVersion: 1,
        profile: {
          birthYear: 1990,
          residencyStartYear: null,
          province: null,
          hasEmployerPension: false,
        },
        accounts: {
          tfsa: { contributions: [], withdrawals: [] },
          fhsa: { accountOpenedYear: null, firstQualifyingWithdrawalYear: null, contributions: [] },
          rrsp: {
            contributions: [],
            earnedIncomeCentsByYear: {},
            pensionAdjustmentCentsByYear: {},
            priorUnusedRoomOverrideCents: null,
          },
        },
        ui: { disclaimerAcceptedAt: new Date().toISOString(), theme: "system" },
      }),
    );
  });

  await page.goto("/#/about");
  await expect(page.getByTestId("about-screen")).toBeVisible();

  await page.getByTestId("nav-link-dashboard").click();
  await expect(page.getByTestId("dashboard-screen")).toBeVisible();

  await page.getByTestId("nav-link-summary").click();
  await expect(page.getByTestId("summary-screen")).toBeVisible();
});
