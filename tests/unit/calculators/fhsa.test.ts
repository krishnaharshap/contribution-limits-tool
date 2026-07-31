import { describe, expect, it } from "vitest";
import { calculateFhsaRoom } from "../../../src/calculators/fhsa";
import { ValidationError } from "../../../src/calculators/shared/errors";
import { fhsaScenarios } from "../../shared/scenarios/fhsa.scenarios";

describe("calculateFhsaRoom scenarios", () => {
  for (const scenario of fhsaScenarios) {
    it(scenario.name, () => {
      const result = calculateFhsaRoom(scenario.input);

      expect(result.eligible).toBe(scenario.expected.eligible);
      expect(result.hasAccountOpen).toBe(scenario.expected.hasAccountOpen);
      expect(result.remainingRoomCents).toBe(scenario.expected.remainingRoomCents);
      expect(result.isOverContributed).toBe(scenario.expected.isOverContributed);
      expect(result.overContributionCents).toBe(scenario.expected.overContributionCents);
    });
  }
});

describe("calculateFhsaRoom lifetime cap", () => {
  it("tracks lifetime contributed and remaining independently of the annual rule", () => {
    const result = calculateFhsaRoom({
      birthYear: 1990,
      accountOpenedYear: 2023,
      contributions: [{ year: 2023, amountCents: 4_000_000 }],
      asOfYear: 2023,
    });

    // $40,000 in one year blows past the $8,000 annual rule (flagged
    // below), but exactly exhausts the separate $40,000 lifetime cap.
    expect(result.lifetimeContributedCents).toBe(4_000_000);
    expect(result.lifetimeRemainingCents).toBe(0);
    expect(result.isOverContributed).toBe(true);
  });

  it("does not let lifetime remaining go informative-negative beyond what was actually contributed", () => {
    const result = calculateFhsaRoom({
      birthYear: 1990,
      accountOpenedYear: 2023,
      contributions: [{ year: 2023, amountCents: 4_500_000 }],
      asOfYear: 2023,
    });

    expect(result.lifetimeContributedCents).toBe(4_500_000);
    expect(result.lifetimeRemainingCents).toBe(-500_000);
  });
});

describe("calculateFhsaRoom participation period", () => {
  it("closes 15 years after opening", () => {
    const result = calculateFhsaRoom({
      birthYear: 1980,
      accountOpenedYear: 2023,
      contributions: [],
      asOfYear: 2038,
    });

    expect(result.participationPeriodEndYear).toBe(2038);
    expect(result.isParticipationPeriodOver).toBe(true);
    expect(result.closureReason).toBe("15_YEAR");
  });

  it("rejects a contribution dated after the 15-year period ends", () => {
    expect(() =>
      calculateFhsaRoom({
        birthYear: 1980,
        accountOpenedYear: 2023,
        contributions: [{ year: 2039, amountCents: 100 }],
        asOfYear: 2039,
      }),
    ).toThrow(ValidationError);
  });

  it("closes at age 71 when that comes before the 15-year mark", () => {
    const result = calculateFhsaRoom({
      birthYear: 1954,
      accountOpenedYear: 2023,
      contributions: [],
      asOfYear: 2026,
    });

    expect(result.participationPeriodEndYear).toBe(2025);
    expect(result.closureReason).toBe("AGE_71");
  });

  it("closes the year after the first qualifying withdrawal", () => {
    const result = calculateFhsaRoom({
      birthYear: 1980,
      accountOpenedYear: 2023,
      contributions: [],
      firstQualifyingWithdrawalYear: 2025,
      asOfYear: 2026,
    });

    expect(result.participationPeriodEndYear).toBe(2026);
    expect(result.closureReason).toBe("QUALIFYING_WITHDRAWAL");
  });
});

describe("calculateFhsaRoom validation", () => {
  it("rejects contributions when no account was ever opened", () => {
    expect(() =>
      calculateFhsaRoom({
        birthYear: 1990,
        contributions: [{ year: 2026, amountCents: 100 }],
        asOfYear: 2026,
      }),
    ).toThrow(ValidationError);
  });

  it("rejects a contribution dated before the account was opened", () => {
    expect(() =>
      calculateFhsaRoom({
        birthYear: 1990,
        accountOpenedYear: 2024,
        contributions: [{ year: 2023, amountCents: 100 }],
        asOfYear: 2026,
      }),
    ).toThrow(ValidationError);
  });

  it("rejects opening an account before the person was eligible", () => {
    expect(() =>
      calculateFhsaRoom({
        birthYear: 2010,
        accountOpenedYear: 2026,
        contributions: [],
        asOfYear: 2026,
      }),
    ).toThrow(ValidationError);
  });

  it("rejects an account opened before FHSA existed", () => {
    expect(() =>
      calculateFhsaRoom({
        birthYear: 1970,
        accountOpenedYear: 2022,
        contributions: [],
        asOfYear: 2026,
      }),
    ).toThrow(ValidationError);
  });
});
