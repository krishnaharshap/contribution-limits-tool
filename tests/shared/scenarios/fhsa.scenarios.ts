import type { CalculateFhsaRoomInput } from "../../../src/calculators/fhsa";

export interface FhsaScenario {
  name: string;
  input: CalculateFhsaRoomInput;
  expected: {
    eligible: boolean;
    hasAccountOpen: boolean;
    remainingRoomCents: number;
    isOverContributed: boolean;
    overContributionCents: number;
  };
}

export const fhsaScenarios: FhsaScenario[] = [
  {
    name: "no FHSA ever opened has zero room, even though old enough",
    input: {
      birthYear: 1990,
      contributions: [],
      asOfYear: 2026,
    },
    expected: {
      eligible: true,
      hasAccountOpen: false,
      remainingRoomCents: 0,
      isOverContributed: false,
      overContributionCents: 0,
    },
  },
  {
    name: "opened this year gets only this year's $8,000, not the years already eligible",
    input: {
      birthYear: 1990,
      accountOpenedYear: 2026,
      contributions: [],
      asOfYear: 2026,
    },
    expected: {
      eligible: true,
      hasAccountOpen: true,
      remainingRoomCents: 800_000,
      isOverContributed: false,
      overContributionCents: 0,
    },
  },
  {
    name: "carryforward is capped at $8,000 and does not compound across skipped years",
    input: {
      birthYear: 1990,
      accountOpenedYear: 2023,
      contributions: [],
      asOfYear: 2026,
    },
    expected: {
      eligible: true,
      hasAccountOpen: true,
      // Not $32,000 (4 years x $8,000): only one prior year's unused
      // room carries forward, capping the visible room at $16,000.
      remainingRoomCents: 1_600_000,
      isOverContributed: false,
      overContributionCents: 0,
    },
  },
  {
    name: "contributing exactly the annual limit leaves zero room",
    input: {
      birthYear: 1990,
      accountOpenedYear: 2026,
      contributions: [{ year: 2026, amountCents: 800_000 }],
      asOfYear: 2026,
    },
    expected: {
      eligible: true,
      hasAccountOpen: true,
      remainingRoomCents: 0,
      isOverContributed: false,
      overContributionCents: 0,
    },
  },
  {
    name: "one dollar over the annual limit is flagged as over-contributed",
    input: {
      birthYear: 1990,
      accountOpenedYear: 2026,
      contributions: [{ year: 2026, amountCents: 800_100 }],
      asOfYear: 2026,
    },
    expected: {
      eligible: true,
      hasAccountOpen: true,
      remainingRoomCents: -100,
      isOverContributed: true,
      overContributionCents: 100,
    },
  },
  {
    name: "one dollar over even with a full $8,000 carryforward available",
    input: {
      birthYear: 1990,
      accountOpenedYear: 2023,
      contributions: [{ year: 2024, amountCents: 1_600_100 }],
      asOfYear: 2024,
    },
    expected: {
      eligible: true,
      hasAccountOpen: true,
      remainingRoomCents: -100,
      isOverContributed: true,
      overContributionCents: 100,
    },
  },
];
