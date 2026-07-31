import { afterEach, describe, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RrspPanel } from "../../../../src/screens/account/RrspPanel";
import { STORAGE_KEY } from "../../../../src/store/persistence";
import { createInitialState } from "../../../../src/store/types";
import { renderScreen } from "../testUtils";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function seedProfile(hasEmployerPension = false) {
  const state = createInitialState();
  state.profile.birthYear = 1980;
  state.profile.hasEmployerPension = hasEmployerPension;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

describe("RrspPanel", () => {
  it("computes 18% of entered income as new room", async () => {
    seedProfile();
    const user = userEvent.setup();
    renderScreen(<RrspPanel />);

    await user.type(screen.getByTestId("rrsp-income-year-input"), "2025");
    await user.type(screen.getByTestId("rrsp-income-amount-input"), "50000");
    await user.click(screen.getByTestId("rrsp-income-submit"));

    expect(screen.getByTestId("rrsp-remaining")).toHaveTextContent("$9,000.00");
  });

  it("does not show a pension adjustment field unless the profile has an employer pension", () => {
    seedProfile(false);
    renderScreen(<RrspPanel />);
    expect(screen.queryByTestId("rrsp-pension-year-input")).not.toBeInTheDocument();
  });

  it("shows a pension adjustment field when the profile has an employer pension", () => {
    seedProfile(true);
    renderScreen(<RrspPanel />);
    expect(screen.getByTestId("rrsp-pension-year-input")).toBeInTheDocument();
  });

  it("lets the prior-room override stand in for income history", async () => {
    seedProfile();
    const user = userEvent.setup();
    renderScreen(<RrspPanel />);

    await user.type(screen.getByTestId("rrsp-prior-room-override-input"), "50000");
    await user.click(screen.getByTestId("rrsp-prior-room-override-save"));

    await user.type(screen.getByTestId("rrsp-income-year-input"), "2025");
    await user.type(screen.getByTestId("rrsp-income-amount-input"), "50000");
    await user.click(screen.getByTestId("rrsp-income-submit"));

    expect(screen.getByTestId("rrsp-remaining")).toHaveTextContent("$59,000.00");
  });
});
