import { describe, expect, it } from "vitest";
import {
  exportStateAsCsv,
  exportStateAsJson,
  ImportError,
  parseImportedJson,
} from "../../../src/utils/exportImport";
import { createInitialState } from "../../../src/store/types";

describe("exportStateAsJson", () => {
  it("round-trips through parseImportedJson", () => {
    const state = createInitialState();
    state.profile.birthYear = 1990;

    const json = exportStateAsJson(state);
    const imported = parseImportedJson(json);

    expect(imported).toEqual(state);
  });
});

describe("exportStateAsCsv", () => {
  it("includes a header row and one row per contribution/withdrawal", () => {
    const state = createInitialState();
    state.accounts.tfsa.contributions.push({
      id: "1",
      year: 2024,
      amountCents: 500_000,
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    state.accounts.fhsa.contributions.push({
      id: "2",
      year: 2023,
      amountCents: 800_000,
      createdAt: "2023-01-01T00:00:00.000Z",
    });

    const csv = exportStateAsCsv(state);
    const lines = csv.split("\n");

    expect(lines[0]).toBe("Account,Type,Year,Amount");
    expect(lines).toContain("FHSA,contribution,2023,8000");
    expect(lines).toContain("TFSA,contribution,2024,5000");
  });

  it("produces just a header row when there is no data", () => {
    const csv = exportStateAsCsv(createInitialState());
    expect(csv).toBe("Account,Type,Year,Amount");
  });
});

describe("parseImportedJson", () => {
  it("rejects invalid JSON", () => {
    expect(() => parseImportedJson("{not valid")).toThrow(ImportError);
  });

  it("rejects JSON that isn't a recognizable export", () => {
    expect(() => parseImportedJson(JSON.stringify({ hello: "world" }))).toThrow(ImportError);
  });

  it("accepts a fresh (never-set-up) export", () => {
    const state = createInitialState();
    expect(parseImportedJson(exportStateAsJson(state))).toEqual(state);
  });

  it("falls back to a fresh state for an unrecognized schema version, via migrateState", () => {
    const futureExport = { ...createInitialState(), schemaVersion: 999 };
    expect(parseImportedJson(JSON.stringify(futureExport))).toEqual(createInitialState());
  });
});
