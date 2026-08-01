import type { CalculateTfsaRoomInput } from "../../../src/calculators/tfsa";

/**
 * One corpus, two consumers: Vitest asserts these against
 * calculateTfsaRoom() directly, and the Playwright suite seeds this
 * same input into localStorage and asserts the *rendered* number
 * matches. A mismatch between the two pinpoints whether a bug is in
 * the math or in the display.
 */
export interface TfsaScenario {
  name: string;
  input: CalculateTfsaRoomInput;
  expected: {
    eligible: boolean;
    eligibilityStartYear: number;
    remainingRoomCents: number;
    isOverContributed: boolean;
    overContributionCents: number;
  };
}

export const tfsaScenarios: TfsaScenario[] = [
  {
    name: "eligible since the program began, no contributions ever made",
    input: {
      birthYear: 1980,
      contributions: [],
      withdrawals: [],
      asOfYear: 2026,
    },
    expected: {
      eligible: true,
      eligibilityStartYear: 2009,
      remainingRoomCents: 10_900_000,
      isOverContributed: false,
      overContributionCents: 0,
    },
  },
  {
    name: "contributed exactly the limit in the year eligibility begins",
    input: {
      birthYear: 2000,
      contributions: [{ year: 2018, amountCents: 550_000 }],
      withdrawals: [],
      asOfYear: 2018,
    },
    expected: {
      eligible: true,
      eligibilityStartYear: 2018,
      remainingRoomCents: 0,
      isOverContributed: false,
      overContributionCents: 0,
    },
  },
  {
    name: "over-contributed by exactly one dollar",
    input: {
      birthYear: 2000,
      contributions: [{ year: 2018, amountCents: 550_100 }],
      withdrawals: [],
      asOfYear: 2018,
    },
    expected: {
      eligible: true,
      eligibilityStartYear: 2018,
      remainingRoomCents: -100,
      isOverContributed: true,
      overContributionCents: 100,
    },
  },
  {
    name: "not yet eligible (turns 18 two years after asOfYear)",
    input: {
      birthYear: 2010,
      contributions: [],
      withdrawals: [],
      asOfYear: 2026,
    },
    expected: {
      eligible: false,
      eligibilityStartYear: 2028,
      remainingRoomCents: 0,
      isOverContributed: false,
      overContributionCents: 0,
    },
  },
  {
    name: "withdrawal restores room the following January, not the same year",
    input: {
      birthYear: 2007,
      contributions: [{ year: 2025, amountCents: 700_000 }],
      withdrawals: [{ year: 2025, amountCents: 700_000 }],
      asOfYear: 2026,
    },
    expected: {
      eligible: true,
      eligibilityStartYear: 2025,
      // 2026's own $7,000 limit, plus the $7,000 withdrawn in 2025
      // restored on 2026-01-01 - proves the "following year" rule.
      remainingRoomCents: 1_400_000,
      isOverContributed: false,
      overContributionCents: 0,
    },
  },
  {
    name: "residency starting after turning 18 delays eligibility",
    input: {
      birthYear: 1990,
      residencyStartYear: 2020,
      contributions: [],
      withdrawals: [],
      asOfYear: 2026,
    },
    expected: {
      eligible: true,
      eligibilityStartYear: 2020,
      // 6000*3 (2020-2022) + 6500 (2023) + 7000*3 (2024-2026)
      remainingRoomCents: 4_550_000,
      isOverContributed: false,
      overContributionCents: 0,
    },
  },
];
