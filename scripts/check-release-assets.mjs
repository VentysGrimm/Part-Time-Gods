import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const system = JSON.parse(await fs.readFile(path.join(root, "system.json"), "utf8"));
const expectedZipName = `${system.id}-${system.version}.zip`;
const expectedZipUrl = `https://github.com/VentysGrimm/Part-Time-Gods/releases/download/v${system.version}/${expectedZipName}`;
const checks = [];
let failed = false;

await checkPackagePackLocks();
await checkLocalDist();
await checkRemoteManifest();
await checkRemoteZip();

console.log(JSON.stringify({
  version: system.version,
  manifest: system.manifest,
  download: system.download,
  checks
}, null, 2));

if (failed) process.exit(1);

async function checkPackagePackLocks() {
  const lockedPacks = [];

  for (const pack of system.packs ?? []) {
    const lockPath = path.join(root, pack.path, "LOCK");
    try {
      const handle = await fs.open(lockPath, "r+");
      await handle.close();
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      if (["EBUSY", "EPERM", "EACCES"].includes(error?.code)) {
        lockedPacks.push(`${pack.name} (${pack.path})`);
        continue;
      }
      throw error;
    }
  }

  pushCheck("package pack locks released", lockedPacks.length === 0, lockedPacks.length
    ? lockedPacks.join(", ")
    : "all declared package packs are available");
}

async function checkLocalDist() {
  const distDir = path.join(root, "dist");
  const zipPath = path.join(root, "dist", expectedZipName);
  const manifestPath = path.join(root, "dist", "system.json");
  const staleZips = await staleReleaseZips(distDir);
  const localZip = await statIfExists(zipPath);
  const localManifest = await statIfExists(manifestPath);

  pushCheck("stale local release zips", staleZips.length === 0, staleZips.length
    ? staleZips.join(", ")
    : "none");

  pushCheck("local zip", Boolean(localZip), localZip
    ? `${path.relative(root, zipPath)} ${localZip.size} bytes`
    : `${path.relative(root, zipPath)} is missing`);

  if (!localManifest) {
    pushCheck("local manifest", false, `${path.relative(root, manifestPath)} is missing`);
    return;
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  pushCheck("local manifest version", manifest.version === system.version, `version=${manifest.version ?? ""}`);
  pushCheck("local manifest download", manifest.download === system.download, `download=${manifest.download ?? ""}`);
}

async function checkRemoteManifest() {
  const response = await fetch(system.manifest, { redirect: "follow" });
  const text = await response.text();
  pushCheck("remote manifest status", response.ok, `HTTP ${response.status}`);

  let manifest;
  try {
    manifest = JSON.parse(text);
  } catch (error) {
    pushCheck("remote manifest json", false, error.message);
    return;
  }

  pushCheck("remote manifest version", manifest.version === system.version, `version=${manifest.version ?? ""}`);
  pushCheck("remote manifest download", manifest.download === system.download, `download=${manifest.download ?? ""}`);
}

async function checkRemoteZip() {
  const response = await fetch(expectedZipUrl, { method: "HEAD", redirect: "follow" });
  pushCheck("remote zip status", response.ok, `HTTP ${response.status}`);
  pushCheck("system download URL", system.download === expectedZipUrl, `download=${system.download ?? ""}`);
}

async function statIfExists(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function staleReleaseZips(distDir) {
  let entries = [];
  try {
    entries = await fs.readdir(distDir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }

  const releaseZipPattern = new RegExp(`^${escapeRegExp(system.id)}-\\d+\\.\\d+\\.\\d+\\.zip$`);
  return entries
    .filter(entry => entry.isFile() && entry.name !== expectedZipName && releaseZipPattern.test(entry.name))
    .map(entry => entry.name);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pushCheck(name, pass, detail) {
  checks.push({ name, pass, detail });
  if (!pass) failed = true;
}
