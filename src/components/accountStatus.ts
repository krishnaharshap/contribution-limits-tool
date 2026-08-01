import { formatCad } from "../calculators/shared/money";

export type StatusTone = "success" | "warning" | "danger" | "neutral";

export interface AccountStatus {
  label: string;
  tone: StatusTone;
}

interface StatusInput {
  eligible: boolean;
  hasRoom: boolean;
  remainingRoomCents: number;
  isOverContributed: boolean;
  estimatedMonthlyPenaltyCents: number;
  notEligibleLabel: string;
  noRoomLabel?: string;
}

export function getAccountStatus({
  eligible,
  hasRoom,
  remainingRoomCents,
  isOverContributed,
  estimatedMonthlyPenaltyCents,
  notEligibleLabel,
  noRoomLabel,
}: StatusInput): AccountStatus {
  if (!eligible) {
    return { label: notEligibleLabel, tone: "neutral" };
  }

  if (!hasRoom && noRoomLabel) {
    return { label: noRoomLabel, tone: "neutral" };
  }

  if (isOverContributed) {
    return {
      label: `Over-contributed - est. ${formatCad(estimatedMonthlyPenaltyCents)}/mo`,
      tone: "danger",
    };
  }

  if (remainingRoomCents === 0) {
    return { label: "Maxed out", tone: "warning" };
  }

  return { label: "On track", tone: "success" };
}
