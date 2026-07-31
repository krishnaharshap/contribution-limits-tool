import { calculateFhsaRoom, type FhsaResult } from "../calculators/fhsa";
import { calculateRrspRoom, type RrspResult } from "../calculators/rrsp";
import { calculateTfsaRoom, type TfsaResult } from "../calculators/tfsa";
import type { ContributionEntry } from "../calculators/shared/types";
import type { AppState, ContributionRecord } from "./types";

function toEntry(record: ContributionRecord): ContributionEntry {
  return { year: record.year, amountCents: record.amountCents };
}

export function selectTfsaResult(state: AppState, asOfYear: number): TfsaResult | null {
  if (state.profile.birthYear === null) {
    return null;
  }

  return calculateTfsaRoom({
    birthYear: state.profile.birthYear,
    residencyStartYear: state.profile.residencyStartYear ?? undefined,
    contributions: state.accounts.tfsa.contributions.map(toEntry),
    withdrawals: state.accounts.tfsa.withdrawals.map(toEntry),
    asOfYear,
  });
}

export function selectFhsaResult(state: AppState, asOfYear: number): FhsaResult | null {
  if (state.profile.birthYear === null) {
    return null;
  }

  return calculateFhsaRoom({
    birthYear: state.profile.birthYear,
    accountOpenedYear: state.accounts.fhsa.accountOpenedYear ?? undefined,
    firstQualifyingWithdrawalYear: state.accounts.fhsa.firstQualifyingWithdrawalYear ?? undefined,
    contributions: state.accounts.fhsa.contributions.map(toEntry),
    asOfYear,
  });
}

export function selectRrspResult(state: AppState, asOfYear: number): RrspResult | null {
  if (state.profile.birthYear === null) {
    return null;
  }

  return calculateRrspRoom({
    birthYear: state.profile.birthYear,
    earnedIncomeCentsByYear: state.accounts.rrsp.earnedIncomeCentsByYear,
    pensionAdjustmentCentsByYear: state.profile.hasEmployerPension
      ? state.accounts.rrsp.pensionAdjustmentCentsByYear
      : undefined,
    priorUnusedRoomOverrideCents: state.accounts.rrsp.priorUnusedRoomOverrideCents ?? undefined,
    contributions: state.accounts.rrsp.contributions.map(toEntry),
    asOfYear,
  });
}

export interface AllResults {
  tfsa: TfsaResult | null;
  fhsa: FhsaResult | null;
  rrsp: RrspResult | null;
}

export function selectAllResults(state: AppState, asOfYear: number): AllResults {
  return {
    tfsa: selectTfsaResult(state, asOfYear),
    fhsa: selectFhsaResult(state, asOfYear),
    rrsp: selectRrspResult(state, asOfYear),
  };
}
