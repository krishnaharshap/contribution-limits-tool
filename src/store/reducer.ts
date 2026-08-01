import type { Action } from "./actions";
import { type AppState, createInitialState } from "./types";

function removeById<T extends { id: string }>(records: T[], id: string): T[] {
  return records.filter((record) => record.id !== id);
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "PROFILE_UPDATED":
      return { ...state, profile: { ...state.profile, ...action.payload } };

    case "TFSA_CONTRIBUTION_ADDED":
      return {
        ...state,
        accounts: {
          ...state.accounts,
          tfsa: {
            ...state.accounts.tfsa,
            contributions: [...state.accounts.tfsa.contributions, action.record],
          },
        },
      };

    case "TFSA_CONTRIBUTION_REMOVED":
      return {
        ...state,
        accounts: {
          ...state.accounts,
          tfsa: {
            ...state.accounts.tfsa,
            contributions: removeById(state.accounts.tfsa.contributions, action.id),
          },
        },
      };

    case "TFSA_WITHDRAWAL_ADDED":
      return {
        ...state,
        accounts: {
          ...state.accounts,
          tfsa: {
            ...state.accounts.tfsa,
            withdrawals: [...state.accounts.tfsa.withdrawals, action.record],
          },
        },
      };

    case "TFSA_WITHDRAWAL_REMOVED":
      return {
        ...state,
        accounts: {
          ...state.accounts,
          tfsa: {
            ...state.accounts.tfsa,
            withdrawals: removeById(state.accounts.tfsa.withdrawals, action.id),
          },
        },
      };

    case "FHSA_ACCOUNT_OPENED_SET":
      return {
        ...state,
        accounts: {
          ...state.accounts,
          fhsa: { ...state.accounts.fhsa, accountOpenedYear: action.year },
        },
      };

    case "FHSA_QUALIFYING_WITHDRAWAL_YEAR_SET":
      return {
        ...state,
        accounts: {
          ...state.accounts,
          fhsa: { ...state.accounts.fhsa, firstQualifyingWithdrawalYear: action.year },
        },
      };

    case "FHSA_CONTRIBUTION_ADDED":
      return {
        ...state,
        accounts: {
          ...state.accounts,
          fhsa: {
            ...state.accounts.fhsa,
            contributions: [...state.accounts.fhsa.contributions, action.record],
          },
        },
      };

    case "FHSA_CONTRIBUTION_REMOVED":
      return {
        ...state,
        accounts: {
          ...state.accounts,
          fhsa: {
            ...state.accounts.fhsa,
            contributions: removeById(state.accounts.fhsa.contributions, action.id),
          },
        },
      };

    case "RRSP_CONTRIBUTION_ADDED":
      return {
        ...state,
        accounts: {
          ...state.accounts,
          rrsp: {
            ...state.accounts.rrsp,
            contributions: [...state.accounts.rrsp.contributions, action.record],
          },
        },
      };

    case "RRSP_CONTRIBUTION_REMOVED":
      return {
        ...state,
        accounts: {
          ...state.accounts,
          rrsp: {
            ...state.accounts.rrsp,
            contributions: removeById(state.accounts.rrsp.contributions, action.id),
          },
        },
      };

    case "RRSP_INCOME_SET": {
      const earnedIncomeCentsByYear = { ...state.accounts.rrsp.earnedIncomeCentsByYear };
      if (action.amountCents === null) {
        delete earnedIncomeCentsByYear[action.year];
      } else {
        earnedIncomeCentsByYear[action.year] = action.amountCents;
      }
      return {
        ...state,
        accounts: { ...state.accounts, rrsp: { ...state.accounts.rrsp, earnedIncomeCentsByYear } },
      };
    }

    case "RRSP_PENSION_ADJUSTMENT_SET": {
      const pensionAdjustmentCentsByYear = { ...state.accounts.rrsp.pensionAdjustmentCentsByYear };
      if (action.amountCents === null) {
        delete pensionAdjustmentCentsByYear[action.year];
      } else {
        pensionAdjustmentCentsByYear[action.year] = action.amountCents;
      }
      return {
        ...state,
        accounts: {
          ...state.accounts,
          rrsp: { ...state.accounts.rrsp, pensionAdjustmentCentsByYear },
        },
      };
    }

    case "RRSP_PRIOR_ROOM_OVERRIDE_SET":
      return {
        ...state,
        accounts: {
          ...state.accounts,
          rrsp: { ...state.accounts.rrsp, priorUnusedRoomOverrideCents: action.amountCents },
        },
      };

    case "DISCLAIMER_ACCEPTED":
      return { ...state, ui: { ...state.ui, disclaimerAcceptedAt: new Date().toISOString() } };

    case "THEME_SET":
      return { ...state, ui: { ...state.ui, theme: action.theme } };

    case "STATE_IMPORTED":
      return action.state;

    case "STATE_RESET":
      return createInitialState();

    default:
      return state;
  }
}
