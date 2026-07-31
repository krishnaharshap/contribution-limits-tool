import { migrateState } from "../store/migrations";
import type { AppState } from "../store/types";
import { fromCents } from "../calculators/shared/money";

export function exportStateAsJson(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

interface CsvRow {
  account: string;
  type: string;
  year: number;
  amount: number;
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function exportStateAsCsv(state: AppState): string {
  const rows: CsvRow[] = [
    ...state.accounts.tfsa.contributions.map((record) => ({
      account: "TFSA",
      type: "contribution",
      year: record.year,
      amount: fromCents(record.amountCents),
    })),
    ...state.accounts.tfsa.withdrawals.map((record) => ({
      account: "TFSA",
      type: "withdrawal",
      year: record.year,
      amount: fromCents(record.amountCents),
    })),
    ...state.accounts.fhsa.contributions.map((record) => ({
      account: "FHSA",
      type: "contribution",
      year: record.year,
      amount: fromCents(record.amountCents),
    })),
    ...state.accounts.rrsp.contributions.map((record) => ({
      account: "RRSP",
      type: "contribution",
      year: record.year,
      amount: fromCents(record.amountCents),
    })),
  ].sort((a, b) => a.year - b.year || a.account.localeCompare(b.account));

  const header = ["Account", "Type", "Year", "Amount"];
  const lines = [header.join(",")];

  for (const row of rows) {
    lines.push([row.account, row.type, row.year, row.amount].map(escapeCsvCell).join(","));
  }

  return lines.join("\n");
}

export class ImportError extends Error {}

export function parseImportedJson(raw: string): AppState {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ImportError("That file isn't valid JSON.");
  }

  const migrated = migrateState(parsed);

  if (migrated.profile.birthYear === null && parsed !== null && typeof parsed === "object") {
    // migrateState silently falls back to a fresh state for any shape
    // it doesn't recognize - if the original had *some* content but
    // came back empty, the file was probably not one of our exports.
    const original = parsed as Record<string, unknown>;
    if (typeof original.schemaVersion !== "number") {
      throw new ImportError("That file doesn't look like a Contribution Limits Tool export.");
    }
  }

  return migrated;
}

export function downloadTextFile(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
