import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testFiles = (await findTestFiles(path.join(root, "tests"))).sort((a, b) => a.localeCompare(b));

if (!testFiles.length) {
  console.error("No test files found.");
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", ...testFiles.map(file => path.relative(root, file))], {
  cwd: root,
  stdio: "inherit"
});

process.exit(result.status ?? 1);

async function findTestFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await findTestFiles(fullPath));
    else if (entry.isFile() && /\.test\.mjs$/i.test(entry.name)) files.push(fullPath);
  }

  return files;
}
