import { CURRENT_SCHEMA_VERSION, createInitialState, type AppState } from "./types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Turns whatever was in localStorage into a valid AppState. There is
 * only one schema version so far, so this is a guard rather than a
 * real migration chain - but the shape is here so a future version
 * bump only needs an `if (state.schemaVersion === 1) { ... }` branch,
 * not a rewrite of loadState().
 */
export function migrateState(raw: unknown): AppState {
  if (!isPlainObject(raw) || typeof raw.schemaVersion !== "number") {
    return createInitialState();
  }

  if (raw.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    // No migration path yet for a version other than the current one -
    // safer to start fresh than to guess at an incompatible shape.
    return createInitialState();
  }

  return raw as unknown as AppState;
}
