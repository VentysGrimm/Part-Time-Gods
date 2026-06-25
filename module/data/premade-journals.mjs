const SYSTEM_ID = "part-time-gods";
const RULES_KIND = "rules-reference";
const RULES_FOLDER = "PTG Rules Reference";
const RULES_DATA_PATH = "systems/part-time-gods/module/data/complete-rules.json";

export async function getPremadeJournals() {
  const journals = await loadRulesJournals();
  return journals.map(normalizeRulesJournal).filter(Boolean);
}

export async function importRulesJournals({ notify = true } = {}) {
  if (!game.user?.isGM) {
    if (notify) ui.notifications.warn("Only a GM can import the Part-Time Gods rules journals.");
    return [];
  }

  const journals = await getPremadeJournals();

  if (!journals.length) {
    if (notify) ui.notifications.warn("No source-backed Part-Time Gods rules journals are available.");
    return [];
  }

  const existing = new Set(
    game.journal
      .filter(entry => entry.getFlag(SYSTEM_ID, "kind") === RULES_KIND)
      .map(entry => entry.name)
  );

  const missing = journals.filter(entry => !existing.has(entry.name));

  if (!missing.length) {
    if (notify) ui.notifications.info("Part-Time Gods rules journals are already imported.");
    return [];
  }

  const folder = await ensureWorldRulesFolder();
  const created = await JournalEntry.createDocuments(missing.map(entry => ({
    ...entry,
    folder: folder.id
  })));

  if (notify) ui.notifications.info(`Imported ${created.length} Part-Time Gods rules journals.`);

  return created;
}

async function loadRulesJournals() {
  const route = globalThis.foundry?.utils?.getRoute?.(RULES_DATA_PATH) ?? RULES_DATA_PATH;

  try {
    const response = await fetch(route, { cache: "no-cache" });
    if (!response.ok) return [];

    const journals = await response.json();
    return Array.isArray(journals) ? journals : [];
  } catch (error) {
    console.warn("Part-Time Gods 2E | Unable to load source-backed rules journals.", error);
    return [];
  }
}

function normalizeRulesJournal(entry, index) {
  if (!entry?.name || !Array.isArray(entry.pages) || !entry.pages.length) return null;

  const pages = entry.pages.map(normalizeRulesPage).filter(Boolean);
  if (!pages.length) return null;

  const systemFlags = entry.flags?.[SYSTEM_ID] ?? {};

  return {
    name: entry.name,
    sort: entry.sort ?? (index + 1) * 100000,
    pages,
    flags: {
      ...entry.flags,
      [SYSTEM_ID]: {
        ...systemFlags,
        premade: true,
        kind: RULES_KIND,
        category: systemFlags.category ?? entry.category ?? "rules"
      }
    }
  };
}

function normalizeRulesPage(entry, index) {
  if (!entry?.name || !entry.text?.content) return null;

  const systemFlags = entry.flags?.[SYSTEM_ID] ?? {};

  return {
    name: entry.name,
    type: "text",
    sort: entry.sort ?? (index + 1) * 100000,
    title: {
      show: entry.title?.show ?? true,
      level: entry.title?.level ?? 2
    },
    text: {
      format: entry.text?.format ?? htmlFormat(),
      content: entry.text.content
    },
    flags: {
      ...entry.flags,
      [SYSTEM_ID]: {
        ...systemFlags,
        premade: true,
        kind: RULES_KIND,
        ruleTopic: systemFlags.ruleTopic ?? slugify(entry.name)
      }
    }
  };
}

async function ensureWorldRulesFolder() {
  let folder = game.folders.find(existing =>
    existing.type === "JournalEntry" && existing.name === RULES_FOLDER
  );

  if (!folder) {
    folder = await Folder.create({
      name: RULES_FOLDER,
      type: "JournalEntry",
      sorting: "a"
    });
  }

  return folder;
}

function htmlFormat() {
  return globalThis.CONST?.JOURNAL_ENTRY_PAGE_FORMATS?.HTML ?? 1;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
