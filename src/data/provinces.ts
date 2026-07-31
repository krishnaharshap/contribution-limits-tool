export interface Province {
  code: string;
  name: string;
}

export const PROVINCES: readonly Province[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

// Age of majority is 19, not 18, in these provinces/territories - it
// only affects when you can *open* a TFSA, not when room starts accruing.
export const AGE_OF_MAJORITY_19_PROVINCES: ReadonlySet<string> = new Set([
  "BC",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "YT",
]);
