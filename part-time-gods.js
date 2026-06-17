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

  if (typeof ActorSheet !== "undefined") Actors.unregisterSheet("core", ActorSheet);
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
  if (typeof ItemSheet !== "undefined") Items.unregisterSheet("core", ItemSheet);
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
