import { formatCad } from "../../../src/calculators/shared/money";
import { getTfsaLimit } from "../../../src/data/limits";
import { getCurrentYear } from "../../../src/utils/currentYear";
import { tfsaScenarios } from "../../shared/scenarios/tfsa.scenarios";
import { buildState, expect, test } from "../fixtures/test-fixtures";
import { AccountPage } from "../pages/AccountPage";

const currentYear = getCurrentYear();

// Only scenarios written against the real "as of" year can be
// cross-checked against the live app, which always calculates against
// today's date - the others are already covered against the
// calculator directly in tests/unit/calculators/tfsa.test.ts.
const liveScenarios = tfsaScenarios.filter((scenario) => scenario.input.asOfYear === currentYear);

test.describe("TFSA scenario corpus, rendered", () => {
  for (const scenario of liveScenarios) {
    test(scenario.name, async ({ page, seedState }) => {
      await seedState(
        buildState((state) => {
          state.profile.birthYear = scenario.input.birthYear;
          state.profile.residencyStartYear = scenario.input.residencyStartYear ?? null;
          state.accounts.tfsa.contributions = scenario.input.contributions.map((entry, index) => ({
            id: `c${index}`,
            year: entry.year,
            amountCents: entry.amountCents,
            createdAt: new Date().toISOString(),
          }));
          state.accounts.tfsa.withdrawals = (scenario.input.withdrawals ?? []).map(
            (entry, index) => ({
              id: `w${index}`,
              year: entry.year,
              amountCents: entry.amountCents,
              createdAt: new Date().toISOString(),
            }),
          );
        }),
      );

      const account = new AccountPage(page, "tfsa");
      await account.goto();

      await expect(account.remaining).toHaveText(formatCad(scenario.expected.remainingRoomCents));
    });
  }
});

test.describe("TFSA interactions", () => {
  test("adds a contribution through the form and updates the total", async ({
    page,
    seedState,
  }) => {
    await seedState(buildState((state) => (state.profile.birthYear = 1980)));

    const account = new AccountPage(page, "tfsa");
    await account.goto();
    await expect(account.remaining).toHaveText("$109,000.00");

    await account.addContribution(2024, 5000);
    await expect(account.remaining).toHaveText("$104,000.00");
  });

  test("rejects a duplicate year and does not change the total", async ({ page, seedState }) => {
    await seedState(buildState((state) => (state.profile.birthYear = 1980)));

    const account = new AccountPage(page, "tfsa");
    await account.goto();
    await account.addContribution(2024, 5000);
    await account.addContribution(2024, 100);

    await expect(account.contributionError()).toContainText(/already have an entry/i);
    await expect(account.remaining).toHaveText("$104,000.00");
  });

  test("does not restore a withdrawal's room until the following year", async ({
    page,
    seedState,
  }) => {
    // Turns 18 this exact year, so there's exactly one year of room:
    // this year's own annual limit, nothing carried in from before.
    await seedState(buildState((state) => (state.profile.birthYear = currentYear - 18)));

    const account = new AccountPage(page, "tfsa");
    await account.goto();

    const thisYearLimit = getTfsaLimit(currentYear);
    await account.addContribution(currentYear, thisYearLimit);
    await account.addWithdrawal(currentYear, thisYearLimit);

    // Withdrawing everything back out the same year doesn't restore
    // room - the account should read $0, not the full annual limit.
    await expect(account.remaining).toHaveText("$0.00");
  });

  test("removes a contribution and restores its room", async ({ page, seedState }) => {
    await seedState(buildState((state) => (state.profile.birthYear = 1980)));

    const account = new AccountPage(page, "tfsa");
    await account.goto();
    await account.addContribution(2024, 5000);
    await expect(account.remaining).toHaveText("$104,000.00");

    await account.removeContribution(2024);
    await expect(account.remaining).toHaveText("$109,000.00");
  });
});
