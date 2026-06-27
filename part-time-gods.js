import { PTGCharacterData } from "./module/documents/models/actor/character-model.mjs";
import { PTGAntagonistData } from "./module/documents/models/actor/antagonist-model.mjs";
import { PTGPantheonData } from "./module/documents/models/actor/pantheon-model.mjs";
import {
  PTGAttachmentData,
  PTGArmorData,
  PTGArchetypeData,
  PTGBlessingData,
  PTGBondData,
  PTGConditionData,
  PTGCurseData,
  PTGDomainData,
  PTGGearQualityData,
  PTGOccupationData,
  PTGPowerData,
  PTGRelicData,
  PTGTheologyData,
  PTGTruthData,
  PTGVassalData,
  PTGWeaponData,
  PTGWorshipperData
} from "./module/documents/models/item/item-models.mjs";
import { PartTimeGodsActor } from "./module/documents/actor/part-time-gods-actor.mjs";
import { PartTimeGodsItem } from "./module/documents/item/part-time-gods-item.mjs";
import { PTGCharacterSheet } from "./module/sheets/character-sheet.mjs";
import { PTGAntagonistSheet } from "./module/sheets/antagonist-sheet.mjs";
import { PTGPantheonSheet } from "./module/sheets/pantheon-sheet.mjs";
import { PTGItemSheet } from "./module/sheets/item-sheet.mjs";
import { PTGDiceEngine } from "./module/dice/ptg-dice-engine.mjs";
import { PTG_PREMADE_ITEMS, importPremadeItems } from "./module/data/premade-items.mjs";
import { PTG_PREMADE_CHOICES, importPremadeChoices } from "./module/data/premade-choices.mjs";
import { openAntagonistBuilder } from "./module/data/premade-actors.mjs";
import { populatePremadeCompendiums } from "./module/data/premade-compendiums.mjs";
import { PTG_PREMADE_MACROS } from "./module/data/premade-macros.mjs";
import { getPremadeJournals, importRulesJournals } from "./module/data/premade-journals.mjs";
import { getGodTerritorySceneData, importGodTerritoryScene, openTerritoryControls } from "./module/data/premade-scenes.mjs";
import { openPTGCombatControls, registerPTGCombatHooks, rollPTGInitiative } from "./module/combat/ptg-combat.mjs";
import { openMortalDivineBalanceTracker, registerMortalDivineTrackerSettings } from "./module/apps/mortal-divine-tracker.mjs";
import { openPantheonPoolDialog } from "./module/workflows/pantheon-pool-workflow.mjs";
import { registerPTGMigrationSettings, runPTGMigrations } from "./module/migration/ptg-migrations.mjs";
import { migrateWorldActorsToCanonicalEmbeddedItems } from "./module/migration/canonical-embedded-items.mjs";
import { registerPTGChatCardActions } from "./module/chat/chat-actions.mjs";
import { itemFromDropData } from "./module/util/drop-data.mjs";
import { SYSTEM_ID, localize, localizeFallback, localizeRecord } from "./module/util/localization.mjs";

const { DocumentSheetConfig } = foundry.applications.apps;
const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
const { loadTemplates } = foundry.applications.handlebars;

Hooks.once("init", async () => {
  console.log("Part-Time Gods 2E | Initializing");
  const config = localizedPTGConfig();

  game.partTimeGods = {
    config,
    dice: PTGDiceEngine,
    premadeItems: PTG_PREMADE_ITEMS,
    premadeChoices: PTG_PREMADE_CHOICES,
    premadeMacros: PTG_PREMADE_MACROS,
    importPremadeItems,
    importPremadeChoices,
    getPremadeJournals,
    importRulesJournals,
    getGodTerritorySceneData,
    importGodTerritoryScene,
    openTerritoryControls,
    openPTGCombatControls,
    openMortalDivineBalanceTracker,
    openPantheonPoolDialog,
    runPTGMigrations,
    migrateWorldActorsToCanonicalEmbeddedItems,
    rollPTGInitiative,
    openAntagonistBuilder,
    populatePremadeCompendiums
  };

  registerPTGCombatHooks();
  registerPTGChatCardActions();

  CONFIG.PTG = config;
  CONFIG.Actor.documentClass = PartTimeGodsActor;
  CONFIG.Actor.dataModels = {
    character: PTGCharacterData,
    antagonist: PTGAntagonistData,
    pantheon: PTGPantheonData
  };
  CONFIG.Item.documentClass = PartTimeGodsItem;
  CONFIG.Item.dataModels = {
    occupation: PTGOccupationData,
    archetype: PTGArchetypeData,
    domain: PTGDomainData,
    theology: PTGTheologyData,
    power: PTGPowerData,
    attachment: PTGAttachmentData,
    bond: PTGBondData,
    truth: PTGTruthData,
    relic: PTGRelicData,
    worshipper: PTGWorshipperData,
    vassal: PTGVassalData,
    blessing: PTGBlessingData,
    curse: PTGCurseData,
    condition: PTGConditionData,
    gearQuality: PTGGearQualityData,
    weapon: PTGWeaponData,
    armor: PTGArmorData
  };

  if (ActorSheetV2) DocumentSheetConfig.unregisterSheet(Actor, "core", ActorSheetV2);
  DocumentSheetConfig.registerSheet(Actor, SYSTEM_ID, PTGCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "PTG.Sheet.CharacterSheet"
  });
  DocumentSheetConfig.registerSheet(Actor, SYSTEM_ID, PTGAntagonistSheet, {
    types: ["antagonist"],
    makeDefault: true,
    label: "PTG.Sheet.AntagonistSheet"
  });
  DocumentSheetConfig.registerSheet(Actor, SYSTEM_ID, PTGPantheonSheet, {
    types: ["pantheon"],
    makeDefault: true,
    label: "PTG.Sheet.PantheonSheet"
  });
  if (ItemSheetV2) DocumentSheetConfig.unregisterSheet(Item, "core", ItemSheetV2);
  DocumentSheetConfig.registerSheet(Item, SYSTEM_ID, PTGItemSheet, {
    types: Object.keys(CONFIG.Item.dataModels),
    makeDefault: true,
    label: "PTG.Sheet.ItemSheet"
  });

  game.settings.register(SYSTEM_ID, "autoPopulatePremadeCompendiums", {
    name: localize("PTG.Settings.AutoPopulate.Name"),
    hint: localize("PTG.Settings.AutoPopulate.Hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(SYSTEM_ID, "canonicalEmbeddedItemsMigration", {
    name: localize("PTG.Settings.CanonicalEmbeddedItemsMigration.Name"),
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
  registerMortalDivineTrackerSettings();
  registerPTGMigrationSettings();

  Handlebars.registerHelper("eq", (a, b) => a === b);
  Handlebars.registerHelper("gt", (a, b) => Number(a) > Number(b));
  Handlebars.registerHelper("gte", (a, b) => Number(a) >= Number(b));
  Handlebars.registerHelper("ptgLocalize", (key, options) => localizeFallback(key, key, options.hash ?? {}));
  Handlebars.registerHelper("skillLabel", key => localizeFallback(`PTG.Skills.${key}`, CONFIG.PTG.skills[key] ?? key));
  Handlebars.registerHelper("manifestationLabel", key => localizeFallback(`PTG.Manifestations.${key}`, CONFIG.PTG.manifestations[key] ?? key));
  Handlebars.registerHelper("ptgLabel", (collection, key) => CONFIG.PTG[collection]?.[key] ?? key);
  Handlebars.registerHelper("ptgEntries", collection => Object.entries(collection ?? {}));
  Handlebars.registerHelper("ptgItemTypeLabel", type => game.i18n.localize(`TYPES.Item.${type}`));
  Handlebars.registerHelper("json", value => JSON.stringify(value ?? {}, null, 2));

  await loadTemplates([
    "systems/part-time-gods/templates/actor/parts/item-list.hbs",
    "systems/part-time-gods/templates/chat/item-use-card.hbs",
    "systems/part-time-gods/templates/apps/mortal-divine-tracker.hbs"
  ]);
});

Hooks.once("ready", async () => {
  console.log("Part-Time Gods 2E | Ready");

  if (!game.user?.isGM) return;

  await runPTGMigrations({ notify: true });

  try {
    const migration = await migrateWorldActorsToCanonicalEmbeddedItems({ notify: false });
    if (migration.createdItems || migration.clearedFields) {
      ui.notifications.info(localize("PTG.Notifications.EmbeddedItemsMigrated", {
        createdItems: migration.createdItems
      }));
    }
  } catch (error) {
    console.error("Part-Time Gods 2E | Canonical embedded Items migration failed.", error);
    ui.notifications.error(localize("PTG.Notifications.EmbeddedItemsMigrationFailed"));
  }

  if (!game.settings.get(SYSTEM_ID, "autoPopulatePremadeCompendiums")) return;

  await populatePremadeCompendiums({ notify: true });
});

Hooks.on("dropCanvasData", async (canvas, data) => {
  if (data?.type !== "Item") return true;

  const item = await itemFromDropData(data);
  if (!item || !["worshipper", "vassal"].includes(item.type)) return true;

  if (!game.user?.isGM) {
    ui.notifications.warn(localize("PTG.Notifications.OnlyGMFollowerScene"));
    return false;
  }

  const actor = await getOrCreateFollowerActor(item);
  await createFollowerToken(canvas, actor, data);
  return false;
});

async function getOrCreateFollowerActor(item) {
  const sourceUuid = item.uuid;
  if (sourceUuid) {
    const existing = game.actors.find(actor => actor.getFlag(SYSTEM_ID, "sourceItemUuid") === sourceUuid);
    if (existing) return existing;
  }

  const folder = await ensureFollowerActorFolder(item.type);
  return Actor.create(followerActorData(item, folder, sourceUuid), { renderSheet: false });
}

async function ensureFollowerActorFolder(type) {
  const folderName = type === "vassal" ? localize("PTG.Folders.Vassals") : localize("PTG.Folders.Worshippers");
  const existing = game.folders.find(folder => folder.type === "Actor" && folder.name === folderName);
  if (existing) return existing;

  return Folder.create({
    name: folderName,
    type: "Actor",
    sorting: "a"
  });
}

function followerActorData(item, folder, sourceUuid) {
  const level = followerLevel(item);
  const img = item.img || followerIcon(item.type);
  const disposition = CONST?.TOKEN_DISPOSITIONS?.FRIENDLY ?? 1;
  const template = followerActorTemplate(item);
  const templateSystem = template?.system ?? {};
  const actorType = CONFIG.Actor.dataModels?.[template?.type] ? template.type : "antagonist";
  const threshold = finiteNumber(templateSystem.threshold ?? templateSystem.health ?? level, level, 0);

  return {
    name: template?.name ?? item.name,
    type: actorType,
    img: template?.img ?? img,
    folder: folder?.id,
    system: {
      ...templateSystem,
      threat: finiteNumber(templateSystem.threat ?? level, level, 1),
      threshold,
      health: finiteNumber(templateSystem.health ?? threshold, threshold, 0),
      psyche: finiteNumber(templateSystem.psyche ?? threshold, threshold, 0),
      description: followerActorDescription(item, templateSystem)
    },
    prototypeToken: {
      ...(template?.prototypeToken ?? {}),
      name: template?.prototypeToken?.name ?? template?.name ?? item.name,
      actorLink: template?.prototypeToken?.actorLink ?? false,
      disposition,
      texture: {
        src: template?.prototypeToken?.texture?.src ?? template?.img ?? img
      }
    },
    flags: {
      [SYSTEM_ID]: {
        sourceItemUuid: sourceUuid ?? null,
        sourceItemType: item.type,
        sourceActorName: item.system?.sourceActorName ?? null,
        powerHooks: Array.isArray(item.system?.powerHooks)
          ? item.system.powerHooks.filter(hook => typeof hook === "string")
          : []
      }
    }
  };
}

async function createFollowerToken(canvas, actor, data) {
  if (!canvas?.scene) {
    ui.notifications.warn(localize("PTG.Notifications.NoActiveScene"));
    return;
  }

  const tokenDocument = await actor.getTokenDocument({
    x: Number(data.x) || 0,
    y: Number(data.y) || 0
  });
  const tokenData = tokenDocument.toObject ? tokenDocument.toObject() : tokenDocument;
  await canvas.scene.createEmbeddedDocuments("Token", [tokenData]);
}

function followerActorDescription(item, templateSystem = {}) {
  const system = item.system ?? {};
  const rulesSummary = system.rules?.summary;
  const parts = [
    `<p><strong>${label("SourceItem")}:</strong> ${escapeHTML(item.name)} (${escapeHTML(localizeFallback(`TYPES.Item.${item.type}`, item.type))})</p>`
  ];

  if (system.level) parts.push(`<p><strong>${label("Level")}:</strong> ${escapeHTML(String(system.level))}</p>`);
  if (system.sourceActorName) parts.push(`<p><strong>${label("SourceActor")}:</strong> ${escapeHTML(system.sourceActorName)}</p>`);
  if (rulesSummary) parts.push(`<p><strong>${label("Rules")}:</strong> ${escapeHTML(rulesSummary)}</p>`);
  if (system.benefit) parts.push(`<h3>${label("Benefit")}</h3>${system.benefit}`);
  if (templateSystem.powers) parts.push(`<h3>${label("ActorPowers")}</h3>${templateSystem.powers}`);
  if (system.description) parts.push(`<h3>${label("Description")}</h3>${system.description}`);
  if (system.notes) parts.push(`<h3>${label("Notes")}</h3>${system.notes}`);

  return parts.join("");
}

function followerActorTemplate(item) {
  const source = item.type === "vassal" ? item.system?.actorTemplate : null;
  if (!source || typeof source !== "object" || !Object.keys(source).length) return null;

  return foundry.utils.deepClone(source);
}

function followerLevel(item) {
  const level = finiteNumber(item.system?.level, 1, 1);
  return Number.isFinite(level) && level > 0 ? level : 1;
}

function followerIcon(type) {
  return {
    vassal: "icons/creatures/magical/spirit-undead-winged-blue.webp",
    worshipper: "icons/environment/people/group.webp"
  }[type] ?? "icons/svg/mystery-man.svg";
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function finiteNumber(value, fallback = 0, min = Number.NEGATIVE_INFINITY) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, number) : fallback;
}

function label(key) {
  return escapeHTML(localizeFallback(`PTG.Follower.${key}`, key));
}

function localizedPTGConfig() {
  return {
    ...PTG,
    skills: localizeRecord("PTG.Skills", PTG.skills),
    manifestations: localizeRecord("PTG.Manifestations", PTG.manifestations),
    attachments: localizeRecord("PTG.Attachments", PTG.attachments),
    activationTypes: localizeRecord("PTG.Config.ActivationTypes", PTG.activationTypes),
    bondKinds: localizeRecord("PTG.Config.BondKinds", PTG.bondKinds),
    domainCategories: localizeRecord("PTG.Config.DomainCategories", PTG.domainCategories),
    measureOptions: localizeRecord("PTG.Config.MeasureOptions", PTG.measureOptions),
    choiceTypes: localizeRecord("PTG.Config.ChoiceTypes", PTG.choiceTypes)
  };
}

export const PTG = {
  skills: {
    athletics: "Athletics",
    crafts: "Crafts",
    deception: "Deception",
    discipline: "Discipline",
    empathy: "Empathy",
    fighting: "Fighting",
    fortitude: "Fortitude",
    influence: "Influence",
    intuition: "Intuition",
    knowledge: "Knowledge",
    marksman: "Marksman",
    medicine: "Medicine",
    might: "Might",
    perception: "Perception",
    perform: "Perform",
    speed: "Speed",
    stealth: "Stealth",
    survival: "Survival",
    tech: "Tech",
    travel: "Travel"
  },
  manifestations: {
    aegis: "Aegis",
    beckon: "Beckon",
    journey: "Journey",
    minion: "Minion",
    oracle: "Oracle",
    puppetry: "Puppetry",
    ruin: "Ruin",
    shaping: "Shaping",
    soul: "Soul"
  },
  difficulties: {
    simple: 1,
    moderate: 2,
    tough: 3,
    challenging: 4,
    legendary: 5
  },
  attachments: {
    bonds: "Bonds",
    failings: "Failings",
    relics: "Relics",
    truths: "Truths",
    vassals: "Vassals",
    worshippers: "Worshippers",
    blessings: "Blessings",
    curses: "Curses"
  },
  activationTypes: {
    passive: "Passive",
    instant: "Instant",
    action: "Action",
    scene: "Scene",
    sustained: "Sustained",
    ritual: "Ritual"
  },
  bondKinds: {
    choice: "Choice",
    individual: "Individual",
    group: "Group",
    landmark: "Landmark"
  },
  domainCategories: {
    bestial: "Bestial",
    conceptual: "Conceptual",
    elemental: "Elemental",
    emotional: "Emotional",
    patron: "Patron",
    tangible: "Tangible",
    crossover: "Crossover"
  },
  measureOptions: {
    damage: "Damage",
    range: "Range",
    targets: "Additional Targets",
    duration: "Duration",
    scale: "Scale",
    detail: "Effect Detail"
  },
  choiceTypes: {
    occupation: "Occupation",
    archetype: "Archetype",
    domain: "Dominion",
    theology: "Theology"
  }
};
