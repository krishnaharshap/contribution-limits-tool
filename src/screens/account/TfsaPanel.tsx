import { calculateTfsaRoom } from "../../calculators/tfsa";
import { getTfsaEligibility } from "../../calculators/shared/eligibility";
import { ValidationError } from "../../calculators/shared/errors";
import { formatCad } from "../../calculators/shared/money";
import { ContributionForm } from "../../components/ContributionForm";
import { ContributionTable } from "../../components/ContributionTable";
import { ErrorBanner } from "../../components/ErrorBanner";
import { WarningBanner } from "../../components/WarningBanner";
import { actions } from "../../store/actions";
import { useStore } from "../../store/StoreContext";
import { getCurrentYear } from "../../utils/currentYear";

export function TfsaPanel() {
  const { state, dispatch } = useStore();
  const asOfYear = getCurrentYear();
  const birthYear = state.profile.birthYear as number;

  const { eligibilityStartYear } = getTfsaEligibility({
    birthYear,
    residencyStartYear: state.profile.residencyStartYear ?? undefined,
    asOfYear,
  });

  let errorMessage: string | null = null;
  let result: ReturnType<typeof calculateTfsaRoom> | null = null;

  try {
    result = calculateTfsaRoom({
      birthYear,
      residencyStartYear: state.profile.residencyStartYear ?? undefined,
      contributions: state.accounts.tfsa.contributions.map((record) => ({
        year: record.year,
        amountCents: record.amountCents,
      })),
      withdrawals: state.accounts.tfsa.withdrawals.map((record) => ({
        year: record.year,
        amountCents: record.amountCents,
      })),
      asOfYear,
    });
  } catch (error) {
    errorMessage =
      error instanceof ValidationError
        ? error.message
        : "Something went wrong calculating your TFSA room.";
  }

  if (errorMessage !== null || result === null) {
    return <ErrorBanner message={errorMessage ?? "Unable to calculate TFSA room."} />;
  }

  return (
    <>
      <WarningBanner warnings={result.warnings} />

      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <p style={{ margin: 0 }}>
          Remaining room:{" "}
          <strong data-testid="tfsa-remaining">{formatCad(result.remainingRoomCents)}</strong>
        </p>
        {result.isOverContributed && (
          <p style={{ margin: "var(--space-2) 0 0", color: "var(--color-danger)" }}>
            You are over-contributed by {formatCad(result.overContributionCents)} - estimated
            penalty {formatCad(result.estimatedMonthlyPenaltyCents)}/month until it's withdrawn.
          </p>
        )}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <h2>Contributions</h2>
          <ContributionForm
            submitLabel="Add contribution"
            minYear={eligibilityStartYear}
            maxYear={asOfYear}
            existingYears={state.accounts.tfsa.contributions.map((record) => record.year)}
            onAdd={(entry) => dispatch(actions.tfsaContributionAdded(entry))}
            testIdPrefix="tfsa-contribution"
          />
          <div style={{ marginTop: "var(--space-4)" }}>
            <ContributionTable
              records={state.accounts.tfsa.contributions}
              onRemove={(id) => dispatch(actions.tfsaContributionRemoved(id))}
              testIdPrefix="tfsa-contribution"
            />
          </div>
        </div>

        <div className="card">
          <h2>Withdrawals</h2>
          <p className="field-hint">
            A withdrawal restores your room on January 1 of the <strong>following</strong> year -
            not the same year you withdraw.
          </p>
          <ContributionForm
            submitLabel="Add withdrawal"
            minYear={eligibilityStartYear}
            maxYear={asOfYear}
            existingYears={state.accounts.tfsa.withdrawals.map((record) => record.year)}
            onAdd={(entry) => dispatch(actions.tfsaWithdrawalAdded(entry))}
            testIdPrefix="tfsa-withdrawal"
          />
          <div style={{ marginTop: "var(--space-4)" }}>
            <ContributionTable
              records={state.accounts.tfsa.withdrawals}
              onRemove={(id) => dispatch(actions.tfsaWithdrawalRemoved(id))}
              testIdPrefix="tfsa-withdrawal"
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "var(--space-5)" }}>
        <h2>Year-by-year breakdown</h2>
        <table className="data-table" data-testid="tfsa-breakdown-table">
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col" className="numeric">
                Limit
              </th>
              <th scope="col" className="numeric">
                Withdrawals added back
              </th>
              <th scope="col" className="numeric">
                Room available
              </th>
              <th scope="col" className="numeric">
                Contributed
              </th>
              <th scope="col" className="numeric">
                Remaining
              </th>
            </tr>
          </thead>
          <tbody>
            {result.yearlyBreakdown.map((row) => (
              <tr key={row.year}>
                <td>{row.year}</td>
                <td className="numeric">{formatCad(row.annualLimitCents)}</td>
                <td className="numeric">{formatCad(row.withdrawalsAddedBackCents)}</td>
                <td className="numeric">{formatCad(row.roomAvailableCents)}</td>
                <td className="numeric">{formatCad(row.contributedCents)}</td>
                <td className="numeric">{formatCad(row.cumulativeRoomRemainingCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
