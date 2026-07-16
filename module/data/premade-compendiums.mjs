import { PTG_PREMADE_CHOICES } from "./premade-choices.mjs";
import { PTG_PREMADE_ITEMS } from "./premade-items.mjs";
import { PTG_PREMADE_ACTORS } from "./premade-actors.mjs";
import { getPremadeJournals } from "./premade-journals.mjs";
import { PTG_PREMADE_ROLL_TABLES } from "./premade-roll-tables.mjs";
import { getPremadeScenes } from "./premade-scenes.mjs";
import { PTG_PREMADE_MACROS } from "./premade-macros.mjs";

const SYSTEM_ID = "part-time-gods";

const PACKS = {
  actors: "part-time-gods.opposition-actors",
  choices: "part-time-gods.character-creation",
  items: "part-time-gods.premade-items",
  maps: "part-time-gods.maps",
  macros: "part-time-gods.macros",
  rollTables: "part-time-gods.roll-tables",
  rules: "part-time-gods.rules-reference"
};

export async function populatePremadeCompendiums({ notify = true, skipLockedPacks = false } = {}) {
  const packOptions = { skipLockedPacks };
  const actors = await populatePack(PACKS.actors, PTG_PREMADE_ACTORS, actorFolderLabels, "Actor", packOptions);
  const choices = await populatePack(PACKS.choices, PTG_PREMADE_CHOICES, choiceFolderLabels, "Item", packOptions);
  const items = await populatePack(PACKS.items, PTG_PREMADE_ITEMS, itemFolderLabels, "Item", {
    ...packOptions,
    removeStale: true,
    stalePredicate: isPremadeItemDocument,
    retiredFolderLabels: RETIRED_PREMADE_ITEM_FOLDER_LABELS
  });
  const maps = await populatePack(PACKS.maps, getPremadeScenes(), sceneFolderLabels, "Scene", packOptions);
  const macros = await populatePack(PACKS.macros, PTG_PREMADE_MACROS, macroFolderLabels, "Macro", packOptions);
  const rollTables = await populatePack(PACKS.rollTables, PTG_PREMADE_ROLL_TABLES, rollTableFolderLabels, "RollTable", packOptions);
  const rules = await populatePack(PACKS.rules, await getPremadeJournals(), ruleFolderLabels, "JournalEntry", {
    ...packOptions,
    removeStale: true,
    stalePredicate: isPremadeRulesJournal
  });
  const total = actors + choices + items + maps + macros + rollTables + rules;

  if (notify) {
    const message = total > 0
      ? `Updated ${total} Part-Time Gods compendium entries.`
      : "Part-Time Gods compendiums are already populated.";

    ui.notifications.info(message);
  }

  return total;
}

async function populatePack(packId, documents, folderLabels, documentName, { removeStale = false, stalePredicate = null, retiredFolderLabels = [], skipLockedPacks = false } = {}) {
  const pack = game.packs.get(packId);

  if (!pack) {
    ui.notifications.warn(`Missing Part-Time Gods compendium: ${packId}`);
    return 0;
  }

  if (shouldSkipPremadePackWrites(pack, { skipLockedPacks })) {
    console.warn(`Part-Time Gods 2E | Skipping ready-time auto-populate for protected compendium: ${packId}`);
    return 0;
  }

  const documentClass = getDocumentClass(documentName);
  if (!documentClass) {
    ui.notifications.warn(`Missing Foundry document class: ${documentName}`);
    return 0;
  }

  documents = documents.map(document => withCompendiumSourceFlags(document, documentName));

  await pack.getIndex({ fields: ["name", "type", "folder", "flags"] });

  const existing = new Set(pack.index.map(entry => documentKeys(entry, documentName)).flat());
  const missing = documents.filter(document => !documentKeys(document, documentName).some(key => existing.has(key)));

  const wasLocked = isCompendiumPackLocked(pack);
  if (wasLocked) await setCompendiumPackLocked(pack, false);
  if (isCompendiumPackLocked(pack)) {
    console.warn(`Part-Time Gods 2E | Skipping auto-populate for locked compendium: ${packId}`);
    return 0;
  }

  try {
    const folders = await ensurePackFolders(pack, documents, folderLabels, documentName);

    if (missing.length) {
      await documentClass.createDocuments(missing.map(document => ({
        ...document,
        folder: folders[documentTypeKey(document, documentName)]?.id
      })), { pack: pack.collection });
    }

    let packDocuments = await pack.getDocuments();
    const updated = ["Actor", "Item", "JournalEntry", "Macro", "RollTable", "Scene"].includes(documentName)
      ? await updateExistingPremadeDocuments(packDocuments, documents, folders, documentName)
      : 0;
    const removed = removeStale
      ? await removeStaleDocuments(documentClass, pack, packDocuments, documents, documentName, stalePredicate)
      : 0;

    if (removed) {
      const staleKeys = sourceKeySet(documents, documentName);
      packDocuments = packDocuments.filter(document =>
        documentKeys(document, documentName).some(key => staleKeys.has(key)) || !stalePredicate?.(document)
      );
    }

    const removedFolders = await removeRetiredFolders(pack, packDocuments, retiredFolderLabels, documentName);
    const moved = await organizeExistingDocuments(packDocuments, folders, documentName);

    return missing.length + updated + removed + removedFolders + moved;
  } finally {
    if (wasLocked) await setCompendiumPackLocked(pack, true);
  }
}

export function isCompendiumPackLocked(pack) {
  return Boolean(pack?.locked ?? pack?.metadata?.locked);
}

export function shouldSkipPremadePackWrites(pack, { skipLockedPacks = false } = {}) {
  if (!skipLockedPacks) return false;
  return isCompendiumPackLocked(pack) || pack?.metadata?.packageType !== "world";
}

export async function setCompendiumPackLocked(pack, locked) {
  if (typeof pack?.configure === "function") await pack.configure({ locked });
  syncCompendiumPackLockState(pack, locked);
  return waitForCompendiumPackLockState(pack, locked);
}

function syncCompendiumPackLockState(pack, locked) {
  for (const target of [pack, pack?.metadata]) {
    if (!target || typeof target !== "object") continue;
    try {
      target.locked = locked;
    } catch {
      // Foundry versions differ on whether `locked` is assignable; `configure` remains authoritative.
    }
  }
}

async function waitForCompendiumPackLockState(pack, locked) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (isCompendiumPackLocked(pack) === locked) return true;
    await new Promise(resolve => globalThis.setTimeout?.(resolve, 0) ?? resolve());
  }

  return isCompendiumPackLocked(pack) === locked;
}

async function ensurePackFolders(pack, documents, folderLabels, documentName) {
  const folders = {};
  const types = Array.from(new Set(documents.map(document => documentTypeKey(document, documentName))));
  const existingFolders = getPackFolders(pack);

  for (const type of types) {
    const name = folderLabels[type] ?? labelize(type);
    let folder = existingFolders.find(existing => existing.name === name && existing.type === documentName);

    if (!folder) {
      [folder] = await Folder.createDocuments([{
        name,
        type: documentName,
        sorting: "a"
      }], { pack: pack.collection });
    }

    folders[type] = folder;
  }

  return folders;
}

async function removeStaleDocuments(documentClass, pack, packDocuments, sourceDocuments, documentName, stalePredicate) {
  const expected = sourceKeySet(sourceDocuments, documentName);
  const staleDocuments = packDocuments.filter(document =>
    !documentKeys(document, documentName).some(key => expected.has(key)) && stalePredicate?.(document)
  );

  if (!staleDocuments.length) return 0;

  await documentClass.deleteDocuments(staleDocuments.map(document => document.id), { pack: pack.collection });
  return staleDocuments.length;
}

async function removeRetiredFolders(pack, packDocuments, retiredFolderLabels, documentName) {
  if (!retiredFolderLabels.length) return 0;

  const folderClass = globalThis.Folder;
  if (typeof folderClass?.deleteDocuments !== "function") return 0;

  const occupiedFolderIds = new Set(packDocuments.map(documentFolderId).filter(Boolean));
  const retiredFolders = getPackFolders(pack)
    .filter(folder => isRetiredFolderName(folder.name, retiredFolderLabels) && folder.type === documentName)
    .filter(folder => !occupiedFolderIds.has(folderDocumentId(folder)));
  const retiredFolderIds = retiredFolders.map(folderDocumentId).filter(Boolean);
  if (!retiredFolderIds.length) return 0;

  await folderClass.deleteDocuments(retiredFolderIds, { pack: pack.collection });
  return retiredFolderIds.length;
}

async function organizeExistingDocuments(documents, folders, documentName) {
  const updates = [];

  for (const document of documents) {
    const folder = folders[documentTypeKey(document, documentName)];
    if (!folder || document.folder?.id === folder.id) continue;

    updates.push(document.update(compendiumDocumentUpdateData(document, { folder: folder.id })));
  }

  await Promise.all(updates);
  return updates.length;
}

async function updateExistingPremadeDocuments(documents, sourceDocuments, folders, documentName) {
  const sourceByKey = sourceMap(sourceDocuments, documentName);
  const updates = [];

  for (const document of documents) {
    const source = documentKeys(document, documentName).map(key => sourceByKey.get(key)).find(Boolean);
    if (!source) continue;

    const folder = folders[documentTypeKey(source, documentName)];
    const updateData = {
      ...foundry.utils.deepClone(source),
      folder: folder?.id ?? document.folder?.id ?? null
    };
    if (documentName === "Scene") delete updateData.drawings;
    if (documentName === "JournalEntry") delete updateData.pages;

    const diff = foundry.utils.diffObject(document.toObject(), updateData);
    updates.push(updateExistingPremadeDocument(document, source, updateData, diff, documentName));
  }

  const results = await Promise.all(updates);
  return results.filter(Boolean).length;
}

async function updateExistingPremadeDocument(document, source, updateData, diff, documentName) {
  let changed = false;

  if (Object.keys(diff).length) {
    await document.update(compendiumDocumentUpdateData(document, updateData));
    changed = true;
  }

  if (documentName === "Scene") {
    changed = await refreshPremadeSceneDrawings(document, source) || changed;
  }
  if (documentName === "JournalEntry") {
    changed = await refreshPremadeJournalPages(document, source) || changed;
  }

  return changed;
}

export function compendiumDocumentUpdateData(document, updateData) {
  const id = document?.id ?? document?._id ?? document?.toObject?.()._id;
  return id ? { ...updateData, _id: id } : { ...updateData };
}

export async function refreshPremadeSceneDrawings(document, source) {
  const sourceDrawings = (source.drawings ?? [])
    .filter(isManagedSceneDrawing)
    .map(drawing => foundry.utils.deepClone(drawing));

  if (!sourceDrawings.length || typeof document.createEmbeddedDocuments !== "function") return false;

  const existingManagedDrawings = embeddedCollectionDocuments(document.drawings)
    .filter(isManagedSceneDrawing);

  if (sameManagedDrawingSet(existingManagedDrawings, sourceDrawings)) return false;
  if (existingManagedDrawings.length && typeof document.deleteEmbeddedDocuments !== "function") return false;

  const drawingIds = existingManagedDrawings.map(embeddedDocumentId).filter(Boolean);
  if (drawingIds.length) await document.deleteEmbeddedDocuments("Drawing", drawingIds);
  await document.createEmbeddedDocuments("Drawing", sourceDrawings);

  return true;
}

export async function refreshPremadeJournalPages(document, source) {
  const sourcePages = (source.pages ?? [])
    .filter(isManagedRulesPage)
    .map(page => foundry.utils.deepClone(page));

  if (!sourcePages.length || typeof document.createEmbeddedDocuments !== "function") return false;

  const existingManagedPages = embeddedCollectionDocuments(document.pages)
    .filter(isManagedRulesPage);

  if (sameManagedJournalPageSet(existingManagedPages, sourcePages)) return false;
  if (existingManagedPages.length && typeof document.deleteEmbeddedDocuments !== "function") return false;

  const pageIds = existingManagedPages.map(embeddedDocumentId).filter(Boolean);
  if (pageIds.length) await document.deleteEmbeddedDocuments("JournalEntryPage", pageIds);
  await document.createEmbeddedDocuments("JournalEntryPage", sourcePages);

  return true;
}

function embeddedCollectionDocuments(collection) {
  if (!collection) return [];
  if (Array.isArray(collection)) return collection;
  if (collection.contents) return Array.from(collection.contents);
  if (typeof collection.values === "function") return Array.from(collection.values());
  if (typeof collection[Symbol.iterator] === "function") return Array.from(collection);

  return Object.values(collection);
}

function embeddedDocumentId(document) {
  return document.id ?? document._id ?? document.toObject?.()._id ?? null;
}

function isManagedSceneDrawing(drawing) {
  const source = drawingSource(drawing);
  const flags = source.flags?.[SYSTEM_ID] ?? {};
  return Boolean(
    drawing.getFlag?.(SYSTEM_ID, "territoryZone")
    || drawing.getFlag?.(SYSTEM_ID, "territorySheetElement")
    || flags.territoryZone
    || flags.territorySheetElement
    || String(source.name ?? drawing.name ?? "").startsWith("Territory Grid:")
  );
}

function isManagedRulesPage(page) {
  const source = pageSource(page);
  const flags = source.flags?.[SYSTEM_ID] ?? {};
  return flags.premade === true && flags.kind === "rules-reference";
}

function sameManagedDrawingSet(existingDrawings, sourceDrawings) {
  if (existingDrawings.length !== sourceDrawings.length) return false;

  const existing = existingDrawings.map(normalizedSceneDrawing).sort();
  const source = sourceDrawings.map(normalizedSceneDrawing).sort();
  return existing.every((entry, index) => entry === source[index]);
}

function sameManagedJournalPageSet(existingPages, sourcePages) {
  if (existingPages.length !== sourcePages.length) return false;

  const existing = existingPages.map(normalizedJournalPage).sort();
  const source = sourcePages.map(normalizedJournalPage).sort();
  return existing.every((entry, index) => entry === source[index]);
}

function normalizedSceneDrawing(drawing) {
  const source = foundry.utils.deepClone(drawingSource(drawing));
  delete source._id;
  delete source.id;
  delete source._stats;

  return stableStringify(source);
}

function normalizedJournalPage(page) {
  const source = foundry.utils.deepClone(pageSource(page));
  delete source._id;
  delete source.id;
  delete source._stats;

  return stableStringify(source);
}

function drawingSource(drawing) {
  return drawing?.toObject?.() ?? drawing?._source ?? drawing ?? {};
}

function pageSource(page) {
  return page?.toObject?.() ?? page?._source ?? page ?? {};
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }

  return JSON.stringify(value);
}

function getPackFolders(pack) {
  if (pack.folders?.contents) return pack.folders.contents;
  if (pack.folders?.values) return Array.from(pack.folders.values());
  if (pack.folders) return Array.from(pack.folders);

  return game.folders.filter(folder => folder.pack === pack.collection);
}

function documentFolderId(document) {
  if (!document?.folder) return null;
  if (typeof document.folder === "string") return document.folder;
  return document.folder.id ?? document.folder._id ?? null;
}

function folderDocumentId(folder) {
  return folder?.id ?? folder?._id ?? null;
}

function labelize(type) {
  return `${type[0].toUpperCase()}${type.slice(1)}s`;
}

export function isRetiredPremadeItemFolderName(name) {
  return isRetiredFolderName(name, RETIRED_PREMADE_ITEM_FOLDER_LABELS);
}

function isRetiredFolderName(name, labels) {
  const normalizedName = slugify(name);
  return labels.some(label => name === label || normalizedName === slugify(label));
}

function getDocumentClass(documentName) {
  return CONFIG[documentName]?.documentClass ?? globalThis[documentName];
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

function sourceMap(documents, documentName) {
  const sourceByKey = new Map();

  for (const document of documents) {
    for (const key of documentKeys(document, documentName)) {
      if (!sourceByKey.has(key)) sourceByKey.set(key, document);
    }
  }

  return sourceByKey;
}

function sourceKeySet(documents, documentName) {
  return new Set(documents.flatMap(document => documentKeys(document, documentName)));
}

function documentKeys(document, documentName) {
  const systemFlags = document.flags?.[SYSTEM_ID] ?? {};
  const typeKey = documentTypeKey(document, documentName);
  const keys = [
    systemFlags.sourceId ? `${typeKey}:source:${systemFlags.sourceId}` : null,
    systemFlags.importId ? `${typeKey}:import:${systemFlags.importId}` : null,
    systemFlags.slug ? `${typeKey}:slug:${systemFlags.slug}` : null,
    `${typeKey}:name:${document.name}`
  ].filter(Boolean);

  return Array.from(new Set(keys));
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

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function documentTypeKey(document, documentName) {
  if (documentName === "Actor") return document.flags?.[SYSTEM_ID]?.category ?? document.type ?? "actor";
  if (documentName === "Item") return document.flags?.[SYSTEM_ID]?.folder ?? document.type ?? "item";
  return document.type ?? documentName.toLowerCase();
}

function isPremadeRulesJournal(document) {
  const premade = document.getFlag?.(SYSTEM_ID, "premade") ?? document.flags?.[SYSTEM_ID]?.premade;
  const kind = document.getFlag?.(SYSTEM_ID, "kind") ?? document.flags?.[SYSTEM_ID]?.kind;

  return premade === true && ["complete-rules", "rules-reference"].includes(kind);
}

function isPremadeItemDocument(document) {
  const premade = document.getFlag?.(SYSTEM_ID, "premade") ?? document.flags?.[SYSTEM_ID]?.premade;
  const source = document.getFlag?.(SYSTEM_ID, "source") ?? document.flags?.[SYSTEM_ID]?.source;
  const sourceBook = document.getFlag?.(SYSTEM_ID, "sourceBook") ?? document.flags?.[SYSTEM_ID]?.sourceBook;

  return premade === true && [source, sourceBook].some(value => String(value ?? "").includes("Part-Time Gods"));
}

const choiceFolderLabels = {
  archetype: "Archetypes",
  domain: "Dominions",
  occupation: "Occupations",
  theology: "Theologies"
};

const itemFolderLabels = {
  attachment: "Attachments",
  armor: "Armor",
  blessing: "Blessings",
  bond: "Bonds",
  condition: "Conditions",
  curse: "Curses and Failings",
  domain: "Specific Dominions",
  manifestation: "Manifestations",
  occupation: "Occupation Careers",
  power: "Powers",
  relic: "Relics",
  ritual: "Rituals",
  truth: "Truths",
  vassal: "Vassals",
  weapon: "Weapons",
  worshipper: "Worshippers"
};

const RETIRED_PREMADE_ITEM_FOLDER_LABELS = [
  "Battle of Fists Actions",
  "Battle of Wits Actions",
  "Battle Fists Actions",
  "Battle Wits Actions",
  "Battle-fists",
  "Battle-wits",
  "Battle-fistss",
  "Battle-witss",
  "Critical Failure Effects",
  "Gear Qualities",
  "Manifestation Applications",
  "Critical-failure-effectss",
  "GearQualitys",
  "Manifestation-applications"
];

const actorFolderLabels = {
  "Backers' Pregens": "Backers' Pregens",
  Animals: "Animals",
  Mortals: "Mortals",
  "The Touched": "The Touched",
  "Other Gods": "Other Gods",
  Outsiders: "Outsiders"
};

const sceneFolderLabels = {
  scene: "Maps"
};

const macroFolderLabels = {
  script: "Workflow Macros"
};

const ruleFolderLabels = {
  journalentry: "Rules Reference"
};

const rollTableFolderLabels = {
  rolltable: "Random Tables"
};
