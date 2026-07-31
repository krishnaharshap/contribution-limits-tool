import { describe, expect, it } from "vitest";
import { actions } from "../../../src/store/actions";
import { reducer } from "../../../src/store/reducer";
import {
  selectAllResults,
  selectFhsaResult,
  selectRrspResult,
  selectTfsaResult,
} from "../../../src/store/selectors";
import { createInitialState } from "../../../src/store/types";

describe("selectTfsaResult", () => {
  it("returns null when no birth year has been set yet", () => {
    expect(selectTfsaResult(createInitialState(), 2026)).toBeNull();
  });

  it("computes TFSA room from stored contributions once a profile exists", () => {
    let state = createInitialState();
    state = reducer(state, actions.profileUpdated({ birthYear: 1980 }));
    state = reducer(state, actions.tfsaContributionAdded({ year: 2024, amountCents: 700_000 }));

    const result = selectTfsaResult(state, 2026);
    expect(result?.totalContributedCents).toBe(700_000);
  });
});

describe("selectFhsaResult", () => {
  it("returns null without a birth year", () => {
    expect(selectFhsaResult(createInitialState(), 2026)).toBeNull();
  });

  it("reflects the account-opened year from state", () => {
    let state = createInitialState();
    state = reducer(state, actions.profileUpdated({ birthYear: 1990 }));
    state = reducer(state, actions.fhsaAccountOpenedSet(2024));

    const result = selectFhsaResult(state, 2026);
    expect(result?.hasAccountOpen).toBe(true);
  });
});

describe("selectRrspResult", () => {
  it("only applies the pension adjustment when the profile flags an employer pension", () => {
    let state = createInitialState();
    state = reducer(state, actions.profileUpdated({ birthYear: 1980, hasEmployerPension: false }));
    state = reducer(state, actions.rrspIncomeSet(2025, 5_000_000));
    state = reducer(state, actions.rrspPensionAdjustmentSet(2025, 500_000));

    const withoutPensionFlag = selectRrspResult(state, 2026);
    expect(withoutPensionFlag?.totalPensionAdjustmentCents).toBe(0);

    state = reducer(state, actions.profileUpdated({ hasEmployerPension: true }));
    const withPensionFlag = selectRrspResult(state, 2026);
    expect(withPensionFlag?.totalPensionAdjustmentCents).toBe(500_000);
  });
});

describe("selectAllResults", () => {
  it("returns all three account results together", () => {
    let state = createInitialState();
    state = reducer(state, actions.profileUpdated({ birthYear: 1980 }));

    const results = selectAllResults(state, 2026);
    expect(results.tfsa).not.toBeNull();
    expect(results.fhsa).not.toBeNull();
    expect(results.rrsp).not.toBeNull();
  });
});
