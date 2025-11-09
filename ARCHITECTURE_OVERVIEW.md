
---

### **`ARCHITECTURE_OVERVIEW.md`**

```markdown
# Architecture Overview – Contribution Limits Tool

## 1. High-Level Overview

The system is designed in two main layers:
- **Frontend UI layer**: A single-screen web app (HTML/CSS/JS) that allows users to select between TFSA / FHSA / RRSP tabs, input data, and view remaining contribution room.
- **Automation Test layer**: A test framework using Playwright + Jest, validating UI components, user flows, input validation, data persistence, and role eligibility (18+) across account types.

## 2. Folder & Module Structure

/contribution-limits-tool
│
├─ frontend/
│ ├─ index.html ← entry point
│ ├─ styles/
│ │ └─ styles.css
│ └─ scripts/
│ └─ app.js ← main UI logic
│
├─ tests/
│ ├─ e2e/ ← end-to-end test specs
│ ├─ helpers/ ← reusable helper functions
│ ├─ fixtures/ ← test data / scenarios
│ ├─ jest.config.js
│ └─ package.json
│
└─ .github/
└─ workflows/ ← CI workflows (GitHub Actions)


## 3. Design Patterns & Conventions

- **Separation of concerns**: UI logic separated from styles and markup. Test logic separated into helpers + specs.
- **Page Object Model (POM)** (for tests): Each UI screen/tab (TFSA, FHSA, RRSP) will have a corresponding page object under `tests/helpers/`.
- **Config-Driven Tests**: Use fixtures for varying input scenarios (valid age, invalid age, over-contribution, multi-year data).
- **Immutable Data Flow**: For the UI logic, input events feed into a central calculator module that computes remaining room (future extension: module testable in isolation).

## 4. Hosting Strategy (MVP)

- Use GitHub Pages to host the `frontend/` directory as a static site.
- In GitHub repo settings: Enable Pages, set source to `main` branch, `/frontend` folder.
- URL will be something like: `https://<YOUR_USERNAME>.github.io/contribution-limits-tool/`
- For data persistence, we use browser `localStorage` initially (no backend). This allows storing user’s contribution history locally.
- Future phase: integrate a free backend (e.g., Firebase, or Netlify Functions) to store user data securely.

## 5. Data Persistence Plan (MVP → Phase 2)

- **MVP**: Use `localStorage` with key structure: `contribLimitsTool:userData` storing JSON object per user session.
- **Phase 2**:  
  - Add user identity (anonymous or sign-in)  
  - Free backend alternative: Firebase Firestore or Netlify Functions + Fauna DB  
  - Data schema: user → contributions → accountType → year → amount  
  - Test automation will include API mock/test for backend once integrated.

## 6. Automation Framework Architecture

- **tests/package.json** defines dependencies: Playwright + Jest + ts-node (if using TS)  
- **jest.config.js** will configure test environment (e.g., `testMatch: ["**/*.spec.ts"]`)  
- **Playwright config** (if separate) will define browsers, headless mode, test timeouts.  
- **Helpers** module: e.g., `pageObjects/tfsaPage.ts`, `helpers/dataSetup.ts`, `helpers/assertions.ts`  
- **Fixtures**: JSON files describing scenarios (user age < 18, user age ≥ 18, multi-year contributions)  
- **E2E Specs**: `tfsa.spec.ts`, `fhsa.spec.ts`, `rrsp.spec.ts` — covering flows for each account type.

## 7. SDLC & Versioning Strategy

- Version using Semantic Versioning: `v0.1.0` for MVP.  
- Use GitHub Actions (in `.github/workflows/ci.yml`) to run tests on each PR and push to `main`.  
- Maintain CHANGELOG.md (optional) to record major/minor/patch changes.

---

## 📈 Visual Overview (future addition)

You may add a simple architecture diagram here (e.g., draw.io export) showing UI → persistence → tests layers.

---

## 🧾 Summary

This document presents how the system is structured, how directories are organized, how automation is set up, and how hosting/data-persistence are handled.  
Keep this aligned with code implementations and update as architecture evolves.


