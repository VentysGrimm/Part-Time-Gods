import { PTG_PREMADE_CHOICES } from "./premade-choices.mjs";
import { PTG_PREMADE_ITEMS } from "./premade-items.mjs";
import { getPremadeJournals } from "./premade-journals.mjs";
import { getPremadeScenes } from "./premade-scenes.mjs";

const PACKS = {
  choices: "part-time-gods.character-creation",
  items: "part-time-gods.premade-items",
  maps: "part-time-gods.maps",
  rules: "part-time-gods.rules-reference"
};

export async function populatePremadeCompendiums({ notify = true } = {}) {
  const choices = await populatePack(PACKS.choices, PTG_PREMADE_CHOICES, choiceFolderLabels, "Item");
  const items = await populatePack(PACKS.items, PTG_PREMADE_ITEMS, itemFolderLabels, "Item");
  const maps = await populatePack(PACKS.maps, getPremadeScenes(), sceneFolderLabels, "Scene");
  const rules = await populatePack(PACKS.rules, await getPremadeJournals(), ruleFolderLabels, "JournalEntry");
  const total = choices + items + maps + rules;

  if (notify) {
    const message = total > 0
      ? `Added ${total} Part-Time Gods entries to system compendiums.`
      : "Part-Time Gods compendiums are already populated.";

    ui.notifications.info(message);
  }

  return total;
}

async function populatePack(packId, documents, folderLabels, documentName) {
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

  await pack.getIndex({ fields: ["name", "type", "folder"] });

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

  await organizeExistingDocuments(pack, folders, documentName);

  if (wasLocked) await pack.configure({ locked: true });

  return missing.length;
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

async function organizeExistingDocuments(pack, folders, documentName) {
  const documents = await pack.getDocuments();
  const updates = [];

  for (const document of documents) {
    const folder = folders[documentTypeKey(document, documentName)];
    if (!folder || document.folder?.id === folder.id) continue;

    updates.push(document.update({ folder: folder.id }));
  }

  await Promise.all(updates);
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
  return document.type ?? documentName.toLowerCase();
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
  curse: "Curses and Failings",
  relic: "Relics",
  truth: "Truths",
  vassal: "Vassals",
  weapon: "Weapons",
  worshipper: "Worshippers"
};

const sceneFolderLabels = {
  scene: "Maps"
};

const ruleFolderLabels = {
  journalentry: "Rules Reference"
};
