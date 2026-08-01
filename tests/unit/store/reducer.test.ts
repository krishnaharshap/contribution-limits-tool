import { describe, expect, it } from "vitest";
import { actions } from "../../../src/store/actions";
import { reducer } from "../../../src/store/reducer";
import { createInitialState } from "../../../src/store/types";

describe("reducer", () => {
  it("updates profile fields without touching the rest of state", () => {
    const state = createInitialState();
    const next = reducer(state, actions.profileUpdated({ birthYear: 1990 }));

    expect(next.profile.birthYear).toBe(1990);
    expect(next.accounts).toBe(state.accounts);
  });

  it("appends a TFSA contribution", () => {
    const state = createInitialState();
    const next = reducer(state, actions.tfsaContributionAdded({ year: 2024, amountCents: 100 }));

    expect(next.accounts.tfsa.contributions).toHaveLength(1);
    expect(next.accounts.tfsa.contributions[0]).toMatchObject({ year: 2024, amountCents: 100 });
    expect(next.accounts.tfsa.contributions[0].id).toBeTruthy();
    expect(state.accounts.tfsa.contributions).toHaveLength(0);
  });

  it("removes a TFSA contribution by id without touching other entries", () => {
    let state = createInitialState();
    state = reducer(state, actions.tfsaContributionAdded({ year: 2024, amountCents: 100 }));
    state = reducer(state, actions.tfsaContributionAdded({ year: 2025, amountCents: 200 }));
    const idToRemove = state.accounts.tfsa.contributions[0].id;

    const next = reducer(state, actions.tfsaContributionRemoved(idToRemove));

    expect(next.accounts.tfsa.contributions).toHaveLength(1);
    expect(next.accounts.tfsa.contributions[0].year).toBe(2025);
  });

  it("keeps TFSA contributions and withdrawals as separate lists", () => {
    let state = createInitialState();
    state = reducer(state, actions.tfsaContributionAdded({ year: 2024, amountCents: 100 }));
    state = reducer(state, actions.tfsaWithdrawalAdded({ year: 2024, amountCents: 50 }));

    expect(state.accounts.tfsa.contributions).toHaveLength(1);
    expect(state.accounts.tfsa.withdrawals).toHaveLength(1);
  });

  it("sets the FHSA account opened year", () => {
    const state = createInitialState();
    const next = reducer(state, actions.fhsaAccountOpenedSet(2024));
    expect(next.accounts.fhsa.accountOpenedYear).toBe(2024);
  });

  it("sets and clears RRSP income for a year", () => {
    let state = createInitialState();
    state = reducer(state, actions.rrspIncomeSet(2025, 5_000_000));
    expect(state.accounts.rrsp.earnedIncomeCentsByYear[2025]).toBe(5_000_000);

    state = reducer(state, actions.rrspIncomeSet(2025, null));
    expect(state.accounts.rrsp.earnedIncomeCentsByYear[2025]).toBeUndefined();
  });

  it("records the disclaimer acceptance timestamp", () => {
    const state = createInitialState();
    const next = reducer(state, actions.disclaimerAccepted());
    expect(next.ui.disclaimerAcceptedAt).not.toBeNull();
  });

  it("replaces the entire state on import", () => {
    const imported = createInitialState();
    imported.profile.birthYear = 1985;

    const state = createInitialState();
    const next = reducer(state, actions.stateImported(imported));

    expect(next.profile.birthYear).toBe(1985);
  });

  it("resets to a fresh initial state", () => {
    let state = createInitialState();
    state = reducer(state, actions.profileUpdated({ birthYear: 1990 }));
    state = reducer(state, actions.stateReset());

    expect(state).toEqual(createInitialState());
  });

  it("returns the same state reference for an unknown action", () => {
    const state = createInitialState();
    // @ts-expect-error deliberately testing an action type the reducer doesn't handle
    const next = reducer(state, { type: "SOMETHING_UNKNOWN" });
    expect(next).toBe(state);
  });
});
