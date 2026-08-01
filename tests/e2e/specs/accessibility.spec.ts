import AxeBuilder from "@axe-core/playwright";
import { buildState, contribution, expect, test } from "../fixtures/test-fixtures";

async function expectNoSeriousViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const seriousOrCritical = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );

  expect(
    seriousOrCritical,
    seriousOrCritical.map((v) => `${v.id}: ${v.description}`).join("\n"),
  ).toEqual([]);
}

test.describe("accessibility", () => {
  test("welcome screen has no serious violations", async ({ page }) => {
    await page.goto("/");
    await expectNoSeriousViolations(page);
  });

  test("profile screen has no serious violations", async ({ page }) => {
    await page.goto("/#/profile");
    await expectNoSeriousViolations(page);
  });

  test("dashboard has no serious violations", async ({ page, seedState }) => {
    await seedState(buildState((state) => (state.profile.birthYear = 1980)));
    await page.goto("/#/dashboard");
    await expectNoSeriousViolations(page);
  });

  test("account detail screen has no serious violations", async ({ page, seedState }) => {
    await seedState(
      buildState((state) => {
        state.profile.birthYear = 1980;
        state.accounts.tfsa.contributions.push(contribution(2024, 500_000));
      }),
    );
    await page.goto("/#/account/tfsa");
    await expectNoSeriousViolations(page);
  });

  test("summary screen has no serious violations", async ({ page, seedState }) => {
    await seedState(buildState((state) => (state.profile.birthYear = 1980)));
    await page.goto("/#/summary");
    await expectNoSeriousViolations(page);
  });

  test("about screen has no serious violations", async ({ page }) => {
    await page.goto("/#/about");
    await expectNoSeriousViolations(page);
  });
});

test.describe("keyboard navigation", () => {
  test("moves focus to the new screen's heading after a nav click", async ({ page, seedState }) => {
    await seedState(buildState((state) => (state.profile.birthYear = 1980)));
    await page.goto("/#/dashboard");

    await page.getByTestId("nav-link-about").click();
    await expect(page.locator("#main-heading")).toBeFocused();
  });
});
