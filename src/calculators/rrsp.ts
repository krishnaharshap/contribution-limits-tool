import {
  getRrspDollarLimit,
  isYearSupported,
  PENALTY_RATE_PER_MONTH,
  RRSP_EARNED_INCOME_RATE,
  RRSP_OVERCONTRIBUTION_BUFFER,
} from "../data/limits";
import { getRrspEligibility } from "./shared/eligibility";
import { ERROR_CODES, ValidationError, type Warning } from "./shared/errors";
import { addCents } from "./shared/money";
import type { ContributionEntry } from "./shared/types";
import { assertNoDuplicateYears, validateAmountCents, validateYear } from "./shared/validation";

export interface RrspYearBreakdown {
  year: number;
  earnedIncomeYear: number;
  newRoomCents: number;
  pensionAdjustmentCents: number;
  roomAvailableCents: number;
  contributedCents: number;
  cumulativeRoomRemainingCents: number;
}

export interface RrspResult {
  account: "rrsp";
  asOfYear: number;
  eligible: boolean;
  mustCollapseByYear: number;
  totalContributedCents: number;
  totalPensionAdjustmentCents: number;
  remainingRoomCents: number;
  isOverContributed: boolean;
  overContributionCents: number;
  overContributionBeyondBufferCents: number;
  bufferRemainingCents: number;
  estimatedMonthlyPenaltyCents: number;
  yearlyBreakdown: RrspYearBreakdown[];
  warnings: Warning[];
}

export interface CalculateRrspRoomInput {
  birthYear: number;
  earnedIncomeCentsByYear?: Readonly<Record<number, number>>;
  contributions: readonly ContributionEntry[];
  pensionAdjustmentCentsByYear?: Readonly<Record<number, number>>;
  priorUnusedRoomOverrideCents?: number;
  asOfYear: number;
}

export function calculateRrspRoom({
  birthYear,
  earnedIncomeCentsByYear = {},
  contributions,
  pensionAdjustmentCentsByYear = {},
  priorUnusedRoomOverrideCents,
  asOfYear,
}: CalculateRrspRoomInput): RrspResult {
  assertNoDuplicateYears(contributions);

  const { eligible, mustCollapseByYear } = getRrspEligibility({ birthYear, asOfYear });

  for (const entry of contributions) {
    validateYear(entry.year, { asOfYear });
    validateAmountCents(entry.amountCents);

    if (entry.year > mustCollapseByYear) {
      throw new ValidationError(
        ERROR_CODES.RRSP_PAST_AGE_71,
        `${entry.year} is after this person had to collapse their RRSP (by ${mustCollapseByYear}).`,
        entry.year,
      );
    }
  }

  const contributionYears = contributions.map((entry) => entry.year);
  const incomeGeneratedRoomYears = Object.keys(earnedIncomeCentsByYear).map(
    (year) => Number(year) + 1,
  );
  const candidateYears = [...contributionYears, ...incomeGeneratedRoomYears];

  const warnings: Warning[] = [];
  const yearlyBreakdown: RrspYearBreakdown[] = [];
  const contributionsByYear = new Map(
    contributions.map((entry) => [entry.year, entry.amountCents]),
  );

  let totalContributedCents = 0;
  let totalPensionAdjustmentCents = 0;
  let cumulativeRoomRemainingCents = priorUnusedRoomOverrideCents ?? 0;

  if (candidateYears.length > 0) {
    const startYear = Math.min(...candidateYears);
    const endYear = Math.min(asOfYear, mustCollapseByYear);

    for (let year = startYear; year <= endYear; year += 1) {
      const earnedIncomeYear = year - 1;
      const earnedIncomeCents = earnedIncomeCentsByYear[earnedIncomeYear];
      const pensionAdjustmentCents = pensionAdjustmentCentsByYear[earnedIncomeYear] ?? 0;

      let newRoomCents = 0;

      if (earnedIncomeCents === undefined) {
        warnings.push({
          code: ERROR_CODES.MISSING_EARNED_INCOME,
          message: `No earned income on record for ${earnedIncomeYear}; ${year} contributes no new room.`,
          year,
        });
      } else if (!isYearSupported("rrsp", year)) {
        warnings.push({
          code: ERROR_CODES.UNKNOWN_LIMIT_YEAR,
          message: `CRA has not published an RRSP dollar limit for ${year} yet; it is excluded from this estimate.`,
          year,
        });
      } else {
        const incomeBasedRoomCents = Math.round(earnedIncomeCents * RRSP_EARNED_INCOME_RATE);
        const dollarCapCents = getRrspDollarLimit(year) * 100;
        newRoomCents = Math.max(
          0,
          Math.min(incomeBasedRoomCents, dollarCapCents) - pensionAdjustmentCents,
        );
      }

      const roomAvailableCents = addCents(cumulativeRoomRemainingCents, newRoomCents);
      const contributedCents = contributionsByYear.get(year) ?? 0;
      cumulativeRoomRemainingCents = roomAvailableCents - contributedCents;
      totalContributedCents = addCents(totalContributedCents, contributedCents);
      totalPensionAdjustmentCents = addCents(totalPensionAdjustmentCents, pensionAdjustmentCents);

      yearlyBreakdown.push({
        year,
        earnedIncomeYear,
        newRoomCents,
        pensionAdjustmentCents,
        roomAvailableCents,
        contributedCents,
        cumulativeRoomRemainingCents,
      });
    }
  }

  const remainingRoomCents = cumulativeRoomRemainingCents;
  const isOverContributed = remainingRoomCents < 0;
  const overContributionCents = isOverContributed ? -remainingRoomCents : 0;
  const bufferCents = RRSP_OVERCONTRIBUTION_BUFFER * 100;
  const overContributionBeyondBufferCents = Math.max(0, overContributionCents - bufferCents);
  const bufferRemainingCents = Math.max(0, bufferCents - overContributionCents);
  const estimatedMonthlyPenaltyCents = Math.round(
    overContributionBeyondBufferCents * PENALTY_RATE_PER_MONTH,
  );

  return {
    account: "rrsp",
    asOfYear,
    eligible,
    mustCollapseByYear,
    totalContributedCents,
    totalPensionAdjustmentCents,
    remainingRoomCents,
    isOverContributed,
    overContributionCents,
    overContributionBeyondBufferCents,
    bufferRemainingCents,
    estimatedMonthlyPenaltyCents,
    yearlyBreakdown,
    warnings,
  };
}
