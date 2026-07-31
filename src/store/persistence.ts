import { migrateState } from "./migrations";
import { createInitialState, type AppState } from "./types";

export const STORAGE_KEY = "contribution-limits-tool:state";

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return createInitialState();
    }
    return migrateState(JSON.parse(raw));
  } catch {
    // Corrupted JSON, or storage inaccessible (private browsing, quota,
    // disabled by the user) - degrade to a fresh session rather than crash.
    return createInitialState();
  }
}

export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing more we can do if storage is inaccessible.
  }
}
