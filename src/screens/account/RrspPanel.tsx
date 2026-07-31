import { useState, type FormEvent } from "react";
import { calculateRrspRoom } from "../../calculators/rrsp";
import { ValidationError } from "../../calculators/shared/errors";
import { formatCad, toCents } from "../../calculators/shared/money";
import { ContributionForm } from "../../components/ContributionForm";
import { ContributionTable } from "../../components/ContributionTable";
import { ErrorBanner } from "../../components/ErrorBanner";
import { WarningBanner } from "../../components/WarningBanner";
import { actions } from "../../store/actions";
import { useStore } from "../../store/StoreContext";
import { getCurrentYear } from "../../utils/currentYear";

function YearValueForm({
  heading,
  amountLabel,
  existingYears,
  maxYear,
  onSave,
  testIdPrefix,
}: {
  heading: string;
  amountLabel: string;
  existingYears: readonly number[];
  maxYear: number;
  onSave: (year: number, amountCents: number) => void;
  testIdPrefix: string;
}) {
  const [year, setYear] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedYear = Number(year);
    if (year.trim() === "" || !Number.isInteger(parsedYear) || parsedYear > maxYear) {
      setError(`Year must be ${maxYear} or earlier.`);
      return;
    }

    if (existingYears.includes(parsedYear)) {
      setError(`You already have a value for ${parsedYear} - remove it first to change it.`);
      return;
    }

    const parsedAmount = Number(amount);
    if (amount.trim() === "" || !Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setError("Enter a non-negative amount.");
      return;
    }

    setError(null);
    onSave(parsedYear, toCents(parsedAmount));
    setYear("");
    setAmount("");
  }

  return (
    <div style={{ marginBottom: "var(--space-4)" }}>
      <h3>{heading}</h3>
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-end", flexWrap: "wrap" }}
      >
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor={`${testIdPrefix}-year`}>Year</label>
          <input
            id={`${testIdPrefix}-year`}
            className="input"
            type="number"
            inputMode="numeric"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            data-testid={`${testIdPrefix}-year-input`}
            style={{ width: "8rem" }}
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor={`${testIdPrefix}-amount`}>{amountLabel}</label>
          <input
            id={`${testIdPrefix}-amount`}
            className="input"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            data-testid={`${testIdPrefix}-amount-input`}
            style={{ width: "10rem" }}
          />
        </div>
        <button
          type="submit"
          className="button button--secondary"
          data-testid={`${testIdPrefix}-submit`}
        >
          Save
        </button>
        {error && (
          <p className="field-error" role="alert" style={{ width: "100%", margin: 0 }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

function YearValueTable({
  values,
  onRemove,
  testIdPrefix,
}: {
  values: Readonly<Record<number, number>>;
  onRemove: (year: number) => void;
  testIdPrefix: string;
}) {
  const years = Object.keys(values)
    .map(Number)
    .sort((a, b) => a - b);

  if (years.length === 0) {
    return <p data-testid={`${testIdPrefix}-empty`}>No entries yet.</p>;
  }

  return (
    <table className="data-table" data-testid={`${testIdPrefix}-table`}>
      <thead>
        <tr>
          <th scope="col">Year</th>
          <th scope="col" className="numeric">
            Amount
          </th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {years.map((year) => (
          <tr key={year}>
            <td>{year}</td>
            <td className="numeric">{formatCad(values[year])}</td>
            <td>
              <button
                type="button"
                className="button button--danger button--small"
                onClick={() => onRemove(year)}
                data-testid={`${testIdPrefix}-remove-${year}`}
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RrspPanel() {
  const { state, dispatch } = useStore();
  const asOfYear = getCurrentYear();
  const birthYear = state.profile.birthYear as number;
  const rrsp = state.accounts.rrsp;

  let errorMessage: string | null = null;
  let result: ReturnType<typeof calculateRrspRoom> | null = null;

  try {
    result = calculateRrspRoom({
      birthYear,
      earnedIncomeCentsByYear: rrsp.earnedIncomeCentsByYear,
      pensionAdjustmentCentsByYear: state.profile.hasEmployerPension
        ? rrsp.pensionAdjustmentCentsByYear
        : undefined,
      priorUnusedRoomOverrideCents: rrsp.priorUnusedRoomOverrideCents ?? undefined,
      contributions: rrsp.contributions.map((record) => ({
        year: record.year,
        amountCents: record.amountCents,
      })),
      asOfYear,
    });
  } catch (error) {
    errorMessage =
      error instanceof ValidationError
        ? error.message
        : "Something went wrong calculating your RRSP room.";
  }

  if (errorMessage !== null || result === null) {
    return <ErrorBanner message={errorMessage ?? "Unable to calculate RRSP room."} />;
  }

  return (
    <>
      <WarningBanner warnings={result.warnings} />

      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <p style={{ margin: 0 }}>
          Remaining room:{" "}
          <strong data-testid="rrsp-remaining">{formatCad(result.remainingRoomCents)}</strong>
        </p>
        <p style={{ margin: "var(--space-2) 0 0" }}>
          Must be collapsed by {result.mustCollapseByYear}.
        </p>
        {result.isOverContributed && (
          <p style={{ margin: "var(--space-2) 0 0", color: "var(--color-danger)" }}>
            You are over-contributed by {formatCad(result.overContributionCents)}
            {result.estimatedMonthlyPenaltyCents > 0
              ? ` - ${formatCad(result.bufferRemainingCents)} of your $2,000 lifetime cushion remains before the estimated ${formatCad(result.estimatedMonthlyPenaltyCents)}/month penalty applies.`
              : ` - within your $2,000 lifetime cushion, so no penalty applies yet.`}
          </p>
        )}
      </div>

      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <h2>Have your Notice of Assessment room figure?</h2>
        <p className="field-hint">
          Paste your available RRSP room directly instead of reconstructing years of income history.
          This replaces any room calculated from income before your first tracked year.
        </p>
        <PriorRoomOverrideField
          value={rrsp.priorUnusedRoomOverrideCents}
          onSave={(cents) => dispatch(actions.rrspPriorRoomOverrideSet(cents))}
        />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <YearValueForm
            heading="Earned income by year"
            amountLabel="Earned income"
            existingYears={Object.keys(rrsp.earnedIncomeCentsByYear).map(Number)}
            maxYear={asOfYear - 1}
            onSave={(year, amountCents) => dispatch(actions.rrspIncomeSet(year, amountCents))}
            testIdPrefix="rrsp-income"
          />
          <YearValueTable
            values={rrsp.earnedIncomeCentsByYear}
            onRemove={(year) => dispatch(actions.rrspIncomeSet(year, null))}
            testIdPrefix="rrsp-income"
          />
        </div>

        {state.profile.hasEmployerPension && (
          <div className="card">
            <YearValueForm
              heading="Pension adjustments by year"
              amountLabel="Pension adjustment"
              existingYears={Object.keys(rrsp.pensionAdjustmentCentsByYear).map(Number)}
              maxYear={asOfYear - 1}
              onSave={(year, amountCents) =>
                dispatch(actions.rrspPensionAdjustmentSet(year, amountCents))
              }
              testIdPrefix="rrsp-pension"
            />
            <YearValueTable
              values={rrsp.pensionAdjustmentCentsByYear}
              onRemove={(year) => dispatch(actions.rrspPensionAdjustmentSet(year, null))}
              testIdPrefix="rrsp-pension"
            />
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: "var(--space-5)" }}>
        <h2>Contributions</h2>
        <ContributionForm
          submitLabel="Add contribution"
          minYear={asOfYear - 100}
          maxYear={result.mustCollapseByYear}
          existingYears={rrsp.contributions.map((record) => record.year)}
          onAdd={(entry) => dispatch(actions.rrspContributionAdded(entry))}
          testIdPrefix="rrsp-contribution"
        />
        <div style={{ marginTop: "var(--space-4)" }}>
          <ContributionTable
            records={rrsp.contributions}
            onRemove={(id) => dispatch(actions.rrspContributionRemoved(id))}
            testIdPrefix="rrsp-contribution"
          />
        </div>
      </div>

      {result.yearlyBreakdown.length > 0 && (
        <div className="card" style={{ marginTop: "var(--space-5)" }}>
          <h2>Year-by-year breakdown</h2>
          <table className="data-table" data-testid="rrsp-breakdown-table">
            <thead>
              <tr>
                <th scope="col">Year</th>
                <th scope="col">Based on income year</th>
                <th scope="col" className="numeric">
                  New room
                </th>
                <th scope="col" className="numeric">
                  Pension adjustment
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
                  <td>{row.earnedIncomeYear}</td>
                  <td className="numeric">{formatCad(row.newRoomCents)}</td>
                  <td className="numeric">{formatCad(row.pensionAdjustmentCents)}</td>
                  <td className="numeric">{formatCad(row.roomAvailableCents)}</td>
                  <td className="numeric">{formatCad(row.contributedCents)}</td>
                  <td className="numeric">{formatCad(row.cumulativeRoomRemainingCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function PriorRoomOverrideField({
  value,
  onSave,
}: {
  value: number | null;
  onSave: (cents: number | null) => void;
}) {
  const [draft, setDraft] = useState(value !== null ? (value / 100).toString() : "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (draft.trim() === "") {
      onSave(null);
      setError(null);
      return;
    }

    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) {
      setError("Enter a number, or leave blank to clear it.");
      return;
    }

    setError(null);
    onSave(toCents(parsed));
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-end" }}
    >
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="rrsp-prior-room-override">Available room from your NOA</label>
        <input
          id="rrsp-prior-room-override"
          className="input"
          type="number"
          step="0.01"
          inputMode="decimal"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          data-testid="rrsp-prior-room-override-input"
          style={{ width: "12rem" }}
        />
      </div>
      <button
        type="submit"
        className="button button--secondary"
        data-testid="rrsp-prior-room-override-save"
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
