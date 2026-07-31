# Contributing to Contribution Limits Tool

Thanks for your interest in improving this tool. Issues, bug reports, and pull requests are all welcome.

## Getting set up

```bash
git clone https://github.com/krishnaharshap/contribution-limits-tool.git
cd contribution-limits-tool
npm install
npm run dev
```

Use the Node version in [`.nvmrc`](.nvmrc). Before opening a PR, run:

```bash
npm run verify
```

This runs lint, format check, typecheck, unit tests (with coverage), and the full Playwright e2e suite - the same checks CI runs.

## Branch naming

Branches are named `<type>/<short-description>`, all lowercase, words separated by hyphens:

- `feature/...` - new functionality
- `fix/...` - bug fixes
- `chore/...` - tooling, dependencies, config, cleanup
- `docs/...` - documentation only
- `test/...` - test-only changes
- `ci/...` - CI/CD workflow changes

## Commit messages

- A concise, imperative subject line ("Add FHSA carryforward cap", not "Added" or "Adds").
- A short body explaining _why_, not a restatement of the diff - the diff already shows what changed.
- No AI-attribution footers or generated-by notices.

## Code style

- TypeScript, strict mode. `npm run typecheck` must pass.
- ESLint + Prettier are enforced in CI; run `npm run lint` and `npm run format` locally first.
- Comments explain non-obvious _why_, not _what_ - well-named code doesn't need a comment restating it.

## Tests

- Pure logic (calculators, store, utilities) gets Vitest unit tests.
- New screens or interactive components get a Vitest + React Testing Library component test.
- User-facing flows and cross-cutting concerns (accessibility, responsive layout, persistence) belong in the Playwright e2e suite under `tests/e2e/specs/`.
- If you're adding or changing TFSA/FHSA/RRSP math, add a scenario to `tests/shared/scenarios/` rather than a one-off test - it gets asserted against the calculator _and_ the rendered UI for free.

See [`docs/TESTING.md`](docs/TESTING.md) for the full strategy.

## CRA rules and figures

If you're touching contribution-limit numbers or eligibility rules, update `src/data/limits.ts` and `docs/CRA_RULES.md` together, and note your source. Don't guess or extrapolate a figure CRA hasn't published yet - `isYearSupported()` exists specifically so the app can say "we don't know yet" instead of silently using the wrong number.
