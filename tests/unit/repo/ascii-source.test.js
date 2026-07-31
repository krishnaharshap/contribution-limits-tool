const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const FRONTEND_DIR = path.join(__dirname, "..", "..", "..", "frontend");
const SOURCE_EXTENSIONS = new Set([".html", ".css", ".js"]);
const ALLOWED_WHITESPACE = new Set(["\n", "\r", "\t"]);

function collectSourceFiles(dir) {
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function findNonAsciiCharacters(content) {
  const offenders = [];

  for (const char of content) {
    const codePoint = char.codePointAt(0);
    const isPrintableAscii = codePoint >= 0x20 && codePoint <= 0x7e;

    if (!isPrintableAscii && !ALLOWED_WHITESPACE.has(char)) {
      offenders.push(`U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`);
    }
  }

  return offenders;
}

test("frontend source files contain only ASCII characters", () => {
  const sourceFiles = collectSourceFiles(FRONTEND_DIR);
  assert.ok(sourceFiles.length > 0, "expected to find frontend source files");

  const violations = [];

  for (const filePath of sourceFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    const offenders = findNonAsciiCharacters(content);

    if (offenders.length > 0) {
      violations.push(`${path.relative(FRONTEND_DIR, filePath)}: ${offenders.join(", ")}`);
    }
  }

  assert.deepEqual(
    violations,
    [],
    `non-ASCII characters found (e.g. a smart/non-breaking hyphen pasted from an editor) will silently break id/class selector matching:\n${violations.join("\n")}`,
  );
});
