import type { CalculateRrspRoomInput } from "../../../src/calculators/rrsp";

export interface RrspScenario {
  name: string;
  input: CalculateRrspRoomInput;
  expected: {
    eligible: boolean;
    remainingRoomCents: number;
    isOverContributed: boolean;
    overContributionCents: number;
    estimatedMonthlyPenaltyCents: number;
  };
}

export const rrspScenarios: RrspScenario[] = [
  {
    name: "$50,000 of prior-year income generates 18% of it as new room",
    input: {
      birthYear: 1980,
      earnedIncomeCentsByYear: { 2025: 5_000_000 },
      contributions: [],
      asOfYear: 2026,
    },
    expected: {
      eligible: true,
      remainingRoomCents: 900_000,
      isOverContributed: false,
      overContributionCents: 0,
      estimatedMonthlyPenaltyCents: 0,
    },
  },
  {
    name: "high income is capped at the year's dollar maximum, not 18% of income",
    input: {
      birthYear: 1980,
      earnedIncomeCentsByYear: { 2025: 25_000_000 },
      contributions: [],
      asOfYear: 2026,
    },
    expected: {
      eligible: true,
      remainingRoomCents: 3_381_000,
      isOverContributed: false,
      overContributionCents: 0,
      estimatedMonthlyPenaltyCents: 0,
    },
  },
  {
    name: "over-contributed by $1,500 stays within the $2,000 lifetime buffer",
    input: {
      birthYear: 1980,
      earnedIncomeCentsByYear: { 2025: 5_000_000 },
      contributions: [{ year: 2026, amountCents: 1_050_000 }],
      asOfYear: 2026,
    },
    expected: {
      eligible: true,
      remainingRoomCents: -150_000,
      isOverContributed: true,
      overContributionCents: 150_000,
      estimatedMonthlyPenaltyCents: 0,
    },
  },
  {
    name: "over-contributed by $2,001 is penalized only on the dollar beyond the buffer",
    input: {
      birthYear: 1980,
      earnedIncomeCentsByYear: { 2025: 5_000_000 },
      contributions: [{ year: 2026, amountCents: 1_100_100 }],
      asOfYear: 2026,
    },
    expected: {
      eligible: true,
      remainingRoomCents: -200_100,
      isOverContributed: true,
      overContributionCents: 200_100,
      estimatedMonthlyPenaltyCents: 1,
    },
  },
];
