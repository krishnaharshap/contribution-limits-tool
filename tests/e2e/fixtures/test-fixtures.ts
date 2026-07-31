import { test as base } from "@playwright/test";
import { STORAGE_KEY } from "../../../src/store/persistence";
import { createInitialState, type AppState } from "../../../src/store/types";

export function buildState(mutate: (state: AppState) => void): AppState {
  const state = createInitialState();
  state.ui.disclaimerAcceptedAt = new Date().toISOString();
  mutate(state);
  return state;
}

let contributionIdCounter = 0;

export function contribution(year: number, amountCents: number) {
  contributionIdCounter += 1;
  return {
    id: `seed-${contributionIdCounter}`,
    year,
    amountCents,
    createdAt: new Date().toISOString(),
  };
}

interface Fixtures {
  seedState: (state: AppState) => Promise<void>;
}

export const test = base.extend<Fixtures>({
  seedState: async ({ page }, use) => {
    await use(async (state: AppState) => {
      await page.addInitScript(
        ([key, serialized]) => {
          window.localStorage.setItem(key, serialized);
        },
        [STORAGE_KEY, JSON.stringify(state)] as [string, string],
      );
    });
  },
});

export { expect } from "@playwright/test";
