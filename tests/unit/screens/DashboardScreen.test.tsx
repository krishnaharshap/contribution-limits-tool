import { afterEach, describe, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import { DashboardScreen } from "../../../src/screens/DashboardScreen";
import { STORAGE_KEY } from "../../../src/store/persistence";
import { createInitialState } from "../../../src/store/types";
import { renderScreen } from "./testUtils";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function seedProfile(overrides: Partial<ReturnType<typeof createInitialState>["profile"]> = {}) {
  const state = createInitialState();
  state.profile = { ...state.profile, birthYear: 1980, ...overrides };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

describe("DashboardScreen", () => {
  it("shows all three account cards once a profile exists", () => {
    seedProfile();
    renderScreen(<DashboardScreen />);

    expect(screen.getByTestId("room-card-tfsa")).toBeInTheDocument();
    expect(screen.getByTestId("room-card-fhsa")).toBeInTheDocument();
    expect(screen.getByTestId("room-card-rrsp")).toBeInTheDocument();
  });

  it("shows the TFSA card's remaining room, matching the calculator directly", () => {
    seedProfile();
    renderScreen(<DashboardScreen />);

    // Eligible since 2009 (birth year 1980, well past 18), zero
    // contributions -> full cumulative TFSA room as of the current year.
    expect(screen.getByTestId("room-card-tfsa-status")).toHaveTextContent("On track");
  });

  it("shows FHSA as 'No account open' when no FHSA has been opened", () => {
    seedProfile();
    renderScreen(<DashboardScreen />);

    expect(screen.getByTestId("room-card-fhsa-status")).toHaveTextContent("No account open");
  });

  it("shows RRSP's must-collapse status once the holder is past 71", () => {
    seedProfile({ birthYear: 1950 });
    renderScreen(<DashboardScreen />);

    expect(screen.getByTestId("room-card-rrsp-status")).toHaveTextContent(/Must collapse by/);
  });
});
