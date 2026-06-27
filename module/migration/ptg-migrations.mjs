const SYSTEM_ID = "part-time-gods";

export const PTG_SYSTEM_SCHEMA_VERSION = 1;

const LEGACY_ATTACHMENT_KEYS = [
  "bonds",
  "failings",
  "relics",
  "truths",
  "vassals",
  "worshippers",
  "blessings",
  "curses"
];

const CANONICAL_ATTACHMENT_ITEM_TYPES = [
  "bond",
  "truth",
  "relic",
  "worshipper",
  "vassal",
  "blessing",
  "curse",
  "condition"
];

export function registerPTGMigrationSettings() {
  game.settings.register(SYSTEM_ID, "schemaVersion", {
    name: "Part-Time Gods Schema Version",
    hint: "Internal world schema version used for safe data migrations.",
    scope: "world",
    config: false,
    type: Number,
    default: 0
  });
}

export async function runPTGMigrations({ notify = false } = {}) {
  if (!game.user?.isGM) return;

  const currentVersion = Number(game.settings.get(SYSTEM_ID, "schemaVersion") ?? 0);
  if (currentVersion >= PTG_SYSTEM_SCHEMA_VERSION) return;

  const summary = {
    from: currentVersion,
    to: PTG_SYSTEM_SCHEMA_VERSION,
    actorsScanned: 0,
    actorsUpdated: 0,
    legacyAttachmentFieldsPreserved: 0
  };

  if (currentVersion < 1) {
    const result = await migrateLegacyAttachmentTextToFlags();
    summary.actorsScanned += result.actorsScanned;
    summary.actorsUpdated += result.actorsUpdated;
    summary.legacyAttachmentFieldsPreserved += result.legacyAttachmentFieldsPreserved;
  }

  await game.settings.set(SYSTEM_ID, "schemaVersion", PTG_SYSTEM_SCHEMA_VERSION);

  if (notify) {
    ui.notifications.info(`Part-Time Gods migrations complete: schema ${summary.from} -> ${summary.to}.`);
    await postMigrationSummary(summary);
  }
}

async function migrateLegacyAttachmentTextToFlags() {
  const result = {
    actorsScanned: 0,
    actorsUpdated: 0,
    legacyAttachmentFieldsPreserved: 0
  };

  for (const actor of game.actors ?? []) {
    if (actor.type !== "character") continue;
    result.actorsScanned += 1;

    const legacyText = legacyAttachmentText(actor);
    if (!Object.keys(legacyText).length) continue;

    const existing = actor.getFlag(SYSTEM_ID, "legacyAttachmentText") ?? {};
    const merged = foundry.utils.mergeObject(existing, legacyText, { inplace: false });

    await actor.update({
      [`flags.${SYSTEM_ID}.legacyAttachmentText`]: merged,
      [`flags.${SYSTEM_ID}.attachmentSourceOfTruth`]: "embedded-items",
      [`flags.${SYSTEM_ID}.attachmentMigrationNote`]: "Legacy actor text fields were preserved here. Embedded Items are the canonical attachment data model going forward."
    });

    result.actorsUpdated += 1;
    result.legacyAttachmentFieldsPreserved += Object.keys(legacyText).length;
  }

  return result;
}

function legacyAttachmentText(actor) {
  const attachments = actor.system?.attachments ?? {};
  const legacyText = {};

  for (const key of LEGACY_ATTACHMENT_KEYS) {
    const value = String(attachments[key] ?? "").trim();
    if (value) legacyText[key] = value;
  }

  return legacyText;
}

async function postMigrationSummary(summary) {
  if (!summary.actorsUpdated && !summary.legacyAttachmentFieldsPreserved) return;

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker(),
    content: `
      <div class="ptg-chat-card">
        <h3>Part-Time Gods Migration</h3>
        <div><strong>Schema:</strong> ${summary.from} -> ${summary.to}</div>
        <div><strong>Characters scanned:</strong> ${summary.actorsScanned}</div>
        <div><strong>Characters updated:</strong> ${summary.actorsUpdated}</div>
        <div><strong>Legacy attachment fields preserved:</strong> ${summary.legacyAttachmentFieldsPreserved}</div>
        <p>Embedded Items are now treated as the canonical model for Bonds, Failings, Relics, Truths, Vassals, Worshippers, Blessings, Curses, and Conditions. Existing text fields are preserved in flags for review and later conversion.</p>
      </div>
    `
  });
}

export function embeddedAttachmentItems(actor) {
  if (!actor?.items) return [];
  return actor.items.filter(item => CANONICAL_ATTACHMENT_ITEM_TYPES.includes(item.type));
}

export function attachmentSummaryByType(actor) {
  return embeddedAttachmentItems(actor).reduce((summary, item) => {
    summary[item.type] ??= [];
    summary[item.type].push(item);
    return summary;
  }, {});
}
