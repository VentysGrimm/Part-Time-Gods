import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidencePath = path.join(root, "docs", "qa", "manual-dragdrop-matrix.md");
const requiredGates = [
  "item-occupation",
  "item-archetype",
  "item-domain",
  "item-theology",
  "item-blessing",
  "item-curse",
  "item-truth",
  "item-relic",
  "item-bond",
  "item-worshipper",
  "item-vassal",
  "item-condition",
  "item-weapon",
  "item-armor",
  "actor-territory-character"
];

const rows = parseRows(await fs.readFile(evidencePath, "utf8"));
const checks = requiredGates.map(gate => {
  const row = rows.get(gate);
  if (!row) return { gate, pass: false, status: "Missing", evidence: "" };
  return {
    gate,
    pass: row.status === "Pass",
    status: row.status,
    evidence: row.evidence
  };
});

console.log(JSON.stringify({
  file: path.relative(root, evidencePath),
  checks,
  passed: checks.filter(check => check.pass).length,
  required: requiredGates.length
}, null, 2));

if (checks.some(check => !check.pass)) process.exit(1);

function parseRows(source) {
  const rows = new Map();
  for (const line of source.split(/\r?\n/)) {
    if (!line.startsWith("|")) continue;
    if (line.includes("| --- ") || line.includes("| Gate ")) continue;

    const cells = line
      .split("|")
      .slice(1, -1)
      .map(cell => cell.trim());

    if (cells.length < 7) continue;
    const [gate,,,,, status, evidence] = cells;
    rows.set(gate, { status, evidence });
  }
  return rows;
}
