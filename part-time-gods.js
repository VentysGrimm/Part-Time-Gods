import { PTGCharacterData } from "./module/documents/models/actor/character-model.mjs";
import { PTGAntagonistData } from "./module/documents/models/actor/antagonist-model.mjs";
import { PTGPantheonData } from "./module/documents/models/actor/pantheon-model.mjs";
import {
  PTGArmorData,
  PTGArchetypeData,
  PTGBlessingData,
  PTGBondData,
  PTGCurseData,
  PTGDomainData,
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
import { populatePremadeCompendiums } from "./module/data/premade-compendiums.mjs";
import { getPremadeJournals, importRulesJournals } from "./module/data/premade-journals.mjs";
import { getGodTerritorySceneData, importGodTerritoryScene } from "./module/data/premade-scenes.mjs";
import { itemFromDropData } from "./module/util/drop-data.mjs";

const { DocumentSheetConfig } = foundry.applications.apps;
const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
const { loadTemplates } = foundry.applications.handlebars;

Hooks.once("init", async () => {
  console.log("Part-Time Gods 2E | Initializing");

  game.partTimeGods = {
    config: PTG,
    dice: PTGDiceEngine,
    premadeItems: PTG_PREMADE_ITEMS,
    premadeChoices: PTG_PREMADE_CHOICES,
    importPremadeItems,
    importPremadeChoices,
    getPremadeJournals,
    importRulesJournals,
    getGodTerritorySceneData,
    importGodTerritoryScene,
    populatePremadeCompendiums
  };

  CONFIG.PTG = PTG;
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
    bond: PTGBondData,
    truth: PTGTruthData,
    relic: PTGRelicData,
    worshipper: PTGWorshipperData,
    vassal: PTGVassalData,
    blessing: PTGBlessingData,
    curse: PTGCurseData,
    weapon: PTGWeaponData,
    armor: PTGArmorData
  };

  if (ActorSheetV2) DocumentSheetConfig.unregisterSheet(Actor, "core", ActorSheetV2);
  DocumentSheetConfig.registerSheet(Actor, "part-time-gods", PTGCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "PTG.Sheet.CharacterSheet"
  });
  DocumentSheetConfig.registerSheet(Actor, "part-time-gods", PTGAntagonistSheet, {
    types: ["antagonist"],
    makeDefault: true,
    label: "PTG.Sheet.AntagonistSheet"
  });
  DocumentSheetConfig.registerSheet(Actor, "part-time-gods", PTGPantheonSheet, {
    types: ["pantheon"],
    makeDefault: true,
    label: "PTG.Sheet.PantheonSheet"
  });
  if (ItemSheetV2) DocumentSheetConfig.unregisterSheet(Item, "core", ItemSheetV2);
  DocumentSheetConfig.registerSheet(Item, "part-time-gods", PTGItemSheet, {
    types: Object.keys(CONFIG.Item.dataModels),
    makeDefault: true,
    label: "PTG.Sheet.ItemSheet"
  });

  game.settings.register("part-time-gods", "autoPopulatePremadeCompendiums", {
    name: "Auto-populate premade Part-Time Gods compendiums",
    hint: "Creates the system's premade character creation choices, play items, maps, and rules journals in system compendiums for GMs.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  Handlebars.registerHelper("eq", (a, b) => a === b);
  Handlebars.registerHelper("gt", (a, b) => Number(a) > Number(b));
  Handlebars.registerHelper("gte", (a, b) => Number(a) >= Number(b));
  Handlebars.registerHelper("skillLabel", key => CONFIG.PTG.skills[key] ?? key);
  Handlebars.registerHelper("manifestationLabel", key => CONFIG.PTG.manifestations[key] ?? key);
  Handlebars.registerHelper("ptgLabel", (collection, key) => CONFIG.PTG[collection]?.[key] ?? key);
  Handlebars.registerHelper("ptgEntries", collection => Object.entries(collection ?? {}));
  Handlebars.registerHelper("ptgItemTypeLabel", type => game.i18n.localize(`TYPES.Item.${type}`));
  Handlebars.registerHelper("json", value => JSON.stringify(value ?? {}, null, 2));

  await loadTemplates([
    "systems/part-time-gods/templates/actor/parts/item-list.hbs"
  ]);
});

Hooks.once("ready", async () => {
  console.log("Part-Time Gods 2E | Ready");

  if (!game.user?.isGM) return;
  if (!game.settings.get("part-time-gods", "autoPopulatePremadeCompendiums")) return;

  await populatePremadeCompendiums({ notify: true });
});

Hooks.on("dropCanvasData", async (canvas, data) => {
  if (data?.type !== "Item") return true;

  const item = await itemFromDropData(data);
  if (!item || !["worshipper", "vassal"].includes(item.type)) return true;

  if (!game.user?.isGM) {
    ui.notifications.warn("Only a GM can create Worshipper and Vassal actors on a scene.");
    return false;
  }

  const actor = await getOrCreateFollowerActor(item);
  await createFollowerToken(canvas, actor, data);
  return false;
});

Hooks.on("chatMessage", (chatLog, message) => {
  if (message === "/ptg-import-items") {
    importPremadeItems();
    return false;
  }

  if (message === "/ptg-import-choices") {
    importPremadeChoices();
    return false;
  }

  if (message === "/ptg-populate-compendiums") {
    populatePremadeCompendiums();
    return false;
  }

  if (message === "/ptg-create-territory-scene") {
    importGodTerritoryScene();
    return false;
  }

  if (message === "/ptg-import-rules-journals") {
    importRulesJournals();
    return false;
  }

  if (message !== "/ptg") return true;

  ui.notifications.info("Part-Time Gods 2E loaded. Premade content lives in the system compendiums. Use /ptg-create-territory-scene or /ptg-import-rules-journals for world setup.");
  return false;
});

async function getOrCreateFollowerActor(item) {
  const sourceUuid = item.uuid;
  if (sourceUuid) {
    const existing = game.actors.find(actor => actor.getFlag("part-time-gods", "sourceItemUuid") === sourceUuid);
    if (existing) return existing;
  }

  const folder = await ensureFollowerActorFolder(item.type);
  return Actor.create(followerActorData(item, folder, sourceUuid), { renderSheet: false });
}

async function ensureFollowerActorFolder(type) {
  const folderName = type === "vassal" ? "PTG Vassals" : "PTG Worshippers";
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

  return {
    name: item.name,
    type: "antagonist",
    img,
    folder: folder?.id,
    system: {
      threat: level,
      health: Math.max(1, level * 2),
      psyche: Math.max(1, level),
      initiative: level,
      damage: Math.max(1, level),
      description: followerActorDescription(item)
    },
    prototypeToken: {
      name: item.name,
      actorLink: false,
      disposition,
      texture: {
        src: img
      }
    },
    flags: {
      "part-time-gods": {
        sourceItemUuid: sourceUuid ?? null,
        sourceItemType: item.type
      }
    }
  };
}

async function createFollowerToken(canvas, actor, data) {
  const tokenDocument = await actor.getTokenDocument({
    x: Number(data.x) || 0,
    y: Number(data.y) || 0
  });
  const tokenData = tokenDocument.toObject ? tokenDocument.toObject() : tokenDocument;
  await canvas.scene.createEmbeddedDocuments("Token", [tokenData]);
}

function followerActorDescription(item) {
  const system = item.system ?? {};
  const rulesSummary = system.rules?.summary;
  const parts = [
    `<p><strong>Source Item:</strong> ${escapeHTML(item.name)} (${escapeHTML(game.i18n.localize(`TYPES.Item.${item.type}`))})</p>`
  ];

  if (system.level) parts.push(`<p><strong>Level:</strong> ${escapeHTML(String(system.level))}</p>`);
  if (rulesSummary) parts.push(`<p><strong>Rules:</strong> ${escapeHTML(rulesSummary)}</p>`);
  if (system.benefit) parts.push(`<h3>Benefit</h3>${system.benefit}`);
  if (system.description) parts.push(`<h3>Description</h3>${system.description}`);
  if (system.notes) parts.push(`<h3>Notes</h3>${system.notes}`);

  return parts.join("");
}

function followerLevel(item) {
  const level = Number(item.system?.level ?? 1);
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
  choiceTypes: {
    occupation: "Occupation",
    archetype: "Archetype",
    domain: "Dominion",
    theology: "Theology"
  }
};
