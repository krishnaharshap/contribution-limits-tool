# Architecture

## Layers

The app is split into four layers, each with a clear one-way dependency on the one below it:

```
screens/        React components - one per route, plus shared components/
  |
  v  (selectors read state, produce calculator inputs)
store/          reducer + actions + localStorage persistence + schema migrations
  |
  v  (selectors call the calculators directly)
calculators/    pure TFSA/FHSA/RRSP room math - no React, no DOM, no localStorage
  |
  v
data/           CRA contribution-limit tables and constants
```

`calculators/` and `data/` know nothing about React or the store - they're plain TypeScript functions and frozen data tables. That's deliberate: it's what makes the entire calculation engine unit-testable without rendering anything, and why `tests/unit/calculators/` existed and passed well before any screen was built.

## State

A single `AppState` object (`src/store/types.ts`) holds the user's profile and each account's contribution history. It's managed by a plain reducer (`src/store/reducer.ts`) - no external state library. `StoreContext.tsx` is the only React-specific piece: it wraps `useReducer` with a `localStorage`-backed lazy initializer and persists on every change.

State is versioned (`schemaVersion`) and passed through `migrateState()` (`src/store/migrations.ts`) on load. There's only one version so far, but the guard is there from day one: an unrecognized or malformed shape falls back to a fresh state instead of crashing or silently misinterpreting old data.

### Selectors

`src/store/selectors.ts` maps `AppState` plus an "as of" year into calculator inputs and calls `calculateTfsaRoom` / `calculateFhsaRoom` / `calculateRrspRoom` directly. Screens never call the calculators themselves - they go through selectors, so there's exactly one place that knows how to translate stored `ContributionRecord[]` arrays into the `{year, amountCents}` shape the calculators expect.

## Calculators

Each of `tfsa.ts`, `fhsa.ts`, and `rrsp.ts` exports a single function that takes an options object (birth year, contribution/withdrawal history, and account-specific inputs like FHSA's `accountOpenedYear` or RRSP's `earnedIncomeCentsByYear`) and returns a result object: remaining room, over-contribution status, an estimated monthly penalty, a full year-by-year breakdown, and any warnings (like a year CRA hasn't published a limit for yet).

All money is integer cents (`calculators/shared/money.ts`) to avoid float drift when summing contributions across 18+ years. Invalid input throws a `ValidationError` with a `code` from a frozen enum (`calculators/shared/errors.ts`) - callers and tests match on the code, never the message string, so copy can be reworded freely without breaking anything.

## Routing

React Router's `HashRouter` is used deliberately, not `BrowserRouter`: the app deploys to a GitHub Pages sub-path (`/contribution-limits-tool/`) with no server-side rewrites available, so a path-based router would 404 on any deep-link refresh. Hash routing sidesteps that entirely.

| Route                   | Screen                                                     | Guard                                                                              |
| ----------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `/`                     | -                                                          | `RootRedirect` sends to `/welcome`, `/profile`, or `/dashboard` depending on state |
| `/welcome`              | `WelcomeScreen`                                            | -                                                                                  |
| `/profile`              | `ProfileScreen`                                            | -                                                                                  |
| `/dashboard`            | `DashboardScreen`                                          | redirects to `/profile` if no birth year is set                                    |
| `/account/:accountType` | `AccountScreen` -> `TfsaPanel` / `FhsaPanel` / `RrspPanel` | same, plus redirects to `/dashboard` on an invalid `:accountType`                  |
| `/summary`              | `SummaryScreen`                                            | same                                                                               |
| `/about`                | `AboutScreen`                                              | none - always accessible                                                           |

`RouteAnnouncer` moves focus to each screen's `<h1>` on navigation, since a client-side route change gives keyboard and screen-reader users no signal otherwise.

## Deployment

`vite.config.ts` sets `base: '/contribution-limits-tool/'` so every built asset path resolves correctly under the Pages sub-path. `public/.nojekyll` is required alongside it - without it, GitHub Pages runs the artifact through Jekyll, which silently drops anything starting with `_`. See [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml).
