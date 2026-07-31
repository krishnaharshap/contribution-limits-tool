export const ERROR_CODES = Object.freeze({
  INVALID_YEAR: "INVALID_YEAR",
  FUTURE_YEAR: "FUTURE_YEAR",
  YEAR_BEFORE_ACCOUNT_EXISTS: "YEAR_BEFORE_ACCOUNT_EXISTS",
  YEAR_BEFORE_ELIGIBILITY: "YEAR_BEFORE_ELIGIBILITY",
  UNKNOWN_LIMIT_YEAR: "UNKNOWN_LIMIT_YEAR",
  DUPLICATE_YEAR_ENTRY: "DUPLICATE_YEAR_ENTRY",
  NON_NUMERIC_AMOUNT: "NON_NUMERIC_AMOUNT",
  NEGATIVE_AMOUNT: "NEGATIVE_AMOUNT",
  AMOUNT_EXCEEDS_SANITY_CAP: "AMOUNT_EXCEEDS_SANITY_CAP",
  MISSING_BIRTH_YEAR: "MISSING_BIRTH_YEAR",
  IMPLAUSIBLE_BIRTH_YEAR: "IMPLAUSIBLE_BIRTH_YEAR",
  FHSA_PERIOD_EXPIRED: "FHSA_PERIOD_EXPIRED",
  RRSP_PAST_AGE_71: "RRSP_PAST_AGE_71",
  MISSING_EARNED_INCOME: "MISSING_EARNED_INCOME",
} as const);

export type ErrorCode = keyof typeof ERROR_CODES;

// Callers match on `code`, never on `message` - message text can be
// reworded freely for the UI without touching any test assertion.
export class ValidationError extends Error {
  readonly code: ErrorCode;
  readonly year?: number;

  constructor(code: ErrorCode, message: string, year?: number) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
    this.year = year;
  }
}

export interface Warning {
  code: ErrorCode;
  message: string;
  year?: number;
}
