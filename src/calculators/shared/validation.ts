import { ERROR_CODES, ValidationError } from "./errors";
import { toCents } from "./money";

// $10,000,000 in a single year is not a real contribution; it's almost
// certainly a data-entry mistake (e.g. cents typed as whole dollars).
export const SANITY_CAP_CENTS = toCents(10_000_000);

export interface YearEntry {
  year: number;
}

export function validateYear(year: number, options: { asOfYear: number; minYear?: number }): void {
  if (!Number.isInteger(year)) {
    throw new ValidationError(
      ERROR_CODES.INVALID_YEAR,
      `Year must be a whole number, got ${year}.`,
      year,
    );
  }

  if (year > options.asOfYear) {
    throw new ValidationError(ERROR_CODES.FUTURE_YEAR, `${year} is in the future.`, year);
  }

  if (options.minYear !== undefined && year < options.minYear) {
    throw new ValidationError(
      ERROR_CODES.INVALID_YEAR,
      `${year} is before ${options.minYear}.`,
      year,
    );
  }
}

export function validateAmountCents(amountCents: number): void {
  if (!Number.isFinite(amountCents)) {
    throw new ValidationError(
      ERROR_CODES.NON_NUMERIC_AMOUNT,
      `Amount must be a finite number, got ${amountCents}.`,
    );
  }

  if (amountCents < 0) {
    throw new ValidationError(
      ERROR_CODES.NEGATIVE_AMOUNT,
      `Amount cannot be negative: ${amountCents} cents.`,
    );
  }

  if (amountCents > SANITY_CAP_CENTS) {
    throw new ValidationError(
      ERROR_CODES.AMOUNT_EXCEEDS_SANITY_CAP,
      `Amount exceeds the sanity cap: ${amountCents} cents.`,
    );
  }
}

export function assertNoDuplicateYears(entries: readonly YearEntry[]): void {
  const seen = new Set<number>();

  for (const entry of entries) {
    if (seen.has(entry.year)) {
      throw new ValidationError(
        ERROR_CODES.DUPLICATE_YEAR_ENTRY,
        `Duplicate entry for year ${entry.year}.`,
        entry.year,
      );
    }

    seen.add(entry.year);
  }
}
