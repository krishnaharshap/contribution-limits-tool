import { formatCad } from "../calculators/shared/money";
import type { ContributionRecord } from "../store/types";

interface ContributionTableProps {
  records: readonly ContributionRecord[];
  onRemove: (id: string) => void;
  amountLabel?: string;
  testIdPrefix: string;
  emptyMessage?: string;
}

export function ContributionTable({
  records,
  onRemove,
  amountLabel = "Amount",
  testIdPrefix,
  emptyMessage = "No entries yet.",
}: ContributionTableProps) {
  if (records.length === 0) {
    return <p data-testid={`${testIdPrefix}-empty`}>{emptyMessage}</p>;
  }

  const sorted = [...records].sort((a, b) => a.year - b.year);

  return (
    <table className="data-table" data-testid={`${testIdPrefix}-table`}>
      <thead>
        <tr>
          <th scope="col">Year</th>
          <th scope="col" className="numeric">
            {amountLabel}
          </th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((record) => (
          <tr key={record.id}>
            <td>{record.year}</td>
            <td className="numeric">{formatCad(record.amountCents)}</td>
            <td>
              <button
                type="button"
                className="button button--danger button--small"
                onClick={() => onRemove(record.id)}
                data-testid={`${testIdPrefix}-remove-${record.year}`}
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
