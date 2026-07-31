import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { ProfileScreen } from "../../../src/screens/ProfileScreen";
import { STORAGE_KEY } from "../../../src/store/persistence";
import { StoreProvider } from "../../../src/store/StoreContext";
import { renderScreen } from "./testUtils";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("ProfileScreen", () => {
  it("shows a prompt instead of eligibility results before a birth year is entered", () => {
    renderScreen(<ProfileScreen />);
    expect(screen.getByText(/enter a birth year to see your eligibility/i)).toBeInTheDocument();
  });

  it("shows live eligibility once a valid birth year is entered", async () => {
    const user = userEvent.setup();
    renderScreen(<ProfileScreen />);

    await user.type(screen.getByTestId("profile-birth-year-input"), "1980");

    const summary = screen.getByTestId("profile-eligibility-summary");
    // Born 1980 turns 18 in 1998, but the TFSA program didn't start
    // until 2009 - eligibility can't predate the program itself.
    expect(summary).toHaveTextContent(/TFSA:\s*Eligible since 2009/);
    expect(summary).toHaveTextContent(/RRSP:\s*Room has no minimum age/);
  });

  it("shows a validation error and does not submit without a birth year", async () => {
    const user = userEvent.setup();
    renderScreen(<ProfileScreen />);

    await user.click(screen.getByTestId("profile-continue-button"));

    expect(screen.getByTestId("profile-form-error")).toBeInTheDocument();
  });

  it("saves the profile and navigates to the dashboard on submit", async () => {
    const user = userEvent.setup();
    render(
      <StoreProvider>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/dashboard" element={<div data-testid="dashboard-marker" />} />
          </Routes>
        </MemoryRouter>
      </StoreProvider>,
    );

    await user.type(screen.getByTestId("profile-birth-year-input"), "1990");
    await user.type(screen.getByTestId("profile-fhsa-opened-year-input"), "2024");
    await user.click(screen.getByTestId("profile-continue-button"));

    expect(screen.getByTestId("dashboard-marker")).toBeInTheDocument();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(saved.profile.birthYear).toBe(1990);
    expect(saved.accounts.fhsa.accountOpenedYear).toBe(2024);
  });

  it("rejects a residency year before the birth year", async () => {
    const user = userEvent.setup();
    renderScreen(<ProfileScreen />);

    await user.type(screen.getByTestId("profile-birth-year-input"), "1990");
    await user.type(screen.getByTestId("profile-residency-year-input"), "1980");
    await user.click(screen.getByTestId("profile-continue-button"));

    expect(screen.getByTestId("profile-form-error")).toHaveTextContent(/before your birth year/i);
  });
});
