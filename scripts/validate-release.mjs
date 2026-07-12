import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SYSTEM_ID = "part-time-gods";
const ROUTE_PREFIX = "systems/part-time-gods/";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED_MANIFESTATION_APPLICATIONS = {
  aegis: ["Protection Field", "Purge", "Warning"],
  beckon: ["Banish", "Multiply", "Summon"],
  journey: ["Blink", "Phasing", "Swift"],
  minion: ["Bestow", "Enchant", "Instill Life"],
  oracle: ["Area Sense", "Read Minds", "Temporal View"],
  puppetry: ["Manipulation", "Marionette", "Transfer"],
  ruin: ["Blast", "Geas", "Warrior"],
  shaping: ["Ambience", "Transmutation", "Vessel"],
  soul: ["Call Spirit", "Figments", "Redefine"]
};
const EXPECTED_MANIFESTATION_MEASURES = ["damage", "range", "targets", "duration", "scale", "detail", "magnitude", "modifier", "area", "trigger"];
const EXPECTED_CHAPTER_FOUR_JOURNAL_PAGES = {
  "Blessings, Curses, and the Skill-Combo System": [175, 176, 177],
  "Skill List": [178, 179, 180, 181, 182],
  "Rolling Dice and Checks": [183, 184, 185, 186],
  "Pantheon Pool, Strength, and Movement": [187, 188, 189],
  "Free Time and Wealth": [190, 191, 192],
  "Interacting with Attachments and Territory": [193, 194, 195]
};
const EXPECTED_CHAPTER_FOUR_CRITICAL_FAILURE_EFFECTS = [
  "Critical Failure: Harm",
  "Critical Failure: New Condition",
  "Critical Failure: Skill Penalty",
  "Critical Failure: Skill Locked",
  "Critical Failure: Lost Materials",
  "Critical Failure: Fragile Item",
  "Critical Failure: False Read",
  "Critical Failure: Attachment Strain",
  "Critical Failure: Lost Free Time",
  "Critical Failure: Enemy Opening",
  "Critical Failure: Unique Consequence"
];
const EXPECTED_CHAPTER_FOUR_ROLL_TABLES = [
  "Possible Critical Failure Effects",
  "Boost Effect Menu",
  "Pantheon Pool Uses",
  "Attachment Interaction Choices",
  "Wealth Cost Tiers"
];
const EXPECTED_CHAPTER_FIVE_JOURNAL_PAGES = {
  "Timing, Initiative, and Turns": [197, 198, 199],
  "Actions and Defenses": [200, 201, 202, 203],
  "Damage, Conditions, and Healing": [204, 205, 206, 207, 208],
  "Armor, Weapons, and Range": [209, 210, 211, 212]
};
const EXPECTED_CHAPTER_FIVE_BATTLE_ACTIONS = {
  fists: {
    "quick-action": ["Feint", "Move", "Prepare", "Pulling Punches", "Resist Condition", "Touch"],
    "standard-action": ["Ambush", "Close Combat Attack", "Disarm", "Grab or Break Grab", "Protect", "Ranged Attack", "Sprint", "Tackle", "Throwing Attack", "Divine Powers"],
    "quick-defense": ["Brace", "Catch", "Prepare"],
    "standard-defense": ["Block", "Dodge", "Run for Cover", "Divine Powers"]
  },
  wits: {
    "quick-action": ["Mislead", "Present Evidence", "Read the Room", "Resist Condition", "Shout Out", "Taunt"],
    "standard-action": ["Compose", "Encourage", "Escalate", "Fast Talk", "Frighten", "Provoke", "Retreat", "Take Something", "Uncomfortable Silence", "Divine Powers"],
    "quick-defense": ["Big Reveal", "Give the Signal", "Um Actually"],
    "standard-defense": ["Laugh It Off", "Stand My Ground", "Turn It Around", "Divine Powers"]
  }
};

installFoundrySourceMocks();

const system = await readJson("system.json");
const packageManifest = await readJson("package.json");
const errors = [];

assertEqual(system.id, SYSTEM_ID, "system id");
assertPackageVersion(system, packageManifest);
assertReleaseUrls(system);
await assertFile("part-time-gods.js", "Main system entry point");
await assertManifestAssets(system);
await assertProductionUxScaffold();
await assertChapterFourRulesScaffold();
await assertChapterFiveCombatScaffold();

const sourceResult = await validatePremadeSourceData();
if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}

console.log(JSON.stringify(sourceResult.summary, null, 2));
console.log("Release validation passed.");

async function assertManifestAssets(manifest) {
  for (const language of manifest.languages ?? []) {
    await assertFile(language.path, "Language file");
    await readJson(language.path).catch(error => errors.push(`Language JSON does not parse: ${language.path}: ${error.message}`));
  }
  for (const esmodule of manifest.esmodules ?? []) await assertFile(esmodule, "Manifest esmodule");
  for (const stylesheet of manifest.styles ?? []) await assertFile(stylesheet, "Manifest stylesheet");
  for (const pack of manifest.packs ?? []) await assertDirectory(pack.path, `Compendium pack: ${pack.name}`);
}

async function assertProductionUxScaffold() {
  const language = await readJson("lang/en.json");
  const requiredLocalizationKeys = [
    "PTG.Settings.ShowGMSetupOnReady.Name",
    "PTG.Settings.ShowGMSetupOnReady.Hint",
    "PTG.Settings.AutoOpenTerritoryInterface.Name",
    "PTG.Settings.AutoOpenTerritoryInterface.Hint",
    "PTG.Settings.GMSetupFirstRunComplete.Name",
    "PTG.Setup.WindowTitle",
    "PTG.Setup.ControlTitle",
    "PTG.Setup.FirstRunHint",
    "PTG.Setup.FirstRunNotification",
    "PTG.Setup.Actions.PopulateCompendia.Label",
    "PTG.Setup.Actions.TerritoryScene.Label",
    "PTG.Setup.Actions.CombatControls.Label",
    "PTG.Setup.Actions.OppositionBuilder.Label",
    "PTG.Setup.Actions.RulesReference.Label",
    "PTG.Help.FreeTime",
    "PTG.Help.Wealth",
    "PTG.Help.PantheonPool",
    "PTG.Help.Fragments",
    "PTG.Help.Spark",
    "PTG.Help.Strain",
    "PTG.Help.Conditions",
    "PTG.Help.ManifestationMeasures"
  ];
  const missingKeys = requiredLocalizationKeys.filter(key => !localizationValue(language, key));
  if (missingKeys.length) errors.push(`Missing production UX localization keys:\n${missingKeys.map(key => `- ${key}`).join("\n")}`);
  const missingMeasureOptions = EXPECTED_MANIFESTATION_MEASURES.filter(key => !localizationValue(language, `PTG.Config.MeasureOptions.${key}`));
  if (missingMeasureOptions.length) {
    errors.push(`Manifestation dialog Measure options missing localization keys:\n${missingMeasureOptions.map(key => `- ${key}`).join("\n")}`);
  }

  const setupModule = await readText("module/apps/gm-setup-panel.mjs");
  for (const token of ["registerGMSetupSettings", "registerGMSetupControls", "maybeOpenFirstRunGMSetup", "showGMSetupOnReady"]) {
    if (!setupModule.includes(token)) errors.push(`GM setup module missing ${token}`);
  }

  const entryPoint = await readText("part-time-gods.js");
  for (const token of ["registerGMSetupSettings()", "registerGMSetupControls()", "maybeOpenFirstRunGMSetup()", "registerTerritoryGridSettings()", "maybeOpenTerritoryInterfaceOnReady()", "openTerritoryInterface", "maybeOpenMortalDivineBalanceTrackerOnReady()", "game.ptg.balance"]) {
    if (!entryPoint.includes(token)) errors.push(`Main entry point missing ${token}`);
  }

  const balanceModule = await readText("module/apps/mortal-divine-tracker.mjs");
  for (const token of ["maybeOpenMortalDivineBalanceTrackerOnReady", "autoOpenMortalDivineTracker", "mortalDivineTrackedCharacters", "visibleBalanceTrackerActors", "normalizeTrackedCharacterUuids", "addTrackedCharacter", "removeTrackedCharacterUuid", "canViewBalanceActor"]) {
    if (!balanceModule.includes(token)) errors.push(`Mortal-Divine tracker module missing ${token}`);
  }

  const balanceTemplate = await readText("templates/apps/mortal-divine-tracker.hbs");
  for (const token of ["is-gm", "is-player", "data-balance-add", "data-balance-remove", "<details class=\"ptg-balance-party-card", "PTG.Balance.PlayerView"]) {
    if (!balanceTemplate.includes(token)) errors.push(`Mortal-Divine tracker template missing ${token}`);
  }

  const territoryModule = await readText("module/apps/territory-grid-app.mjs");
  for (const token of ["registerTerritoryGridSettings", "maybeOpenTerritoryInterfaceOnReady", "autoOpenTerritoryInterface", "openTerritoryScene", "fitTerritorySceneToCanvas", "territorySceneFitPan", "setTerritorySceneBackground", "territorySceneBackgroundUpdateData", "ensureTerritoryGridOverlayForeground", "openTerritoryControls", "territoryPointsFromActor", "dropEventData", "canEditTerritory", "findTerritoryScene", "LOCATION_TYPES", "CONTROL_TYPES", "TERRITORY_STATUSES", "DISCOVERY_STATES", "RITUAL_EVENT_TYPES", "gmNotes", "publicNotes", "footprint", "ritualEvents", "data-territory-background-browse", "wireTerritoryBackgroundDialog", "FilePicker"]) {
    if (!territoryModule.includes(token)) errors.push(`Integrated Territory interface missing ${token}`);
  }

  const territoryTemplate = await readText("templates/apps/territory-grid-app.hbs");
  for (const token of ["data-action=\"view-scene\"", "data-action=\"territory-controls\"", "data-action=\"background\"", "can-drop-actors", "data-territory-drop-root", "controlLabel", "statusLabel", "discoveryLabel", "eventLabel"]) {
    if (!territoryTemplate.includes(token)) errors.push(`Territory GM interface template missing ${token}`);
  }

  const setupTemplate = await readText("templates/apps/gm-setup-panel.hbs");
  for (const token of ["{{firstRunHint}}", "{{action.hint}}", "{{@root.gmBadge}}"]) {
    if (!setupTemplate.includes(token)) errors.push(`GM setup template missing ${token}`);
  }

  const characterTemplate = await readText("templates/actor/character-sheet.hbs");
  const characterSheet = await readText("module/sheets/character-sheet.mjs");
  for (const key of ["PTG.Help.FreeTime", "PTG.Help.Wealth", "PTG.Help.Fragments", "PTG.Help.Spark", "PTG.Help.Strain", "PTG.Help.Conditions", "PTG.Help.ManifestationMeasures"]) {
    if (!characterTemplate.includes(key) && !characterSheet.includes(key)) errors.push(`Character sheet missing localized help key ${key}`);
  }
  for (const token of ["ptg-print-ability-actions", "ptg-print-truth-actions", "ptg-sheet-detail-body"]) {
    if (!characterTemplate.includes(token)) errors.push(`Character sheet ability readability markup missing ${token}`);
  }
  for (const token of ["sheetDetailDisplayHTML", "sanitizeSheetDetailHTML", "decodeSheetDetailEntities", "data-random-god-apply", "identity.divineName", "identity.divineMythSeed"]) {
    if (!characterSheet.includes(token)) errors.push(`Character sheet detail display helper missing ${token}`);
  }

  const characterModel = await readText("module/documents/models/actor/character-model.mjs");
  for (const token of ["divineName", "divineTitle", "divineEpithet", "divineSymbol", "divineOmen", "divineTaboo", "divineOffering", "divineMythSeed", "divineTone"]) {
    if (!characterModel.includes(token)) errors.push(`Character identity model missing ${token}`);
  }

  const randomGodGenerator = await readText("module/util/random-god-generator.mjs");
  for (const token of ["generateDivineIdentity", "divineSymbol", "divineOmen", "divineTaboo", "divineOffering", "divineMythSeed", "divineTone"]) {
    if (!randomGodGenerator.includes(token)) errors.push(`Random god generator missing ${token}`);
  }

  const compendiumModule = await readText("module/data/premade-compendiums.mjs");
  for (const token of ["removeStale: true", "isPremadeItemDocument", "PACKS.items"]) {
    if (!compendiumModule.includes(token)) errors.push(`Premade Item compendium stale-cleanup guard missing ${token}`);
  }

  const pantheonTemplate = await readText("templates/actor/pantheon-sheet.hbs");
  for (const key of ["PTG.Help.PantheonPool", "PTG.Help.Fragments", "PTG.Help.Spark", "PTG.Help.Strain"]) {
    if (!pantheonTemplate.includes(key)) errors.push(`Pantheon sheet missing localized help key ${key}`);
  }
  for (const token of ["data-member-add", "canManageMembers", "member.canOpen", "member.limited"]) {
    if (!pantheonTemplate.includes(token)) errors.push(`Pantheon party sheet missing member-management token ${token}`);
  }

  const pantheonSheet = await readText("module/sheets/pantheon-sheet.mjs");
  for (const token of ["preparePantheonMemberContext", "pantheonMemberAddOptions", "canManagePantheonMembers", "canViewPantheonMemberActor"]) {
    if (!pantheonSheet.includes(token)) errors.push(`Pantheon party sheet missing helper ${token}`);
  }

  const stylesheet = await readText("styles/part-time-gods.css");
  const readableSurfaceTokens = [
    "--ptg-sheet-paper",
    ".part-time-gods.sheet.item .window-content",
    ".part-time-gods.sheet.item :where(input:not([type=\"checkbox\"]), select, textarea)",
    ".ptg-sheet :where(input:not([type=\"checkbox\"]), select, textarea)",
    "min-height: 2.5rem",
    "var(--ptg-sheet-field, #ffffff)",
    "details.ptg-editor-section",
    ".ptg-edit-lock-bar",
    ".ptg-sheet.is-locked",
    "[data-edit][data-ptg-edit-locked=\"true\"]",
    ".ptg-print-ability-actions",
    ".ptg-print-truth-actions button",
    ".ptg-sheet-detail-body",
    ".ptg-editor-section :where(.editor-content, .editor-container, .ProseMirror, [contenteditable=\"true\"])",
    ".part-time-gods.sheet.item :where(.form-group.stacked) .editor",
    ".ptg-condition-create-dialog :where(input:not([type=\"checkbox\"]), select, textarea)",
    ".ptg-career-dialog :where(input:not([type=\"checkbox\"]), select, textarea)",
    ".ptg-attachment-definition-dialog :where(input:not([type=\"checkbox\"]), select, textarea)",
    ".ptg-condition-recovery-dialog :where(input:not([type=\"checkbox\"]), select, textarea)",
    ".ptg-print-title-field input",
    ".ptg-territory-overlay-note",
    ".ptg-territory-grid-app.is-readonly",
    ".ptg-territory-grid-app.can-drop-actors",
    "scrollbar-gutter: stable",
    "min-height: 360px",
    ".ptg-territory-point-details",
    ".ptg-territory-status-contested",
    ".ptg-territory-control-pantheon",
    ".ptg-territory-file-row",
    ".ptg-balance-tracker.is-player",
    ".ptg-balance-body.is-player",
    ".ptg-balance-party-card summary",
    ".ptg-balance-party-card-actions",
    ".ptg-skill-combo-dialog {",
    "max-height: calc(100vh - 32px)",
    ".ptg-skill-combo-dialog .window-content > form",
    ".ptg-skill-combo-dialog .dialog-content",
    ".ptg-skill-combo-dialog [data-application-part=\"footer\"]",
    ".ptg-skill-combo-dialog .ptg-skill-combo-options",
    "overflow-x: hidden",
    "max-height: none"
  ];
  for (const token of readableSurfaceTokens) {
    if (!stylesheet.includes(token)) errors.push(`Readable sheet/dialog stylesheet guard missing ${token}`);
  }

  const itemTemplate = await readText("templates/item/item-sheet.hbs");
  for (const token of ["<details class=\"ptg-editor-section\" open>", "<summary><span>", "<details class=\"ptg-editor-section ptg-rules-explanation\" open>"]) {
    if (!itemTemplate.includes(token)) errors.push(`Item sheet collapsible editor guard missing ${token}`);
  }

  for (const template of [
    "templates/actor/character-sheet.hbs",
    "templates/actor/antagonist-sheet.hbs",
    "templates/actor/pantheon-sheet.hbs",
    "templates/item/item-sheet.hbs"
  ]) {
    const source = await readText(template);
    if (!source.includes("data-ptg-edit-lock-toggle")) errors.push(`${template} missing sheet edit lock toggle`);
    if (!source.includes("sheetLocked") || !source.includes("canEditSheet")) errors.push(`${template} missing sheet edit lock context`);
  }

  const lockHelper = await readText("module/sheets/sheet-edit-lock.mjs");
  for (const token of ["sheetEditLockContext", "wireSheetEditLock", "isSheetEditLocked", "toggleSheetEditLock", "WeakSet", "[data-item-action='toggle-details']"]) {
    if (!lockHelper.includes(token)) errors.push(`Sheet edit lock helper missing ${token}`);
  }
}

async function assertChapterFourRulesScaffold() {
  const entryPoint = await readText("part-time-gods.js");
  if (!entryPoint.includes("easy: 0")) errors.push("Difficulty config missing Chapter 4 Easy (0) tier.");

  const diceEngine = await readText("module/dice/ptg-dice-engine.mjs");
  for (const token of ["successes += 2", "boosts: Math.floor", "criticalConsequenceCount", "ones,"]) {
    if (!diceEngine.includes(token)) errors.push(`Dice engine missing Chapter 4 runtime token ${token}`);
  }

  const characterSheet = await readText("module/sheets/character-sheet.mjs");
  for (const token of ["Support Bonus", "Boost Choice", "repetitionPenalty", "extendedTarget", "opposingSuccesses", "Tool Modifier", "Specialty Bonus", "goingToWork"]) {
    if (!characterSheet.includes(token)) errors.push(`Character sheet roll/resource workflow missing ${token}`);
  }

  const actorDocument = await readText("module/documents/actor/part-time-gods-actor.mjs");
  for (const token of ["adjustDowntimeResources", "goToWork"]) {
    if (!actorDocument.includes(token)) errors.push(`Actor document missing Chapter 4 resource workflow ${token}`);
  }

  const skillConfig = await readText("module/config/skills.mjs");
  for (const token of ["PTG_SKILL_SOURCE", "PTG_SPECIALTY_LIMIT", "specialtyLimit: 2"]) {
    if (!skillConfig.includes(token)) errors.push(`Skill config missing Chapter 4 source metadata ${token}`);
  }
}

async function assertChapterFiveCombatScaffold() {
  const entryPoint = await readText("part-time-gods.js");
  for (const token of ["registerPTGCombatHooks", "openPTGCombatControls", "PartTimeGodsCombatant", "CONFIG.Combatant.documentClass", "CONFIG.Combat.initiative", "quick: \"Quick Action\"", "standard: \"Standard Action\""]) {
    if (!entryPoint.includes(token)) errors.push(`Main entry point/config missing Chapter 5 combat token ${token}`);
  }

  const language = await readJson("lang/en.json");
  for (const key of ["PTG.Config.ActivationTypes.quick", "PTG.Config.ActivationTypes.standard"]) {
    if (!localizationValue(language, key)) errors.push(`Missing Chapter 5 activation localization ${key}`);
  }

  const combat = await readText("module/combat/ptg-combat.mjs");
  for (const token of ["PTG_INITIATIVE_FORMULA", "actorInitiative", "initiativeProcedureHTML", "quickAction", "standardAction", "quickDefense", "standardDefense", "battleFists", "battleWits", "physicalDamage", "mentalDamage", "healing", "rollPTGInitiative", "applyConditionToActor", "conditionCombatModifier"]) {
    if (!combat.includes(token)) errors.push(`Combat workflow missing Chapter 5 token ${token}`);
  }

  const combatant = await readText("module/combat/ptg-combatant.mjs");
  for (const token of ["extends Combatant", "getInitiativeRoll", "PTG_INITIATIVE_FORMULA", "actorInitiative"]) {
    if (!combatant.includes(token)) errors.push(`Combatant workflow missing Chapter 5 token ${token}`);
  }

  const damage = await readText("module/workflows/damage-workflow.mjs");
  for (const token of ["resource === \"psyche\"", "applyArmor", "armorProofBonus", "health", "psyche"]) {
    if (!damage.includes(token)) errors.push(`Damage workflow missing Chapter 5 token ${token}`);
  }

  const conditions = await readText("module/conditions/condition-workflow.mjs");
  for (const token of ["condition-reduce", "condition-recover", "increase", "replace", "separate"]) {
    if (!conditions.includes(token)) errors.push(`Condition workflow missing Chapter 5 token ${token}`);
  }

  const characterTemplate = await readText("templates/actor/character-sheet.hbs");
  for (const token of ["data-item-action=\"condition-reduce\"", "data-item-action=\"condition-increase\"", "data-item-action=\"condition-recover\""]) {
    if (!characterTemplate.includes(token)) errors.push(`Character sheet missing Condition action ${token}`);
  }
}

function assertReleaseUrls(manifest) {
  if (!/^https:\/\/github\.com\/VentysGrimm\/Part-Time-Gods\/releases\/latest\/download\/system\.json$/.test(String(manifest.manifest ?? ""))) {
    errors.push(`Manifest URL should point at the live GitHub Release system.json: ${manifest.manifest}`);
  }
  const expectedDownload = `https://github.com/VentysGrimm/Part-Time-Gods/releases/download/v${manifest.version}/${manifest.id}-${manifest.version}.zip`;
  if (String(manifest.download ?? "") !== expectedDownload) {
    errors.push(`Download URL should point at the v${manifest.version} GitHub Release ZIP: ${manifest.download}`);
  }
}

function assertPackageVersion(manifest, packageData) {
  if (String(packageData.version ?? "") !== String(manifest.version ?? "")) {
    errors.push(`package.json version must match system.json version ${manifest.version}: ${packageData.version}`);
  }
}

async function validatePremadeSourceData() {
  const [
    actors,
    items,
    choices,
    journals,
    rollTables,
    scenes,
    macros
  ] = await Promise.all([
    importModule("module/data/premade-actors.mjs"),
    importModule("module/data/premade-items.mjs"),
    importModule("module/data/premade-choices.mjs"),
    importModule("module/data/premade-journals.mjs"),
    importModule("module/data/premade-roll-tables.mjs"),
    importModule("module/data/premade-scenes.mjs"),
    importModule("module/data/premade-macros.mjs")
  ]);

  const journalDocuments = await journals.getPremadeJournals();
  const sceneDocuments = scenes.getPremadeScenes();
  const documents = {
    actors: actors.PTG_PREMADE_ACTORS,
    items: items.PTG_PREMADE_ITEMS,
    choices: choices.PTG_PREMADE_CHOICES,
    journals: journalDocuments,
    rollTables: rollTables.PTG_PREMADE_ROLL_TABLES,
    scenes: sceneDocuments,
    macros: macros.PTG_PREMADE_MACROS
  };

  const summary = {
    actors: documents.actors.length,
    items: documents.items.length,
    choices: documents.choices.length,
    journals: documents.journals.length,
    rollTables: documents.rollTables.length,
    scenes: documents.scenes.length,
    macros: documents.macros.length,
    stableSourceKeys: true
  };
  const emptyFamilies = Object.entries(summary)
    .filter(([key, value]) => key !== "stableSourceKeys" && Number(value) <= 0)
    .map(([key]) => key);
  if (emptyFamilies.length) errors.push(`Empty premade data families: ${emptyFamilies.join(", ")}`);

  const missingStableKeys = [];
  for (const [family, familyDocuments] of Object.entries(documents)) {
    for (const document of familyDocuments) {
      if (!hasStableSourceKey(document)) missingStableKeys.push(`${family}:${document.type ?? document.documentName ?? "document"}:${document.name}`);
    }
  }
  if (missingStableKeys.length) errors.push(`Missing stable source keys:\n${missingStableKeys.map(key => `- ${key}`).join("\n")}`);

  const missingSystemSourceKeys = itemSystemSourceKeyAudit([...documents.items, ...documents.choices]);
  if (missingSystemSourceKeys.length) {
    errors.push(`Item documents missing system.slug/system.sourceId:\n${missingSystemSourceKeys.map(key => `- ${key}`).join("\n")}`);
  }

  const weakItems = weakItemExplanations(documents.items);
  if (weakItems.length) errors.push(`Weak premade Item explanations:\n${weakItems.map(key => `- ${key}`).join("\n")}`);

  const invalidSceneDrawings = sceneDrawingSchemaAudit(sceneDocuments);
  if (invalidSceneDrawings.length) {
    errors.push(`Premade Scene drawings are not Foundry v14-ready:\n${invalidSceneDrawings.map(key => `- ${key}`).join("\n")}`);
  }

  const rulesAudit = rulesJournalTextAudit(journalDocuments);
  if (rulesAudit.missingSafeSummary.length) {
    errors.push(`Rules reference pages missing safeSummary flags:\n${rulesAudit.missingSafeSummary.map(key => `- ${key}`).join("\n")}`);
  }
  if (rulesAudit.totalWords > 12000 || rulesAudit.largestPageWords > 900) {
    errors.push(`Rules reference text is too large for release-safe summaries: totalWords=${rulesAudit.totalWords}, largestPageWords=${rulesAudit.largestPageWords}`);
  }

  const pregenAudit = backersPregensAudit(documents.actors);
  if (pregenAudit.unsafe.length) {
    errors.push(`Backers' Pregens must remain metadata-only until permission is confirmed:\n${pregenAudit.unsafe.map(key => `- ${key}`).join("\n")}`);
  }

  const manifestationAudit = manifestationApplicationAudit(documents.items);
  if (manifestationAudit.missing.length) {
    errors.push(`Missing Chapter 3 manifestation application Items:\n${manifestationAudit.missing.map(key => `- ${key}`).join("\n")}`);
  }
  if (manifestationAudit.missingMetadata.length) {
    errors.push(`Manifestation application Items missing roll metadata:\n${manifestationAudit.missingMetadata.map(key => `- ${key}`).join("\n")}`);
  }
  if (manifestationAudit.missingMeasures.length) {
    errors.push(`Manifestation measure metadata missing:\n${manifestationAudit.missingMeasures.map(key => `- ${key}`).join("\n")}`);
  }

  const chapterFourAudit = chapterFourRulesAudit(documents.items, documents.rollTables, documents.journals);
  if (chapterFourAudit.misplacedRuleItems.length) {
    errors.push(`Chapter 4 reference content should be JournalEntry pages, not Items:\n${chapterFourAudit.misplacedRuleItems.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFourAudit.missingJournalPages.length) {
    errors.push(`Missing Chapter 4 rules JournalEntry pages:\n${chapterFourAudit.missingJournalPages.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFourAudit.missingCriticalFailureEffects.length) {
    errors.push(`Missing Chapter 4 Critical Failure consequence Conditions:\n${chapterFourAudit.missingCriticalFailureEffects.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFourAudit.missingRollTables.length) {
    errors.push(`Missing Chapter 4 procedural RollTables:\n${chapterFourAudit.missingRollTables.map(key => `- ${key}`).join("\n")}`);
  }

  const chapterFiveAudit = chapterFiveBattleAudit(documents.items, documents.journals);
  if (chapterFiveAudit.misplacedRuleItems.length) {
    errors.push(`Chapter 5 battle reference content should be JournalEntry pages, not Items:\n${chapterFiveAudit.misplacedRuleItems.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFiveAudit.missingJournalPages.length) {
    errors.push(`Missing Chapter 5 battle JournalEntry pages:\n${chapterFiveAudit.missingJournalPages.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFiveAudit.missingActions.length) {
    errors.push(`Missing Chapter 5 Battle action/defense Items:\n${chapterFiveAudit.missingActions.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFiveAudit.missingActionMetadata.length) {
    errors.push(`Chapter 5 Battle action Items missing roll metadata:\n${chapterFiveAudit.missingActionMetadata.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFiveAudit.missingGearFamilies.length) {
    errors.push(`Chapter 5 gear/condition families incomplete:\n${chapterFiveAudit.missingGearFamilies.map(key => `- ${key}`).join("\n")}`);
  }

  const importFacingMacros = documents.macros
    .filter(macro => /\bimport\b|populate compendiums/i.test(`${macro.name} ${macro.command} ${macro.flags?.[SYSTEM_ID]?.summary ?? ""}`))
    .map(macro => macro.name);
  if (importFacingMacros.length) errors.push(`Import-facing macros should stay workflow-only: ${importFacingMacros.join(", ")}`);

  const primaryMacros = documents.macros
    .filter(macro => macro.flags?.[SYSTEM_ID]?.kind === "workflow-macro")
    .filter(macro => {
      const flags = macro.flags?.[SYSTEM_ID] ?? {};
      return flags.compatibilityLauncher !== true
        || !flags.nativeHome
        || !/compatibility launcher/i.test(flags.summary ?? "");
    })
    .map(macro => macro.name);
  if (primaryMacros.length) errors.push(`Workflow macros must declare compatibility launcher metadata and a native UI home:\n${primaryMacros.map(name => `- ${name}`).join("\n")}`);

  const territoryMacroDrift = documents.macros
    .filter(macro => ["PTG: Create Territory Scene", "PTG: Territory Controls"].includes(macro.name))
    .filter(macro => !String(macro.command ?? "").includes("openTerritoryInterface"))
    .map(macro => macro.name);
  if (territoryMacroDrift.length) errors.push(`Territory workflow macros must launch the unified Territory interface:\n${territoryMacroDrift.map(name => `- ${name}`).join("\n")}`);

  return { summary };
}

function backersPregensAudit(actors) {
  const unsafe = actors
    .filter(actor => actor.flags?.[SYSTEM_ID]?.kind === "backers-pregen")
    .map(actor => {
      const system = actor.system ?? {};
      const skillTotal = Object.values(system.skills ?? {}).reduce((total, value) => total + Number(value ?? 0), 0);
      const manifestationTotal = Object.values(system.manifestations ?? {}).reduce((total, value) => total + Number(value ?? 0), 0);
      const embeddedItems = actor.items?.length ?? 0;
      const notesWords = plainWordCount(system.notes ?? "");
      const licensingStatus = actor.flags?.[SYSTEM_ID]?.licensingStatus ?? "";
      const hasSourceStats = skillTotal > 0
        || manifestationTotal > 0
        || embeddedItems > 0
        || Number(system.derived?.initiative ?? 0) > 0
        || Number(system.derived?.strength ?? 0) > 0
        || Number(system.derived?.movement ?? 0) > 0
        || Number(system.resources?.freeTime ?? 0) > 0
        || Number(system.resources?.wealth ?? 0) > 0;
      if (licensingStatus === "metadata-only" && !hasSourceStats && notesWords <= 45) return null;
      return `${actor.name}: licensingStatus=${licensingStatus || "missing"}, embeddedItems=${embeddedItems}, notesWords=${notesWords}`;
    })
    .filter(Boolean);

  return { unsafe };
}

function manifestationApplicationAudit(items) {
  const expected = Object.entries(EXPECTED_MANIFESTATION_APPLICATIONS)
    .flatMap(([manifestation, names]) => names.map(name => ({
      manifestation,
      name,
      sourceId: `ptg2e.chapter-3.manifestation.${manifestation}.${sourceSlug(name)}`
    })));
  const applications = items.filter(item => item.type === "power" && item.flags?.[SYSTEM_ID]?.kind === "manifestation-application");
  const bySourceId = new Map(applications.map(item => [item.system?.sourceId ?? item.flags?.[SYSTEM_ID]?.sourceId, item]));
  const missing = expected
    .filter(({ sourceId }) => !bySourceId.has(sourceId))
    .map(({ manifestation, name }) => `${manifestation}:${name}`);
  const missingMetadata = applications
    .filter(item => {
      const roll = item.system?.automation?.roll ?? {};
      return roll.type !== "manifestation"
        || !roll.manifestation
        || !roll.application
        || !Array.isArray(roll.suggestedSkills)
        || !roll.suggestedSkills.length
        || !Array.isArray(roll.commonMeasures)
        || !roll.commonMeasures.length;
    })
    .map(item => item.name);
  const measureSet = new Set();
  for (const item of applications) {
    const roll = item.system?.automation?.roll ?? {};
    for (const measure of roll.measures ?? []) measureSet.add(measure);
    for (const measure of roll.commonMeasures ?? []) measureSet.add(measure);
  }
  const missingMeasures = EXPECTED_MANIFESTATION_MEASURES.filter(measure => !measureSet.has(measure));

  return { missing, missingMetadata, missingMeasures };
}

function chapterFourRulesAudit(items, rollTables, journals) {
  const misplacedRuleItems = items
    .filter(item => item.type === "power" && item.flags?.[SYSTEM_ID]?.kind === "chapter-4-rule")
    .map(item => item.name);
  const criticalEffectsBySourceId = new Map(
    items
      .filter(item => item.type === "condition" && item.flags?.[SYSTEM_ID]?.kind === "critical-failure-effect")
      .map(item => [item.system?.sourceId ?? item.flags?.[SYSTEM_ID]?.sourceId, item])
  );
  const missingJournalPages = missingRulesJournalPages(journals, EXPECTED_CHAPTER_FOUR_JOURNAL_PAGES);
  const missingCriticalFailureEffects = EXPECTED_CHAPTER_FOUR_CRITICAL_FAILURE_EFFECTS
    .filter(name => !criticalEffectsBySourceId.has(`ptg2e.chapter-4.critical-failure.${sourceSlug(name)}`));
  const tableNames = new Set(rollTables.map(table => table.name));
  const missingRollTables = EXPECTED_CHAPTER_FOUR_ROLL_TABLES.filter(name => !tableNames.has(name));

  return { misplacedRuleItems, missingJournalPages, missingCriticalFailureEffects, missingRollTables };
}

function chapterFiveBattleAudit(items, journals) {
  const misplacedRuleItems = items
    .filter(item => item.type === "power" && item.flags?.[SYSTEM_ID]?.kind === "chapter-5-rule")
    .map(item => item.name);
  const actionsBySourceId = new Map(
    items
      .filter(item => item.type === "power" && item.flags?.[SYSTEM_ID]?.kind === "battle-action")
      .map(item => [item.system?.sourceId ?? item.flags?.[SYSTEM_ID]?.sourceId, item])
  );
  const missingJournalPages = missingRulesJournalPages(journals, EXPECTED_CHAPTER_FIVE_JOURNAL_PAGES);
  const expectedActions = Object.entries(EXPECTED_CHAPTER_FIVE_BATTLE_ACTIONS)
    .flatMap(([battle, groups]) => Object.entries(groups)
      .flatMap(([actionType, names]) => names.map(name => ({
        battle,
        actionType,
        name,
        sourceId: `ptg2e.chapter-5.${battle}.${actionType}.${sourceSlug(name)}`
      }))));
  const missingActions = expectedActions
    .filter(({ sourceId }) => !actionsBySourceId.has(sourceId))
    .map(({ battle, actionType, name }) => `${battle}:${actionType}:${name}`);
  const missingActionMetadata = [...actionsBySourceId.values()]
    .filter(item => {
      const roll = item.system?.automation?.roll ?? {};
      return roll.type !== "battle-action"
        || !roll.battle
        || !roll.actionType
        || !roll.actionName
        || !["quick", "standard"].includes(item.system?.activation)
        || !["health", "psyche"].includes(roll.damageResource);
    })
    .map(item => item.name);
  const chapterFiveItems = items.filter(item => {
    const page = Number(item.flags?.[SYSTEM_ID]?.page ?? item.system?.sourcePage ?? 0);
    return page >= 205 && page <= 212;
  });
  const familyCounts = chapterFiveItems.reduce((counts, item) => {
    counts[item.type] = (counts[item.type] ?? 0) + 1;
    return counts;
  }, {});
  const missingGearFamilies = [
    ["condition", 20],
    ["gearQuality", 42],
    ["armor", 14],
    ["weapon", 9]
  ]
    .filter(([type, minimum]) => Number(familyCounts[type] ?? 0) < minimum)
    .map(([type, minimum]) => `${type}: expected at least ${minimum}, got ${Number(familyCounts[type] ?? 0)}`);

  return { misplacedRuleItems, missingJournalPages, missingActions, missingActionMetadata, missingGearFamilies };
}

function missingRulesJournalPages(journals, expectedPages) {
  const pagesByName = new Map(
    journals.flatMap(journal => (journal.pages ?? []).map(page => [page.name, page]))
  );

  return Object.entries(expectedPages)
    .filter(([name, expectedSourcePages]) => {
      const page = pagesByName.get(name);
      if (!page) return true;

      const sourcePages = new Set(page.flags?.[SYSTEM_ID]?.sourcePages ?? []);
      return expectedSourcePages.some(sourcePage => !sourcePages.has(sourcePage));
    })
    .map(([name]) => name);
}

function rulesJournalTextAudit(journals) {
  const pages = journals.flatMap(journal => (journal.pages ?? []).map(page => ({ journal, page })));
  const missingSafeSummary = pages
    .filter(({ page }) => !page.flags?.[SYSTEM_ID]?.safeSummary)
    .map(({ journal, page }) => `${journal.name}:${page.name}`);
  const wordCounts = pages.map(({ page }) => plainWordCount(page.text?.content ?? ""));

  return {
    totalWords: wordCounts.reduce((total, count) => total + count, 0),
    largestPageWords: wordCounts.length ? Math.max(...wordCounts) : 0,
    missingSafeSummary
  };
}

function hasStableSourceKey(document) {
  const flags = document?.flags?.[SYSTEM_ID] ?? {};
  return Boolean(flags.slug && flags.sourceId);
}

function itemSystemSourceKeyAudit(documents) {
  return documents
    .filter(document => !document.system?.slug || !document.system?.sourceId)
    .map(document => `${document.type}:${document.name}`);
}

function weakItemExplanations(documents) {
  return documents
    .map(document => {
      const systemData = document.system ?? {};
      return {
        type: document.type,
        name: document.name,
        length: plainTextLength(
          systemData.description,
          systemData.effect,
          systemData.benefit,
          systemData.notes,
          systemData.rules?.summary,
          systemData.rules?.fullText
        )
      };
    })
    .filter(entry => entry.length < 420)
    .map(entry => `${entry.type}:${entry.name}:${entry.length}`);
}

function sceneDrawingSchemaAudit(scenes) {
  return scenes.flatMap(scene => (scene.drawings ?? [])
    .filter(drawing =>
      !/^[A-Za-z0-9]{16}$/.test(String(drawing.author ?? "")) ||
      drawing.shape?.type !== "r"
    )
    .map(drawing => `${scene.name}:${drawing.name}:author=${drawing.author ?? "missing"}:shape=${drawing.shape?.type ?? "missing"}`));
}

function plainTextLength(...values) {
  return values
    .filter(Boolean)
    .join(" ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .length;
}

function plainWordCount(...values) {
  const text = values
    .filter(Boolean)
    .join(" ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(/\s+/).length : 0;
}

async function importModule(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

async function readJson(relativePath) {
  const content = await fs.readFile(path.join(root, relativePath), "utf8");
  return JSON.parse(content.replace(/^\uFEFF/, ""));
}

async function readText(relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

function localizationValue(language, key) {
  return key.split(".").reduce((value, part) => value?.[part], language);
}

function sourceSlug(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function exists(relativePath) {
  try {
    await fs.stat(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function assertFile(relativePath, label) {
  try {
    const stats = await fs.stat(path.join(root, relativePath));
    if (!stats.isFile()) errors.push(`${label} is not a file: ${relativePath}`);
  } catch {
    errors.push(`${label} does not exist: ${relativePath}`);
  }
}

async function assertDirectory(relativePath, label) {
  try {
    const stats = await fs.stat(path.join(root, relativePath));
    if (!stats.isDirectory()) errors.push(`${label} is not a directory: ${relativePath}`);
  } catch {
    errors.push(`${label} does not exist: ${relativePath}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) errors.push(`Invalid ${label}: expected ${expected}, got ${actual}`);
}

function installFoundrySourceMocks() {
  globalThis.CONST = {
    DRAWING_FILL_TYPES: { SOLID: 1 },
    GRID_TYPES: { SQUARE: 1 },
    JOURNAL_ENTRY_PAGE_FORMATS: { HTML: 1 }
  };
  globalThis.foundry = {
    applications: {
      api: {
        ApplicationV2: class {},
        DialogV2: class {},
        HandlebarsApplicationMixin: Base => Base
      }
    },
    data: {
      ShapeData: {
        TYPES: { RECTANGLE: "r" }
      }
    },
    utils: {
      getRoute(route) {
        const relative = String(route).startsWith(ROUTE_PREFIX)
          ? String(route).slice(ROUTE_PREFIX.length)
          : String(route);
        return pathToFileURL(path.join(root, relative)).href;
      }
    }
  };
  globalThis.fetch = async route => {
    const filePath = String(route).startsWith("file:")
      ? fileURLToPath(route)
      : path.join(root, String(route));
    const content = (await fs.readFile(filePath, "utf8")).replace(/^\uFEFF/, "");
    return {
      ok: true,
      json: async () => JSON.parse(content)
    };
  };
}
