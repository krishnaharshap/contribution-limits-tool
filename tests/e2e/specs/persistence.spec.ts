import { buildState, expect, test } from "../fixtures/test-fixtures";
import { AccountPage } from "../pages/AccountPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ProfilePage } from "../pages/ProfilePage";

test("data survives a full page reload", async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.goto();
  await profile.fillBirthYear(1980);
  await profile.submit();

  const account = new AccountPage(page, "tfsa");
  await account.goto();
  await account.addContribution(2024, 5000);
  await expect(account.remaining).toHaveText("$104,000.00");

  await page.reload();

  await expect(account.remaining).toHaveText("$104,000.00");
  await expect(account.contributionRow(2024)).toBeVisible();
});

test("a returning visitor goes straight to the dashboard, skipping onboarding", async ({
  page,
  seedState,
}) => {
  // A real returning visitor has already accepted the disclaimer (set
  // by buildState) - going through the profile form directly, without
  // ever clicking "Get started" on Welcome, would leave that unset and
  // send them back to Welcome instead, which isn't what this test is
  // checking.
  await seedState(buildState((state) => (state.profile.birthYear = 1980)));

  await page.goto("/");

  const dashboard = new DashboardPage(page);
  await expect(page.getByTestId("dashboard-screen")).toBeVisible();
  await expect(dashboard.totalRemaining).toBeVisible();
});
