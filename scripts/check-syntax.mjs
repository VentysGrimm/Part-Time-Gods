import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDirectories = new Set([".git", ".github", "dist", "node_modules", "tmp", "temp"]);
const files = (await findJavaScriptFiles(root)).sort((a, b) => a.localeCompare(b));
const failures = [];

for (const file of files) {
  const relative = path.relative(root, file);
  const result = spawnSync(process.execPath, ["--check", relative], {
    cwd: root,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    failures.push(relative);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.stdout) process.stdout.write(result.stdout);
  }
}

if (failures.length) {
  console.error(`JavaScript syntax check failed for ${failures.length} file(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`JavaScript syntax check passed for ${files.length} files.`);

async function findJavaScriptFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...await findJavaScriptFiles(fullPath));
    } else if (entry.isFile() && /\.(?:js|mjs)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}
