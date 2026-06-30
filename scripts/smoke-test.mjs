import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const system = JSON.parse(await fs.readFile(path.join(root, "system.json"), "utf8"));

assert(system.id === "part-time-gods", "system id must be part-time-gods");
assert(system.compatibility?.minimum === "14", "minimum Foundry compatibility must remain v14");
assert(Array.isArray(system.esmodules) && system.esmodules.includes("part-time-gods.js"), "main ES module must be declared");
assert(Array.isArray(system.packs) && system.packs.length >= 7, "runtime compendium packs must be declared");

console.log("Smoke tests passed.");

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}
