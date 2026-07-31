import { describe, expect, it } from "vitest";
import {
  FHSA_ANNUAL_LIMITS,
  FHSA_FIRST_YEAR,
  RRSP_DOLLAR_LIMITS,
  RRSP_FIRST_YEAR,
  TFSA_ANNUAL_LIMITS,
  TFSA_FIRST_YEAR,
  getFhsaLimit,
  getMaxKnownYear,
  getMinKnownYear,
  getRrspDollarLimit,
  getTfsaLimit,
  isYearSupported,
} from "../../../src/data/limits";

function years(table: Readonly<Record<number, number>>): number[] {
  return Object.keys(table)
    .map(Number)
    .sort((a, b) => a - b);
}

function sum(table: Readonly<Record<number, number>>): number {
  return Object.values(table).reduce((total, value) => total + value, 0);
}

describe("TFSA_ANNUAL_LIMITS", () => {
  it("is frozen", () => {
    expect(Object.isFrozen(TFSA_ANNUAL_LIMITS)).toBe(true);
  });

  it("has no gaps from its first year through its max known year", () => {
    const yearList = years(TFSA_ANNUAL_LIMITS);
    const maxYear = getMaxKnownYear("tfsa");

    for (let year = TFSA_FIRST_YEAR; year <= maxYear; year += 1) {
      expect(yearList).toContain(year);
    }
  });

  it("has the 2015 anomaly ($10,000, not a monotonic increase)", () => {
    expect(TFSA_ANNUAL_LIMITS[2015]).toBe(10000);
    expect(TFSA_ANNUAL_LIMITS[2016]).toBe(5500);
  });

  it("sums to $109,000 of cumulative room from 2009 through 2026", () => {
    expect(sum(TFSA_ANNUAL_LIMITS)).toBe(109000);
  });

  it("throws for an unpublished year", () => {
    expect(() => getTfsaLimit(2027)).toThrow(RangeError);
    expect(() => getTfsaLimit(2008)).toThrow(RangeError);
  });

  it("reports 2026 as the max known year", () => {
    expect(getMaxKnownYear("tfsa")).toBe(2026);
    expect(isYearSupported("tfsa", 2026)).toBe(true);
    expect(isYearSupported("tfsa", 2027)).toBe(false);
  });
});

describe("FHSA_ANNUAL_LIMITS", () => {
  it("is frozen", () => {
    expect(Object.isFrozen(FHSA_ANNUAL_LIMITS)).toBe(true);
  });

  it("has no gaps from its first year (2023) through its max known year", () => {
    const yearList = years(FHSA_ANNUAL_LIMITS);
    const maxYear = getMaxKnownYear("fhsa");

    for (let year = FHSA_FIRST_YEAR; year <= maxYear; year += 1) {
      expect(yearList).toContain(year);
    }
  });

  it("has held flat at $8,000 every year since introduction", () => {
    for (const value of Object.values(FHSA_ANNUAL_LIMITS)) {
      expect(value).toBe(8000);
    }
  });

  it("throws for a year before FHSA existed", () => {
    expect(() => getFhsaLimit(2022)).toThrow(RangeError);
  });
});

describe("RRSP_DOLLAR_LIMITS", () => {
  it("is frozen", () => {
    expect(Object.isFrozen(RRSP_DOLLAR_LIMITS)).toBe(true);
  });

  it("has no gaps from its first year through its max known year", () => {
    const yearList = years(RRSP_DOLLAR_LIMITS);
    const maxYear = getMaxKnownYear("rrsp");

    for (let year = RRSP_FIRST_YEAR; year <= maxYear; year += 1) {
      expect(yearList).toContain(year);
    }
  });

  it("is known one year further ahead than TFSA (2027 vs 2026)", () => {
    expect(getMaxKnownYear("rrsp")).toBe(2027);
    expect(getMaxKnownYear("tfsa")).toBe(2026);
    expect(getRrspDollarLimit(2027)).toBe(35390);
  });

  it("throws for an unpublished year", () => {
    expect(() => getRrspDollarLimit(2028)).toThrow(RangeError);
  });
});

describe("getMinKnownYear", () => {
  it("matches each account's documented first year", () => {
    expect(getMinKnownYear("tfsa")).toBe(TFSA_FIRST_YEAR);
    expect(getMinKnownYear("fhsa")).toBe(FHSA_FIRST_YEAR);
    expect(getMinKnownYear("rrsp")).toBe(RRSP_FIRST_YEAR);
  });
});
