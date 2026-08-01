import {
  FHSA_LIFETIME_LIMIT,
  FHSA_MAX_AGE,
  FHSA_MAX_CARRYFORWARD,
  FHSA_MAX_PARTICIPATION_YEARS,
  getFhsaLimit,
  isYearSupported,
  PENALTY_RATE_PER_MONTH,
} from "../data/limits";
import { getFhsaEligibility } from "./shared/eligibility";
import { ERROR_CODES, ValidationError, type Warning } from "./shared/errors";
import { addCents } from "./shared/money";
import { assertNoDuplicateYears, validateAmountCents, validateYear } from "./shared/validation";
import type { ContributionEntry } from "./shared/types";

export type FhsaClosureReason = "15_YEAR" | "AGE_71" | "QUALIFYING_WITHDRAWAL" | null;

export interface FhsaYearBreakdown {
  year: number;
  annualIncrementCents: number;
  carryforwardCents: number;
  roomAvailableCents: number;
  contributedCents: number;
  unusedThisYearCents: number;
}

export interface FhsaResult {
  account: "fhsa";
  asOfYear: number;
  eligible: boolean;
  eligibilityStartYear: number;
  hasAccountOpen: boolean;
  lifetimeContributedCents: number;
  lifetimeRemainingCents: number;
  remainingRoomCents: number;
  isOverContributed: boolean;
  overContributionCents: number;
  estimatedMonthlyPenaltyCents: number;
  participationPeriodEndYear: number | null;
  isParticipationPeriodOver: boolean;
  closureReason: FhsaClosureReason;
  yearlyBreakdown: FhsaYearBreakdown[];
  warnings: Warning[];
}

export interface CalculateFhsaRoomInput {
  birthYear: number;
  accountOpenedYear?: number;
  contributions: readonly ContributionEntry[];
  firstQualifyingWithdrawalYear?: number;
  asOfYear: number;
}

function getParticipationPeriodEnd(
  accountOpenedYear: number,
  birthYear: number,
  firstQualifyingWithdrawalYear: number | undefined,
): { endYear: number; reason: FhsaClosureReason } {
  const fifteenYearEnd = accountOpenedYear + FHSA_MAX_PARTICIPATION_YEARS;
  const age71End = birthYear + FHSA_MAX_AGE;
  const withdrawalEnd =
    firstQualifyingWithdrawalYear !== undefined ? firstQualifyingWithdrawalYear + 1 : Infinity;

  const endYear = Math.min(fifteenYearEnd, age71End, withdrawalEnd);

  if (endYear === withdrawalEnd) {
    return { endYear, reason: "QUALIFYING_WITHDRAWAL" };
  }
  if (endYear === age71End) {
    return { endYear, reason: "AGE_71" };
  }
  return { endYear, reason: "15_YEAR" };
}

export function calculateFhsaRoom({
  birthYear,
  accountOpenedYear,
  contributions,
  firstQualifyingWithdrawalYear,
  asOfYear,
}: CalculateFhsaRoomInput): FhsaResult {
  assertNoDuplicateYears(contributions);

  const { eligible, eligibilityStartYear } = getFhsaEligibility({ birthYear, asOfYear });
  const hasAccountOpen = accountOpenedYear !== undefined;

  if (hasAccountOpen) {
    validateYear(accountOpenedYear, { asOfYear });
    if (accountOpenedYear < eligibilityStartYear) {
      throw new ValidationError(
        ERROR_CODES.YEAR_BEFORE_ELIGIBILITY,
        `An FHSA cannot open in ${accountOpenedYear}, before this person was eligible (${eligibilityStartYear}).`,
        accountOpenedYear,
      );
    }
  } else if (contributions.length > 0) {
    throw new ValidationError(
      ERROR_CODES.YEAR_BEFORE_ACCOUNT_EXISTS,
      "Contributions were provided but no FHSA has ever been opened.",
    );
  }

  const warnings: Warning[] = [];
  const yearlyBreakdown: FhsaYearBreakdown[] = [];
  let participationPeriodEndYear: number | null = null;
  let closureReason: FhsaClosureReason = null;

  if (hasAccountOpen) {
    const period = getParticipationPeriodEnd(
      accountOpenedYear,
      birthYear,
      firstQualifyingWithdrawalYear,
    );
    participationPeriodEndYear = period.endYear;
    closureReason = asOfYear >= period.endYear ? period.reason : null;

    for (const entry of contributions) {
      validateYear(entry.year, { asOfYear, minYear: accountOpenedYear });
      validateAmountCents(entry.amountCents);

      if (entry.year < accountOpenedYear) {
        throw new ValidationError(
          ERROR_CODES.YEAR_BEFORE_ACCOUNT_EXISTS,
          `${entry.year} is before the FHSA was opened (${accountOpenedYear}).`,
          entry.year,
        );
      }

      if (entry.year > period.endYear) {
        throw new ValidationError(
          ERROR_CODES.FHSA_PERIOD_EXPIRED,
          `The FHSA participation period ended in ${period.endYear}; ${entry.year} is not valid.`,
          entry.year,
        );
      }
    }
  }

  const contributionsByYear = new Map(
    contributions.map((entry) => [entry.year, entry.amountCents]),
  );

  let carryforwardCents = 0;
  let lifetimeContributedCents = 0;
  let unusedThisYearCents = 0;

  if (hasAccountOpen) {
    const loopEndYear = Math.min(asOfYear, participationPeriodEndYear ?? asOfYear);

    for (let year = accountOpenedYear; year <= loopEndYear; year += 1) {
      let annualIncrementCents = 0;

      if (isYearSupported("fhsa", year)) {
        annualIncrementCents = getFhsaLimit(year) * 100;
      } else {
        warnings.push({
          code: ERROR_CODES.UNKNOWN_LIMIT_YEAR,
          message: `CRA has not published an FHSA limit for ${year} yet; it is excluded from this estimate.`,
          year,
        });
      }

      const lifetimeRemainingBeforeThisYear = FHSA_LIFETIME_LIMIT * 100 - lifetimeContributedCents;
      const roomAvailableRawCents = addCents(carryforwardCents, annualIncrementCents);
      const roomAvailableCents = Math.min(roomAvailableRawCents, lifetimeRemainingBeforeThisYear);

      const contributedCents = contributionsByYear.get(year) ?? 0;
      unusedThisYearCents = roomAvailableCents - contributedCents;
      lifetimeContributedCents = addCents(lifetimeContributedCents, contributedCents);
      carryforwardCents = Math.min(unusedThisYearCents, FHSA_MAX_CARRYFORWARD * 100);

      yearlyBreakdown.push({
        year,
        annualIncrementCents,
        carryforwardCents: roomAvailableCents - annualIncrementCents,
        roomAvailableCents,
        contributedCents,
        unusedThisYearCents,
      });
    }
  }

  const lifetimeRemainingCents = FHSA_LIFETIME_LIMIT * 100 - lifetimeContributedCents;
  const remainingRoomCents = hasAccountOpen ? unusedThisYearCents : 0;
  const isOverContributed = remainingRoomCents < 0;
  const overContributionCents = isOverContributed ? -remainingRoomCents : 0;
  const estimatedMonthlyPenaltyCents = Math.round(overContributionCents * PENALTY_RATE_PER_MONTH);

  return {
    account: "fhsa",
    asOfYear,
    eligible,
    eligibilityStartYear,
    hasAccountOpen,
    lifetimeContributedCents,
    lifetimeRemainingCents,
    remainingRoomCents,
    isOverContributed,
    overContributionCents,
    estimatedMonthlyPenaltyCents,
    participationPeriodEndYear,
    isParticipationPeriodOver: closureReason !== null,
    closureReason,
    yearlyBreakdown,
    warnings,
  };
}
