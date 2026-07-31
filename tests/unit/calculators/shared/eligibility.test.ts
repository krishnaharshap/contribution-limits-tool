import { describe, expect, it } from "vitest";
import {
  getFhsaEligibility,
  getRrspEligibility,
  getTfsaEligibility,
} from "../../../../src/calculators/shared/eligibility";

describe("getTfsaEligibility", () => {
  it("is not eligible before turning 18", () => {
    const result = getTfsaEligibility({ birthYear: 2010, asOfYear: 2026 });
    expect(result.eligible).toBe(false);
    expect(result.eligibilityStartYear).toBe(2028);
  });

  it("becomes eligible the year the person turns 18", () => {
    const result = getTfsaEligibility({ birthYear: 2008, asOfYear: 2026 });
    expect(result.eligible).toBe(true);
    expect(result.eligibilityStartYear).toBe(2026);
  });

  it("defers to residencyStartYear when it is later than turning 18", () => {
    const result = getTfsaEligibility({
      birthYear: 1990,
      residencyStartYear: 2020,
      asOfYear: 2026,
    });
    expect(result.eligibilityStartYear).toBe(2020);
  });

  it("never starts before the TFSA program existed (2009)", () => {
    const result = getTfsaEligibility({ birthYear: 1980, asOfYear: 2026 });
    expect(result.eligibilityStartYear).toBe(2009);
  });
});

describe("getFhsaEligibility", () => {
  it("is not eligible before turning 18", () => {
    const result = getFhsaEligibility({ birthYear: 2010, asOfYear: 2026 });
    expect(result.eligible).toBe(false);
  });

  it("never starts before FHSA existed (2023), even for someone already 18+", () => {
    const result = getFhsaEligibility({ birthYear: 1980, asOfYear: 2026 });
    expect(result.eligibilityStartYear).toBe(2023);
  });
});

describe("getRrspEligibility", () => {
  it("has no minimum age - a child with earned income is eligible", () => {
    const result = getRrspEligibility({ birthYear: 2020, asOfYear: 2026 });
    expect(result.eligible).toBe(true);
  });

  it("remains eligible in the year the holder turns 71", () => {
    const result = getRrspEligibility({ birthYear: 1955, asOfYear: 2026 });
    expect(result.mustCollapseByYear).toBe(2026);
    expect(result.eligible).toBe(true);
  });

  it("is not eligible the year after the holder turns 71", () => {
    const result = getRrspEligibility({ birthYear: 1954, asOfYear: 2026 });
    expect(result.mustCollapseByYear).toBe(2025);
    expect(result.eligible).toBe(false);
  });
});
