import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { WelcomeScreen } from "../../../src/screens/WelcomeScreen";
import { StoreProvider } from "../../../src/store/StoreContext";
import { STORAGE_KEY } from "../../../src/store/persistence";
import { renderScreen } from "./testUtils";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("WelcomeScreen", () => {
  it("renders the value proposition and disclaimer", () => {
    renderScreen(<WelcomeScreen />);
    expect(screen.getByRole("heading", { name: "Contribution Limits Tool" })).toBeInTheDocument();
    expect(screen.getByText(/estimates only/i)).toBeInTheDocument();
  });

  it("records disclaimer acceptance when the user clicks Get started", async () => {
    const user = userEvent.setup();
    renderScreen(<WelcomeScreen />);

    await user.click(screen.getByTestId("get-started-button"));

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(saved.ui.disclaimerAcceptedAt).not.toBeNull();
  });

  it("navigates to /profile after Get started", async () => {
    const user = userEvent.setup();
    render(
      <StoreProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/profile" element={<div data-testid="profile-marker" />} />
          </Routes>
        </MemoryRouter>
      </StoreProvider>,
    );

    await user.click(screen.getByTestId("get-started-button"));

    expect(screen.getByTestId("profile-marker")).toBeInTheDocument();
  });
});
