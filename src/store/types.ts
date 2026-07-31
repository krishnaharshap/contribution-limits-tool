export interface ContributionRecord {
  id: string;
  year: number;
  amountCents: number;
  note?: string;
  createdAt: string;
}

export interface ProfileState {
  birthYear: number | null;
  residencyStartYear: number | null;
  province: string | null;
  hasEmployerPension: boolean;
}

export interface TfsaAccountState {
  contributions: ContributionRecord[];
  withdrawals: ContributionRecord[];
}

export interface FhsaAccountState {
  accountOpenedYear: number | null;
  firstQualifyingWithdrawalYear: number | null;
  contributions: ContributionRecord[];
}

export interface RrspAccountState {
  contributions: ContributionRecord[];
  earnedIncomeCentsByYear: Record<number, number>;
  pensionAdjustmentCentsByYear: Record<number, number>;
  priorUnusedRoomOverrideCents: number | null;
}

export type Theme = "light" | "dark" | "system";

export interface UiState {
  disclaimerAcceptedAt: string | null;
  theme: Theme;
}

export interface AppState {
  schemaVersion: number;
  profile: ProfileState;
  accounts: {
    tfsa: TfsaAccountState;
    fhsa: FhsaAccountState;
    rrsp: RrspAccountState;
  };
  ui: UiState;
}

export const CURRENT_SCHEMA_VERSION = 1;

export function createInitialState(): AppState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profile: {
      birthYear: null,
      residencyStartYear: null,
      province: null,
      hasEmployerPension: false,
    },
    accounts: {
      tfsa: { contributions: [], withdrawals: [] },
      fhsa: { accountOpenedYear: null, firstQualifyingWithdrawalYear: null, contributions: [] },
      rrsp: {
        contributions: [],
        earnedIncomeCentsByYear: {},
        pensionAdjustmentCentsByYear: {},
        priorUnusedRoomOverrideCents: null,
      },
    },
    ui: {
      disclaimerAcceptedAt: null,
      theme: "system",
    },
  };
}
