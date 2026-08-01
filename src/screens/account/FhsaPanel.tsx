import { useState, type FormEvent } from "react";
import { calculateFhsaRoom } from "../../calculators/fhsa";
import { ValidationError } from "../../calculators/shared/errors";
import { formatCad } from "../../calculators/shared/money";
import { ContributionForm } from "../../components/ContributionForm";
import { ContributionTable } from "../../components/ContributionTable";
import { ErrorBanner } from "../../components/ErrorBanner";
import { WarningBanner } from "../../components/WarningBanner";
import { FHSA_FIRST_YEAR, FHSA_LIFETIME_LIMIT } from "../../data/limits";
import { actions } from "../../store/actions";
import { useStore } from "../../store/StoreContext";
import { getCurrentYear } from "../../utils/currentYear";

function AccountOpenedYearField({
  value,
  onSave,
  minYear,
  maxYear,
}: {
  value: number | null;
  onSave: (year: number | null) => void;
  minYear: number;
  maxYear: number;
}) {
  const [draft, setDraft] = useState(value?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (draft.trim() === "") {
      onSave(null);
      setError(null);
      return;
    }

    const parsed = Number(draft);
    if (!Number.isInteger(parsed) || parsed < minYear || parsed > maxYear) {
      setError(`Enter a year between ${minYear} and ${maxYear}, or leave blank.`);
      return;
    }

    setError(null);
    onSave(parsed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-end" }}
    >
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="fhsa-opened-year-field">Account opened in</label>
        <input
          id="fhsa-opened-year-field"
          className="input"
          type="number"
          inputMode="numeric"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          data-testid="fhsa-opened-year-input"
          style={{ width: "8rem" }}
        />
      </div>
      <button
        type="submit"
        className="button button--secondary"
        data-testid="fhsa-opened-year-save"
      >
        Save
      </button>
      {error && (
        <p className="field-error" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  );
}

export function FhsaPanel() {
  const { state, dispatch } = useStore();
  const asOfYear = getCurrentYear();
  const birthYear = state.profile.birthYear as number;
  const accountOpenedYear = state.accounts.fhsa.accountOpenedYear;

  let errorMessage: string | null = null;
  let result: ReturnType<typeof calculateFhsaRoom> | null = null;

  try {
    result = calculateFhsaRoom({
      birthYear,
      accountOpenedYear: accountOpenedYear ?? undefined,
      firstQualifyingWithdrawalYear: state.accounts.fhsa.firstQualifyingWithdrawalYear ?? undefined,
      contributions: state.accounts.fhsa.contributions.map((record) => ({
        year: record.year,
        amountCents: record.amountCents,
      })),
      asOfYear,
    });
  } catch (error) {
    errorMessage =
      error instanceof ValidationError
        ? error.message
        : "Something went wrong calculating your FHSA room.";
  }

  if (errorMessage !== null || result === null) {
    return <ErrorBanner message={errorMessage ?? "Unable to calculate FHSA room."} />;
  }

  return (
    <>
      <WarningBanner warnings={result.warnings} />

      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <AccountOpenedYearField
          value={accountOpenedYear}
          minYear={FHSA_FIRST_YEAR}
          maxYear={asOfYear}
          onSave={(year) => dispatch(actions.fhsaAccountOpenedSet(year))}
        />
      </div>

      {!result.hasAccountOpen ? (
        <div className="banner banner--info" role="status">
          <p style={{ margin: 0 }}>
            You have not opened an FHSA yet, so no room has accrued. Set the year you opened one
            above once you do.
          </p>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: "var(--space-5)" }}>
            <p style={{ margin: 0 }}>
              Remaining room:{" "}
              <strong data-testid="fhsa-remaining">{formatCad(result.remainingRoomCents)}</strong>
            </p>
            <p style={{ margin: "var(--space-2) 0 0" }}>
              {formatCad(result.lifetimeContributedCents)} of {formatCad(FHSA_LIFETIME_LIMIT * 100)}{" "}
              lifetime limit used ({formatCad(result.lifetimeRemainingCents)} left)
            </p>
            {result.participationPeriodEndYear !== null && (
              <p style={{ margin: "var(--space-2) 0 0" }}>
                {result.isParticipationPeriodOver
                  ? `This account's participation period ended in ${result.participationPeriodEndYear}.`
                  : `Participation period ends in ${result.participationPeriodEndYear} (${result.participationPeriodEndYear - asOfYear} years from now).`}
              </p>
            )}
            {result.isOverContributed && (
              <p style={{ margin: "var(--space-2) 0 0", color: "var(--color-danger)" }}>
                You are over-contributed by {formatCad(result.overContributionCents)} - estimated
                penalty {formatCad(result.estimatedMonthlyPenaltyCents)}/month.
              </p>
            )}
          </div>

          <div className="card">
            <h2>Contributions</h2>
            <ContributionForm
              submitLabel="Add contribution"
              minYear={accountOpenedYear ?? FHSA_FIRST_YEAR}
              maxYear={result.participationPeriodEndYear ?? asOfYear}
              existingYears={state.accounts.fhsa.contributions.map((record) => record.year)}
              onAdd={(entry) => dispatch(actions.fhsaContributionAdded(entry))}
              testIdPrefix="fhsa-contribution"
            />
            <div style={{ marginTop: "var(--space-4)" }}>
              <ContributionTable
                records={state.accounts.fhsa.contributions}
                onRemove={(id) => dispatch(actions.fhsaContributionRemoved(id))}
                testIdPrefix="fhsa-contribution"
              />
            </div>
          </div>

          <div className="card" style={{ marginTop: "var(--space-5)" }}>
            <h2>Year-by-year breakdown</h2>
            <table className="data-table" data-testid="fhsa-breakdown-table">
              <thead>
                <tr>
                  <th scope="col">Year</th>
                  <th scope="col" className="numeric">
                    Annual increment
                  </th>
                  <th scope="col" className="numeric">
                    Carryforward
                  </th>
                  <th scope="col" className="numeric">
                    Room available
                  </th>
                  <th scope="col" className="numeric">
                    Contributed
                  </th>
                  <th scope="col" className="numeric">
                    Unused
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.yearlyBreakdown.map((row) => (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    <td className="numeric">{formatCad(row.annualIncrementCents)}</td>
                    <td className="numeric">{formatCad(row.carryforwardCents)}</td>
                    <td className="numeric">{formatCad(row.roomAvailableCents)}</td>
                    <td className="numeric">{formatCad(row.contributedCents)}</td>
                    <td className="numeric">{formatCad(row.unusedThisYearCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
