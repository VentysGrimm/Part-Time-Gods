import { PTG_PREMADE_CHOICES } from "./premade-choices.mjs";
import { PTG_PREMADE_ITEMS } from "./premade-items.mjs";
import { PTG_PREMADE_ACTORS } from "./premade-actors.mjs";
import { getPremadeJournals } from "./premade-journals.mjs";
import { PTG_PREMADE_ROLL_TABLES } from "./premade-roll-tables.mjs";
import { getPremadeScenes } from "./premade-scenes.mjs";

const SYSTEM_ID = "part-time-gods";

const PACKS = {
  actors: "part-time-gods.opposition-actors",
  choices: "part-time-gods.character-creation",
  items: "part-time-gods.premade-items",
  maps: "part-time-gods.maps",
  rollTables: "part-time-gods.roll-tables",
  rules: "part-time-gods.rules-reference"
};

export async function populatePremadeCompendiums({ notify = true } = {}) {
  const actors = await populatePack(PACKS.actors, PTG_PREMADE_ACTORS, actorFolderLabels, "Actor");
  const choices = await populatePack(PACKS.choices, PTG_PREMADE_CHOICES, choiceFolderLabels, "Item");
  const items = await populatePack(PACKS.items, PTG_PREMADE_ITEMS, itemFolderLabels, "Item");
  const maps = await populatePack(PACKS.maps, getPremadeScenes(), sceneFolderLabels, "Scene");
  const rollTables = await populatePack(PACKS.rollTables, PTG_PREMADE_ROLL_TABLES, rollTableFolderLabels, "RollTable");
  const rules = await populatePack(PACKS.rules, await getPremadeJournals(), ruleFolderLabels, "JournalEntry", {
    removeStale: true,
    stalePredicate: isPremadeRulesJournal
  });
  const total = actors + choices + items + maps + rollTables + rules;

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

  await pack.getIndex({ fields: ["name", "type", "folder", "flags"] });

  const existing = new Set(pack.index.map(entry => documentKey(entry, documentName)));
  const missing = documents.filter(document => !existing.has(documentKey(document, documentName)));

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
  const updated = documentName === "Actor"
    ? await updateExistingPremadeDocuments(packDocuments, documents, folders, documentName)
    : 0;
  const removed = removeStale
    ? await removeStaleDocuments(documentClass, pack, packDocuments, documents, documentName, stalePredicate)
    : 0;

  if (removed) {
    const staleKeys = new Set(documents.map(document => documentKey(document, documentName)));
    packDocuments = packDocuments.filter(document => staleKeys.has(documentKey(document, documentName)) || !isPremadeRulesJournal(document));
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
  const expected = new Set(sourceDocuments.map(document => documentKey(document, documentName)));
  const staleDocuments = packDocuments.filter(document =>
    !expected.has(documentKey(document, documentName)) && stalePredicate?.(document)
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
  const sourceByKey = new Map(sourceDocuments.map(document => [documentKey(document, documentName), document]));
  const updates = [];

  for (const document of documents) {
    const source = sourceByKey.get(documentKey(document, documentName));
    if (!source) continue;

    const folder = folders[documentTypeKey(source, documentName)];
    const updateData = {
      ...foundry.utils.deepClone(source),
      folder: folder?.id ?? document.folder?.id ?? null
    };
    const diff = foundry.utils.diffObject(document.toObject(), updateData);
    if (Object.keys(diff).length) updates.push(document.update(updateData));
  }

  await Promise.all(updates);
  return updates.length;
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

function documentKey(document, documentName) {
  return `${documentTypeKey(document, documentName)}:${document.name}`;
}

function documentTypeKey(document, documentName) {
  if (documentName === "Actor") return document.flags?.[SYSTEM_ID]?.category ?? document.type ?? "actor";
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
  armor: "Armor",
  blessing: "Blessings",
  bond: "Bonds",
  condition: "Conditions",
  curse: "Curses and Failings",
  relic: "Relics",
  truth: "Truths",
  vassal: "Vassals",
  weapon: "Weapons",
  worshipper: "Worshippers"
};

const actorFolderLabels = {
  Animals: "Animals",
  Mortals: "Mortals",
  "The Touched": "The Touched",
  "Other Gods": "Other Gods",
  Outsiders: "Outsiders"
};

const sceneFolderLabels = {
  scene: "Maps"
};

const ruleFolderLabels = {
  journalentry: "Rules Reference"
};

const rollTableFolderLabels = {
  rolltable: "Random Tables"
};
