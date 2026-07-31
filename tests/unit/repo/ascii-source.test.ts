import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// A stray Unicode non-breaking hyphen (U+2011) once broke every id/class
// selector in this app's markup. This test makes sure it can't happen again.
const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(CURRENT_DIR, "..", "..", "..");
const SCAN_TARGETS = [join(ROOT_DIR, "src"), join(ROOT_DIR, "index.html")];
const SOURCE_EXTENSIONS = new Set([".html", ".css", ".ts", ".tsx"]);
const ALLOWED_WHITESPACE = new Set(["\n", "\r", "\t"]);

function walkDirectory(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkDirectory(fullPath));
    } else if (SOURCE_EXTENSIONS.has(extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function findNonAsciiCharacters(content: string): string[] {
  const offenders: string[] = [];

  for (const char of content) {
    const codePoint = char.codePointAt(0) ?? 0;
    const isPrintableAscii = codePoint >= 0x20 && codePoint <= 0x7e;

    if (!isPrintableAscii && !ALLOWED_WHITESPACE.has(char)) {
      offenders.push(`U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`);
    }
  }

  return offenders;
}

describe("source files", () => {
  it("contain only ASCII characters", () => {
    const sourceFiles = SCAN_TARGETS.flatMap((target) =>
      statSync(target).isDirectory() ? walkDirectory(target) : [target],
    );
    expect(sourceFiles.length).toBeGreaterThan(0);

    const violations: string[] = [];

    for (const filePath of sourceFiles) {
      const content = readFileSync(filePath, "utf8");
      const offenders = findNonAsciiCharacters(content);

      if (offenders.length > 0) {
        violations.push(`${relative(ROOT_DIR, filePath)}: ${offenders.join(", ")}`);
      }
    }

    expect(violations, violations.join("\n")).toEqual([]);
  });
});
