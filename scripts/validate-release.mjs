import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { auditCreatedItemDocuments, itemAuditHasIssues, itemAuditIssueLines } from "../module/data/premade-item-audit.mjs";

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
  "Critical Failure Effects": [176, 177],
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
  "Battle of Fists Actions and Defenses": [200, 201, 202],
  "Battle of Wits Actions and Defenses": [202, 203],
  "Damage, Conditions, and Healing": [204, 205, 206, 207, 208],
  "Armor, Weapons, and Range": [209, 210, 211, 212],
  "Gear Qualities: Armor and General": [209, 210, 211, 212],
  "Gear Qualities: Weapon": [210, 211, 212]
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
const RULES_JOURNAL_MIN_PAGE_WORDS = 85;
const RULES_JOURNAL_BOILERPLATE_PATTERN = /curated Foundry play aid|preserves source-page lookup metadata|Use the original rulebook|complete rules text/i;
const RULES_JOURNAL_EXTRACTOR_ARTIFACT_PATTERN = /DescTeHnEding|DeCsrceeantidnigng|OPSPtOoSrITmION/i;
installFoundrySourceMocks();

const system = await readJson("system.json");
const packageManifest = await readJson("package.json");
const errors = [];

assertEqual(system.id, SYSTEM_ID, "system id");
assertPackageVersion(system, packageManifest);
assertReleaseUrls(system);
await assertReleaseZipBuilderScaffold();
await assertManualQAGateScaffold();
await assertFile("part-time-gods.js", "Main system entry point");
await assertManifestAssets(system);
await assertProductionUxScaffold();
await assertChapterFourRulesScaffold();
await assertChapterFiveCombatScaffold();
await assertPremadeItemFolderScaffold();

const sourceResult = await validatePremadeSourceData();
if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}

console.log(JSON.stringify(sourceResult.summary, null, 2));
console.log("Release validation passed.");

async function assertManifestAssets(manifest) {
  if (manifest.socket !== true) errors.push("System manifest must enable package sockets with socket: true for player-facing GM controls");
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
  for (const token of ["registerGMSetupSettings()", "registerGMSetupControls()", "maybeOpenFirstRunGMSetup()", "registerTerritoryGridSettings()", "maybeOpenTerritoryInterfaceOnReady()", "openTerritoryInterface", "maybeOpenMortalDivineBalanceTrackerOnReady()", "registerMortalDivineTrackerSocket()", "openMortalDivineBalancePlayerBar", "showMortalDivineBalanceBarToOwners", "game.ptg.territory", "game.ptg.balance", "restoreIntegratedModuleApis", "setTimeout?.(restoreIntegratedModuleApis"]) {
    if (!entryPoint.includes(token)) errors.push(`Main entry point missing ${token}`);
  }

  const balanceModule = await readText("module/apps/mortal-divine-tracker.mjs");
  for (const token of ["maybeOpenMortalDivineBalanceTrackerOnReady", "autoOpenMortalDivineTracker", "mortalDivineTrackedCharacters", "visibleBalanceTrackerActors", "normalizeTrackedCharacterUuids", "balanceActorFromDropData", "addTrackedCharacter", "removeTrackedCharacterUuid", "canViewBalanceActor", "balanceBarOwnerUsers", "registerMortalDivineTrackerSocket", "openMortalDivineBalancePlayerBar", "showMortalDivineBalanceBarToOwners", "mortalDivineBalance.showPlayerBar", "#onClick", "Object.hasOwn(button.dataset, \"balanceAction\")", "root.addEventListener(\"click\", event => this.#onClick(event))", "#onDragOver", "root.addEventListener(\"drop\", event => this.#onDrop(event), true)"]) {
    if (!balanceModule.includes(token)) errors.push(`Mortal-Divine tracker module missing ${token}`);
  }

  const balanceTemplate = await readText("templates/apps/mortal-divine-tracker.hbs");
  for (const token of ["is-gm", "is-player", "is-player-bar", "data-balance-player-view", "data-balance-player-bar", "data-balance-show-player", "data-balance-add", "data-balance-remove", "<details class=\"ptg-balance-party-card", "PTG.Balance.PlayerView", "PTG.Balance.ShowPlayerBar", "PTG.Balance.PlayerBarContext"]) {
    if (!balanceTemplate.includes(token)) errors.push(`Mortal-Divine tracker template missing ${token}`);
  }

  const territoryModule = await readText("module/apps/territory-grid-app.mjs");
  for (const token of ["registerTerritoryGridSettings", "maybeOpenTerritoryInterfaceOnReady", "autoOpenTerritoryInterface", "openTerritoryScene", "fitTerritorySceneToCanvas", "territorySceneFitPan", "setTerritorySceneBackground", "territorySceneBackgroundUpdateData", "ensureTerritoryGridOverlayForeground", "openTerritoryControls", "territoryPointsFromActor", "getDragEventData", "root.addEventListener(\"drop\", event => this.#onDrop(event), true)", "canEditTerritory", "findTerritoryScene", "LOCATION_TYPES", "CONTROL_TYPES", "TERRITORY_STATUSES", "DISCOVERY_STATES", "RITUAL_EVENT_TYPES", "gmNotes", "publicNotes", "footprint", "ritualEvents", "data-territory-background-browse", "wireTerritoryBackgroundDialog", "territoryFilePickerClass", "FilePicker", "implementation"]) {
    if (!territoryModule.includes(token)) errors.push(`Integrated Territory interface missing ${token}`);
  }

  const territoryTemplate = await readText("templates/apps/territory-grid-app.hbs");
  for (const token of ["data-action=\"view-scene\"", "data-action=\"territory-controls\"", "data-action=\"background\"", "can-drop-actors", "data-territory-drop-root", "controlLabel", "statusLabel", "discoveryLabel", "eventLabel"]) {
    if (!territoryTemplate.includes(token)) errors.push(`Territory GM interface template missing ${token}`);
  }

  const dropDataModule = await readText("module/util/drop-data.mjs");
  for (const token of ["parseDataTransfer", "application/json", "text/html", "data-uuid", "dropDataFromUuid", "data._id", "decodeHTMLAttribute"]) {
    if (!dropDataModule.includes(token)) errors.push(`Shared drop-data helper missing ${token}`);
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
  for (const token of ["sheetDetailDisplayHTML", "sanitizeSheetDetailHTML", "decodeSheetDetailEntities", "itemAutomationSummary", "Automation Hook", "data-random-god-apply", "data-random-god-preview", "randomGodPreviewHTML", "identity.divineName", "identity.divineMythSeed"]) {
    if (!characterSheet.includes(token)) errors.push(`Character sheet detail display helper missing ${token}`);
  }
  for (const token of ["#wireScrollPersistence", "#captureActivePageScroll", "#pendingScrollAnchorItemId", "captureCurrent: false", "scrollIntoView"]) {
    if (!characterSheet.includes(token)) errors.push(`Character sheet scroll persistence missing ${token}`);
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
  for (const token of ["ptg-panel-section ptg-pantheon-tools", "ptg-panel-section ptg-pantheon-members", "data-member-add", "canManageMembers", "member.canOpen", "member.limited"]) {
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
    ".part-time-gods.sheet.item .window-content > form",
    "max-width: calc(100vw - 16px)",
    "max-height: calc(100vh - 16px)",
    ".part-time-gods.sheet.item :where(input:not([type=\"checkbox\"]), select, textarea)",
    ".part-time-gods.sheet.item .ptg-header .profile-img",
    ".part-time-gods.sheet.item :where(textarea[readonly])",
    ".part-time-gods.sheet.item :where(input:not([type=\"checkbox\"])[readonly])",
    ".ptg-sheet :where(input:not([type=\"checkbox\"]), select, textarea)",
    ".ptg-sheet .ptg-long-field",
    ".ptg-panel-section",
    ".ptg-compact-sheet > :where(header, nav, section)",
    ".part-time-gods.sheet.pantheon .ptg-compact-sheet > *",
    "flex-shrink: 0 !important",
    ".part-time-gods.sheet.pantheon .ptg-compact-sheet > .ptg-editor-section",
    "min-height: max-content",
    "overflow-x: auto",
    "text-overflow: clip",
    "min-height: 2.5rem",
    "var(--ptg-sheet-field, #ffffff)",
    "details.ptg-editor-section",
    ".ptg-edit-lock-bar",
    ".ptg-sheet.is-locked",
    ".ptg-sheet.is-locked :where(textarea[readonly])",
    "[data-edit][data-ptg-edit-locked=\"true\"]",
    ".ptg-print-ability-actions",
    ".ptg-print-truth-actions button",
    ".ptg-sheet-detail-body",
    ".ptg-item-row > *",
    "grid-template-columns: 36px minmax(0, 1fr) minmax(0, 1.1fr) minmax(7rem, auto)",
    ".ptg-item-main .ptg-item-summary",
    ".ptg-item-details > :where(div, .ptg-sheet-detail)",
    ".ptg-print-attachment-row > span",
    ".ptg-item-actions button",
    ".ptg-random-god-preview",
    ".ptg-editor-section :where(.editor-content, .editor-container, .ProseMirror, [contenteditable=\"true\"])",
    ".part-time-gods.sheet.item :where(.form-group.stacked) .editor",
    "form.part-time-gods.sheet.item.ptg-power-sheet",
    "form.part-time-gods.sheet.item.domain-sheet",
    ".part-time-gods.sheet.item .sheet-body > .tab.active",
    ".part-time-gods.sheet.item .ptg-tabs a",
    ".ptg-condition-create-dialog :where(input:not([type=\"checkbox\"]), select, textarea)",
    ".ptg-career-dialog :where(input:not([type=\"checkbox\"]), select, textarea)",
    ".ptg-attachment-definition-dialog :where(input:not([type=\"checkbox\"]), select, textarea)",
    ".ptg-condition-recovery-dialog :where(input:not([type=\"checkbox\"]), select, textarea)",
    ".ptg-print-title-field input",
    ".ptg-print-title-field .ptg-print-display",
    "grid-template-columns: minmax(6.75rem, 8.75rem) minmax(0, 1fr)",
    "min-block-size: 46px",
    "font-size: clamp(15px, 5cqw, 20px)",
    "isolation: isolate",
    "z-index: 1",
    "background-attachment: local",
    "background-clip: padding-box",
    "background-origin: padding-box",
    "background-repeat: repeat-y",
    "--ptg-lined-row-height: 36px",
    "--ptg-lined-row-height: 30px",
    "--ptg-lined-row-height: 40px",
    "background-image: linear-gradient(",
    "background-size: 100% var(--ptg-lined-row-height)",
    "var(--ptg-lined-rule-color)",
    "overflow-x: hidden",
    "overscroll-behavior: contain",
    "scrollbar-width: thin",
    "contain: paint",
    "word-break: normal",
    ".part-time-gods img[data-fallback-src]",
    ".part-time-gods :where(img[data-fallback-src], .profile-img",
    ".ptg-pantheon-member img",
    ".ptg-balance-party-card img",
    ".ptg-balance-actor img",
    "aspect-ratio: 1 / 1",
    "object-fit: contain",
    "object-position: center",
    "image-rendering: auto",
    "inline-size: auto !important",
    "max-inline-size: min(100%, 24rem)",
    "max-inline-size: min(100%, 18rem)",
    "max-block-size: 12rem",
    "max-height: 22rem",
    ".ptg-print-ability-list",
    ".ptg-print-truth-list",
    "max-height: 18rem",
    ".ptg-editor-section :where(figure, picture, svg, canvas, video)",
    ".ptg-editor-section :where(hr)",
    ".ptg-editor-section :where(th, td)",
    ".ptg-sheet-detail-body :where(img)",
    "width: fit-content",
    "border: 1px solid rgba(17, 17, 17, 0.35)",
    ".ptg-character-sheet .ptg-print-page .ptg-sheet-detail-body :where(hr)",
    ".ptg-character-sheet .ptg-print-page .ptg-item-details :where(figure, picture, svg, canvas, video)",
    ".ptg-character-sheet .ptg-print-page .ptg-editor-section :where(th, td)",
    ".ptg-character-sheet .ptg-print-page .ptg-item-details :where(img)",
    ".ptg-score-value",
    ".ptg-creator-attachment-grid",
    ".ptg-creator-attachment-row",
    ".ptg-creator-attachment-notes",
    ".ptg-creator-review",
    ".ptg-creator-steps button.ptg-creator-step-review",
    ".ptg-creator-dialog fieldset.ptg-creator-fieldset-review",
    ".ptg-territory-overlay-note",
    ".ptg-territory-grid-app.is-readonly",
    ".ptg-territory-grid-app.can-drop-actors",
    ".ptg-territory-cell .ptg-territory-point-main strong",
    ".ptg-territory-cell .ptg-territory-point-delete",
    "text-overflow: ellipsis",
    "word-break: keep-all",
    "scrollbar-gutter: stable",
    "min-height: 360px",
    ".ptg-territory-point-details",
    ".ptg-territory-status-contested",
    ".ptg-territory-control-pantheon",
    ".ptg-territory-file-row",
    ".ptg-balance-tracker-window,",
    ".ptg-balance-player-bar-window",
    "max-width: calc(100vw - 24px)",
    "max-height: calc(100vh - 32px)",
    "container-type: inline-size",
    ".ptg-balance-tracker.is-player",
    ".ptg-balance-tracker.is-player-bar",
    ".ptg-balance-body.is-player",
    ".ptg-balance-body.is-player-bar",
    ".ptg-balance-body.is-player .ptg-balance-detail",
    ".ptg-balance-body.is-player-bar .ptg-balance-detail",
    ".ptg-balance-party-list",
    "@container (max-width: 680px)",
    ".ptg-balance-party-card summary",
    ".ptg-balance-party-card-actions",
    "position: sticky",
    ".ptg-skill-combo-dialog {",
    "height: min(720px, calc(100vh - 32px))",
    "max-height: calc(100vh - 32px)",
    ".ptg-skill-combo-dialog .window-content > form",
    ".ptg-skill-combo-dialog .window-content > .standard-form",
    "flex-direction: column",
    ".ptg-skill-combo-dialog .dialog-content",
    ".ptg-skill-combo-dialog [data-application-part=\"footer\"]",
    ".ptg-skill-combo-dialog .ptg-skill-combo-scroll",
    "max-height: min(100%, calc(100vh - 180px))",
    "padding-right: 4px",
    ".ptg-skill-combo-dialog .ptg-skill-combo-options",
    "overflow-x: hidden",
    "overflow-y: auto",
    "max-height: 100%",
    "max-height: min(100%, clamp(160px, calc(100vh - 180px), 560px))",
    ".ptg-combat-dialog-window",
    ":is(.application, .app, .window-app):has(.ptg-combat-dialog) .dialog-content",
    ":is(.application, .app, .window-app):has(.ptg-combat-dialog) [data-application-part=\"footer\"]",
    ":is(.application, .app, .window-app):has(.ptg-combat-dialog) .dialog-buttons",
    ".ptg-combat-dialog-window .ptg-combat-dialog",
    "max-height: min(100%, calc(100vh - 180px))",
    "scrollbar-gutter: stable"
  ];
  for (const token of readableSurfaceTokens) {
    if (!stylesheet.includes(token)) errors.push(`Readable sheet/dialog stylesheet guard missing ${token}`);
  }

  const itemTemplate = await readText("templates/item/item-sheet.hbs");
  for (const token of [
    "<details class=\"ptg-editor-section\" open>",
    "<summary><span>",
    "<details class=\"ptg-editor-section ptg-rules-explanation\" open>",
    "class=\"ptg-long-field\"",
    "data-fallback-src=\"{{itemImageFallback}}\"",
    "alt=\"{{item.name}}\""
  ]) {
    if (!itemTemplate.includes(token)) errors.push(`Item sheet collapsible editor guard missing ${token}`);
  }

  const legacyItemTemplates = [
    ["templates/item/power-sheet.hbs", "ptg-power-sheet"],
    ["templates/item/domain-sheet.hbs", "domain-sheet"]
  ];
  for (const [template, sheetClass] of legacyItemTemplates) {
    const source = await readText(template);
    for (const token of [
      "part-time-gods sheet item",
      sheetClass,
      "src=\"{{itemImg}}\"",
      "data-fallback-src=\"{{itemImageFallback}}\"",
      "alt=\"{{item.name}}\"",
      "ptg-header",
      "ptg-title",
      "ptg-name",
      "ptg-tabs",
      "ptg-item-fields three"
    ]) {
      if (!source.includes(token)) errors.push(`${template} missing shared item sheet readability token ${token}`);
    }
  }

  const imageFallbackSource = await readText("module/util/image-fallback.mjs");
  for (const token of ["PTG_IMAGE_FALLBACK", "imageSource", "wireImageFallbacks", "img[data-fallback-src]", "ptgFallbackWired", "addEventListener(\"error\""]) {
    if (!imageFallbackSource.includes(token)) errors.push(`Shared image fallback helper missing ${token}`);
  }

  const itemSheet = await readText("module/sheets/item-sheet.mjs");
  for (const token of ["ITEM_IMAGE_FALLBACK", "imageSource(this.item?.img", "wireImageFallbacks(this.element", "annotateCompactFieldTitles"]) {
    if (!itemSheet.includes(token)) errors.push(`Item sheet media/readability helper missing ${token}`);
  }

  for (const [template, tokens] of [
    ["templates/actor/antagonist-sheet.hbs", ["src=\"{{actorImg}}\"", "data-fallback-src=\"{{imageFallback}}\"", "alt=\"{{actor.name}}\""]],
    ["templates/actor/pantheon-sheet.hbs", ["src=\"{{actorImg}}\"", "data-fallback-src=\"{{imageFallback}}\"", "data-fallback-src=\"{{member.imageFallback}}\"", "alt=\"{{member.name}}\""]],
    ["templates/apps/mortal-divine-tracker.hbs", ["data-fallback-src=\"{{character.imageFallback}}\"", "data-fallback-src=\"{{actor.imageFallback}}\"", "alt=\"{{character.name}}\""]]
  ]) {
    const source = await readText(template);
    for (const token of tokens) {
      if (!source.includes(token)) errors.push(`${template} image fallback guard missing ${token}`);
    }
  }

  for (const [sourcePath, tokens] of [
    ["module/sheets/antagonist-sheet.mjs", ["actorImg", "imageFallback", "wireImageFallbacks(this.element"]],
    ["module/sheets/pantheon-sheet.mjs", ["actorImg", "imageFallback: PTG_IMAGE_FALLBACK", "wireImageFallbacks(this.element"]],
    ["module/apps/mortal-divine-tracker.mjs", ["imageFallback", "wireImageFallbacks(root", "partyCharacterContext"]]
  ]) {
    const source = await readText(sourcePath);
    for (const token of tokens) {
      if (!source.includes(token)) errors.push(`${sourcePath} image fallback wiring missing ${token}`);
    }
  }

  const characterLockTemplate = await readText("templates/actor/character-sheet.hbs");
  if (!characterLockTemplate.includes("data-ptg-edit-lock-toggle")) errors.push("Character sheet missing sheet edit lock toggle");
  if (!characterLockTemplate.includes("sheetLocked") || !characterLockTemplate.includes("canEditSheet")) errors.push("Character sheet missing sheet edit lock context");
  for (const token of ["{{#if sheetUnlocked}}", "ptg-print-display", "ptg-score-value"]) {
    if (!characterLockTemplate.includes(token)) errors.push(`Character sheet locked-mode display template missing ${token}`);
  }

  const characterItemListTemplate = await readText("templates/actor/parts/item-list.hbs");
  for (const token of ["data-fallback-src=\"icons/svg/item-bag.svg\"", "alt=\"{{item.name}}\""]) {
    if (!characterItemListTemplate.includes(token)) errors.push(`Character item list image fallback missing ${token}`);
  }

  const characterSheetSource = await readText("module/sheets/character-sheet.mjs");
  for (const token of ["commonActions", "ptg-common-actions", "data-common-action", "prepareCharacterCommonActions", "context.commonActions"]) {
    if (characterLockTemplate.includes(token) || characterSheetSource.includes(token)) {
      errors.push(`Character sheet duplicate common action strip should not include ${token}`);
    }
  }
  for (const token of ["CHARACTER_ITEM_IMAGE_FALLBACK", "wireImageFallbacks(this.element"]) {
    if (!characterSheetSource.includes(token)) errors.push(`Character sheet image fallback helper missing ${token}`);
  }
  for (const token of ["readCreatorStartingAttachments", "creatorStartingAttachmentRowsHTML", "creatorStartingAttachmentItem", "startingAttachments", "Step Five: Attachments"]) {
    if (!characterSheetSource.includes(token)) errors.push(`Character creator backed attachment workflow missing ${token}`);
  }
  for (const token of ["attachmentDefinitions: \"auto\"", "domainOptions: creatorDomainOptions", "creatorDomainOptions"]) {
    if (!characterSheetSource.includes(token)) errors.push(`Character creator non-interactive source application missing ${token}`);
  }
  for (const token of ["characterCreatorProblemSteps", "characterCreatorReviewHTML", "validateCreatorSourceSelections", "failedChoices", "reviewErrors", "ptg-creator-fieldset-review"]) {
    if (!characterSheetSource.includes(token)) errors.push(`Character creator failed-review recovery missing ${token}`);
  }
  for (const token of [
    "creatorArchetypeOptionsHTML(options, priorArchetypeOptions, priorChoices.archetype ?? \"\")",
    "creatorCareerOptionValue",
    "selectedCreatorCareerOptionAttribute",
    "creatorArchetypeOptionValue",
    "creatorArchetypeOptionIndexFromValue",
    "hidden disabled",
    "option.disabled = !show",
    "option.selected = true",
    "candidate.value && !candidate.hidden && !candidate.disabled"
  ]) {
    if (!characterSheetSource.includes(token)) errors.push(`Character creator dependent selector guard missing ${token}`);
  }

  for (const template of [
    "templates/actor/antagonist-sheet.hbs",
    "templates/actor/pantheon-sheet.hbs",
    "templates/item/item-sheet.hbs"
  ]) {
    const source = await readText(template);
    if (source.includes("data-ptg-edit-lock-toggle") || source.includes("sheetLocked") || source.includes("canEditSheet")) {
      errors.push(`${template} should not include the character sheet edit lock`);
    }
  }

  const lockHelper = await readText("module/sheets/sheet-edit-lock.mjs");
  for (const token of [
    "sheetEditLockContext",
    "wireSheetEditLock",
    "isSheetEditLocked",
    "toggleSheetEditLock",
    "WeakSet",
    "lockedSheets",
    "shouldDefaultSheetUnlocked",
    "control.tagName?.toUpperCase?.() === \"TEXTAREA\"",
    "control.readOnly = true",
    "control.setAttribute(\"aria-readonly\", \"true\")",
    "[data-roll-skill]",
    "[data-roll-manifestation]",
    "[data-ritual-action]",
    "[data-combat-roll]",
    "[data-combat-controls]",
    "[data-item-action='use']",
    "[data-item-action='toggle-details']"
  ]) {
    if (!lockHelper.includes(token)) errors.push(`Sheet edit lock helper missing ${token}`);
  }

  const actorDocumentSource = await readText("module/documents/actor/part-time-gods-actor.mjs");
  for (const token of ["options.attachmentDefinitions", "automaticAttachmentDefinition", "selectionOptions.domainOptions", "selectDomainOptions(item, this, options)"]) {
    if (!actorDocumentSource.includes(token)) errors.push(`Actor choice non-interactive creator apply hook missing ${token}`);
  }
  for (const token of ["parseOccupationCareerOption", "text.split(\"::\").at(-1)", "selectionOptions.occupationCareerOption, item.uuid"]) {
    if (!actorDocumentSource.includes(token)) errors.push(`Actor choice scoped occupation career parser missing ${token}`);
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
  for (const token of ["registerPTGCombatHooks", "openPTGCombatControls", "rollPTGStatblockPool", "PartTimeGodsCombatant", "CONFIG.Combatant.documentClass", "CONFIG.Combat.initiative", "quick: \"Quick Action\"", "standard: \"Standard Action\""]) {
    if (!entryPoint.includes(token)) errors.push(`Main entry point/config missing Chapter 5 combat token ${token}`);
  }

  const language = await readJson("lang/en.json");
  for (const key of ["PTG.Config.ActivationTypes.quick", "PTG.Config.ActivationTypes.standard"]) {
    if (!localizationValue(language, key)) errors.push(`Missing Chapter 5 activation localization ${key}`);
  }

  const combat = await readText("module/combat/ptg-combat.mjs");
  for (const token of ["PTG_INITIATIVE_FORMULA", "actorInitiative", "itemInitiativeModifier", "initiativeProcedureHTML", "quickAction", "standardAction", "quickDefense", "standardDefense", "battleFists", "battleWits", "damageResource", "Apply Damage (Health or Psyche)", "physicalDamage", "mentalDamage", "healing", "rollPTGInitiative", "rollPTGStatblockPool", "applyConditionToActor", "conditionCombatModifier", "automation.bonus?.initiative", "ptg-combat-dialog-window", "width: 700", "height: 680"]) {
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
  for (const token of ["data-item-action=\"condition-reduce\"", "data-item-action=\"condition-increase\"", "data-item-action=\"condition-recover\"", "data-combat-roll=\"{{roll.key}}\"", "data-combat-controls"]) {
    if (!characterTemplate.includes(token)) errors.push(`Character sheet missing Chapter 5 action ${token}`);
  }

  const antagonistTemplate = await readText("templates/actor/antagonist-sheet.hbs");
  for (const token of ["ptg-panel-section ptg-antagonist-combat-panel", "data-antagonist-combat-roll=\"attack\"", "data-antagonist-combat-roll=\"defense\"", "data-antagonist-combat-controls"]) {
    if (!antagonistTemplate.includes(token)) errors.push(`Antagonist sheet missing combat action ${token}`);
  }
}

async function assertPremadeItemFolderScaffold() {
  const compendiumSource = await readText("module/data/premade-compendiums.mjs");
  const packBuilder = await readText("scripts/build-compendium-packs.mjs");
  const itemAudit = await readText("module/data/premade-item-audit.mjs");
  const itemAuditScript = await readText("scripts/audit-premade-items.mjs");
  const itemAuditDoc = await readText("docs/premade-item-compendium-audit.md");
  const folderTokens = [
    "document.flags?.[SYSTEM_ID]?.folder ?? document.type ?? \"item\""
  ];
  const retiredFolderLabels = [
    "\"battle-fists\": \"Battle of Fists Actions\"",
    "\"battle-wits\": \"Battle of Wits Actions\"",
    "\"critical-failure-effects\": \"Critical Failure Effects\"",
    "\"manifestation-application\": \"Manifestation Applications\"",
    "gearQuality: \"Gear Qualities\""
  ];
  const retiredFolderKeys = ["\"battle-fists\"", "\"battle-wits\""];
  const retiredRuntimeTokens = [
    "RETIRED_PREMADE_ITEM_FOLDER_LABELS",
    "Battle-fistss",
    "Battle-witss",
    "isRetiredPremadeItemFolderName",
    "isRetiredFolderName"
  ];
  const rulesRefreshTokens = [
    "refreshPremadeJournalPages",
    "JournalEntryPage",
    "sameManagedJournalPageSet",
    "isManagedRulesPage"
  ];

  for (const token of folderTokens) {
    if (!compendiumSource.includes(token)) errors.push(`Runtime premade Item folder scaffold missing ${token}`);
    if (!packBuilder.includes(token)) errors.push(`Pack-builder premade Item folder scaffold missing ${token}`);
  }
  for (const token of retiredFolderLabels) {
    if (compendiumSource.includes(token)) errors.push(`Runtime premade Item folder scaffold should not recreate battle-action Items: ${token}`);
    if (packBuilder.includes(token)) errors.push(`Pack-builder premade Item folder scaffold should not recreate battle-action Items: ${token}`);
  }
  for (const token of retiredFolderKeys) {
    if (itemAudit.includes(token)) errors.push(`Premade Item audit helper should not allow battle-action Item folders: ${token}`);
  }
  for (const token of retiredRuntimeTokens) {
    if (!compendiumSource.includes(token)) errors.push(`Runtime premade Item retired-folder cleanup missing ${token}`);
  }
  for (const token of rulesRefreshTokens) {
    if (!compendiumSource.includes(token)) errors.push(`Runtime rules-reference refresh missing ${token}`);
  }
  for (const token of ["auditCreatedItemDocuments", "JOURNAL_STYLE_ITEM_KINDS", "journalSourceItems"]) {
    if (!itemAudit.includes(token)) errors.push(`Premade Item audit helper missing ${token}`);
  }
  for (const token of ["PTG_PREMADE_CHOICES", "PTG_PREMADE_ITEMS", "auditCreatedItemDocuments"]) {
    if (!itemAuditScript.includes(token)) errors.push(`Premade Item audit command missing ${token}`);
  }
  for (const token of ["Total created Item documents", "No journal-style Item kinds", "`packs/**` LevelDB churn"]) {
    if (!itemAuditDoc.includes(token)) errors.push(`Premade Item audit note missing ${token}`);
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

async function assertReleaseZipBuilderScaffold() {
  const source = await readText("scripts/build-release-zip.mjs");
  const releaseAssetChecker = await readText("scripts/check-release-assets.mjs");
  const releaseWorkflow = await readText(".github/workflows/release.yml");
  if (packageManifest.scripts?.["check:release-assets"] !== "node scripts/check-release-assets.mjs") {
    errors.push("package.json missing check:release-assets release asset verification script");
  }
  for (const token of [
    "assertPacksNotLocked",
    "pack.path",
    "\"LOCK\"",
    "Cannot build the release ZIP while Foundry has package compendium packs open.",
    "Locked packs:"
  ]) {
    if (!source.includes(token)) errors.push(`Release ZIP builder lock preflight missing ${token}`);
  }

  const lockCheckIndex = source.indexOf("await assertPacksNotLocked()");
  const staleZipCleanupIndex = source.indexOf("await removeStaleReleaseZips()");
  const writeZipIndex = source.indexOf("await fs.writeFile(outPath");
  if (lockCheckIndex === -1 || staleZipCleanupIndex === -1 || writeZipIndex === -1) return;
  if (lockCheckIndex > staleZipCleanupIndex || lockCheckIndex > writeZipIndex) {
    errors.push("Release ZIP builder must check active pack locks before stale ZIP cleanup or output writes");
  }

  for (const token of [
    "expectedZipUrl",
    "checkPackagePackLocks",
    "package pack locks released",
    "checkLocalDist",
    "checkRemoteManifest",
    "checkRemoteZip",
    "staleReleaseZips",
    "stale local release zips",
    "remote manifest version",
    "remote zip status"
  ]) {
    if (!releaseAssetChecker.includes(token)) errors.push(`Release asset checker missing ${token}`);
  }

  for (const token of [
    "Publish Release Assets",
    "contents: write",
    "workflow_dispatch:",
    "tags:",
    "v*.*.*",
    "npm run check",
    "npm run validate",
    "npm test",
    "npm run zip",
    "dist/system.json",
    "dist/${{ steps.meta.outputs.zip_name }}",
    "gh release create",
    "gh release edit",
    "gh release upload",
    "--clobber",
    "npm run check:release-assets"
  ]) {
    if (!releaseWorkflow.includes(token)) errors.push(`Release publication workflow missing ${token}`);
  }
}

async function assertManualQAGateScaffold() {
  const dragDropEvidence = await readText("docs/qa/manual-dragdrop-matrix.md");
  const dragDropChecker = await readText("scripts/check-dragdrop-evidence.mjs");

  if (packageManifest.scripts?.["check:dragdrop-evidence"] !== "node scripts/check-dragdrop-evidence.mjs") {
    errors.push("package.json missing check:dragdrop-evidence manual QA verification script");
  }

  for (const token of [
    "item-occupation",
    "item-archetype",
    "item-domain",
    "item-theology",
    "item-blessing",
    "item-curse",
    "item-truth",
    "item-relic",
    "item-bond",
    "item-worshipper",
    "item-vassal",
    "item-condition",
    "item-weapon",
    "item-armor",
    "actor-territory-character"
  ]) {
    if (!dragDropEvidence.includes(token)) errors.push(`Manual drag/drop evidence matrix missing ${token}`);
    if (!dragDropChecker.includes(token)) errors.push(`Manual drag/drop evidence checker missing ${token}`);
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

  const itemAudit = auditCreatedItemDocuments([
    { name: "character-creation", documents: documents.choices },
    { name: "premade-items", documents: documents.items }
  ]);
  if (itemAuditHasIssues(itemAudit)) {
    errors.push(`Created Item audit failed; journal-style entries belong in rules-reference Journals:\n${itemAuditIssueLines(itemAudit).map(key => `- ${key}`).join("\n")}`);
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
  if (rulesAudit.boilerplatePages.length) {
    errors.push(`Rules reference pages still contain repeated placeholder boilerplate:\n${rulesAudit.boilerplatePages.map(key => `- ${key}`).join("\n")}`);
  }
  if (rulesAudit.extractorArtifactPages.length) {
    errors.push(`Rules reference pages still contain PDF extractor artifacts:\n${rulesAudit.extractorArtifactPages.map(key => `- ${key}`).join("\n")}`);
  }
  if (rulesAudit.thinPages.length) {
    errors.push(`Rules reference pages are too thin to be useful source-backed summaries:\n${rulesAudit.thinPages.map(key => `- ${key}`).join("\n")}`);
  }
  if (rulesAudit.repeatedRuleParagraphs.length) {
    errors.push(`Rules reference pages repeat the same rules paragraph:\n${rulesAudit.repeatedRuleParagraphs.map(key => `- ${key}`).join("\n")}`);
  }
  if (rulesAudit.duplicatePageNames.length) {
    errors.push(`Rules reference journals contain duplicate page names:\n${rulesAudit.duplicatePageNames.map(key => `- ${key}`).join("\n")}`);
  }
  if (rulesAudit.totalWords > 12000 || rulesAudit.largestPageWords > 900) {
    errors.push(`Rules reference text is too large for release-safe summaries: totalWords=${rulesAudit.totalWords}, largestPageWords=${rulesAudit.largestPageWords}`);
  }

  const pregenAudit = backersPregensAudit(documents.actors);
  if (pregenAudit.unsafe.length) {
    errors.push(`Backers' Pregens must remain metadata-only until permission is confirmed:\n${pregenAudit.unsafe.map(key => `- ${key}`).join("\n")}`);
  }

  const manifestationAudit = manifestationApplicationAudit(documents.items, documents.journals, items.MANIFESTATION_APPLICATION_DEFINITIONS);
  if (manifestationAudit.misplacedItems.length) {
    errors.push(`Manifestation application reference content should be JournalEntry pages, not Items:\n${manifestationAudit.misplacedItems.map(key => `- ${key}`).join("\n")}`);
  }
  if (manifestationAudit.missing.length) {
    errors.push(`Missing Chapter 3 manifestation application Journal entries:\n${manifestationAudit.missing.map(key => `- ${key}`).join("\n")}`);
  }
  if (manifestationAudit.missingMetadata.length) {
    errors.push(`Manifestation application Journal entries missing source, Skill, or Measure guidance:\n${manifestationAudit.missingMetadata.map(key => `- ${key}`).join("\n")}`);
  }
  if (manifestationAudit.missingMeasures.length) {
    errors.push(`Manifestation measure journal references missing:\n${manifestationAudit.missingMeasures.map(key => `- ${key}`).join("\n")}`);
  }

  const chapterFourAudit = chapterFourRulesAudit(documents.items, documents.rollTables, documents.journals, items.CRITICAL_FAILURE_EFFECT_DEFINITIONS);
  if (chapterFourAudit.misplacedRuleItems.length) {
    errors.push(`Chapter 4 reference content should be JournalEntry pages, not Items:\n${chapterFourAudit.misplacedRuleItems.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFourAudit.misplacedCriticalFailureItems.length) {
    errors.push(`Critical Failure effects should be JournalEntry rules, not premade Condition Items:\n${chapterFourAudit.misplacedCriticalFailureItems.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFourAudit.missingJournalPages.length) {
    errors.push(`Missing Chapter 4 rules JournalEntry pages:\n${chapterFourAudit.missingJournalPages.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFourAudit.missingCriticalFailureEffects.length) {
    errors.push(`Missing Chapter 4 Critical Failure Journal entries:\n${chapterFourAudit.missingCriticalFailureEffects.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFourAudit.missingRollTables.length) {
    errors.push(`Missing Chapter 4 procedural RollTables:\n${chapterFourAudit.missingRollTables.map(key => `- ${key}`).join("\n")}`);
  }

  const chapterFiveAudit = chapterFiveBattleAudit(documents.items, documents.journals, items.QUALITY_DEFINITIONS);
  if (chapterFiveAudit.misplacedRuleItems.length) {
    errors.push(`Chapter 5 battle reference content should be JournalEntry pages, not Items:\n${chapterFiveAudit.misplacedRuleItems.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFiveAudit.misplacedGearQualityItems.length) {
    errors.push(`Gear Qualities should be JournalEntry rules, not premade Items:\n${chapterFiveAudit.misplacedGearQualityItems.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFiveAudit.missingJournalPages.length) {
    errors.push(`Missing Chapter 5 battle JournalEntry pages:\n${chapterFiveAudit.missingJournalPages.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFiveAudit.misplacedBattleActionItems.length) {
    errors.push(`Chapter 5 Battle actions should be JournalEntry rules, not Items:\n${chapterFiveAudit.misplacedBattleActionItems.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFiveAudit.missingJournalActions.length) {
    errors.push(`Missing Chapter 5 Battle action/defense journal entries:\n${chapterFiveAudit.missingJournalActions.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFiveAudit.missingGearFamilies.length) {
    errors.push(`Chapter 5 gear/condition families incomplete:\n${chapterFiveAudit.missingGearFamilies.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFiveAudit.missingGearQualityEntries.length) {
    errors.push(`Missing Gear Quality Journal entries:\n${chapterFiveAudit.missingGearQualityEntries.map(key => `- ${key}`).join("\n")}`);
  }
  if (chapterFiveAudit.missingInitiativeModifiers.length) {
    errors.push(`Chapter 5 initiative modifier metadata incomplete:\n${chapterFiveAudit.missingInitiativeModifiers.map(key => `- ${key}`).join("\n")}`);
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

function manifestationApplicationAudit(items, journals, definitions = []) {
  const expected = definitions.length
    ? definitions
    : Object.entries(EXPECTED_MANIFESTATION_APPLICATIONS)
      .flatMap(([manifestation, names]) => names.map(name => ({ manifestation, name, skills: [], commonMeasures: [] })));
  const misplacedItems = items
    .filter(item => item.type === "power" && (
      item.flags?.[SYSTEM_ID]?.kind === "manifestation-application"
      || item.flags?.[SYSTEM_ID]?.folder === "manifestation-application"
    ))
    .map(item => item.name);
  const pages = journalPages(journals, [
    "Manifestation Applications: Aegis, Beckon, Journey, Minion, and Oracle",
    "Manifestation Applications: Puppetry, Ruin, Shaping, and Soul"
  ]);
  const text = journalPagesText(pages);
  const sourcePages = new Set(pages.flatMap(page => page.flags?.[SYSTEM_ID]?.sourcePages ?? []));
  const missing = expected
    .filter(definition => !text.includes(`${titleCase(definition.manifestation)}: ${definition.name}`))
    .map(definition => `${definition.manifestation}:${definition.name}`);
  const missingMetadata = expected
    .filter(definition => {
      const skillMissing = (definition.skills ?? []).length
        ? !definition.skills.some(skill => text.includes(`${titleCase(definition.manifestation)} + ${titleCase(skill)}`))
        : false;
      const measureMissing = (definition.commonMeasures ?? []).some(measure => !text.includes(measureLabel(measure)));
      return skillMissing || measureMissing || !sourcePages.has(Number(definition.page));
    })
    .map(definition => `${definition.manifestation}:${definition.name}`);
  const missingMeasures = EXPECTED_MANIFESTATION_MEASURES.filter(measure => !text.includes(measureLabel(measure)));

  return { misplacedItems, missing, missingMetadata, missingMeasures };
}

function chapterFourRulesAudit(items, rollTables, journals, criticalFailureDefinitions = []) {
  const misplacedRuleItems = items
    .filter(item => item.type === "power" && item.flags?.[SYSTEM_ID]?.kind === "chapter-4-rule")
    .map(item => item.name);
  const misplacedCriticalFailureItems = items
    .filter(item => item.type === "condition" && (
      item.flags?.[SYSTEM_ID]?.kind === "critical-failure-effect"
      || item.flags?.[SYSTEM_ID]?.folder === "critical-failure-effects"
    ))
    .map(item => item.name);
  const missingJournalPages = missingRulesJournalPages(journals, EXPECTED_CHAPTER_FOUR_JOURNAL_PAGES);
  const criticalFailureText = journalPagesText(journalPages(journals, ["Critical Failure Effects"]));
  const expectedCriticalFailures = criticalFailureDefinitions.length
    ? criticalFailureDefinitions.map(definition => definition.name)
    : EXPECTED_CHAPTER_FOUR_CRITICAL_FAILURE_EFFECTS;
  const missingCriticalFailureEffects = EXPECTED_CHAPTER_FOUR_CRITICAL_FAILURE_EFFECTS
    .filter(name => !expectedCriticalFailures.includes(name) || !criticalFailureText.includes(name));
  const tableNames = new Set(rollTables.map(table => table.name));
  const missingRollTables = EXPECTED_CHAPTER_FOUR_ROLL_TABLES.filter(name => !tableNames.has(name));

  return { misplacedRuleItems, misplacedCriticalFailureItems, missingJournalPages, missingCriticalFailureEffects, missingRollTables };
}

function chapterFiveBattleAudit(items, journals, qualityDefinitions = {}) {
  const misplacedRuleItems = items
    .filter(item => item.type === "power" && item.flags?.[SYSTEM_ID]?.kind === "chapter-5-rule")
    .map(item => item.name);
  const misplacedGearQualityItems = items
    .filter(item => item.type === "gearQuality" || item.flags?.[SYSTEM_ID]?.kind === "gear-quality" || item.flags?.[SYSTEM_ID]?.folder === "gearQuality")
    .map(item => item.name);
  const misplacedBattleActionItems = items
    .filter(item => item.type === "power" && item.flags?.[SYSTEM_ID]?.kind === "battle-action")
    .map(item => item.name);
  const missingJournalPages = missingRulesJournalPages(journals, EXPECTED_CHAPTER_FIVE_JOURNAL_PAGES);
  const missingJournalActions = missingBattleJournalActions(journals);
  const gearQualityText = journalPagesText(journalPages(journals, ["Gear Qualities: Armor and General", "Gear Qualities: Weapon"]));
  const missingGearQualityEntries = Object.keys(qualityDefinitions)
    .filter(key => !gearQualityText.includes(titleCase(key)))
    .map(key => titleCase(key));
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
    ["armor", 14],
    ["weapon", 9]
  ]
    .filter(([type, minimum]) => Number(familyCounts[type] ?? 0) < minimum)
    .map(([type, minimum]) => `${type}: expected at least ${minimum}, got ${Number(familyCounts[type] ?? 0)}`);
  const missingInitiativeModifiers = initiativeModifierAudit(items, journals);

  return {
    misplacedRuleItems,
    misplacedGearQualityItems,
    misplacedBattleActionItems,
    missingJournalPages,
    missingJournalActions,
    missingGearFamilies,
    missingGearQualityEntries,
    missingInitiativeModifiers
  };
}

function missingBattleJournalActions(journals) {
  const pages = new Map(
    journals.flatMap(journal => (journal.pages ?? []).map(page => [page.name, page]))
  );
  const pageByBattle = {
    fists: "Battle of Fists Actions and Defenses",
    wits: "Battle of Wits Actions and Defenses"
  };
  const missing = [];

  for (const [battle, groups] of Object.entries(EXPECTED_CHAPTER_FIVE_BATTLE_ACTIONS)) {
    const content = pages.get(pageByBattle[battle])?.text?.content ?? "";
    for (const [actionType, names] of Object.entries(groups)) {
      for (const name of names) {
        if (!content.includes(`>${name}:`) && !content.includes(`>${name}</strong>`)) {
          missing.push(`${battle}:${actionType}:${name}`);
        }
      }
    }
  }

  return missing;
}

function initiativeModifierAudit(items, journals) {
  const missing = [];
  const reactive = items.find(item => item.type === "blessing" && item.name === "Reactive");
  const quickText = journalPagesText(journalPages(journals, ["Gear Qualities: Weapon"]));

  if (reactive?.system?.automation?.enabled !== true || Number(reactive?.system?.automation?.bonus?.initiative ?? 0) !== 2) {
    missing.push("Reactive blessing: expected enabled +2 Initiative automation");
  }
  if (!/\bQuick\b.*\binitiative\b/i.test(quickText)) {
    missing.push("Quick gear quality journal entry: expected initiative reminder");
  }

  return missing;
}

function journalPages(journals, names) {
  const nameSet = new Set(names);
  return journals.flatMap(journal => (journal.pages ?? []).filter(page => nameSet.has(page.name)));
}

function journalPagesText(pages) {
  return pages.map(page => plainText(page.text?.content ?? "")).join(" ");
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
  const boilerplatePages = pages
    .filter(({ page }) =>
      RULES_JOURNAL_BOILERPLATE_PATTERN.test(page.text?.content ?? "")
      || RULES_JOURNAL_BOILERPLATE_PATTERN.test(page.flags?.[SYSTEM_ID]?.safeSummary ?? ""))
    .map(({ journal, page }) => `${journal.name}:${page.name}`);
  const extractorArtifactPages = pages
    .filter(({ page }) =>
      RULES_JOURNAL_EXTRACTOR_ARTIFACT_PATTERN.test(page.text?.content ?? "")
      || RULES_JOURNAL_EXTRACTOR_ARTIFACT_PATTERN.test(page.flags?.[SYSTEM_ID]?.safeSummary ?? ""))
    .map(({ journal, page }) => `${journal.name}:${page.name}`);
  const thinPages = pages
    .filter(({ page }) => plainWordCount(page.text?.content ?? "") < RULES_JOURNAL_MIN_PAGE_WORDS)
    .map(({ journal, page }) => `${journal.name}:${page.name}:${plainWordCount(page.text?.content ?? "")} words`);
  const duplicatePageNames = journals.flatMap(journal => {
    const counts = new Map();
    for (const page of journal.pages ?? []) counts.set(page.name, (counts.get(page.name) ?? 0) + 1);
    return [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([name, count]) => `${journal.name}:${name}:${count}`);
  });
  const paragraphs = new Map();

  for (const { journal, page } of pages) {
    for (const match of String(page.text?.content ?? "").matchAll(/<p(?:\s[^>]*)?>(.*?)<\/p>/gis)) {
      if (/<strong>\s*Foundry support:/i.test(match[1])) continue;

      const text = normalizedRulesParagraph(match[1]);
      if (text.length < 80) continue;
      paragraphs.set(text, [...(paragraphs.get(text) ?? []), `${journal.name}:${page.name}`]);
    }
  }
  const repeatedRuleParagraphs = [...paragraphs.entries()]
    .filter(([, references]) => references.length > 1)
    .map(([text, references]) => `${references.join(", ")} => ${text.slice(0, 120)}`);

  return {
    totalWords: wordCounts.reduce((total, count) => total + count, 0),
    largestPageWords: wordCounts.length ? Math.max(...wordCounts) : 0,
    missingSafeSummary,
    boilerplatePages,
    extractorArtifactPages,
    thinPages,
    duplicatePageNames,
    repeatedRuleParagraphs
  };
}

function normalizedRulesParagraph(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
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

function plainText(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function titleCase(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, char => char.toUpperCase());
}

function measureLabel(key) {
  return {
    area: "Area Affected",
    damage: "Damage",
    detail: "Effect Detail",
    duration: "Duration",
    magnitude: "Magnitude",
    modifier: "Modifier",
    range: "Range",
    scale: "Scale",
    targets: "Targets",
    trigger: "Trigger"
  }[key] ?? titleCase(key);
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
