import { useRef, useState, type ChangeEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import { formatCad } from "../calculators/shared/money";
import { ScreenHeading } from "../components/ScreenHeading";
import { actions } from "../store/actions";
import { useStore } from "../store/StoreContext";
import { selectAllResults } from "../store/selectors";
import { getCurrentYear } from "../utils/currentYear";
import {
  downloadTextFile,
  exportStateAsCsv,
  exportStateAsJson,
  ImportError,
  parseImportedJson,
} from "../utils/exportImport";

function todayForFilename(): string {
  return new Date().toISOString().slice(0, 10);
}

function getTotalContributedCents(
  result: ReturnType<typeof selectAllResults>["tfsa" | "fhsa" | "rrsp"],
): number {
  if (result === null) {
    return 0;
  }
  return result.account === "fhsa" ? result.lifetimeContributedCents : result.totalContributedCents;
}

export function SummaryScreen() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const asOfYear = getCurrentYear();

  // Resetting clears birthYear, which would normally trip this guard.
  // isResetting suppresses it for the one render where that's still
  // true but this screen hasn't finished navigating to /welcome yet.
  if (state.profile.birthYear === null && !isResetting) {
    return <Navigate to="/profile" replace />;
  }

  const results = selectAllResults(state, asOfYear);
  const rows = [
    { label: "TFSA", href: "/account/tfsa", result: results.tfsa },
    { label: "FHSA", href: "/account/fhsa", result: results.fhsa },
    { label: "RRSP", href: "/account/rrsp", result: results.rrsp },
  ];

  function handleExportJson() {
    downloadTextFile(
      `contribution-limits-tool-${todayForFilename()}.json`,
      exportStateAsJson(state),
      "application/json",
    );
  }

  function handleExportCsv() {
    downloadTextFile(
      `contribution-limits-tool-${todayForFilename()}.csv`,
      exportStateAsCsv(state),
      "text/csv",
    );
  }

  function handleImportClick() {
    setImportError(null);
    setImportMessage(null);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const imported = parseImportedJson(text);
      dispatch(actions.stateImported(imported));
      setImportError(null);
      setImportMessage("Import complete - your data has been replaced.");
    } catch (error) {
      setImportMessage(null);
      setImportError(error instanceof ImportError ? error.message : "Could not read that file.");
    }
  }

  function handleResetConfirmed() {
    // The route change to /welcome and this screen's unmount don't
    // happen in the same commit as the reset dispatch, so this screen
    // can still re-render (with the just-cleared state) before it's
    // gone - isResetting stops its own guard from redirecting to
    // /profile during that window instead of /welcome.
    setIsResetting(true);
    dispatch(actions.stateReset());
    navigate("/welcome");
  }

  return (
    <main
      className="container"
      style={{ paddingBlock: "var(--space-6)" }}
      data-testid="summary-screen"
    >
      <ScreenHeading>Summary</ScreenHeading>

      <div className="card" style={{ marginBottom: "var(--space-5)" }}>
        <table className="data-table" data-testid="summary-table">
          <thead>
            <tr>
              <th scope="col">Account</th>
              <th scope="col" className="numeric">
                Remaining room
              </th>
              <th scope="col" className="numeric">
                Contributed
              </th>
              <th scope="col" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td className="numeric">
                  {row.result ? formatCad(row.result.remainingRoomCents) : "-"}
                </td>
                <td className="numeric">{formatCad(getTotalContributedCents(row.result))}</td>
                <td>
                  <a href={`#${row.href}`}>View details</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <h2>Export your data</h2>
          <p>Since nothing is stored anywhere but this browser, exporting is also your backup.</p>
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <button
              type="button"
              className="button button--secondary"
              onClick={handleExportJson}
              data-testid="export-json-button"
            >
              Export as JSON
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={handleExportCsv}
              data-testid="export-csv-button"
            >
              Export as CSV
            </button>
          </div>
        </div>

        <div className="card">
          <h2>Import data</h2>
          <p>Replace everything in this browser with a previously exported JSON file.</p>
          <label htmlFor="import-file-input" className="visually-hidden">
            Choose a Contribution Limits Tool export file (JSON) to import
          </label>
          <input
            id="import-file-input"
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={(event) => {
              void handleFileSelected(event);
            }}
            className="visually-hidden"
            data-testid="import-file-input"
          />
          <button
            type="button"
            className="button button--secondary"
            onClick={handleImportClick}
            data-testid="import-button"
          >
            Choose file to import
          </button>
          {importMessage && (
            <p className="field-hint" role="status" data-testid="import-success">
              {importMessage}
            </p>
          )}
          {importError && (
            <p className="field-error" role="alert" data-testid="import-error">
              {importError}
            </p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: "var(--space-5)" }}>
        <h2>Reset all data</h2>
        <p>Permanently clears your profile and every contribution recorded in this browser.</p>
        {confirmingReset ? (
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
            <span>Are you sure? This cannot be undone.</span>
            <button
              type="button"
              className="button button--danger"
              onClick={handleResetConfirmed}
              data-testid="reset-confirm-button"
            >
              Yes, reset everything
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setConfirmingReset(false)}
              data-testid="reset-cancel-button"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="button button--danger"
            onClick={() => setConfirmingReset(true)}
            data-testid="reset-button"
          >
            Reset all data
          </button>
        )}
      </div>
    </main>
  );
}
