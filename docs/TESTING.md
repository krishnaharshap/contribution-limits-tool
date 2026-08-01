# Testing strategy

## Two runners, on purpose

**Vitest** runs the pure, synchronous layer: calculators, the reducer, persistence, migrations, and React component tests via React Testing Library. It's fast (the whole unit suite runs in well under a minute) and doesn't need a browser.

**Native `@playwright/test`** runs everything that actually needs a rendered page in a real browser: full user flows, accessibility scans, responsive layout, and focus management. It replaced an earlier Jest + `jest-playwright-preset` setup that targeted a UI contract the app never actually implemented.

Neither runner alone is enough - the calculators being individually correct doesn't guarantee the UI renders the right number, and a green e2e suite alone would be too slow to run on every keystroke during development. Splitting by layer gets both speed and confidence.

## One scenario corpus, two consumers

`tests/shared/scenarios/{tfsa,fhsa,rrsp}.scenarios.ts` export `{ name, input, expected }` fixtures. Both layers consume the exact same objects:

- Vitest calls `calculateTfsaRoom(scenario.input)` and asserts the result equals `scenario.expected`.
- Playwright seeds `scenario.input` into `localStorage` (via the `seedState` fixture), navigates to the account screen, and asserts the _rendered_ number equals `scenario.expected.remainingRoomCents`.

Adding one scenario adds coverage at both the logic layer and the render layer for free, and if the two ever disagree, the mismatch immediately tells you whether the bug is in the math or in the display - you don't have to guess which layer to debug first.

One limitation worth knowing: the live app always calculates against _today's_ real date (`getCurrentYear()`), so only scenarios whose `asOfYear` matches the actual current year can be cross-checked against the rendered app; the e2e specs filter to those and rely on the Vitest suite for the rest. There's no way to simulate "a different date" in the deployed app itself, by design - it's a real tool, not a test harness.

## What's covered where

| Concern                                                                                                | Layer                                                         |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| TFSA/FHSA/RRSP room math, all edge cases (boundaries, non-monotonic years, carryforward caps, buffers) | Vitest, `tests/unit/calculators/`                             |
| Reducer, persistence, schema migration                                                                 | Vitest, `tests/unit/store/`                                   |
| Screen rendering and local interaction (forms, validation messages)                                    | Vitest + RTL, `tests/unit/screens/`                           |
| Full user journeys (onboarding, dashboard, per-account flows, export/import/reset)                     | Playwright, `tests/e2e/specs/`                                |
| Cross-cutting input validation (negative amounts, future years, duplicates)                            | Playwright, `validation.spec.ts`                              |
| Accessibility (axe-core scans, keyboard focus)                                                         | Playwright, `accessibility.spec.ts`                           |
| Responsive layout, dark/light mode                                                                     | Playwright, `responsive.spec.ts`                              |
| The deployed site itself, post-deploy                                                                  | Playwright, `tests/e2e/production/`, run by `pages-smoke.yml` |

## A regression test with a history

The original vanilla-JS version of this app had a bug where a Unicode non-breaking hyphen (U+2011), likely pasted from an editor with smart punctuation enabled, silently broke every CSS/JS selector that referenced an element's `id` or `class`. `tests/unit/repo/` (from the very first fix in this project's history) exists specifically to make that class of bug loud instead of silent.

## Coverage gate

`npm run test:cov` enforces coverage thresholds on `src/calculators/**` (configured in `vitest.config.ts`): 90% statements/lines/functions, 85% branches. That's the highest-risk, highest-value code in the app to have well-covered, so it gets the strict bar rather than a blanket repo-wide percentage that would mostly measure boilerplate.

## Running things locally

```bash
npm run test:unit          # Vitest, once
npm run test:unit:watch    # Vitest, watch mode
npm run test:cov           # Vitest with the coverage gate
npm run test:e2e           # Playwright against a local build
npm run test:e2e:ui        # Playwright, interactive UI mode
npm run test:e2e:production # Playwright against the live deployed site
```
