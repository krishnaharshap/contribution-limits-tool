import { describe, expect, it } from "vitest";
import {
  assertNoDuplicateYears,
  validateAmountCents,
  validateYear,
} from "../../../../src/calculators/shared/validation";
import { ValidationError } from "../../../../src/calculators/shared/errors";

describe("validateYear", () => {
  it("accepts a year at or before asOfYear", () => {
    expect(() => validateYear(2026, { asOfYear: 2026 })).not.toThrow();
    expect(() => validateYear(2020, { asOfYear: 2026 })).not.toThrow();
  });

  it("rejects a future year", () => {
    expect(() => validateYear(2027, { asOfYear: 2026 })).toThrow(ValidationError);
    try {
      validateYear(2027, { asOfYear: 2026 });
    } catch (error) {
      expect((error as ValidationError).code).toBe("FUTURE_YEAR");
    }
  });

  it("rejects a non-integer year", () => {
    expect(() => validateYear(2020.5, { asOfYear: 2026 })).toThrow(ValidationError);
  });

  it("rejects a year before an explicit minYear", () => {
    expect(() => validateYear(2008, { asOfYear: 2026, minYear: 2009 })).toThrow(ValidationError);
  });
});

describe("validateAmountCents", () => {
  it("accepts zero (a valid 'contributed nothing' entry)", () => {
    expect(() => validateAmountCents(0)).not.toThrow();
  });

  it("accepts a positive amount", () => {
    expect(() => validateAmountCents(500_00)).not.toThrow();
  });

  it("rejects NaN", () => {
    expect(() => validateAmountCents(Number.NaN)).toThrow(ValidationError);
  });

  it("rejects a negative amount", () => {
    expect(() => validateAmountCents(-1)).toThrow(ValidationError);
  });

  it("rejects an amount above the sanity cap", () => {
    expect(() => validateAmountCents(10_000_001_00)).toThrow(ValidationError);
  });

  it("accepts an amount exactly at the sanity cap", () => {
    expect(() => validateAmountCents(10_000_000_00)).not.toThrow();
  });
});

describe("assertNoDuplicateYears", () => {
  it("passes for entries with unique years", () => {
    expect(() => assertNoDuplicateYears([{ year: 2024 }, { year: 2025 }])).not.toThrow();
  });

  it("throws for a repeated year", () => {
    expect(() => assertNoDuplicateYears([{ year: 2024 }, { year: 2024 }])).toThrow(ValidationError);
  });

  it("passes for an empty list", () => {
    expect(() => assertNoDuplicateYears([])).not.toThrow();
  });
});
