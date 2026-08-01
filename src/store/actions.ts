import type { AppState, ProfileState, Theme } from "./types";

export interface NewContributionInput {
  year: number;
  amountCents: number;
  note?: string;
}

function createId(): string {
  return crypto.randomUUID();
}

export function toContributionRecord(entry: NewContributionInput) {
  return {
    id: createId(),
    year: entry.year,
    amountCents: entry.amountCents,
    note: entry.note,
    createdAt: new Date().toISOString(),
  };
}

export type Action =
  | { type: "PROFILE_UPDATED"; payload: Partial<ProfileState> }
  | { type: "TFSA_CONTRIBUTION_ADDED"; record: ReturnType<typeof toContributionRecord> }
  | { type: "TFSA_CONTRIBUTION_REMOVED"; id: string }
  | { type: "TFSA_WITHDRAWAL_ADDED"; record: ReturnType<typeof toContributionRecord> }
  | { type: "TFSA_WITHDRAWAL_REMOVED"; id: string }
  | { type: "FHSA_ACCOUNT_OPENED_SET"; year: number | null }
  | { type: "FHSA_QUALIFYING_WITHDRAWAL_YEAR_SET"; year: number | null }
  | { type: "FHSA_CONTRIBUTION_ADDED"; record: ReturnType<typeof toContributionRecord> }
  | { type: "FHSA_CONTRIBUTION_REMOVED"; id: string }
  | { type: "RRSP_CONTRIBUTION_ADDED"; record: ReturnType<typeof toContributionRecord> }
  | { type: "RRSP_CONTRIBUTION_REMOVED"; id: string }
  | { type: "RRSP_INCOME_SET"; year: number; amountCents: number | null }
  | { type: "RRSP_PENSION_ADJUSTMENT_SET"; year: number; amountCents: number | null }
  | { type: "RRSP_PRIOR_ROOM_OVERRIDE_SET"; amountCents: number | null }
  | { type: "DISCLAIMER_ACCEPTED" }
  | { type: "THEME_SET"; theme: Theme }
  | { type: "STATE_IMPORTED"; state: AppState }
  | { type: "STATE_RESET" };

export const actions = {
  profileUpdated: (payload: Partial<ProfileState>): Action => ({
    type: "PROFILE_UPDATED",
    payload,
  }),

  tfsaContributionAdded: (entry: NewContributionInput): Action => ({
    type: "TFSA_CONTRIBUTION_ADDED",
    record: toContributionRecord(entry),
  }),
  tfsaContributionRemoved: (id: string): Action => ({ type: "TFSA_CONTRIBUTION_REMOVED", id }),
  tfsaWithdrawalAdded: (entry: NewContributionInput): Action => ({
    type: "TFSA_WITHDRAWAL_ADDED",
    record: toContributionRecord(entry),
  }),
  tfsaWithdrawalRemoved: (id: string): Action => ({ type: "TFSA_WITHDRAWAL_REMOVED", id }),

  fhsaAccountOpenedSet: (year: number | null): Action => ({
    type: "FHSA_ACCOUNT_OPENED_SET",
    year,
  }),
  fhsaQualifyingWithdrawalYearSet: (year: number | null): Action => ({
    type: "FHSA_QUALIFYING_WITHDRAWAL_YEAR_SET",
    year,
  }),
  fhsaContributionAdded: (entry: NewContributionInput): Action => ({
    type: "FHSA_CONTRIBUTION_ADDED",
    record: toContributionRecord(entry),
  }),
  fhsaContributionRemoved: (id: string): Action => ({ type: "FHSA_CONTRIBUTION_REMOVED", id }),

  rrspContributionAdded: (entry: NewContributionInput): Action => ({
    type: "RRSP_CONTRIBUTION_ADDED",
    record: toContributionRecord(entry),
  }),
  rrspContributionRemoved: (id: string): Action => ({ type: "RRSP_CONTRIBUTION_REMOVED", id }),
  rrspIncomeSet: (year: number, amountCents: number | null): Action => ({
    type: "RRSP_INCOME_SET",
    year,
    amountCents,
  }),
  rrspPensionAdjustmentSet: (year: number, amountCents: number | null): Action => ({
    type: "RRSP_PENSION_ADJUSTMENT_SET",
    year,
    amountCents,
  }),
  rrspPriorRoomOverrideSet: (amountCents: number | null): Action => ({
    type: "RRSP_PRIOR_ROOM_OVERRIDE_SET",
    amountCents,
  }),

  disclaimerAccepted: (): Action => ({ type: "DISCLAIMER_ACCEPTED" }),
  themeSet: (theme: Theme): Action => ({ type: "THEME_SET", theme }),
  stateImported: (state: AppState): Action => ({ type: "STATE_IMPORTED", state }),
  stateReset: (): Action => ({ type: "STATE_RESET" }),
};
