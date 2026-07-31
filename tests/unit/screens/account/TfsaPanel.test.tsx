import { afterEach, describe, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TfsaPanel } from "../../../../src/screens/account/TfsaPanel";
import { STORAGE_KEY } from "../../../../src/store/persistence";
import { createInitialState } from "../../../../src/store/types";
import { renderScreen } from "../testUtils";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function seedProfile(birthYear = 1980) {
  const state = createInitialState();
  state.profile.birthYear = birthYear;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

describe("TfsaPanel", () => {
  it("shows the full cumulative room when there are no contributions", () => {
    seedProfile();
    renderScreen(<TfsaPanel />);
    expect(screen.getByTestId("tfsa-remaining")).toHaveTextContent("$109,000.00");
  });

  it("adds a contribution and updates the remaining room", async () => {
    seedProfile();
    const user = userEvent.setup();
    renderScreen(<TfsaPanel />);

    await user.type(screen.getByTestId("tfsa-contribution-year-input"), "2024");
    await user.type(screen.getByTestId("tfsa-contribution-amount-input"), "5000");
    await user.click(screen.getByTestId("tfsa-contribution-submit-button"));

    expect(screen.getByTestId("tfsa-remaining")).toHaveTextContent("$104,000.00");
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(saved.accounts.tfsa.contributions).toHaveLength(1);
  });

  it("rejects a second entry for a year that already has one", async () => {
    seedProfile();
    const user = userEvent.setup();
    renderScreen(<TfsaPanel />);

    await user.type(screen.getByTestId("tfsa-contribution-year-input"), "2024");
    await user.type(screen.getByTestId("tfsa-contribution-amount-input"), "5000");
    await user.click(screen.getByTestId("tfsa-contribution-submit-button"));

    await user.type(screen.getByTestId("tfsa-contribution-year-input"), "2024");
    await user.type(screen.getByTestId("tfsa-contribution-amount-input"), "100");
    await user.click(screen.getByTestId("tfsa-contribution-submit-button"));

    expect(screen.getByTestId("tfsa-contribution-error")).toHaveTextContent(
      /already have an entry/i,
    );
    const table = screen.getByTestId("tfsa-contribution-table");
    expect(table.querySelectorAll("tbody tr")).toHaveLength(1);
  });

  it("removes a contribution", async () => {
    seedProfile();
    const user = userEvent.setup();
    renderScreen(<TfsaPanel />);

    await user.type(screen.getByTestId("tfsa-contribution-year-input"), "2024");
    await user.type(screen.getByTestId("tfsa-contribution-amount-input"), "5000");
    await user.click(screen.getByTestId("tfsa-contribution-submit-button"));
    expect(screen.getByTestId("tfsa-remaining")).toHaveTextContent("$104,000.00");

    await user.click(screen.getByTestId("tfsa-contribution-remove-2024"));
    expect(screen.getByTestId("tfsa-remaining")).toHaveTextContent("$109,000.00");
  });
});
