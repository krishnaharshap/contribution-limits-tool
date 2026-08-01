import { buildState, expect, test } from "../fixtures/test-fixtures";
import { DashboardPage } from "../pages/DashboardPage";
import { ProfilePage } from "../pages/ProfilePage";
import { WelcomePage } from "../pages/WelcomePage";

test("completes the full welcome -> profile -> dashboard flow", async ({ page }) => {
  const welcome = new WelcomePage(page);
  const profile = new ProfilePage(page);
  const dashboard = new DashboardPage(page);

  await welcome.goto();
  await expect(welcome.heading).toBeVisible();

  await welcome.clickGetStarted();
  await expect(page.getByTestId("profile-screen")).toBeVisible();

  await profile.fillBirthYear(1990);
  await expect(profile.eligibilitySummary).toContainText("TFSA: Eligible since 2009");

  await profile.submit();
  await expect(page.getByTestId("dashboard-screen")).toBeVisible();
  await expect(dashboard.totalRemaining).toHaveText("$109,000.00");
});

test("shows a validation error and stays on profile without a birth year", async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.goto();

  await profile.submit();
  await expect(profile.formError).toBeVisible();
  await expect(page.getByTestId("profile-screen")).toBeVisible();
});

test("a returning visitor with a saved profile lands on the dashboard directly", async ({
  page,
  seedState,
}) => {
  await seedState(buildState((state) => (state.profile.birthYear = 1985)));

  const welcome = new WelcomePage(page);
  await welcome.goto();

  await expect(page.getByTestId("dashboard-screen")).toBeVisible();
});
