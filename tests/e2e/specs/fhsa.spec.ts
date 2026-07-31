import { calculateFhsaRoom } from "../../../src/calculators/fhsa";
import { formatCad } from "../../../src/calculators/shared/money";
import { getCurrentYear } from "../../../src/utils/currentYear";
import { fhsaScenarios } from "../../shared/scenarios/fhsa.scenarios";
import { buildState, expect, test } from "../fixtures/test-fixtures";
import { AccountPage } from "../pages/AccountPage";

const currentYear = getCurrentYear();
const liveScenarios = fhsaScenarios.filter((scenario) => scenario.input.asOfYear === currentYear);

test.describe("FHSA scenario corpus, rendered", () => {
  for (const scenario of liveScenarios) {
    test(scenario.name, async ({ page, seedState }) => {
      await seedState(
        buildState((state) => {
          state.profile.birthYear = scenario.input.birthYear;
          state.accounts.fhsa.accountOpenedYear = scenario.input.accountOpenedYear ?? null;
          state.accounts.fhsa.contributions = scenario.input.contributions.map((entry, index) => ({
            id: `c${index}`,
            year: entry.year,
            amountCents: entry.amountCents,
            createdAt: new Date().toISOString(),
          }));
        }),
      );

      const account = new AccountPage(page, "fhsa");
      await account.goto();

      if (!scenario.expected.hasAccountOpen) {
        await expect(page.getByText(/you have not opened an fhsa yet/i)).toBeVisible();
        return;
      }

      await expect(account.remaining).toHaveText(formatCad(scenario.expected.remainingRoomCents));
    });
  }
});

test.describe("FHSA interactions", () => {
  test("has no room at all until an account is opened", async ({ page, seedState }) => {
    await seedState(buildState((state) => (state.profile.birthYear = 1990)));

    const account = new AccountPage(page, "fhsa");
    await account.goto();

    await expect(page.getByText(/you have not opened an fhsa yet/i)).toBeVisible();
  });

  test("carryforward is capped, it does not compound across skipped years", async ({
    page,
    seedState,
  }) => {
    await seedState(buildState((state) => (state.profile.birthYear = 1990)));

    const account = new AccountPage(page, "fhsa");
    await account.goto();
    await account.setAccountOpenedYear(2023);

    const expected = calculateFhsaRoom({
      birthYear: 1990,
      accountOpenedYear: 2023,
      contributions: [],
      asOfYear: currentYear,
    });
    await expect(account.remaining).toHaveText(formatCad(expected.remainingRoomCents));
  });
});
