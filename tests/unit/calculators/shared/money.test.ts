import { describe, expect, it } from "vitest";
import { addCents, formatCad, fromCents, toCents } from "../../../../src/calculators/shared/money";

describe("toCents", () => {
  it("converts whole dollars", () => {
    expect(toCents(100)).toBe(10000);
  });

  it("converts fractional dollars without float drift", () => {
    expect(toCents(19.99)).toBe(1999);
    expect(toCents(0.1)).toBe(10);
    expect(toCents(0.2)).toBe(20);
  });

  it("rounds to the nearest cent", () => {
    expect(toCents(1.005)).toBe(101);
  });
});

describe("fromCents", () => {
  it("is the inverse of toCents for whole and fractional amounts", () => {
    expect(fromCents(10000)).toBe(100);
    expect(fromCents(1999)).toBe(19.99);
  });
});

describe("addCents", () => {
  it("sums integer cents exactly across many small additions", () => {
    const eighteenYearsOfDimes = Array.from({ length: 18 }, () => toCents(0.1));
    expect(addCents(...eighteenYearsOfDimes)).toBe(180);
  });

  it("returns 0 for no arguments", () => {
    expect(addCents()).toBe(0);
  });
});

describe("formatCad", () => {
  it("formats cents as a CAD currency string", () => {
    expect(formatCad(710000)).toBe("$7,100.00");
  });

  it("formats zero", () => {
    expect(formatCad(0)).toBe("$0.00");
  });

  it("formats negative amounts (over-contribution display)", () => {
    expect(formatCad(-100)).toBe("-$1.00");
  });
});
