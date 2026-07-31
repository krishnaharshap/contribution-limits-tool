import { useState, type FormEvent } from "react";
import { toCents } from "../calculators/shared/money";

interface ContributionFormProps {
  submitLabel: string;
  minYear: number;
  maxYear: number;
  existingYears: readonly number[];
  onAdd: (entry: { year: number; amountCents: number }) => void;
  testIdPrefix: string;
  amountLabel?: string;
}

export function ContributionForm({
  submitLabel,
  minYear,
  maxYear,
  existingYears,
  onAdd,
  testIdPrefix,
  amountLabel = "Amount",
}: ContributionFormProps) {
  const [year, setYear] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedYear = Number(year);
    if (
      year.trim() === "" ||
      !Number.isInteger(parsedYear) ||
      parsedYear < minYear ||
      parsedYear > maxYear
    ) {
      setError(`Year must be between ${minYear} and ${maxYear}.`);
      return;
    }

    if (existingYears.includes(parsedYear)) {
      setError(
        `You already have an entry for ${parsedYear} - remove it first to change the amount.`,
      );
      return;
    }

    const parsedAmount = Number(amount);
    if (amount.trim() === "" || !Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setError("Enter a non-negative amount.");
      return;
    }

    setError(null);
    onAdd({ year: parsedYear, amountCents: toCents(parsedAmount) });
    setYear("");
    setAmount("");
  }

  return (
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
        className="button button--primary"
        data-testid={`${testIdPrefix}-submit-button`}
      >
        {submitLabel}
      </button>
      {error && (
        <p
          className="field-error"
          role="alert"
          data-testid={`${testIdPrefix}-error`}
          style={{ width: "100%", margin: 0 }}
        >
          {error}
        </p>
      )}
    </form>
  );
}
