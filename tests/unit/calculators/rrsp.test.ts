import { describe, expect, it } from "vitest";
import { calculateRrspRoom } from "../../../src/calculators/rrsp";
import { ValidationError } from "../../../src/calculators/shared/errors";
import { rrspScenarios } from "../../shared/scenarios/rrsp.scenarios";

describe("calculateRrspRoom scenarios", () => {
  for (const scenario of rrspScenarios) {
    it(scenario.name, () => {
      const result = calculateRrspRoom(scenario.input);

      expect(result.eligible).toBe(scenario.expected.eligible);
      expect(result.remainingRoomCents).toBe(scenario.expected.remainingRoomCents);
      expect(result.isOverContributed).toBe(scenario.expected.isOverContributed);
      expect(result.overContributionCents).toBe(scenario.expected.overContributionCents);
      expect(result.estimatedMonthlyPenaltyCents).toBe(
        scenario.expected.estimatedMonthlyPenaltyCents,
      );
    });
  }
});

describe("calculateRrspRoom", () => {
  it("lands exactly on the dollar cap boundary (18% of income equals the cap)", () => {
    const result = calculateRrspRoom({
      birthYear: 1980,
      earnedIncomeCentsByYear: { 2025: 18_783_333 },
      contributions: [],
      asOfYear: 2026,
    });

    expect(result.remainingRoomCents).toBe(3_381_000);
  });

  it("has no minimum age - a child with earned income accrues room", () => {
    const result = calculateRrspRoom({
      birthYear: 2015,
      earnedIncomeCentsByYear: { 2025: 500_000 },
      contributions: [],
      asOfYear: 2026,
    });

    expect(result.eligible).toBe(true);
    expect(result.remainingRoomCents).toBe(90_000);
  });

  it("treats a year with zero recorded income as zero new room without losing carryforward", () => {
    const result = calculateRrspRoom({
      birthYear: 1980,
      earnedIncomeCentsByYear: { 2024: 5_000_000, 2025: 0 },
      contributions: [],
      asOfYear: 2026,
    });

    // 2025 room (from 2024 income) carries into 2026 untouched, since
    // 2025's own income was $0 and generated no *additional* room.
    expect(result.remainingRoomCents).toBe(900_000);
  });

  it("warns and treats a year with no income record at all as zero new room", () => {
    const result = calculateRrspRoom({
      birthYear: 1980,
      earnedIncomeCentsByYear: { 2024: 5_000_000 },
      contributions: [],
      asOfYear: 2026,
    });

    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "MISSING_EARNED_INCOME", year: 2026 }),
    );
    expect(result.remainingRoomCents).toBe(900_000);
  });

  it("reduces new room by the pension adjustment", () => {
    const result = calculateRrspRoom({
      birthYear: 1980,
      earnedIncomeCentsByYear: { 2025: 5_000_000 },
      pensionAdjustmentCentsByYear: { 2025: 500_000 },
      contributions: [],
      asOfYear: 2026,
    });

    expect(result.remainingRoomCents).toBe(400_000);
  });

  it("floors new room at zero when the pension adjustment exceeds it", () => {
    const result = calculateRrspRoom({
      birthYear: 1980,
      earnedIncomeCentsByYear: { 2025: 500_000 },
      pensionAdjustmentCentsByYear: { 2025: 1_000_000 },
      contributions: [],
      asOfYear: 2026,
    });

    expect(result.remainingRoomCents).toBe(0);
    expect(result.isOverContributed).toBe(false);
  });

  it("lets priorUnusedRoomOverrideCents stand in for untracked history", () => {
    const result = calculateRrspRoom({
      birthYear: 1980,
      earnedIncomeCentsByYear: { 2025: 5_000_000 },
      priorUnusedRoomOverrideCents: 10_000_000,
      contributions: [],
      asOfYear: 2026,
    });

    expect(result.remainingRoomCents).toBe(10_900_000);
  });

  it("remains eligible in the year the holder turns 71", () => {
    const result = calculateRrspRoom({
      birthYear: 1955,
      earnedIncomeCentsByYear: { 2025: 5_000_000 },
      contributions: [],
      asOfYear: 2026,
    });

    expect(result.mustCollapseByYear).toBe(2026);
    expect(result.eligible).toBe(true);
  });

  it("is no longer eligible the year after the holder turns 71", () => {
    const result = calculateRrspRoom({
      birthYear: 1954,
      earnedIncomeCentsByYear: {},
      contributions: [],
      asOfYear: 2026,
    });

    expect(result.mustCollapseByYear).toBe(2025);
    expect(result.eligible).toBe(false);
  });

  it("rejects a contribution dated after the must-collapse-by year", () => {
    expect(() =>
      calculateRrspRoom({
        birthYear: 1954,
        earnedIncomeCentsByYear: {},
        contributions: [{ year: 2026, amountCents: 100 }],
        asOfYear: 2026,
      }),
    ).toThrow(ValidationError);
  });

  it("returns zero room when there is no income, contribution, or override data at all", () => {
    const result = calculateRrspRoom({
      birthYear: 1980,
      contributions: [],
      asOfYear: 2026,
    });

    expect(result.remainingRoomCents).toBe(0);
    expect(result.yearlyBreakdown).toEqual([]);
  });
});
