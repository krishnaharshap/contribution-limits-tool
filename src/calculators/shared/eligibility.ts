import {
  FHSA_FIRST_YEAR,
  RRSP_MAX_AGE,
  TFSA_ELIGIBILITY_AGE,
  TFSA_FIRST_YEAR,
} from "../../data/limits";

export interface AgeBasedEligibilityInput {
  birthYear: number;
  asOfYear: number;
}

export interface TfsaEligibility {
  eligible: boolean;
  eligibilityStartYear: number;
}

// Room accrues from the year a resident turns 18, regardless of a
// province's age of majority for *opening* an account (BC, NB, NL, NS,
// NT, NU, and YT require age 19 to open, but room still starts at 18).
export function getTfsaEligibility({
  birthYear,
  residencyStartYear,
  asOfYear,
}: AgeBasedEligibilityInput & { residencyStartYear?: number }): TfsaEligibility {
  const turnsEighteenYear = birthYear + TFSA_ELIGIBILITY_AGE;
  const eligibilityStartYear = Math.max(
    turnsEighteenYear,
    residencyStartYear ?? turnsEighteenYear,
    TFSA_FIRST_YEAR,
  );

  return {
    eligible: asOfYear >= eligibilityStartYear,
    eligibilityStartYear,
  };
}

export interface FhsaEligibility {
  eligible: boolean;
  eligibilityStartYear: number;
}

// Age eligibility only - whether a *specific* year has room also
// depends on when the account was opened, which fhsa.ts handles.
export function getFhsaEligibility({
  birthYear,
  asOfYear,
}: AgeBasedEligibilityInput): FhsaEligibility {
  const eligibilityStartYear = Math.max(birthYear + TFSA_ELIGIBILITY_AGE, FHSA_FIRST_YEAR);

  return {
    eligible: asOfYear >= eligibilityStartYear,
    eligibilityStartYear,
  };
}

export interface RrspEligibility {
  eligible: boolean;
  mustCollapseByYear: number;
}

// RRSP has no minimum age - a child with earned income and a filed
// return accrues room. The only bound is the collapse-by-71 rule.
export function getRrspEligibility({
  birthYear,
  asOfYear,
}: AgeBasedEligibilityInput): RrspEligibility {
  const mustCollapseByYear = birthYear + RRSP_MAX_AGE;

  return {
    eligible: asOfYear <= mustCollapseByYear,
    mustCollapseByYear,
  };
}
