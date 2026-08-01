/**
 * All money in this app is stored and computed as integer cents.
 * Summing dollar floats across many years accumulates rounding error
 * (e.g. 0.1 + 0.2 !== 0.3); integers don't have that problem. Convert
 * at the I/O boundary only - user input in, formatted strings out.
 */

const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

export function toCents(dollars: number): number {
  // dollars * 100 can land a hair below the true value (e.g. 1.005 * 100
  // is 100.49999999999999 in IEEE754), which would round the wrong way
  // at exact half-cent boundaries. Nudge by a tiny epsilon first.
  const nudge = dollars >= 0 ? 1e-9 : -1e-9;
  return Math.round(dollars * 100 + nudge);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function addCents(...values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function formatCad(cents: number): string {
  return currencyFormatter.format(fromCents(cents));
}
