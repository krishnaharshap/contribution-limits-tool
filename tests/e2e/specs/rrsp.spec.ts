import { calculateRrspRoom } from "../../../src/calculators/rrsp";
import { formatCad } from "../../../src/calculators/shared/money";
import { getCurrentYear } from "../../../src/utils/currentYear";
import { rrspScenarios } from "../../shared/scenarios/rrsp.scenarios";
import { buildState, expect, test } from "../fixtures/test-fixtures";
import { AccountPage } from "../pages/AccountPage";

const currentYear = getCurrentYear();
const liveScenarios = rrspScenarios.filter((scenario) => scenario.input.asOfYear === currentYear);

test.describe("RRSP scenario corpus, rendered", () => {
  for (const scenario of liveScenarios) {
    test(scenario.name, async ({ page, seedState }) => {
      await seedState(
        buildState((state) => {
          state.profile.birthYear = scenario.input.birthYear;
          state.accounts.rrsp.earnedIncomeCentsByYear = {
            ...scenario.input.earnedIncomeCentsByYear,
          };
          state.accounts.rrsp.contributions = scenario.input.contributions.map((entry, index) => ({
            id: `c${index}`,
            year: entry.year,
            amountCents: entry.amountCents,
            createdAt: new Date().toISOString(),
          }));
        }),
      );

      const account = new AccountPage(page, "rrsp");
      await account.goto();

      await expect(account.remaining).toHaveText(formatCad(scenario.expected.remainingRoomCents));
    });
  }
});

test.describe("RRSP interactions", () => {
  test("computes new room as 18% of the prior year's income entered through the form", async ({
    page,
    seedState,
  }) => {
    await seedState(buildState((state) => (state.profile.birthYear = 1980)));

    const account = new AccountPage(page, "rrsp");
    await account.goto();
    await account.setIncome(currentYear - 1, 50000);

    const expected = calculateRrspRoom({
      birthYear: 1980,
      earnedIncomeCentsByYear: { [currentYear - 1]: 50000 * 100 },
      contributions: [],
      asOfYear: currentYear,
    });
    await expect(account.remaining).toHaveText(formatCad(expected.remainingRoomCents));
  });

  test("the Notice of Assessment override adds directly to income-based room", async ({
    page,
    seedState,
  }) => {
    await seedState(buildState((state) => (state.profile.birthYear = 1980)));

    const account = new AccountPage(page, "rrsp");
    await account.goto();
    await account.setPriorRoomOverride(50000);
    await account.setIncome(currentYear - 1, 50000);

    const expected = calculateRrspRoom({
      birthYear: 1980,
      earnedIncomeCentsByYear: { [currentYear - 1]: 50000 * 100 },
      priorUnusedRoomOverrideCents: 50000 * 100,
      contributions: [],
      asOfYear: currentYear,
    });
    await expect(account.remaining).toHaveText(formatCad(expected.remainingRoomCents));
  });

  test("only shows the pension adjustment field when the profile has an employer pension", async ({
    page,
    seedState,
  }) => {
    await seedState(buildState((state) => (state.profile.birthYear = 1980)));

    const account = new AccountPage(page, "rrsp");
    await account.goto();
    await expect(page.getByTestId("rrsp-pension-year-input")).toHaveCount(0);
  });
});
