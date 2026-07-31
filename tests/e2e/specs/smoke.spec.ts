import { buildState, expect, test } from "../fixtures/test-fixtures";
import { WelcomePage } from "../pages/WelcomePage";

test("first-time visitor is redirected to the welcome screen", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  const welcome = new WelcomePage(page);
  await welcome.goto();

  await expect(page).toHaveTitle("Contribution Limits Tool");
  await expect(page.getByTestId("welcome-screen")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("nav links move between screens once a profile exists", async ({ page, seedState }) => {
  await seedState(buildState((state) => (state.profile.birthYear = 1990)));

  const welcome = new WelcomePage(page);
  await welcome.goto();
  await welcome.gotoAbout();
  await expect(page.getByTestId("about-screen")).toBeVisible();

  await welcome.gotoDashboard();
  await expect(page.getByTestId("dashboard-screen")).toBeVisible();

  await welcome.gotoSummary();
  await expect(page.getByTestId("summary-screen")).toBeVisible();
});
