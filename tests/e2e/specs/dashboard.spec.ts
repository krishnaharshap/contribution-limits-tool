import { getTfsaLimit } from "../../../src/data/limits";
import { getCurrentYear } from "../../../src/utils/currentYear";
import { buildState, contribution, expect, test } from "../fixtures/test-fixtures";
import { DashboardPage } from "../pages/DashboardPage";

const currentYear = getCurrentYear();

test("shows all three accounts with the right status before any data is entered", async ({
  page,
  seedState,
}) => {
  await seedState(buildState((state) => (state.profile.birthYear = 1980)));

  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  await expect(dashboard.status("tfsa")).toHaveText("On track");
  await expect(dashboard.status("fhsa")).toHaveText("No account open");
  await expect(dashboard.status("rrsp")).toHaveText("No income on record");
});

test("reflects an over-contributed TFSA with the estimated penalty", async ({
  page,
  seedState,
}) => {
  // Turns 18 this exact year, so there's exactly one year of room to
  // exceed - contributing $1 over it is unambiguously over-contributed
  // regardless of which year the test actually runs in.
  const oneYearOfRoomCents = getTfsaLimit(currentYear) * 100;
  await seedState(
    buildState((state) => {
      state.profile.birthYear = currentYear - 18;
      state.accounts.tfsa.contributions.push(contribution(currentYear, oneYearOfRoomCents + 100));
    }),
  );

  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  await expect(dashboard.status("tfsa")).toContainText("Over-contributed");
  await expect(dashboard.status("tfsa")).toContainText("$0.01/mo");
});

test("navigates to the account detail screen from a card", async ({ page, seedState }) => {
  await seedState(buildState((state) => (state.profile.birthYear = 1980)));

  const dashboard = new DashboardPage(page);
  await dashboard.goto();
  await dashboard.viewDetails("tfsa");

  await expect(page.getByTestId("account-screen")).toBeVisible();
  await expect(page).toHaveURL(/#\/account\/tfsa/);
});

test("redirects to profile setup if no profile exists yet", async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();

  await expect(page.getByTestId("profile-screen")).toBeVisible();
});
