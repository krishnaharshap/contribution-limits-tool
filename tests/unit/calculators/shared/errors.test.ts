import { describe, expect, it } from "vitest";
import { ERROR_CODES, ValidationError } from "../../../../src/calculators/shared/errors";

describe("ValidationError", () => {
  it("carries a code from ERROR_CODES and an optional year", () => {
    const error = new ValidationError(ERROR_CODES.FUTURE_YEAR, "2099 is in the future.", 2099);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ValidationError");
    expect(error.code).toBe("FUTURE_YEAR");
    expect(error.year).toBe(2099);
    expect(error.message).toBe("2099 is in the future.");
  });

  it("allows year to be omitted for errors that aren't year-specific", () => {
    const error = new ValidationError(ERROR_CODES.NON_NUMERIC_AMOUNT, "not a number");
    expect(error.year).toBeUndefined();
  });
});

describe("ERROR_CODES", () => {
  it("is frozen so codes can't be silently renamed or removed", () => {
    expect(Object.isFrozen(ERROR_CODES)).toBe(true);
  });
});
