import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const system = JSON.parse(await fs.readFile(path.join(root, "system.json"), "utf8"));
const distDir = path.join(root, "dist");
const outPath = path.join(distDir, `${system.id}-${system.version}.zip`);
const manifestOutPath = path.join(distDir, "system.json");
const files = new Map();
const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  return value >>> 0;
});

await addFile("system.json");
await addFile("part-time-gods.js");
for (const file of ["README.md", "INSTALL.md", "CHANGELOG.md", "ATTRIBUTION.md", "LICENSE"]) await addFileIfExists(file);
for (const directory of ["lang", "module", "styles", "templates"]) await addDirectoryIfExists(directory);
for (const pack of system.packs ?? []) await addDirectoryIfExists(pack.path);

await fs.mkdir(distDir, { recursive: true });
await fs.writeFile(outPath, createZip(files));
await fs.copyFile(path.join(root, "system.json"), manifestOutPath);
console.log(`Created ${path.relative(root, outPath)} with ${files.size} files.`);
console.log(`Created ${path.relative(root, manifestOutPath)}.`);

async function addDirectoryIfExists(relativePath) {
  if (!await pathExists(relativePath)) return;
  const fullPath = path.join(root, relativePath);
  const entries = await fs.readdir(fullPath, { withFileTypes: true });
  for (const entry of entries) {
    const child = path.posix.join(relativePath.replaceAll(path.sep, "/"), entry.name);
    if (entry.isDirectory()) {
      if (shouldExclude(child)) continue;
      await addDirectoryIfExists(child);
    } else if (entry.isFile() && !shouldExclude(child)) {
      await addFile(child);
    }
  }
}

async function addFileIfExists(relativePath) {
  if (await pathExists(relativePath)) await addFile(relativePath);
}

async function addFile(relativePath) {
  if (shouldExclude(relativePath)) return;
  const normalized = relativePath.replaceAll(path.sep, "/");
  if (files.has(normalized)) return;
  files.set(normalized, await fs.readFile(path.join(root, relativePath)));
}

async function pathExists(relativePath) {
  try {
    await fs.stat(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function shouldExclude(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  return /(^|\/)(LOCK|LOG|LOG\.old)$/.test(normalized)
    || /(^|\/)lost(\/|$)/.test(normalized)
    || /(^|\/)(tmp|temp|node_modules|dist|source-material)(\/|$)/.test(normalized);
}

function createZip(fileMap) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const [name, content] of fileMap.entries()) {
    const nameBuffer = Buffer.from(name, "utf8");
    const crc = crc32(content);
    const { time, date } = dosDateTime(new Date());
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(time, 10);
    localHeader.writeUInt16LE(date, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(content.length, 18);
    localHeader.writeUInt32LE(content.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, nameBuffer, content);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(time, 12);
    centralHeader.writeUInt16LE(date, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(content.length, 20);
    centralHeader.writeUInt32LE(content.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, nameBuffer);

    offset += localHeader.length + nameBuffer.length + content.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(fileMap.size, 8);
  end.writeUInt16LE(fileMap.size, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

function dosDateTime(date) {
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  };
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
