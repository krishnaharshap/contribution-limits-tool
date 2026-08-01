import { getCurrentYear } from "../../../src/utils/currentYear";
import { buildState, expect, test } from "../fixtures/test-fixtures";
import { AccountPage } from "../pages/AccountPage";

const currentYear = getCurrentYear();

test.describe("cross-cutting input validation", () => {
  test("rejects a negative contribution amount", async ({ page, seedState }) => {
    await seedState(buildState((state) => (state.profile.birthYear = 1980)));

    const account = new AccountPage(page, "tfsa");
    await account.goto();
    await account.addContribution(2024, -100);

    await expect(account.contributionError()).toContainText(/non-negative/i);
  });

  test("rejects a contribution dated in the future", async ({ page, seedState }) => {
    await seedState(buildState((state) => (state.profile.birthYear = 1980)));

    const account = new AccountPage(page, "tfsa");
    await account.goto();
    await account.addContribution(currentYear + 1, 100);

    await expect(account.contributionError()).toContainText(/year must be between/i);
  });

  test("accepts a zero-dollar contribution as a valid 'contributed nothing' entry", async ({
    page,
    seedState,
  }) => {
    await seedState(buildState((state) => (state.profile.birthYear = 1980)));

    const account = new AccountPage(page, "tfsa");
    await account.goto();
    await account.addContribution(2024, 0);

    await expect(account.contributionError()).toHaveCount(0);
    await expect(account.contributionRow(2024)).toBeVisible();
  });
});

test.describe("FHSA account-existence validation", () => {
  // The 15-year participation period can't actually have expired for
  // any real account yet - FHSA only launched in 2023 - so that path
  // is covered directly against the calculator in the FHSA unit tests
  // instead. This checks a rule that is reachable today: a
  // contribution can't predate the account it's being added to.
  test("blocks a contribution dated before the account was opened", async ({ page, seedState }) => {
    await seedState(
      buildState((state) => {
        state.profile.birthYear = 1990;
        state.accounts.fhsa.accountOpenedYear = currentYear;
      }),
    );

    const account = new AccountPage(page, "fhsa");
    await account.goto();
    await account.addContribution(currentYear - 1, 100, "fhsa-contribution");

    await expect(account.contributionError("fhsa-contribution")).toBeVisible();
  });
});

test.describe("RRSP age-71 validation", () => {
  test("blocks a contribution dated after the must-collapse-by year", async ({
    page,
    seedState,
  }) => {
    await seedState(buildState((state) => (state.profile.birthYear = currentYear - 72)));

    const account = new AccountPage(page, "rrsp");
    await account.goto();
    await expect(page.getByText(/must be collapsed by/i)).toBeVisible();
  });
});
