import {
  getTfsaLimit,
  isYearSupported,
  PENALTY_RATE_PER_MONTH,
  TFSA_FIRST_YEAR,
} from "../data/limits";
import { getTfsaEligibility } from "./shared/eligibility";
import { ERROR_CODES, ValidationError, type Warning } from "./shared/errors";
import { addCents } from "./shared/money";
import { assertNoDuplicateYears, validateAmountCents, validateYear } from "./shared/validation";

export interface ContributionEntry {
  year: number;
  amountCents: number;
}

export interface TfsaYearBreakdown {
  year: number;
  annualLimitCents: number;
  withdrawalsAddedBackCents: number;
  roomAvailableCents: number;
  contributedCents: number;
  cumulativeRoomRemainingCents: number;
}

export interface TfsaResult {
  account: "tfsa";
  asOfYear: number;
  eligible: boolean;
  eligibilityStartYear: number;
  totalRoomEarnedCents: number;
  totalContributedCents: number;
  totalWithdrawnCents: number;
  remainingRoomCents: number;
  isOverContributed: boolean;
  overContributionCents: number;
  estimatedMonthlyPenaltyCents: number;
  yearlyBreakdown: TfsaYearBreakdown[];
  warnings: Warning[];
}

export interface CalculateTfsaRoomInput {
  birthYear: number;
  residencyStartYear?: number;
  contributions: readonly ContributionEntry[];
  withdrawals?: readonly ContributionEntry[];
  asOfYear: number;
}

function toYearMap(entries: readonly ContributionEntry[]): Map<number, number> {
  return new Map(entries.map((entry) => [entry.year, entry.amountCents]));
}

export function calculateTfsaRoom({
  birthYear,
  residencyStartYear,
  contributions,
  withdrawals = [],
  asOfYear,
}: CalculateTfsaRoomInput): TfsaResult {
  assertNoDuplicateYears(contributions);
  assertNoDuplicateYears(withdrawals);

  const { eligible, eligibilityStartYear } = getTfsaEligibility({
    birthYear,
    residencyStartYear,
    asOfYear,
  });

  for (const entry of [...contributions, ...withdrawals]) {
    validateYear(entry.year, { asOfYear, minYear: TFSA_FIRST_YEAR });
    validateAmountCents(entry.amountCents);

    if (entry.year < eligibilityStartYear) {
      throw new ValidationError(
        ERROR_CODES.YEAR_BEFORE_ELIGIBILITY,
        `${entry.year} is before this person had TFSA room (eligible from ${eligibilityStartYear}).`,
        entry.year,
      );
    }
  }

  const contributionsByYear = toYearMap(contributions);
  const withdrawalsByYear = toYearMap(withdrawals);
  const warnings: Warning[] = [];
  const yearlyBreakdown: TfsaYearBreakdown[] = [];

  let cumulativeRoomRemainingCents = 0;
  let totalRoomEarnedCents = 0;

  if (eligible) {
    for (let year = eligibilityStartYear; year <= asOfYear; year += 1) {
      const withdrawalsAddedBackCents = withdrawalsByYear.get(year - 1) ?? 0;
      let annualLimitCents = 0;

      if (isYearSupported("tfsa", year)) {
        annualLimitCents = getTfsaLimit(year) * 100;
      } else {
        warnings.push({
          code: ERROR_CODES.UNKNOWN_LIMIT_YEAR,
          message: `CRA has not published a TFSA limit for ${year} yet; it is excluded from this estimate.`,
          year,
        });
      }

      const roomAvailableCents = addCents(
        cumulativeRoomRemainingCents,
        annualLimitCents,
        withdrawalsAddedBackCents,
      );
      const contributedCents = contributionsByYear.get(year) ?? 0;
      cumulativeRoomRemainingCents = roomAvailableCents - contributedCents;
      totalRoomEarnedCents = addCents(
        totalRoomEarnedCents,
        annualLimitCents,
        withdrawalsAddedBackCents,
      );

      yearlyBreakdown.push({
        year,
        annualLimitCents,
        withdrawalsAddedBackCents,
        roomAvailableCents,
        contributedCents,
        cumulativeRoomRemainingCents,
      });
    }
  }

  const totalContributedCents = addCents(...[...contributionsByYear.values()]);
  const totalWithdrawnCents = addCents(...[...withdrawalsByYear.values()]);
  const remainingRoomCents = cumulativeRoomRemainingCents;
  const isOverContributed = remainingRoomCents < 0;
  const overContributionCents = isOverContributed ? -remainingRoomCents : 0;
  const estimatedMonthlyPenaltyCents = Math.round(overContributionCents * PENALTY_RATE_PER_MONTH);

  return {
    account: "tfsa",
    asOfYear,
    eligible,
    eligibilityStartYear,
    totalRoomEarnedCents,
    totalContributedCents,
    totalWithdrawnCents,
    remainingRoomCents,
    isOverContributed,
    overContributionCents,
    estimatedMonthlyPenaltyCents,
    yearlyBreakdown,
    warnings,
  };
}
