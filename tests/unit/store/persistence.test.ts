import { afterEach, describe, expect, it, vi } from "vitest";
import { clearState, loadState, saveState, STORAGE_KEY } from "../../../src/store/persistence";
import { createInitialState } from "../../../src/store/types";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("loadState", () => {
  it("returns a fresh state when nothing has been saved yet", () => {
    expect(loadState()).toEqual(createInitialState());
  });

  it("round-trips a saved state", () => {
    const state = createInitialState();
    state.profile.birthYear = 1990;
    saveState(state);

    expect(loadState()).toEqual(state);
  });

  it("falls back to a fresh state when localStorage holds malformed JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");
    expect(loadState()).toEqual(createInitialState());
  });

  it("falls back to a fresh state when localStorage.getItem throws (disabled storage)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });

    expect(loadState()).toEqual(createInitialState());
  });
});

describe("saveState", () => {
  it("returns true on a successful save", () => {
    expect(saveState(createInitialState())).toBe(true);
  });

  it("returns false rather than throwing when storage is full or disabled", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(saveState(createInitialState())).toBe(false);
  });
});

describe("clearState", () => {
  it("removes any saved state", () => {
    saveState(createInitialState());
    clearState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
