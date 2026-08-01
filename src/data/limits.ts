/**
 * CRA contribution-limit figures for TFSA, FHSA, and RRSP.
 *
 * Sources: canada.ca, cross-checked against TaxTips.ca and Investment
 * Executive. TFSA and RRSP dollar limits are set annually by the CRA;
 * FHSA figures are fixed in the Income Tax Act and have not changed
 * since the account type was introduced.
 */

export type AccountType = "tfsa" | "fhsa" | "rrsp";

export const LIMITS_LAST_VERIFIED = "2026-07-31";

// TFSA: annual dollar limit by year. Note 2015 is a one-year anomaly
// ($10,000, a policy change later reversed) - do not assume monotonic
// growth when reasoning about this table.
export const TFSA_ANNUAL_LIMITS: Readonly<Record<number, number>> = Object.freeze({
  2009: 5000,
  2010: 5000,
  2011: 5000,
  2012: 5000,
  2013: 5500,
  2014: 5500,
  2015: 10000,
  2016: 5500,
  2017: 5500,
  2018: 5500,
  2019: 6000,
  2020: 6000,
  2021: 6000,
  2022: 6000,
  2023: 6500,
  2024: 7000,
  2025: 7000,
  2026: 7000,
});

export const TFSA_FIRST_YEAR = 2009;
export const TFSA_ELIGIBILITY_AGE = 18;

// FHSA: introduced April 2023. Unlike TFSA/RRSP these dollar figures
// are fixed in legislation, not indexed to inflation - they are still
// stored as a year-keyed table for symmetry with the other accounts
// and so a future legislative change only requires adding a row.
export const FHSA_ANNUAL_LIMITS: Readonly<Record<number, number>> = Object.freeze({
  2023: 8000,
  2024: 8000,
  2025: 8000,
  2026: 8000,
});

export const FHSA_FIRST_YEAR = 2023;
export const FHSA_LIFETIME_LIMIT = 40000;
export const FHSA_MAX_CARRYFORWARD = 8000;
export const FHSA_MAX_PARTICIPATION_YEARS = 15;
export const FHSA_MAX_AGE = 71;

// RRSP: annual dollar maximum by year. Published a year ahead of TFSA
// because the RRSP dollar limit for year Y equals the money-purchase
// limit for year Y-1, so 2027 is already known while TFSA 2027 is not.
export const RRSP_DOLLAR_LIMITS: Readonly<Record<number, number>> = Object.freeze({
  2010: 22000,
  2011: 22450,
  2012: 22970,
  2013: 23820,
  2014: 24270,
  2015: 24930,
  2016: 25370,
  2017: 26010,
  2018: 26230,
  2019: 26500,
  2020: 27230,
  2021: 27830,
  2022: 29210,
  2023: 30780,
  2024: 31560,
  2025: 32490,
  2026: 33810,
  2027: 35390,
});

export const RRSP_FIRST_YEAR = 2010;
export const RRSP_EARNED_INCOME_RATE = 0.18;
export const RRSP_OVERCONTRIBUTION_BUFFER = 2000;
export const RRSP_MAX_AGE = 71;

export const PENALTY_RATE_PER_MONTH = 0.01;

const LIMIT_TABLES: Readonly<Record<AccountType, Readonly<Record<number, number>>>> = Object.freeze(
  {
    tfsa: TFSA_ANNUAL_LIMITS,
    fhsa: FHSA_ANNUAL_LIMITS,
    rrsp: RRSP_DOLLAR_LIMITS,
  },
);

export function isYearSupported(account: AccountType, year: number): boolean {
  return year in LIMIT_TABLES[account];
}

export function getMinKnownYear(account: AccountType): number {
  return Math.min(...Object.keys(LIMIT_TABLES[account]).map(Number));
}

export function getMaxKnownYear(account: AccountType): number {
  return Math.max(...Object.keys(LIMIT_TABLES[account]).map(Number));
}

function getLimit(account: AccountType, year: number): number {
  const limit = LIMIT_TABLES[account][year];

  if (limit === undefined) {
    throw new RangeError(
      `No published ${account.toUpperCase()} limit for ${year}. ` +
        `Known years: ${getMinKnownYear(account)}-${getMaxKnownYear(account)}. ` +
        "Check isYearSupported() before calling this function.",
    );
  }

  return limit;
}

export function getTfsaLimit(year: number): number {
  return getLimit("tfsa", year);
}

export function getFhsaLimit(year: number): number {
  return getLimit("fhsa", year);
}

export function getRrspDollarLimit(year: number): number {
  return getLimit("rrsp", year);
}

export const LIMIT_SOURCES: ReadonlyArray<{ label: string; url: string }> = Object.freeze([
  {
    label: "TFSA contribution room - Canada.ca",
    url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/contributing/calculate-room.html",
  },
  {
    label: "MP, DB, RRSP, DPSP, ALDA, TFSA limits - Canada.ca",
    url: "https://www.canada.ca/en/revenue-agency/services/tax/registered-plans-administrators/pspa/mp-rrsp-dpsp-tfsa-limits-ympe.html",
  },
  {
    label: "Closing your FHSAs - Canada.ca",
    url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account/closing-your-fhsa.html",
  },
]);
