import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SYSTEM_ID = "part-time-gods";
const SYSTEM_VERSION = "0.0.2";
const CORE_VERSION = "14.364";
const ROUTE_PREFIX = "systems/part-time-gods/";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { ClassicLevel } = await loadClassicLevel();

installFoundrySourceMocks();

const selectedPackNames = new Set(process.argv.slice(2).map(name => String(name).trim()).filter(Boolean));

const [
  actors,
  items,
  choices,
  journals,
  rollTables,
  scenes,
  macros
] = await Promise.all([
  import(pathToFileURL(path.join(root, "module/data/premade-actors.mjs")).href),
  import(pathToFileURL(path.join(root, "module/data/premade-items.mjs")).href),
  import(pathToFileURL(path.join(root, "module/data/premade-choices.mjs")).href),
  import(pathToFileURL(path.join(root, "module/data/premade-journals.mjs")).href),
  import(pathToFileURL(path.join(root, "module/data/premade-roll-tables.mjs")).href),
  import(pathToFileURL(path.join(root, "module/data/premade-scenes.mjs")).href),
  import(pathToFileURL(path.join(root, "module/data/premade-macros.mjs")).href)
]);

const packBuilds = [
  {
    name: "character-creation",
    documentName: "Item",
    collection: "items",
    documents: choices.PTG_PREMADE_CHOICES,
    folderLabels: {
      archetype: "Archetypes",
      domain: "Dominions",
      occupation: "Occupations",
      theology: "Theologies"
    }
  },
  {
    name: "premade-items",
    documentName: "Item",
    collection: "items",
    documents: items.PTG_PREMADE_ITEMS,
    folderLabels: {
      attachment: "Attachments",
      armor: "Armor",
      blessing: "Blessings",
      bond: "Bonds",
      condition: "Conditions",
      curse: "Curses and Failings",
      domain: "Specific Dominions",
      gearQuality: "Gear Qualities",
      manifestation: "Manifestations",
      occupation: "Occupation Careers",
      otherworld: "Otherworld Travel",
      power: "Powers",
      relic: "Relics",
      ritual: "Rituals",
      truth: "Truths",
      vassal: "Vassals",
      weapon: "Weapons",
      worshipper: "Worshippers"
    }
  },
  {
    name: "opposition-actors",
    documentName: "Actor",
    collection: "actors",
    documents: actors.PTG_PREMADE_ACTORS,
    folderLabels: {
      "Backers' Pregens": "Backers' Pregens",
      Animals: "Animals",
      Mortals: "Mortals",
      "The Touched": "The Touched",
      "Other Gods": "Other Gods",
      Outsiders: "Outsiders"
    }
  },
  {
    name: "maps",
    documentName: "Scene",
    collection: "scenes",
    documents: scenes.getPremadeScenes(),
    folderLabels: {
      scene: "Maps"
    }
  },
  {
    name: "roll-tables",
    documentName: "RollTable",
    collection: "tables",
    documents: rollTables.PTG_PREMADE_ROLL_TABLES,
    folderLabels: {
      rolltable: "Random Tables"
    }
  },
  {
    name: "rules-reference",
    documentName: "JournalEntry",
    collection: "journal",
    documents: await journals.getPremadeJournals(),
    folderLabels: {
      journalentry: "Rules Reference"
    }
  },
  {
    name: "macros",
    documentName: "Macro",
    collection: "macros",
    documents: macros.PTG_PREMADE_MACROS,
    folderLabels: {
      script: "Workflow Macros"
    }
  }
];

const unknownPackNames = Array.from(selectedPackNames).filter(name => !packBuilds.some(build => build.name === name));
if (unknownPackNames.length) {
  throw new Error(`Unknown pack filter(s): ${unknownPackNames.join(", ")}`);
}

const buildsToRun = selectedPackNames.size
  ? packBuilds.filter(build => selectedPackNames.has(build.name))
  : packBuilds;

for (const build of buildsToRun) {
  const result = await buildPack(build);
  console.log(`${build.name}: ${result.documents} ${build.documentName} documents, ${result.embedded} embedded documents, ${result.folders} folders`);
}

async function buildPack(build) {
  const packPath = path.join(root, "packs", build.name);
  await fs.mkdir(packPath, { recursive: true });

  const db = new ClassicLevel(packPath, { valueEncoding: "utf8" });
  await db.open();

  try {
    await db.clear();

    const documents = build.documents.map(document => withCompendiumSourceFlags(document, build.documentName));
    const folders = folderMap(build, documents);
    const batch = [];
    let embedded = 0;

    for (const folder of folders.values()) {
      batch.push({ type: "put", key: `!folders!${folder._id}`, value: JSON.stringify(folder) });
    }

    documents.forEach((source, index) => {
      const document = deepClone(source);
      const typeKey = documentTypeKey(document, build.documentName);
      const folder = folders.get(typeKey);
      const documentId = idFor(`${build.name}:document:${documentSourceKey(document, build.documentName)}`);

      document._id = documentId;
      document.folder = folder?._id ?? null;
      document.sort = Number(document.sort ?? (index + 1) * 100000);
      document.ownership = document.ownership ?? { default: 0 };
      document._stats = stats();

      embedded += extractEmbeddedDocuments(build, document, batch);
      batch.push({ type: "put", key: `!${build.collection}!${documentId}`, value: JSON.stringify(document) });
    });

    if (batch.length) await db.batch(batch);
    return { documents: documents.length, embedded, folders: folders.size };
  } finally {
    await db.close();
  }
}

function extractEmbeddedDocuments(build, document, batch) {
  let count = 0;

  if (build.documentName === "JournalEntry") {
    const pages = Array.isArray(document.pages) ? document.pages : [];
    document.pages = pages.map((page, index) => {
      const pageDocument = embeddedDocument(page, `${document._id}:page:${page.name ?? index}`, index);
      batch.push({ type: "put", key: `!journal.pages!${document._id}.${pageDocument._id}`, value: JSON.stringify(pageDocument) });
      count += 1;
      return pageDocument._id;
    });
  }

  if (build.documentName === "RollTable") {
    const results = Array.isArray(document.results) ? document.results : [];
    document.results = results.map((result, index) => {
      const resultDocument = embeddedDocument(result, `${document._id}:result:${result.text ?? index}:${result.range?.join("-") ?? ""}`, index);
      batch.push({ type: "put", key: `!tables.results!${document._id}.${resultDocument._id}`, value: JSON.stringify(resultDocument) });
      count += 1;
      return resultDocument._id;
    });
  }

  if (build.documentName === "Scene") {
    const drawings = Array.isArray(document.drawings) ? document.drawings : [];
    document.drawings = drawings.map((drawing, index) => {
      const drawingDocument = embeddedDocument(drawing, `${document._id}:drawing:${drawing.name ?? index}`, index);
      batch.push({ type: "put", key: `!scenes.drawings!${document._id}.${drawingDocument._id}`, value: JSON.stringify(drawingDocument) });
      count += 1;
      return drawingDocument._id;
    });
  }

  if (build.documentName === "Actor") {
    const items = Array.isArray(document.items) ? document.items : [];
    document.items = items.map((item, index) => {
      const itemDocument = embeddedDocument(item, `${document._id}:item:${item.name ?? index}:${item.type ?? "item"}`, index);
      batch.push({ type: "put", key: `!actors.items!${document._id}.${itemDocument._id}`, value: JSON.stringify(itemDocument) });
      count += 1;
      return itemDocument._id;
    });
  }

  return count;
}

function embeddedDocument(source, seed, index) {
  const document = deepClone(source);
  document._id = idFor(seed);
  document.sort = Number(document.sort ?? index);
  return document;
}

function folderMap(build, documents) {
  const typeKeys = Array.from(new Set(documents.map(document => documentTypeKey(document, build.documentName))));
  const folders = new Map();

  typeKeys.forEach((typeKey, index) => {
    const folderId = idFor(`${build.name}:folder:${typeKey}`);
    folders.set(typeKey, {
      name: build.folderLabels[typeKey] ?? labelize(typeKey),
      type: build.documentName,
      sorting: "a",
      _id: folderId,
      description: "",
      folder: null,
      sort: index * 100000,
      color: null,
      flags: {},
      _stats: stats()
    });
  });

  return folders;
}

function withCompendiumSourceFlags(document, documentName) {
  const systemFlags = document.flags?.[SYSTEM_ID] ?? {};
  const slug = systemFlags.slug ?? slugify(document.name ?? documentName);
  const sourceId = systemFlags.sourceId ?? systemFlags.importId ?? sourceIdForDocument(document, documentName, slug);

  return {
    ...document,
    flags: {
      ...(document.flags ?? {}),
      [SYSTEM_ID]: {
        ...systemFlags,
        slug,
        sourceId,
        sourceBook: systemFlags.sourceBook ?? sourceBookForDocument(systemFlags)
      }
    }
  };
}

function sourceIdForDocument(document, documentName, slug) {
  const systemFlags = document.flags?.[SYSTEM_ID] ?? {};
  const kind = systemFlags.kind ?? documentName.toLowerCase();
  const typeKey = documentTypeKey(document, documentName);
  return `${documentName.toLowerCase()}:${kind}:${typeKey}:${slug}`;
}

function sourceBookForDocument(systemFlags) {
  if (typeof systemFlags.sourceBook === "string" && systemFlags.sourceBook.trim()) return systemFlags.sourceBook;
  if (typeof systemFlags.source === "string" && systemFlags.source.trim()) return systemFlags.source;
  if (systemFlags.source?.book) return systemFlags.source.book;
  return "Part-Time Gods Second Edition";
}

function documentSourceKey(document, documentName) {
  const typeKey = documentTypeKey(document, documentName);
  const flags = document.flags?.[SYSTEM_ID] ?? {};
  return [
    typeKey,
    flags.sourceId,
    flags.slug,
    document.name
  ].filter(Boolean).join(":");
}

function documentTypeKey(document, documentName) {
  if (documentName === "Actor") return document.flags?.[SYSTEM_ID]?.category ?? document.type ?? "actor";
  if (documentName === "Item" && document.type === "power") return document.flags?.[SYSTEM_ID]?.folder ?? "power";
  return document.type ?? documentName.toLowerCase();
}

function stats() {
  return {
    coreVersion: CORE_VERSION,
    systemId: SYSTEM_ID,
    systemVersion: SYSTEM_VERSION,
    createdTime: 1782390472000,
    modifiedTime: 1782390472000,
    lastModifiedBy: null,
    compendiumSource: null,
    duplicateSource: null,
    exportSource: null
  };
}

function idFor(seed) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let value = BigInt(`0x${crypto.createHash("sha256").update(String(seed)).digest("hex").slice(0, 24)}`);
  let id = "";
  for (let index = 0; index < 16; index += 1) {
    id += alphabet[Number(value % 62n)];
    value /= 62n;
  }
  return id;
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function labelize(type) {
  return `${type[0].toUpperCase()}${type.slice(1)}s`;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function loadClassicLevel() {
  try {
    return await import("classic-level");
  } catch {
    try {
      return await import(pathToFileURL(path.join(root, "tmp/pack-tools/node_modules/classic-level/index.js")).href);
    } catch {
      throw new Error("Install classic-level before building packs: npm.cmd install --prefix tmp\\\\pack-tools classic-level");
    }
  }
}

function installFoundrySourceMocks() {
  globalThis.CONST = {
    JOURNAL_ENTRY_PAGE_FORMATS: { HTML: 1 },
    GRID_TYPES: { SQUARE: 1 },
    DRAWING_FILL_TYPES: { SOLID: 1 }
  };
  globalThis.foundry = {
    applications: {
      api: { DialogV2: class {} }
    },
    data: {
      ShapeData: { TYPES: { RECTANGLE: "r" } }
    },
    utils: {
      getRoute(route) {
        const relative = String(route).startsWith(ROUTE_PREFIX)
          ? String(route).slice(ROUTE_PREFIX.length)
          : String(route);
        return pathToFileURL(path.join(root, relative)).href;
      }
    }
  };
  globalThis.fetch = async function fetchLocalJson(route) {
    const filePath = String(route).startsWith("file:")
      ? fileURLToPath(route)
      : path.join(root, String(route));
    const content = (await fs.readFile(filePath, "utf8")).replace(/^\uFEFF/, "");
    return {
      ok: true,
      json: async () => JSON.parse(content)
    };
  };
}
