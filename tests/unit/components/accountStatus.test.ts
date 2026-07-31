import { describe, expect, it } from "vitest";
import { getAccountStatus } from "../../../src/components/accountStatus";

const base = {
  eligible: true,
  hasRoom: true,
  remainingRoomCents: 100_000,
  isOverContributed: false,
  estimatedMonthlyPenaltyCents: 0,
  notEligibleLabel: "Not yet eligible",
};

describe("getAccountStatus", () => {
  it("returns the not-eligible label when the account isn't eligible", () => {
    expect(getAccountStatus({ ...base, eligible: false })).toEqual({
      label: "Not yet eligible",
      tone: "neutral",
    });
  });

  it("returns the no-room label when eligible but no room exists yet", () => {
    expect(getAccountStatus({ ...base, hasRoom: false, noRoomLabel: "No account open" })).toEqual({
      label: "No account open",
      tone: "neutral",
    });
  });

  it("returns an over-contributed status with the estimated penalty", () => {
    expect(
      getAccountStatus({
        ...base,
        remainingRoomCents: -100,
        isOverContributed: true,
        estimatedMonthlyPenaltyCents: 1,
      }),
    ).toEqual({ label: "Over-contributed - est. $0.01/mo", tone: "danger" });
  });

  it("returns maxed out when remaining room is exactly zero", () => {
    expect(getAccountStatus({ ...base, remainingRoomCents: 0 })).toEqual({
      label: "Maxed out",
      tone: "warning",
    });
  });

  it("returns on track when there is positive remaining room", () => {
    expect(getAccountStatus(base)).toEqual({ label: "On track", tone: "success" });
  });
});
