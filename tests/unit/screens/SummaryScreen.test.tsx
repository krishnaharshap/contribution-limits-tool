import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SummaryScreen } from "../../../src/screens/SummaryScreen";
import { exportStateAsJson } from "../../../src/utils/exportImport";
import { STORAGE_KEY } from "../../../src/store/persistence";
import { createInitialState } from "../../../src/store/types";
import { renderScreen } from "./testUtils";

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:mock");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

function seedProfile() {
  const state = createInitialState();
  state.profile.birthYear = 1980;
  state.accounts.tfsa.contributions.push({
    id: "1",
    year: 2024,
    amountCents: 500_000,
    createdAt: "2024-01-01T00:00:00.000Z",
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

describe("SummaryScreen", () => {
  it("shows a row per account with remaining room and contributed totals", () => {
    seedProfile();
    renderScreen(<SummaryScreen />);

    const table = screen.getByTestId("summary-table");
    expect(table).toHaveTextContent("TFSA");
    expect(table).toHaveTextContent("FHSA");
    expect(table).toHaveTextContent("RRSP");
    expect(table).toHaveTextContent("$5,000.00");
  });

  it("triggers a JSON download when exporting", async () => {
    seedProfile();
    const user = userEvent.setup();
    renderScreen(<SummaryScreen />);

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    await user.click(screen.getByTestId("export-json-button"));

    expect(clickSpy).toHaveBeenCalledOnce();
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
  });

  it("imports a valid exported file and replaces state", async () => {
    const original = seedProfile();
    const importedState = createInitialState();
    importedState.profile.birthYear = 1999;
    const file = new File([exportStateAsJson(importedState)], "export.json", {
      type: "application/json",
    });

    const user = userEvent.setup();
    renderScreen(<SummaryScreen />);

    await user.upload(screen.getByTestId("import-file-input"), file);

    expect(await screen.findByTestId("import-success")).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(saved.profile.birthYear).toBe(1999);
    expect(saved.profile.birthYear).not.toBe(original.profile.birthYear);
  });

  it("shows an error for a file that isn't a valid export", async () => {
    seedProfile();
    const file = new File(["not json"], "export.json", { type: "application/json" });
    const user = userEvent.setup();
    renderScreen(<SummaryScreen />);

    await user.upload(screen.getByTestId("import-file-input"), file);

    expect(await screen.findByTestId("import-error")).toBeInTheDocument();
  });

  it("requires confirmation before resetting all data", async () => {
    seedProfile();
    const user = userEvent.setup();
    renderScreen(<SummaryScreen />);

    await user.click(screen.getByTestId("reset-button"));
    expect(screen.getByTestId("reset-confirm-button")).toBeInTheDocument();

    await user.click(screen.getByTestId("reset-cancel-button"));
    expect(screen.queryByTestId("reset-confirm-button")).not.toBeInTheDocument();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(saved.profile.birthYear).toBe(1980);
  });
});
