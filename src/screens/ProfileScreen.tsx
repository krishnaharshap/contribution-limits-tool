import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router";
import {
  getFhsaEligibility,
  getRrspEligibility,
  getTfsaEligibility,
} from "../calculators/shared/eligibility";
import { ScreenHeading } from "../components/ScreenHeading";
import { AGE_OF_MAJORITY_19_PROVINCES, PROVINCES } from "../data/provinces";
import { actions } from "../store/actions";
import { useStore } from "../store/StoreContext";
import { getCurrentYear } from "../utils/currentYear";

const CURRENT_YEAR = getCurrentYear();
const MIN_BIRTH_YEAR = CURRENT_YEAR - 110;
const FHSA_INTRODUCED_YEAR = 2023;

function parseOptionalYear(value: string): number | null {
  return value.trim() === "" ? null : Number(value);
}

export function ProfileScreen() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();

  const [birthYear, setBirthYear] = useState(state.profile.birthYear?.toString() ?? "");
  const [residencyStartYear, setResidencyStartYear] = useState(
    state.profile.residencyStartYear?.toString() ?? "",
  );
  const [province, setProvince] = useState(state.profile.province ?? "");
  const [hasEmployerPension, setHasEmployerPension] = useState(state.profile.hasEmployerPension);
  const [fhsaOpenedYear, setFhsaOpenedYear] = useState(
    state.accounts.fhsa.accountOpenedYear?.toString() ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  const parsedBirthYear = Number(birthYear);
  const isBirthYearValid =
    birthYear.trim() !== "" &&
    Number.isInteger(parsedBirthYear) &&
    parsedBirthYear >= MIN_BIRTH_YEAR &&
    parsedBirthYear <= CURRENT_YEAR;

  const selectedProvince = PROVINCES.find((candidate) => candidate.code === province);

  const eligibility = isBirthYearValid
    ? {
        tfsa: getTfsaEligibility({
          birthYear: parsedBirthYear,
          residencyStartYear: parseOptionalYear(residencyStartYear) ?? undefined,
          asOfYear: CURRENT_YEAR,
        }),
        fhsa: getFhsaEligibility({ birthYear: parsedBirthYear, asOfYear: CURRENT_YEAR }),
        rrsp: getRrspEligibility({ birthYear: parsedBirthYear, asOfYear: CURRENT_YEAR }),
      }
    : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isBirthYearValid) {
      setError(`Enter a birth year between ${MIN_BIRTH_YEAR} and ${CURRENT_YEAR}.`);
      return;
    }

    const parsedResidencyStartYear = parseOptionalYear(residencyStartYear);
    if (
      parsedResidencyStartYear !== null &&
      (!Number.isInteger(parsedResidencyStartYear) || parsedResidencyStartYear < parsedBirthYear)
    ) {
      setError("Residency start year can't be before your birth year.");
      return;
    }

    const parsedFhsaOpenedYear = parseOptionalYear(fhsaOpenedYear);
    if (
      parsedFhsaOpenedYear !== null &&
      (!Number.isInteger(parsedFhsaOpenedYear) ||
        parsedFhsaOpenedYear < FHSA_INTRODUCED_YEAR ||
        parsedFhsaOpenedYear > CURRENT_YEAR)
    ) {
      setError(`FHSA opened year must be between ${FHSA_INTRODUCED_YEAR} and ${CURRENT_YEAR}.`);
      return;
    }

    setError(null);
    dispatch(
      actions.profileUpdated({
        birthYear: parsedBirthYear,
        residencyStartYear: parsedResidencyStartYear,
        province: province === "" ? null : province,
        hasEmployerPension,
      }),
    );
    dispatch(actions.fhsaAccountOpenedSet(parsedFhsaOpenedYear));
    navigate("/dashboard");
  }

  return (
    <main
      className="container"
      style={{ paddingBlock: "var(--space-6)" }}
      data-testid="profile-screen"
    >
      <ScreenHeading>Your profile</ScreenHeading>
      <p>
        This determines when each account starts building room. Nothing here is sent anywhere - it
        stays on this device.
      </p>

      <div className="grid grid--profile" style={{ alignItems: "start" }}>
        <form className="card" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="birth-year">Birth year</label>
            <input
              id="birth-year"
              className="input"
              type="number"
              inputMode="numeric"
              value={birthYear}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setBirthYear(event.target.value)}
              aria-invalid={birthYear.trim() !== "" && !isBirthYearValid}
              aria-describedby="birth-year-hint"
              data-testid="profile-birth-year-input"
            />
            <p className="field-hint" id="birth-year-hint">
              Used to determine when TFSA and FHSA room starts.
            </p>
          </div>

          <div className="field">
            <label htmlFor="residency-year">Canadian resident since (optional)</label>
            <input
              id="residency-year"
              className="input"
              type="number"
              inputMode="numeric"
              value={residencyStartYear}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setResidencyStartYear(event.target.value)
              }
              data-testid="profile-residency-year-input"
            />
            <p className="field-hint">Leave blank if you've been a resident since turning 18.</p>
          </div>

          <div className="field">
            <label htmlFor="province">Province or territory</label>
            <select
              id="province"
              className="select"
              value={province}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setProvince(event.target.value)}
              data-testid="profile-province-select"
            >
              <option value="">Prefer not to say</option>
              {PROVINCES.map((candidate) => (
                <option key={candidate.code} value={candidate.code}>
                  {candidate.name}
                </option>
              ))}
            </select>
            {selectedProvince && AGE_OF_MAJORITY_19_PROVINCES.has(selectedProvince.code) && (
              <p className="field-hint">
                Age of majority is 19 in {selectedProvince.name} - you can open a TFSA at 19, though
                room still starts building at 18.
              </p>
            )}
          </div>

          <div className="field checkbox-field">
            <input
              id="has-pension"
              type="checkbox"
              checked={hasEmployerPension}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setHasEmployerPension(event.target.checked)
              }
              data-testid="profile-pension-checkbox"
            />
            <label htmlFor="has-pension">I have an employer pension plan</label>
          </div>

          <div className="field">
            <label htmlFor="fhsa-opened-year">FHSA opened in (optional)</label>
            <input
              id="fhsa-opened-year"
              className="input"
              type="number"
              inputMode="numeric"
              value={fhsaOpenedYear}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setFhsaOpenedYear(event.target.value)
              }
              data-testid="profile-fhsa-opened-year-input"
            />
            <p className="field-hint">Leave blank if you haven't opened an FHSA yet.</p>
          </div>

          {error && (
            <p className="field-error" role="alert" data-testid="profile-form-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button button--primary"
            data-testid="profile-continue-button"
          >
            Continue to dashboard
          </button>
        </form>

        <div className="card" aria-live="polite">
          <h2>Your eligibility</h2>
          {eligibility ? (
            <ul style={{ listStyle: "none" }} data-testid="profile-eligibility-summary">
              <li style={{ marginBottom: "var(--space-3)" }}>
                <strong>TFSA:</strong>{" "}
                {eligibility.tfsa.eligible
                  ? `Eligible since ${eligibility.tfsa.eligibilityStartYear}`
                  : `You'll start accruing room in ${eligibility.tfsa.eligibilityStartYear}`}
              </li>
              <li style={{ marginBottom: "var(--space-3)" }}>
                <strong>FHSA:</strong>{" "}
                {!eligibility.fhsa.eligible
                  ? `You'll be eligible to open one in ${eligibility.fhsa.eligibilityStartYear}`
                  : parseOptionalYear(fhsaOpenedYear) !== null
                    ? `Eligible, opened ${fhsaOpenedYear}`
                    : "Eligible, but you have no room until you open an account"}
              </li>
              <li>
                <strong>RRSP:</strong> Room has no minimum age - it's based on your earned income,
                so it's available regardless of birth year.
              </li>
            </ul>
          ) : (
            <p>Enter a birth year to see your eligibility for each account.</p>
          )}
        </div>
      </div>
    </main>
  );
}
