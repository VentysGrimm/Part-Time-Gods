const SYSTEM_ID = "part-time-gods";
const MIGRATION_ID = "canonical-embedded-items-v1";

const LEGACY_FIELDS = [
  { path: "system.conditions", type: "condition", name: "Legacy Condition Notes", label: "Condition Notes" },
  { path: "system.attachments.failings", type: "curse", name: "Legacy Failing Notes", label: "Failings" },
  { path: "system.attachments.blessings", type: "blessing", name: "Legacy Blessing Notes", label: "Blessings" },
  { path: "system.attachments.curses", type: "curse", name: "Legacy Curse Notes", label: "Curses" },
  { path: "system.attachments.bonds", type: "bond", name: "Legacy Bond Notes", label: "Bonds" },
  { path: "system.attachments.worshippers", type: "worshipper", name: "Legacy Worshipper Notes", label: "Worshippers" },
  { path: "system.attachments.vassals", type: "vassal", name: "Legacy Vassal Notes", label: "Vassals" },
  { path: "system.attachments.relics", type: "relic", name: "Legacy Relic Notes", label: "Relics" },
  { path: "system.attachments.truths", type: "truth", name: "Legacy Truth Notes", label: "Truths" }
];

export async function migrateWorldActorsToCanonicalEmbeddedItems({ force = false, notify = true } = {}) {
  if (!game.user?.isGM) {
    return {
      migratedActors: 0,
      createdItems: 0,
      clearedFields: 0,
      skipped: "not-gm"
    };
  }

  const summary = {
    migratedActors: 0,
    createdItems: 0,
    clearedFields: 0,
    skipped: ""
  };

  for (const actor of game.actors ?? []) {
    const result = await migrateActorToCanonicalEmbeddedItems(actor, { force });
    if (!result.migrated) continue;

    summary.migratedActors += 1;
    summary.createdItems += result.createdItems;
    summary.clearedFields += result.clearedFields;
  }

  await game.settings.set(SYSTEM_ID, "canonicalEmbeddedItemsMigration", MIGRATION_ID);

  if (notify && (summary.createdItems || summary.clearedFields)) {
    ui.notifications.info(`Part-Time Gods migrated ${summary.createdItems} legacy sheet note(s) into owned Items.`);
  }

  return summary;
}

export async function migrateActorToCanonicalEmbeddedItems(actor, { force = false } = {}) {
  if (!actor || actor.type !== "character") {
    return {
      migrated: false,
      createdItems: 0,
      clearedFields: 0
    };
  }

  const migrations = actor.getFlag(SYSTEM_ID, "schemaMigrations") ?? {};
  if (!force && migrations.canonicalEmbeddedItems?.id === MIGRATION_ID) {
    return {
      migrated: false,
      createdItems: 0,
      clearedFields: 0
    };
  }

  const createData = [];
  const updates = {};

  for (const field of LEGACY_FIELDS) {
    const text = String(foundry.utils.getProperty(actor, field.path) ?? "").trim();
    if (!text) continue;

    if (!hasMigratedLegacyItem(actor, field)) {
      createData.push(legacyItemData(actor, field, text));
    }

    updates[field.path] = "";
  }

  if (createData.length) {
    await actor.createEmbeddedDocuments("Item", createData);
  }

  if (Object.keys(updates).length) {
    await actor.update(updates);
  }

  await actor.setFlag(SYSTEM_ID, "schemaMigrations", {
    ...migrations,
    canonicalEmbeddedItems: {
      id: MIGRATION_ID,
      migratedAt: new Date().toISOString(),
      createdItems: createData.length,
      clearedFields: Object.keys(updates)
    }
  });

  return {
    migrated: Boolean(createData.length || Object.keys(updates).length || force),
    createdItems: createData.length,
    clearedFields: Object.keys(updates).length
  };
}

function hasMigratedLegacyItem(actor, field) {
  return actor.items.some(item => {
    const flags = item.flags?.[SYSTEM_ID] ?? {};
    return flags.canonicalMigration === MIGRATION_ID && flags.legacyPath === field.path;
  });
}

function legacyItemData(actor, field, text) {
  const description = legacyDescription(field.label, text);
  const common = {
    rules: rulesData(field, description),
    usage: usageData(field.type),
    automation: automationData(),
    notes: `<p>Migrated from <code>${escapeHTML(field.path)}</code> on ${escapeHTML(actor.name)}.</p>`
  };

  return {
    name: field.name,
    type: field.type,
    img: iconForType(field.type),
    system: systemDataForType(field, description, common),
    flags: {
      [SYSTEM_ID]: {
        canonicalEmbeddedItem: true,
        canonicalId: `legacy:${slugify(field.path)}`,
        canonicalMigration: MIGRATION_ID,
        canonicalSource: "legacy-sheet-field",
        canonicalSourceType: field.type,
        canonicalSourceName: field.label,
        canonicalRole: field.type,
        legacyPath: field.path,
        legacyLabel: field.label
      }
    }
  };
}

function systemDataForType(field, description, common) {
  if (field.type === "condition") {
    return {
      ...common,
      category: "",
      severity: 1,
      severityMode: "legacy-note",
      appliesTo: "fictional",
      duration: "",
      recovery: "",
      removal: "",
      effect: description
    };
  }

  if (field.type === "curse") {
    return {
      ...common,
      source: "Legacy character sheet",
      trigger: "",
      pantheonDice: 1,
      effect: description
    };
  }

  if (field.type === "blessing") {
    return {
      ...common,
      source: "Legacy character sheet",
      trigger: "",
      bonus: "",
      effect: description
    };
  }

  if (field.type === "bond") {
    return {
      ...common,
      choiceSource: "Legacy character sheet",
      choiceKind: "legacy",
      choiceLabel: field.label,
      kind: "legacy",
      level: 1,
      strain: { value: 0, max: 1 },
      description
    };
  }

  if (field.type === "worshipper") {
    return {
      ...common,
      choiceSource: "Legacy character sheet",
      choiceKind: "legacy",
      choiceLabel: field.label,
      level: 1,
      strain: { value: 0, max: 1 },
      group: field.label,
      benefit: description,
      description
    };
  }

  if (field.type === "vassal") {
    return {
      ...common,
      choiceSource: "Legacy character sheet",
      choiceKind: "legacy",
      choiceLabel: field.label,
      level: 1,
      strain: { value: 0, max: 1 },
      concept: field.label,
      loyalty: 0,
      benefit: description,
      description
    };
  }

  if (field.type === "relic") {
    return {
      ...common,
      choiceSource: "Legacy character sheet",
      choiceKind: "legacy",
      choiceLabel: field.label,
      level: 1,
      cost: 0,
      bonus: "",
      benefit: description,
      effect: description,
      description
    };
  }

  if (field.type === "truth") {
    return {
      ...common,
      choiceSource: "Legacy character sheet",
      choiceKind: "legacy",
      choiceLabel: field.label,
      statement: field.label,
      rank: 1,
      cost: 0,
      fragmentCost: 0,
      activation: "Passive",
      benefit: description,
      effect: description,
      description
    };
  }

  return {
    ...common,
    description
  };
}

function rulesData(field, description) {
  return {
    summary: `${field.label} preserved from legacy character-sheet notes.`,
    fullText: description,
    source: {
      book: "Legacy character sheet",
      page: null,
      section: field.label,
      type: field.type
    }
  };
}

function usageData(type) {
  return {
    kind: ["truth", "relic"].includes(type) ? "active" : "narrative",
    trigger: "",
    target: "self",
    cost: {
      freeTime: 0,
      wealth: 0,
      pantheonDice: 0,
      fragments: 0,
      health: 0,
      psyche: 0,
      strain: 0
    }
  };
}

function automationData() {
  return {
    enabled: false,
    action: "",
    bonus: null,
    penalty: null,
    roll: null,
    healing: null,
    damage: null,
    condition: null,
    resourceChange: null,
    chatCard: true
  };
}

function legacyDescription(label, text) {
  return [
    `<p><strong>${escapeHTML(label)}</strong></p>`,
    ...String(text).split(/\n{2,}/).map(block => `<p>${escapeHTML(block).replace(/\n/g, "<br>")}</p>`)
  ].join("");
}

function iconForType(type) {
  return {
    blessing: "icons/magic/holy/prayer-hands-glowing-yellow.webp",
    bond: "icons/sundries/documents/document-sealed-red.webp",
    condition: "icons/svg/aura.svg",
    curse: "icons/magic/unholy/silhouette-robe-evil-power.webp",
    relic: "icons/commodities/treasure/token-runed-os-grey.webp",
    truth: "icons/magic/symbols/rune-sigil-black-pink.webp",
    vassal: "icons/creatures/magical/spirit-undead-winged-blue.webp",
    worshipper: "icons/environment/people/group.webp"
  }[type] ?? "icons/svg/item-bag.svg";
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}
