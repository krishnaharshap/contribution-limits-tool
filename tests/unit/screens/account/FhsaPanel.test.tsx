import { afterEach, describe, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FhsaPanel } from "../../../../src/screens/account/FhsaPanel";
import { STORAGE_KEY } from "../../../../src/store/persistence";
import { createInitialState } from "../../../../src/store/types";
import { renderScreen } from "../testUtils";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function seedProfile() {
  const state = createInitialState();
  state.profile.birthYear = 1990;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

describe("FhsaPanel", () => {
  it("shows no room at all before an account is opened", () => {
    seedProfile();
    renderScreen(<FhsaPanel />);
    expect(screen.getByText(/you have not opened an fhsa yet/i)).toBeInTheDocument();
  });

  it("shows the carryforward-capped room once an account is opened", async () => {
    seedProfile();
    const user = userEvent.setup();
    renderScreen(<FhsaPanel />);

    await user.type(screen.getByTestId("fhsa-opened-year-input"), "2023");
    await user.click(screen.getByTestId("fhsa-opened-year-save"));

    // Opened 2023, zero contributions, as of 2026: capped at $16,000,
    // not $32,000 - carryforward only ever banks one prior year.
    expect(screen.getByTestId("fhsa-remaining")).toHaveTextContent("$16,000.00");
  });

  it("adds a contribution once an account is open", async () => {
    seedProfile();
    const user = userEvent.setup();
    renderScreen(<FhsaPanel />);

    await user.type(screen.getByTestId("fhsa-opened-year-input"), "2026");
    await user.click(screen.getByTestId("fhsa-opened-year-save"));

    await user.type(screen.getByTestId("fhsa-contribution-year-input"), "2026");
    await user.type(screen.getByTestId("fhsa-contribution-amount-input"), "8000");
    await user.click(screen.getByTestId("fhsa-contribution-submit-button"));

    expect(screen.getByTestId("fhsa-remaining")).toHaveTextContent("$0.00");
  });
});
