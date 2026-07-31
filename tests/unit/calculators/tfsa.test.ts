import { describe, expect, it } from "vitest";
import { calculateTfsaRoom } from "../../../src/calculators/tfsa";
import { ValidationError } from "../../../src/calculators/shared/errors";
import { tfsaScenarios } from "../../shared/scenarios/tfsa.scenarios";

describe("calculateTfsaRoom scenarios", () => {
  for (const scenario of tfsaScenarios) {
    it(scenario.name, () => {
      const result = calculateTfsaRoom(scenario.input);

      expect(result.eligible).toBe(scenario.expected.eligible);
      expect(result.eligibilityStartYear).toBe(scenario.expected.eligibilityStartYear);
      expect(result.remainingRoomCents).toBe(scenario.expected.remainingRoomCents);
      expect(result.isOverContributed).toBe(scenario.expected.isOverContributed);
      expect(result.overContributionCents).toBe(scenario.expected.overContributionCents);
    });
  }
});

describe("calculateTfsaRoom", () => {
  it("handles the 2015 anomaly correctly (a one-year jump to $10,000, not monotonic)", () => {
    const result = calculateTfsaRoom({
      birthYear: 1980,
      contributions: [],
      asOfYear: 2016,
    });

    const year2015 = result.yearlyBreakdown.find((row) => row.year === 2015);
    const year2016 = result.yearlyBreakdown.find((row) => row.year === 2016);

    expect(year2015?.annualLimitCents).toBe(1_000_000);
    expect(year2016?.annualLimitCents).toBe(550_000);
  });

  it("charges an estimated 1%/month penalty on the over-contributed amount, no buffer", () => {
    const result = calculateTfsaRoom({
      birthYear: 2000,
      contributions: [{ year: 2018, amountCents: 550_100 }],
      asOfYear: 2018,
    });

    expect(result.estimatedMonthlyPenaltyCents).toBe(1);
  });

  it("does not restore withdrawn room in the same calendar year", () => {
    const result = calculateTfsaRoom({
      birthYear: 2007,
      contributions: [{ year: 2025, amountCents: 700_000 }],
      withdrawals: [{ year: 2025, amountCents: 700_000 }],
      asOfYear: 2025,
    });

    expect(result.remainingRoomCents).toBe(0);
    expect(result.isOverContributed).toBe(false);
  });

  it("rejects a contribution dated before the program existed", () => {
    expect(() =>
      calculateTfsaRoom({
        birthYear: 1950,
        contributions: [{ year: 2008, amountCents: 100 }],
        asOfYear: 2026,
      }),
    ).toThrow(ValidationError);
  });

  it("rejects a contribution dated before this person's eligibility began", () => {
    expect(() =>
      calculateTfsaRoom({
        birthYear: 2010,
        contributions: [{ year: 2026, amountCents: 100 }],
        asOfYear: 2026,
      }),
    ).toThrow(ValidationError);
  });

  it("rejects a contribution dated in the future", () => {
    expect(() =>
      calculateTfsaRoom({
        birthYear: 1980,
        contributions: [{ year: 2027, amountCents: 100 }],
        asOfYear: 2026,
      }),
    ).toThrow(ValidationError);
  });

  it("rejects duplicate entries for the same year", () => {
    expect(() =>
      calculateTfsaRoom({
        birthYear: 1980,
        contributions: [
          { year: 2024, amountCents: 100 },
          { year: 2024, amountCents: 200 },
        ],
        asOfYear: 2026,
      }),
    ).toThrow(ValidationError);
  });

  it("warns and excludes years with no published limit (TFSA 2027)", () => {
    const result = calculateTfsaRoom({
      birthYear: 1980,
      contributions: [],
      asOfYear: 2027,
    });

    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "UNKNOWN_LIMIT_YEAR", year: 2027 }),
    );
    const year2027 = result.yearlyBreakdown.find((row) => row.year === 2027);
    expect(year2027?.annualLimitCents).toBe(0);
  });

  it("returns a zeroed result for someone not yet eligible, with no breakdown rows", () => {
    const result = calculateTfsaRoom({
      birthYear: 2015,
      contributions: [],
      asOfYear: 2026,
    });

    expect(result.eligible).toBe(false);
    expect(result.yearlyBreakdown).toEqual([]);
    expect(result.totalRoomEarnedCents).toBe(0);
  });
});
