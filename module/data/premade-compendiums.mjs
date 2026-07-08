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

export async function populatePremadeCompendiums({ notify = true } = {}) {
  const actors = await populatePack(PACKS.actors, PTG_PREMADE_ACTORS, actorFolderLabels, "Actor");
  const choices = await populatePack(PACKS.choices, PTG_PREMADE_CHOICES, choiceFolderLabels, "Item");
  const items = await populatePack(PACKS.items, PTG_PREMADE_ITEMS, itemFolderLabels, "Item");
  const maps = await populatePack(PACKS.maps, getPremadeScenes(), sceneFolderLabels, "Scene");
  const macros = await populatePack(PACKS.macros, PTG_PREMADE_MACROS, macroFolderLabels, "Macro");
  const rollTables = await populatePack(PACKS.rollTables, PTG_PREMADE_ROLL_TABLES, rollTableFolderLabels, "RollTable");
  const rules = await populatePack(PACKS.rules, await getPremadeJournals(), ruleFolderLabels, "JournalEntry", {
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

async function populatePack(packId, documents, folderLabels, documentName, { removeStale = false, stalePredicate = null } = {}) {
  const pack = game.packs.get(packId);

  if (!pack) {
    ui.notifications.warn(`Missing Part-Time Gods compendium: ${packId}`);
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

  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });

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
    packDocuments = packDocuments.filter(document => documentKeys(document, documentName).some(key => staleKeys.has(key)) || !isPremadeRulesJournal(document));
  }

  const moved = await organizeExistingDocuments(packDocuments, folders, documentName);

  if (wasLocked) await pack.configure({ locked: true });

  return missing.length + updated + removed + moved;
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

async function organizeExistingDocuments(documents, folders, documentName) {
  const updates = [];

  for (const document of documents) {
    const folder = folders[documentTypeKey(document, documentName)];
    if (!folder || document.folder?.id === folder.id) continue;

    updates.push(document.update({ folder: folder.id }));
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

    const diff = foundry.utils.diffObject(document.toObject(), updateData);
    updates.push(updateExistingPremadeDocument(document, source, updateData, diff, documentName));
  }

  const results = await Promise.all(updates);
  return results.filter(Boolean).length;
}

async function updateExistingPremadeDocument(document, source, updateData, diff, documentName) {
  let changed = false;

  if (Object.keys(diff).length) {
    await document.update(updateData);
    changed = true;
  }

  if (documentName === "Scene") {
    changed = await refreshPremadeSceneDrawings(document, source) || changed;
  }

  return changed;
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

function sameManagedDrawingSet(existingDrawings, sourceDrawings) {
  if (existingDrawings.length !== sourceDrawings.length) return false;

  const existing = existingDrawings.map(normalizedSceneDrawing).sort();
  const source = sourceDrawings.map(normalizedSceneDrawing).sort();
  return existing.every((entry, index) => entry === source[index]);
}

function normalizedSceneDrawing(drawing) {
  const source = foundry.utils.deepClone(drawingSource(drawing));
  delete source._id;
  delete source.id;
  delete source._stats;

  return stableStringify(source);
}

function drawingSource(drawing) {
  return drawing?.toObject?.() ?? drawing?._source ?? drawing ?? {};
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

function labelize(type) {
  return `${type[0].toUpperCase()}${type.slice(1)}s`;
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
  if (documentName === "Item" && document.type === "power") return document.flags?.[SYSTEM_ID]?.folder ?? "power";
  return document.type ?? documentName.toLowerCase();
}

function isPremadeRulesJournal(document) {
  const premade = document.getFlag?.(SYSTEM_ID, "premade") ?? document.flags?.[SYSTEM_ID]?.premade;
  const kind = document.getFlag?.(SYSTEM_ID, "kind") ?? document.flags?.[SYSTEM_ID]?.kind;

  return premade === true && ["complete-rules", "rules-reference"].includes(kind);
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
};

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
