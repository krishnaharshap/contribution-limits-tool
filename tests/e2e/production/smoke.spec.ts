import { buildState, expect, test } from "../fixtures/test-fixtures";

test("the deployed site loads with no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto("/");

  await expect(page).toHaveTitle("Contribution Limits Tool");
  await expect(page.getByTestId("welcome-screen")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("all three dashboard cards render for a returning visitor", async ({ page, seedState }) => {
  await seedState(buildState((state) => (state.profile.birthYear = 1980)));

  await page.goto("/#/dashboard");

  await expect(page.getByTestId("room-card-tfsa")).toBeVisible();
  await expect(page.getByTestId("room-card-fhsa")).toBeVisible();
  await expect(page.getByTestId("room-card-rrsp")).toBeVisible();
});

test("a contribution can be added and persists across reload", async ({ page, seedState }) => {
  await seedState(buildState((state) => (state.profile.birthYear = 1980)));

  await page.goto("/#/account/tfsa");
  await page.getByTestId("tfsa-contribution-year-input").fill("2024");
  await page.getByTestId("tfsa-contribution-amount-input").fill("1000");
  await page.getByTestId("tfsa-contribution-submit-button").click();

  await expect(page.getByTestId("tfsa-remaining")).toHaveText("$108,000.00");

  await page.reload();
  await expect(page.getByTestId("tfsa-remaining")).toHaveText("$108,000.00");
});
