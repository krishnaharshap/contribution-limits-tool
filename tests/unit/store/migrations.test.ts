import { describe, expect, it } from "vitest";
import { migrateState } from "../../../src/store/migrations";
import { createInitialState } from "../../../src/store/types";

describe("migrateState", () => {
  it("passes a valid current-version state through unchanged", () => {
    const state = createInitialState();
    state.profile.birthYear = 1990;

    expect(migrateState(state)).toEqual(state);
  });

  it("falls back to a fresh state for null", () => {
    expect(migrateState(null)).toEqual(createInitialState());
  });

  it("falls back to a fresh state for an array", () => {
    expect(migrateState([1, 2, 3])).toEqual(createInitialState());
  });

  it("falls back to a fresh state when schemaVersion is missing", () => {
    expect(migrateState({ profile: {} })).toEqual(createInitialState());
  });

  it("falls back to a fresh state for an unrecognized schema version", () => {
    const future = { ...createInitialState(), schemaVersion: 999 };
    expect(migrateState(future)).toEqual(createInitialState());
  });

  it("falls back to a fresh state for malformed JSON content (a plain string)", () => {
    expect(migrateState("not an object")).toEqual(createInitialState());
  });
});
