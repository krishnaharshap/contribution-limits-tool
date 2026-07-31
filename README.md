# Contribution Limits Tool

[![CI](https://github.com/krishnaharshap/contribution-limits-tool/actions/workflows/ci.yml/badge.svg)](https://github.com/krishnaharshap/contribution-limits-tool/actions/workflows/ci.yml)
[![Deploy](https://github.com/krishnaharshap/contribution-limits-tool/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/krishnaharshap/contribution-limits-tool/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A web app that tracks remaining **TFSA**, **FHSA**, and **RRSP** contribution room across years, for Canadians who are tired of rebuilding the same spreadsheet every year.

**Live app:** https://krishnaharshap.github.io/contribution-limits-tool/

Everything runs client-side. Nothing you enter is sent anywhere - your profile and contribution history live only in your browser's `localStorage`, and the Summary screen lets you export/import a JSON backup at any time.

> This tool gives **estimates only** and is not tax, legal, or financial advice. See [`docs/DISCLAIMER.md`](docs/DISCLAIMER.md) and the in-app About screen for details, and always verify against your CRA My Account.

## What it does

- **Profile-driven eligibility.** Enter your birth year (and optionally residency start year, province, FHSA opened year) once; the app computes when each account actually starts accruing room - TFSA and FHSA both key off turning 18, RRSP has no minimum age at all.
- **A dashboard**, not three disconnected calculators: remaining room, a progress ring, and a plain-language status ("On track", "Maxed out", "Over-contributed - est. $X/mo", "No account open") for all three accounts at a glance.
- **Per-account detail screens** with a full year-by-year breakdown table, a contribution/withdrawal form, and the account-specific rules that actually matter:
  - **TFSA** - a withdrawal only restores room the following January 1st, not the same year.
  - **FHSA** - room doesn't exist until you open an account, and carryforward is capped at $8,000 from the immediately preceding year, not cumulative.
  - **RRSP** - new room is 18% of last year's income capped at that year's CRA dollar maximum, with an optional field to paste your actual room straight from your Notice of Assessment instead of reconstructing years of income history.
- **Export, import, and reset** on the Summary screen - since there's no backend, export is also your only backup.

## Tech stack

| Layer                | Choice                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Frontend             | React 19 + TypeScript, built with Vite                                                                                        |
| Routing              | React Router (`HashRouter`, required for a GitHub Pages sub-path with no server rewrites)                                     |
| State                | A single reducer (`useReducer` + Context), persisted to `localStorage` with a schema-versioned migration guard                |
| Unit/component tests | Vitest + React Testing Library                                                                                                |
| End-to-end tests     | Native `@playwright/test` (Page Object Model, axe-core accessibility scans, responsive checks)                                |
| CI/CD                | GitHub Actions - lint/typecheck/coverage-gated unit tests/e2e on every PR, deploy + post-deploy smoke test on merge to `main` |
| Hosting              | GitHub Pages, static build, zero backend                                                                                      |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the pieces fit together, and [`docs/TESTING.md`](docs/TESTING.md) for the full test strategy.

## Running it locally

```bash
git clone https://github.com/krishnaharshap/contribution-limits-tool.git
cd contribution-limits-tool
npm install
npm run dev
```

Requires the Node version pinned in [`.nvmrc`](.nvmrc). Opens at `http://localhost:5173/` by default.

### Scripts

| Script                            | What it does                                                   |
| --------------------------------- | -------------------------------------------------------------- |
| `npm run dev`                     | Start the Vite dev server                                      |
| `npm run build`                   | Typecheck, then build the production bundle to `dist/`         |
| `npm run preview`                 | Serve the production build locally                             |
| `npm run lint` / `npm run format` | ESLint / Prettier check                                        |
| `npm run typecheck`               | `tsc --noEmit`                                                 |
| `npm run test:unit`               | Vitest unit + component tests                                  |
| `npm run test:cov`                | Same, with coverage (gated at 90%/85% on `src/calculators/**`) |
| `npm run test:e2e`                | Playwright end-to-end suite (builds and serves the app first)  |
| `npm run test:e2e:ui`             | Same, with Playwright's UI mode for debugging                  |
| `npm run verify`                  | Everything above, in one shot - what CI runs                   |

## Project structure

```
src/
  calculators/       # Pure TFSA/FHSA/RRSP room calculations - zero React, zero DOM
  data/              # CRA contribution limit tables and the provinces list
  store/             # Reducer, actions, selectors, localStorage persistence + migrations
  screens/           # One component per route (Welcome, Profile, Dashboard, Account, Summary, About)
  components/        # Shared UI: cards, forms, tables, nav, progress ring
  styles/            # Design tokens, base styles, component classes
tests/
  unit/              # Vitest: calculators, store, components, screens
  e2e/               # Playwright: page objects, fixtures, specs, production smoke test
  shared/scenarios/  # {input, expected} fixtures reused by BOTH unit and e2e tests
docs/                # Architecture, testing strategy, CRA rules, disclaimer
```

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for branch naming, commit conventions, and how to run the full check suite before opening a PR.

## License

[MIT](LICENSE)
