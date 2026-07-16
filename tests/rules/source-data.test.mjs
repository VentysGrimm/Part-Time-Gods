import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment, repoRoot, SYSTEM_ID } from "../helpers/foundry-test-env.mjs";
import { auditCreatedItemDocuments, itemAuditIssueLines } from "../../module/data/premade-item-audit.mjs";

installFoundryTestEnvironment();

const choices = await import("../../module/data/premade-choices.mjs");
const items = await import("../../module/data/premade-items.mjs");
const actors = await import("../../module/data/premade-actors.mjs");
const journals = await import("../../module/data/premade-journals.mjs");
const rollTables = await import("../../module/data/premade-roll-tables.mjs");
const scenes = await import("../../module/data/premade-scenes.mjs");
const macros = await import("../../module/data/premade-macros.mjs");
const skills = await import("../../module/config/skills.mjs");
const compendiums = await import("../../module/data/premade-compendiums.mjs");
const territory = await import("../../module/apps/territory-grid-app.mjs");
const balance = await import("../../module/apps/mortal-divine-tracker.mjs");

test("Premade compendium source documents have stable slug and sourceId flags", async () => {
  const documents = [
    ...choices.PTG_PREMADE_CHOICES,
    ...items.PTG_PREMADE_ITEMS,
    ...actors.PTG_PREMADE_ACTORS,
    ...await journals.getPremadeJournals(),
    ...rollTables.PTG_PREMADE_ROLL_TABLES,
    ...scenes.getPremadeScenes(),
    ...macros.PTG_PREMADE_MACROS
  ];

  assert.ok(documents.length > 800);
  for (const document of documents) {
    assert.ok(document.flags?.[SYSTEM_ID]?.slug, `${document.name} missing slug`);
    assert.ok(document.flags?.[SYSTEM_ID]?.sourceId, `${document.name} missing sourceId`);
  }
});

test("Choice data covers all core choice families with usable grants", () => {
  const byType = groupByType(choices.PTG_PREMADE_CHOICES);

  for (const type of ["occupation", "archetype", "domain", "theology"]) {
    assert.ok((byType.get(type) ?? []).length > 0, `missing ${type} choices`);
  }

  for (const choice of choices.PTG_PREMADE_CHOICES) {
    assert.equal(typeof choice.system?.grants, "object", `${choice.name} has grants`);
  }

  for (const occupation of byType.get("occupation")) {
    assert.ok(occupation.system.careerOptions.length > 0, `${occupation.name} needs careers`);
    for (const career of occupation.system.careerOptions) {
      assert.equal(typeof career.resources?.freeTime, "number", `${occupation.name}/${career.name} freeTime`);
      assert.equal(typeof career.resources?.wealth, "number", `${occupation.name}/${career.name} wealth`);
      assert.ok(career.blessing?.name, `${occupation.name}/${career.name} blessing`);
      assert.ok(career.curse?.name, `${occupation.name}/${career.name} curse`);
    }
  }

  for (const domain of byType.get("domain")) {
    assert.ok(Object.keys(domain.system.grants.manifestations ?? {}).length > 0, `${domain.name} needs Manifestation grants`);
  }

  for (const theology of byType.get("theology")) {
    assert.ok(Object.keys(theology.system.grants.resources ?? {}).length > 0, `${theology.name} needs resource grants`);
  }
});

test("Chapter 4 rules journals cover dice, resource, and consequence procedures", async () => {
  const chapterFourRules = items.PTG_PREMADE_ITEMS.filter(item => item.type === "power" && item.flags?.[SYSTEM_ID]?.kind === "chapter-4-rule");
  const criticalFailureEffects = items.PTG_PREMADE_ITEMS.filter(item => item.type === "condition" && item.flags?.[SYSTEM_ID]?.kind === "critical-failure-effect");
  const tableNames = new Set(rollTables.PTG_PREMADE_ROLL_TABLES.map(table => table.name));
  const rulesJournals = await journals.getPremadeJournals();
  const diceJournal = rulesJournals.find(journal => journal.name === "05. Dice, Skills, and Resources");

  assert.equal(chapterFourRules.length, 0);
  assert.ok(diceJournal, "Chapter 4 rules are stored as a JournalEntry");
  for (const name of [
    "Blessings, Curses, and the Skill-Combo System",
    "Critical Failure Effects",
    "Rolling Dice and Checks",
    "Pantheon Pool, Strength, and Movement",
    "Free Time and Wealth",
    "Interacting with Attachments and Territory"
  ]) {
    const page = diceJournal.pages.find(candidate => candidate.name === name);
    assert.ok(page, `${name} JournalEntry page`);
    assert.ok(page.flags?.[SYSTEM_ID]?.sourcePages?.length, `${name} source pages`);
  }

  assert.equal(criticalFailureEffects.length, 0);
  const criticalFailureText = plainText(diceJournal.pages.find(page => page.name === "Critical Failure Effects")?.text.content ?? "");
  for (const definition of items.CRITICAL_FAILURE_EFFECT_DEFINITIONS) {
    assert.match(criticalFailureText, new RegExp(`\\b${escapeRegExp(definition.name)}\\b`), `${definition.name} journal entry`);
  }

  for (const name of ["Possible Critical Failure Effects", "Boost Effect Menu", "Pantheon Pool Uses", "Attachment Interaction Choices", "Wealth Cost Tiers"]) {
    assert.ok(tableNames.has(name), `${name} RollTable`);
  }

  assert.equal(skills.PTG_SPECIALTY_LIMIT, 2);
  assert.equal(skills.PTG_SKILL_SOURCE.chapter, 4);
  assert.equal(Object.keys(skills.PTG_SKILLS).length, 20);
  for (const [key, skill] of Object.entries(skills.PTG_SKILLS)) {
    assert.ok(skill.specialties.length > 0, `${key} specialties`);
  }
});

test("Manifestation Application references live in rules journals, not premade Items", async () => {
  const applicationItems = items.PTG_PREMADE_ITEMS.filter(item =>
    item.flags?.[SYSTEM_ID]?.kind === "manifestation-application"
    || item.flags?.[SYSTEM_ID]?.folder === "manifestation-application"
  );
  const rulesJournals = await journals.getPremadeJournals();
  const expressionJournal = rulesJournals.find(journal => journal.name === "04. Divine Expressions");
  const applicationPages = [
    expressionJournal?.pages.find(page => page.name === "Manifestation Applications: Aegis, Beckon, Journey, Minion, and Oracle"),
    expressionJournal?.pages.find(page => page.name === "Manifestation Applications: Puppetry, Ruin, Shaping, and Soul")
  ].filter(Boolean);
  const applicationText = plainText(applicationPages.map(page => page.text.content).join(" "));

  assert.equal(applicationItems.length, 0);
  assert.equal(applicationPages.length, 2);

  for (const definition of items.MANIFESTATION_APPLICATION_DEFINITIONS) {
    const label = `${titleCase(definition.manifestation)}: ${definition.name}`;
    assert.match(applicationText, new RegExp(`\\b${escapeRegExp(label)}\\b`), `${label} journal entry`);
    assert.ok(definition.skills.some(skill => applicationText.includes(`${titleCase(definition.manifestation)} + ${titleCase(skill)}`)), `${label} suggested Skill`);
    for (const measure of definition.commonMeasures) {
      assert.ok(applicationText.includes(measureLabel(measure)), `${label} ${measure} Measure`);
    }
  }
});

test("Chapter 5 battle data covers actions, defenses, gear, and conditions", async () => {
  const chapterFiveRules = items.PTG_PREMADE_ITEMS.filter(item => item.type === "power" && item.flags?.[SYSTEM_ID]?.kind === "chapter-5-rule");
  const battleActions = items.PTG_PREMADE_ITEMS.filter(item => item.type === "power" && item.flags?.[SYSTEM_ID]?.kind === "battle-action");
  const chapterFiveItems = items.PTG_PREMADE_ITEMS.filter(item => {
    const page = Number(item.flags?.[SYSTEM_ID]?.page ?? item.system?.sourcePage ?? 0);
    return page >= 205 && page <= 212;
  });
  const counts = groupByType(chapterFiveItems);
  const rulesJournals = await journals.getPremadeJournals();
  const battleJournal = rulesJournals.find(journal => journal.name === "06. Divine Battles");

  assert.equal(chapterFiveRules.length, 0);
  assert.ok(battleJournal, "Chapter 5 battle rules are stored as a JournalEntry");
  for (const name of [
    "Timing, Initiative, and Turns",
    "Actions and Defenses",
    "Battle of Fists Actions and Defenses",
    "Battle of Wits Actions and Defenses",
    "Damage, Conditions, and Healing",
    "Armor, Weapons, and Range",
    "Gear Qualities: Armor and General",
    "Gear Qualities: Weapon"
  ]) {
    const page = battleJournal.pages.find(candidate => candidate.name === name);
    assert.ok(page, `${name} JournalEntry page`);
    assert.ok(page.flags?.[SYSTEM_ID]?.sourcePages?.length, `${name} source pages`);
  }

  assert.equal(battleActions.length, 0);

  const fistsText = plainText(battleJournal.pages.find(page => page.name === "Battle of Fists Actions and Defenses")?.text.content ?? "");
  const witsText = plainText(battleJournal.pages.find(page => page.name === "Battle of Wits Actions and Defenses")?.text.content ?? "");
  for (const name of ["Feint", "Close Combat Attack", "Dodge", "Run for Cover"]) {
    assert.match(fistsText, new RegExp(`\\b${name}\\b`), `${name} Fists journal action`);
  }
  for (const name of ["Mislead", "Fast Talk", "Laugh It Off", "Stand My Ground"]) {
    assert.match(witsText, new RegExp(`\\b${name}\\b`), `${name} Wits journal action`);
  }

  assert.ok((counts.get("condition") ?? []).length >= 20);
  assert.equal((counts.get("gearQuality") ?? []).length, 0);
  assert.ok((counts.get("armor") ?? []).length >= 14);
  assert.ok((counts.get("weapon") ?? []).length >= 9);

  const gearQualityItems = items.PTG_PREMADE_ITEMS.filter(item => item.type === "gearQuality" || item.flags?.[SYSTEM_ID]?.kind === "gear-quality");
  const gearText = plainText([
    battleJournal.pages.find(page => page.name === "Gear Qualities: Armor and General")?.text.content ?? "",
    battleJournal.pages.find(page => page.name === "Gear Qualities: Weapon")?.text.content ?? ""
  ].join(" "));
  assert.equal(gearQualityItems.length, 0);
  for (const key of Object.keys(items.QUALITY_DEFINITIONS)) {
    assert.match(gearText, new RegExp(`\\b${escapeRegExp(titleCase(key))}\\b`), `${titleCase(key)} journal quality`);
  }
});

test("Premade source data exposes initiative modifiers for automation", () => {
  const reactive = items.PTG_PREMADE_ITEMS.find(item => item.type === "blessing" && item.name === "Reactive");

  assert.ok(reactive, "Reactive blessing item");
  assert.equal(reactive.system.automation.enabled, true);
  assert.deepEqual(reactive.system.automation.bonus, { initiative: 2 });
});

test("Gear Quality journal keeps Quick initiative guidance", async () => {
  const rulesJournals = await journals.getPremadeJournals();
  const battleJournal = rulesJournals.find(journal => journal.name === "06. Divine Battles");
  const quickText = plainText(battleJournal.pages.find(page => page.name === "Gear Qualities: Weapon")?.text.content ?? "");

  assert.match(quickText, /\bQuick\b/);
  assert.match(quickText, /\binitiative\b/i);
});

test("Premade source data exposes structured Blessing hooks beyond visible prose", () => {
  const sturdy = items.PTG_PREMADE_ITEMS.find(item => item.type === "blessing" && item.name === "Made of Sturdy Stuff");
  const compliance = items.PTG_PREMADE_ITEMS.find(item => item.type === "blessing" && item.name === "Fate's Compliance");
  const martyrdom = items.PTG_PREMADE_ITEMS.find(item => item.type === "blessing" && item.name === "Martyrdom");

  assert.ok(sturdy, "Made of Sturdy Stuff blessing item");
  assert.equal(sturdy.system.automation.enabled, true);
  assert.equal(sturdy.system.automation.action, "prevent-damage");
  assert.deepEqual(sturdy.system.automation.damage, { mode: "negate-successes", resource: "health", timing: "reflexive" });
  assert.deepEqual(sturdy.system.automation.roll, { primary: "fortitude", mode: "reflexive" });

  assert.ok(compliance, "Fate's Compliance blessing item");
  assert.equal(compliance.system.automation.action, "reroll");
  assert.deepEqual(compliance.system.automation.damage, { mode: "cost", resource: "healthOrPsyche", amount: 1, timing: "use" });
  assert.deepEqual(compliance.system.automation.roll, { mode: "reroll", target: "die-showing-1" });

  assert.ok(martyrdom, "Martyrdom blessing item");
  assert.equal(martyrdom.system.automation.action, "change-resource");
  assert.deepEqual(martyrdom.system.automation.damage, { mode: "trigger-threshold", resource: "healthOrPsyche", threshold: 3, timing: "after-damage" });
  assert.deepEqual(martyrdom.system.automation.resourceChange, { resource: "pantheonDice", amount: 1, target: "pantheonPool" });
});

test("Premade Items stay in valid item folders without journal-style leaks", () => {
  const audit = auditCreatedItemDocuments([
    { name: "character-creation", documents: choices.PTG_PREMADE_CHOICES },
    { name: "premade-items", documents: items.PTG_PREMADE_ITEMS }
  ]);

  assert.deepEqual(itemAuditIssueLines(audit), []);
  assert.equal(audit.summary.totalItems, 640);
  assert.equal(audit.counts.collections["character-creation"], 40);
  assert.equal(audit.counts.collections["premade-items"], 600);
  assert.equal(audit.counts.folders["battle-fists"] ?? 0, 0);
  assert.equal(audit.counts.folders["battle-wits"] ?? 0, 0);
  assert.equal(audit.counts.folders["critical-failure-effects"] ?? 0, 0);
  assert.equal(audit.counts.folders["gearQuality"] ?? 0, 0);
  assert.equal(audit.counts.folders["manifestation-application"] ?? 0, 0);
  assert.equal(compendiums.isRetiredPremadeItemFolderName("Battle of Fists Actions"), true);
  assert.equal(compendiums.isRetiredPremadeItemFolderName("Battle of Wits Actions"), true);
  assert.equal(compendiums.isRetiredPremadeItemFolderName("Battle-fistss"), true);
  assert.equal(compendiums.isRetiredPremadeItemFolderName("Battle-witss"), true);
  assert.equal(compendiums.isRetiredPremadeItemFolderName("Critical Failure Effects"), true);
  assert.equal(compendiums.isRetiredPremadeItemFolderName("Gear Qualities"), true);
  assert.equal(compendiums.isRetiredPremadeItemFolderName("Manifestation Applications"), true);
  assert.equal(compendiums.isRetiredPremadeItemFolderName("Blessings"), false);
  assert.equal(audit.counts.folders.otherworld ?? 0, 0);
  assert.equal(items.PTG_PREMADE_ITEMS.filter(item => item.flags?.[SYSTEM_ID]?.kind === "otherworld-travel").length, 0);
});

test("Rules journals are source-backed summaries without repeated placeholder text", async () => {
  const rulesJournals = await journals.getPremadeJournals();
  const pages = rulesJournals.flatMap(journal => journal.pages.map(page => ({ journal, page })));
  const boilerplate = /curated Foundry play aid|preserves source-page lookup metadata|Use the original rulebook|complete rules text/i;
  const extractorArtifact = /DescTeHnEding|DeCsrceeantidnigng|OPSPtOoSrITmION/i;
  const paragraphs = new Map();

  assert.equal(rulesJournals.length, 9);
  assert.equal(pages.length, 56);

  for (const { journal, page } of pages) {
    const content = page.text.content;
    assert.doesNotMatch(content, boilerplate, `${journal.name}:${page.name} boilerplate`);
    assert.doesNotMatch(page.flags[SYSTEM_ID].safeSummary, boilerplate, `${journal.name}:${page.name} summary boilerplate`);
    assert.doesNotMatch(content, extractorArtifact, `${journal.name}:${page.name} extractor artifact`);
    assert.ok(plainWordCount(content) >= 85, `${journal.name}:${page.name} needs a useful summary`);

    for (const match of content.matchAll(/<p(?:\s[^>]*)?>(.*?)<\/p>/gis)) {
      if (/<strong>\s*Foundry support:/i.test(match[1])) continue;
      const text = plainText(match[1]).toLowerCase();
      if (text.length < 80) continue;
      paragraphs.set(text, [...(paragraphs.get(text) ?? []), `${journal.name}:${page.name}`]);
    }
  }

  const duplicatePageNames = rulesJournals.flatMap(journal => {
    const counts = new Map();
    for (const page of journal.pages ?? []) counts.set(page.name, (counts.get(page.name) ?? 0) + 1);
    return [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([name, count]) => `${journal.name}:${name}:${count}`);
  });
  assert.deepEqual(duplicatePageNames, []);

  const repeated = [...paragraphs.values()].filter(references => references.length > 1);
  assert.deepEqual(repeated, []);

  const ritualPage = pages.find(({ page }) => page.name === "Rituals and Otherworlds")?.page;
  assert.ok(ritualPage, "Rituals and Otherworlds page");
  const ritualText = plainText(ritualPage.text.content);
  assert.match(ritualText, /Otherworld travel belongs here as procedure, not as standalone power Items/);
  assert.match(ritualText, /Portal stage: Knowledge \+ Influence/);
  assert.match(ritualText, /Outsiders and Realm stages: Stealth \+ Perception, then Discipline \+ Tech/);

  const settingPage = pages.find(({ page }) => page.name === "The Descending Storm and Modern Godhood")?.page;
  assert.ok(settingPage, "The Descending Storm and Modern Godhood page");
  assert.deepEqual(settingPage.flags[SYSTEM_ID].sourcePages, [14, 15, 16, 17, 18, 19, 20, 21, 22]);
  const settingText = plainText(settingPage.text.content);
  assert.match(settingText, /Golden Web/);
  assert.match(settingText, /God Wars/);
  assert.match(settingText, /modern gods are survivors and successors/);
});

test("Workflow macros are compatibility launchers with native UI homes", () => {
  const workflowMacros = macros.PTG_PREMADE_MACROS.filter(macro => macro.flags?.[SYSTEM_ID]?.kind === "workflow-macro");

  assert.equal(workflowMacros.length, 8);
  for (const macro of workflowMacros) {
    const flags = macro.flags[SYSTEM_ID];
    assert.equal(flags.compatibilityLauncher, true, `${macro.name} compatibility launcher flag`);
    assert.match(flags.summary, /compatibility launcher/i, `${macro.name} summary`);
    assert.ok(flags.nativeHome, `${macro.name} native UI home`);
    assert.doesNotMatch(flags.nativeHome, /macro/i, `${macro.name} native home should not be macro-first`);
  }

  for (const macroName of ["PTG: Create Territory Scene", "PTG: Territory Controls"]) {
    const macro = workflowMacros.find(candidate => candidate.name === macroName);
    assert.ok(macro, `${macroName} exists`);
    assert.match(macro.command, /openTerritoryInterface/, `${macroName} uses unified Territory interface`);
  }
});

test("Integrated Territory API remains primary while Territory macros stay compatibility-only", async () => {
  const entryPoint = await fs.readFile(path.join(repoRoot, "part-time-gods.js"), "utf8");
  const workflowMacros = macros.PTG_PREMADE_MACROS.filter(macro => macro.flags?.[SYSTEM_ID]?.kind === "workflow-macro");
  const territoryMacros = workflowMacros.filter(macro => /^PTG: (Create Territory Scene|Territory Controls)$/.test(macro.name));

  assert.match(entryPoint, /game\.ptg\.territory\s*=\s*{/, "initial integrated Territory API registration");
  assert.match(entryPoint, /\.\.\.\(game\.ptg\.territory \?\? {}\)/, "restored Territory API preserves external additions");
  for (const token of [
    "open: openTerritoryInterface",
    "openInterface: openTerritoryInterface",
    "openScene: openTerritoryScene",
    "viewScene: openTerritoryScene",
    "autoOpen: maybeOpenTerritoryInterfaceOnReady",
    "restoreIntegratedModuleApis",
    "setTimeout?.(restoreIntegratedModuleApis, 0)",
    "await maybeOpenTerritoryInterfaceOnReady();"
  ]) {
    assert.ok(entryPoint.includes(token), `entry point missing ${token}`);
  }

  assert.equal(territoryMacros.length, 2);
  for (const macro of territoryMacros) {
    const flags = macro.flags[SYSTEM_ID];
    assert.equal(flags.compatibilityLauncher, true, `${macro.name} stays compatibility-only`);
    assert.match(flags.nativeHome, /Unified Territory interface/i, `${macro.name} points to the native interface`);
    assert.doesNotMatch(flags.nativeHome, /macro/i, `${macro.name} native home is not macro-first`);
    assert.match(macro.command, /openTerritoryInterface/, `${macro.name} delegates to the integrated API`);
  }
});

test("Premade territory scene drawings use Foundry v14 drawing schema", () => {
  const [scene] = scenes.getPremadeScenes();

  assert.equal(scene.drawings.length, 24);
  for (const drawing of scene.drawings) {
    assert.match(drawing.author, /^[A-Za-z0-9]{16}$/, `${drawing.name} has a non-null author id`);
    assert.equal(drawing.shape?.type, "r", `${drawing.name} uses v14 rectangle shape code`);
    assert.equal(typeof drawing.shape?.width, "number", `${drawing.name} shape width`);
    assert.equal(typeof drawing.shape?.height, "number", `${drawing.name} shape height`);
  }

  const drawingsByElement = new Map(scene.drawings.map(drawing => [drawing.flags?.[SYSTEM_ID]?.territorySheetElement, drawing]));
  const legend = drawingsByElement.get("legend");
  const rowOne = drawingsByElement.get("row-1");
  const columnOne = drawingsByElement.get("column-1");
  assert.equal(legend.x, 8);
  assert.equal(legend.y, 8);
  assert.equal(legend.shape.width, 84);
  assert.equal(legend.shape.height, 42);
  assert.ok(legend.fontSize < columnOne.fontSize, "Legend uses smaller type than grid number labels");
  assert.equal(rowOne.x, 0);
  assert.equal(rowOne.y, 100);
  assert.equal(columnOne.x, 100);
  assert.equal(columnOne.y, 0);
  assert.ok(legend.x + legend.shape.width < columnOne.x, "Legend box ends before the column 1 label cell");
  assert.ok(legend.y + legend.shape.height < rowOne.y, "Legend box ends before the row 1 label cell");
});

test("Territory point model separates GM secrets from player-facing scene data", () => {
  const grid = territory.normalizeTerritoryGrid({
    points: [
      {
        id: "public-point",
        name: "Secret True Name",
        publicName: "Known Landmark",
        x: 3,
        y: 4,
        category: "landmark",
        locationType: "mixed",
        controlType: "pantheon",
        status: "contested",
        discoveryState: "known",
        owner: "QA Pantheon",
        footprint: { width: 2, height: 1 },
        dominionTags: ["Smoke"],
        theologyTags: ["Saints"],
        publicNotes: "Player-safe landmark notes.",
        gmNotes: "Hidden crawl secret.",
        sourceActorUuid: "Actor.secret0000001",
        ritualEvents: [{ type: "challenge", clock: "Week 2", notes: "Public challenge clock.", public: true }]
      },
      {
        id: "hidden-point",
        name: "Hidden Rival",
        x: 5,
        y: 6,
        category: "rival",
        discoveryState: "hidden",
        gmNotes: "Do not reveal."
      }
    ]
  });

  assert.equal(grid.points.length, 2);
  assert.equal(grid.points[0].locationType, "mixed");
  assert.equal(grid.points[0].controlType, "pantheon");
  assert.equal(grid.points[0].status, "contested");
  assert.equal(grid.points[0].footprintLabel, "2 x 1 points");
  assert.equal(grid.points[0].ritualEvents[0].type, "challenge");

  const playerCells = territory.buildTerritoryGridCells(grid, { canEditTerritory: false });
  const playerPoints = playerCells.rows.flatMap(row => row.cells.flatMap(cell => cell.points));

  assert.equal(playerPoints.length, 1);
  assert.equal(playerPoints[0].name, "Known Landmark");
  assert.equal(playerPoints[0].controlLabel, "Pantheon");
  assert.equal(playerPoints[0].statusLabel, "Contested / Disputed");
  assert.equal(playerPoints[0].gmNotes, "");
  assert.equal(playerPoints[0].sourceActorUuid, "");
  assert.equal(playerPoints[0].eventLabel, "Challenge");
});

test("Territory random location helper rolls 2d10 coordinates for point creation", () => {
  const rolls = [0, 0.999];
  const rolled = territory.rollTerritoryLocationCoordinate({
    random: () => rolls.shift()
  });

  assert.deepEqual(rolled, {
    x: 1,
    y: 10,
    key: "1-10",
    label: "1-10"
  });

  const point = territory.validateTerritoryPoint({
    name: `Random Location ${rolled.label}`,
    publicName: `Rumored Location ${rolled.label}`,
    x: rolled.x,
    y: rolled.y,
    category: "neutral",
    locationType: "unknown",
    controlType: "unclaimed",
    status: "unknown",
    discoveryState: "rumored",
    publicNotes: `Random location helper rolled ${rolled.label}.`
  });
  const grid = territory.normalizeTerritoryGrid({ points: [point] });
  const cells = territory.buildTerritoryGridCells(grid, { canEditTerritory: true });
  const targetCell = cells.rows.flatMap(row => row.cells).find(cell => cell.key === rolled.key);

  assert.equal(targetCell.points.length, 1);
  assert.equal(targetCell.points[0].name, "Random Location 1-10");
  assert.equal(targetCell.points[0].discoveryLabel, "Rumored");
  assert.match(targetCell.points[0].publicNotes, /Random location helper rolled 1-10/);
});

test("Territory influence overlay exposes capped Manifestation bonus and overlap state", () => {
  const grid = territory.normalizeTerritoryGrid({
    points: [
      {
        id: "north",
        name: "North Bond",
        publicName: "North Known",
        x: 5,
        y: 4,
        category: "individual",
        controlType: "god",
        status: "friendly",
        owner: "North God"
      },
      {
        id: "east",
        name: "East Landmark",
        publicName: "East Known",
        x: 6,
        y: 5,
        category: "landmark",
        controlType: "pantheon",
        status: "contested",
        owner: "QA Pantheon"
      },
      {
        id: "south",
        name: "South Choir",
        publicName: "South Known",
        x: 5,
        y: 6,
        category: "worshipper",
        controlType: "outsider",
        status: "hostile",
        owner: "Outsider Court"
      },
      {
        id: "west",
        name: "West Shrine",
        publicName: "West Known",
        x: 4,
        y: 5,
        category: "landmark",
        controlType: "shared",
        status: "bolstered",
        owner: "Shared Gods"
      }
    ]
  });
  const cells = territory.buildTerritoryGridCells(grid, { canEditTerritory: false });
  const center = cells.rows.flatMap(row => row.cells).find(cell => cell.key === "5-5");

  assert.equal(center.rawBonus, 4);
  assert.equal(center.bonus, 3);
  assert.equal(center.overlapCount, 4);
  assert.equal(center.hasOverlap, true);
  assert.equal(center.primaryStatus, "contested");
  assert.equal(center.primaryControl, "outsider");
  assert.match(center.cellClass, /has-bonus/);
  assert.match(center.cellClass, /has-overlap/);
  assert.match(center.cellClass, /ptg-territory-cell-status-contested/);
  assert.match(center.cellClass, /ptg-territory-cell-control-outsider/);
  assert.match(center.influenceTitle, /Manifestation bonus \+3 \(capped from 4\)/);
  assert.match(center.influenceTitle, /overlapping spheres/);
  assert.match(center.influenceTitle, /East Known/);
});

test("Territory character import turns player attachments into scene points", async () => {
  const actor = {
    name: "QA Character",
    type: "character",
    uuid: "Actor.qaCharacter",
    items: [
      {
        name: "Old Temple",
        type: "bond",
        uuid: "Item.oldTemple",
        system: {
          kind: "landmark",
          territoryGrid: "7-8",
          level: 2,
          description: "<p>A known landmark Bond.</p>"
        }
      },
      {
        name: "Street Choir",
        type: "worshipper",
        uuid: "Item.streetChoir",
        system: {
          territoryCoordinate: "2-3",
          rank: 1,
          summary: "Public worshipper group."
        }
      }
    ]
  };

  const imported = await territory.territoryPointsFromActor(actor, {
    promptForMissingCoordinates: false
  });

  assert.equal(imported.points.length, 2);
  assert.equal(imported.skipped, 0);

  const landmark = imported.points.find(point => point.sourceItemUuid === "Item.oldTemple");
  assert.equal(landmark.category, "landmark");
  assert.equal(landmark.x, 7);
  assert.equal(landmark.y, 8);
  assert.equal(landmark.owner, "QA Character");
  assert.equal(landmark.linkedActorUuid, "Actor.qaCharacter");
  assert.equal(landmark.linkedBondUuid, "Item.oldTemple");

  const duplicateAware = await territory.territoryPointsFromActor(actor, {
    existingPoints: [landmark],
    promptForMissingCoordinates: false
  });

  assert.equal(duplicateAware.points.length, 1);
  assert.equal(duplicateAware.skipped, 1);
  assert.equal(duplicateAware.points[0].sourceItemUuid, "Item.streetChoir");
});

test("Territory scene view fits the overlay to the canvas viewport", () => {
  const pan = territory.territorySceneFitPan(
    { width: 1100, height: 1100 },
    { width: 900, height: 700 },
    { padding: 50 }
  );

  assert.equal(pan.x, 550);
  assert.equal(pan.y, 550);
  assert.equal(Number(pan.scale.toFixed(3)), 0.545);
});

test("Territory scene background controls update scene and foreground overlay", async () => {
  const update = territory.territorySceneBackgroundUpdateData({
    backgroundSrc: "worlds/ptg/territory.jpg",
    backgroundColor: "#112233"
  });

  assert.equal(update.levels[0].background.src, "worlds/ptg/territory.jpg");
  assert.equal(update.levels[0].background.color, "#112233");

  const cleared = territory.territorySceneBackgroundUpdateData({
    backgroundSrc: "worlds/ptg/old.jpg",
    backgroundColor: "not-a-color",
    clearImage: true
  });

  assert.equal(cleared.levels[0].background.src, null);
  assert.equal(cleared.levels[0].background.color, "#f4f0e8");

  const originalUser = game.user;
  game.user = { isGM: true };
  try {
    const scene = {
      levels: [{
        _id: "defaultLevel0000",
        name: "Level",
        background: { src: "worlds/ptg/old.jpg", color: "#445566" }
      }],
      flags: {},
      drawings: {
        contents: [
          { id: "unmanaged", name: "Unmanaged Drawing", sort: 9999 },
          {
            id: "column",
            name: "Territory Grid: column-1",
            sort: 100,
            hidden: true,
            locked: false,
            flags: { [SYSTEM_ID]: { territorySheetElement: "column-1" } },
            getFlag(system, key) {
              return this.flags?.[system]?.[key];
            }
          },
          {
            name: "Grid Border",
            _source: {
              _id: "border",
              sort: 300,
              flags: { [SYSTEM_ID]: { territorySheetElement: "play-grid-border" } }
            }
          }
        ]
      },
      toObject() {
        return {
          levels: foundry.utils.deepClone(this.levels)
        };
      },
      async update(data) {
        this.updated = data;
        this.levels = foundry.utils.deepClone(data.levels);
      },
      async setFlag(system, key, value) {
        this.flags[system] ??= {};
        this.flags[system][key] = value;
      },
      async updateEmbeddedDocuments(documentType, updates) {
        this.embeddedUpdate = { documentType, updates };
      }
    };

    const applied = await territory.setTerritorySceneBackground(scene, {
      backgroundSrc: "worlds/ptg/territory.jpg",
      backgroundColor: "#112233"
    });

    assert.equal(applied.levels[0].background.src, "worlds/ptg/territory.jpg");
    assert.equal(applied.levels[0].background.color, "#112233");
    assert.deepEqual(scene.updated, applied);
    assert.equal(scene.flags[SYSTEM_ID].territoryBackground.src, "worlds/ptg/territory.jpg");
    assert.equal(scene.flags[SYSTEM_ID].territoryBackground.color, "#112233");
    assert.equal(scene.embeddedUpdate.documentType, "Drawing");
    const columnUpdate = scene.embeddedUpdate.updates.find(drawing => drawing._id === "column");
    const borderUpdate = scene.embeddedUpdate.updates.find(drawing => drawing._id === "border");
    assert.equal(columnUpdate.x, 100);
    assert.equal(columnUpdate.y, 0);
    assert.equal(columnUpdate.shape.width, 100);
    assert.equal(columnUpdate.hidden, false);
    assert.equal(columnUpdate.locked, true);
    assert.equal(borderUpdate.x, 100);
    assert.equal(borderUpdate.y, 100);
    assert.equal(borderUpdate.shape.width, 1000);
    assert.equal(borderUpdate.hidden, false);
    assert.equal(borderUpdate.locked, true);
  } finally {
    game.user = originalUser;
  }
});

test("Territory scene background controls report scene update failures", async () => {
  const originalUser = game.user;
  const originalError = ui.notifications.error;
  const originalWarn = console.warn;
  const errors = [];
  const warnings = [];
  game.user = { isGM: true };
  ui.notifications.error = message => errors.push(message);
  console.warn = (...args) => warnings.push(args);

  try {
    const missingUpdate = await territory.setTerritorySceneBackground({}, {
      backgroundSrc: "worlds/ptg/territory.jpg",
      backgroundColor: "#112233"
    });
    assert.equal(missingUpdate, null);

    const failedScene = {
      async update() {
        throw new Error("locked scene");
      }
    };
    const failedUpdate = await territory.setTerritorySceneBackground(failedScene, {
      backgroundSrc: "worlds/ptg/territory.jpg",
      backgroundColor: "#112233"
    });
    assert.equal(failedUpdate, null);
    assert.deepEqual(errors, [
      "Unable to update the Territory scene background: the selected scene cannot be edited.",
      "Unable to update the Territory scene background. See the console for details."
    ]);
    assert.equal(warnings.length, 1);
  } finally {
    game.user = originalUser;
    ui.notifications.error = originalError;
    console.warn = originalWarn;
  }
});

test("Territory scene background file picker uses Foundry v14 implementation", () => {
  const originalGlobalFilePicker = globalThis.FilePicker;
  const originalApps = foundry.applications.apps;
  class LegacyFilePicker {}
  class V14FilePicker {}

  try {
    delete globalThis.FilePicker;
    foundry.applications.apps = { FilePicker: { implementation: V14FilePicker } };
    assert.equal(territory.territoryFilePickerClass(), V14FilePicker);

    globalThis.FilePicker = LegacyFilePicker;
    assert.equal(territory.territoryFilePickerClass(), LegacyFilePicker);
  } finally {
    if (originalGlobalFilePicker) globalThis.FilePicker = originalGlobalFilePicker;
    else delete globalThis.FilePicker;
    foundry.applications.apps = originalApps;
  }
});

test("Territory GM drop resolves native Actor and Token payload shapes", async () => {
  const actor = {
    documentName: "Actor",
    type: "character",
    id: "owned",
    uuid: "Actor.owned",
    name: "Owned Character"
  };
  const token = {
    documentName: "Token",
    actor
  };
  const originalFromUuid = globalThis.fromUuid;
  const originalActors = game.actors;
  const warnings = [];
  const originalWarn = console.warn;

  globalThis.fromUuid = async uuid => {
    if (uuid === "Actor.owned") return actor;
    if (uuid === "Scene.scene.Token.token") return token;
    if (uuid === "Scene.scene.Token.document-token") return token;
    return null;
  };
  game.actors = new Map([
    ["owned", actor],
    ["document-owned", actor]
  ]);
  console.warn = (...args) => warnings.push(args);

  try {
    assert.equal(await territory.territoryActorFromDropData({ uuid: "Actor.owned" }), actor);
    assert.equal(await territory.territoryActorFromDropData({ actorUuid: "Actor.owned" }), actor);
    assert.equal(await territory.territoryActorFromDropData({ documentUuid: "Actor.owned" }), actor);
    assert.equal(await territory.territoryActorFromDropData({ data: { uuid: "Actor.owned" } }), actor);
    assert.equal(await territory.territoryActorFromDropData({ uuid: "Scene.scene.Token.token" }), actor);
    assert.equal(await territory.territoryActorFromDropData({ type: "Token", sceneId: "scene", tokenId: "token" }), actor);
    assert.equal(await territory.territoryActorFromDropData({ type: "Token", sceneId: "scene", documentId: "document-token" }), actor);
    assert.equal(await territory.territoryActorFromDropData({ type: "Actor", id: "owned" }), actor);
    assert.equal(await territory.territoryActorFromDropData({ type: "Actor", actorId: "owned" }), actor);
    assert.equal(await territory.territoryActorFromDropData({ type: "Actor", documentId: "document-owned" }), actor);
    assert.equal(await territory.territoryActorFromDropData({ type: "Actor", data: { actorId: "owned" } }), actor);
    assert.equal(await territory.territoryActorFromDropData({ type: "Token", id: "owned" }), actor);
    assert.equal(await territory.territoryActorFromDropData({ type: "Item", id: "owned" }), null);
    assert.equal(await territory.territoryActorFromDropData({ type: "Item", actorUuid: "Actor.owned" }), null);
    assert.equal(warnings.length, 0);
  } finally {
    globalThis.fromUuid = originalFromUuid;
    game.actors = originalActors;
    console.warn = originalWarn;
  }
});

test("Mortal-Divine tracker roster respects GM and player visibility", () => {
  const owned = {
    name: "Owned Character",
    type: "character",
    uuid: "Actor.owned",
    isOwner: true,
    ownership: { player: 3 }
  };
  const other = {
    name: "Other Character",
    type: "character",
    uuid: "Actor.other",
    isOwner: false,
    ownership: { player: 0 }
  };
  const observer = {
    name: "Observer Character",
    type: "character",
    uuid: "Actor.observer",
    isOwner: false,
    testUserPermission: (user, level) => user.id === "player" && level === "OWNER"
  };
  const npc = {
    name: "Antagonist",
    type: "antagonist",
    uuid: "Actor.npc"
  };
  const actors = [other, npc, owned, observer];

  assert.deepEqual(balance.normalizeTrackedCharacterUuids(["Actor.owned", "", "Actor.owned", "Actor.other"]), ["Actor.owned", "Actor.other"]);

  const gmRoster = balance.visibleBalanceTrackerActors(actors, {
    trackedUuids: ["Actor.other", "Actor.owned"],
    user: { id: "gm", isGM: true },
    isGM: true
  });
  assert.deepEqual(gmRoster.map(actor => actor.uuid), ["Actor.other", "Actor.owned"]);

  const playerTracked = balance.visibleBalanceTrackerActors(actors, {
    trackedUuids: ["Actor.other", "Actor.owned", "Actor.observer"],
    user: { id: "player", isGM: false },
    isGM: false
  });
  assert.deepEqual(playerTracked.map(actor => actor.uuid), ["Actor.observer", "Actor.owned"]);

  const playerFallback = balance.visibleBalanceTrackerActors(actors, {
    trackedUuids: [],
    user: { id: "player", isGM: false },
    isGM: false
  });
  assert.deepEqual(playerFallback.map(actor => actor.uuid), ["Actor.observer", "Actor.owned"]);
});

test("Mortal-Divine player bar targets owning non-GM users despite stale active flags", () => {
  const originalUser = game.user;
  game.user = { id: "gm", isGM: true };

  const actor = {
    name: "Shared Character",
    type: "character",
    uuid: "Actor.shared",
    isOwner: true,
    ownership: {
      owner: 3,
      inactive: 3,
      observer: 2,
      default: 0
    }
  };
  const users = [
    { id: "gm", name: "GM", isGM: true, active: true },
    { id: "owner", name: "Owner", isGM: false, active: true },
    { id: "inactive", name: "Inactive Owner", isGM: false, active: false },
    { id: "observer", name: "Observer", isGM: false, active: true },
    { id: "stranger", name: "Stranger", isGM: false, active: true }
  ];

  try {
    assert.equal(balance.canViewBalanceActor(actor, users[3]), false);
    assert.deepEqual(balance.balanceBarOwnerUsers(actor, users).map(user => user.id), ["owner", "inactive"]);
  } finally {
    game.user = originalUser;
  }
});

test("Mortal-Divine template exposes GM send control and compact player bar surface", async () => {
  const template = await fs.readFile(path.join(repoRoot, "templates/apps/mortal-divine-tracker.hbs"), "utf8");

  assert.match(template, /data-balance-show-player/);
  assert.match(template, /data-balance-player-bar/);
  assert.match(template, /PTG\.Balance\.ShowPlayerBar/);
  assert.match(template, /PTG\.Balance\.PlayerBarContext/);
});

test("Mortal-Divine tracker resolves dropped Character actors for GM roster import", async () => {
  const actor = {
    documentName: "Actor",
    type: "character",
    id: "owned",
    uuid: "Actor.owned",
    name: "Owned Character"
  };
  const token = {
    documentName: "Token",
    actor
  };
  const originalFromUuid = globalThis.fromUuid;
  const originalActors = game.actors;
  const warnings = [];
  const originalWarn = console.warn;

  globalThis.fromUuid = async uuid => {
    if (uuid === "Actor.owned") return actor;
    if (uuid === "Scene.scene.Token.token") return token;
    return null;
  };
  game.actors = new Map([["owned", actor]]);
  console.warn = (...args) => warnings.push(args);

  try {
    assert.equal(await balance.balanceActorFromDropData({ uuid: "Actor.owned" }), actor);
    assert.equal(await balance.balanceActorFromDropData({ uuid: "Scene.scene.Token.token" }), actor);
    assert.equal(await balance.balanceActorFromDropData({ type: "Actor", id: "owned" }), actor);
    assert.equal(await balance.balanceActorFromDropData({ type: "Item", id: "item" }), null);
    assert.equal(warnings.length, 0);
  } finally {
    globalThis.fromUuid = originalFromUuid;
    game.actors = originalActors;
    console.warn = originalWarn;
  }
});

test("Premade scene refresh replaces stale managed drawing rows", async () => {
  const [scene] = scenes.getPremadeScenes();
  const sourceDrawing = scene.drawings[0];
  const staleDrawing = {
    id: "oldDrawing000001",
    name: sourceDrawing.name,
    flags: sourceDrawing.flags,
    getFlag(system, key) {
      return this.flags?.[system]?.[key];
    },
    toObject() {
      return {
        ...foundry.utils.deepClone(sourceDrawing),
        _id: this.id,
        author: "",
        shape: {
          ...sourceDrawing.shape,
          type: "rectangle"
        }
      };
    }
  };
  const document = {
    drawings: [staleDrawing],
    deleted: [],
    created: [],
    async deleteEmbeddedDocuments(documentType, ids) {
      this.deleted.push({ documentType, ids });
    },
    async createEmbeddedDocuments(documentType, drawings) {
      this.created.push({ documentType, drawings });
    }
  };

  const changed = await compendiums.refreshPremadeSceneDrawings(document, { drawings: [sourceDrawing] });

  assert.equal(changed, true);
  assert.deepEqual(document.deleted, [{ documentType: "Drawing", ids: ["oldDrawing000001"] }]);
  assert.equal(document.created.length, 1);
  assert.equal(document.created[0].documentType, "Drawing");
  assert.equal(document.created[0].drawings[0].author, "0000000000000000");
  assert.equal(document.created[0].drawings[0].shape.type, "r");
});

test("Premade scene refresh skips already-current managed drawing rows", async () => {
  const [scene] = scenes.getPremadeScenes();
  const sourceDrawing = scene.drawings[0];
  const document = {
    drawings: [{
      id: "currentDrawing01",
      name: sourceDrawing.name,
      flags: sourceDrawing.flags,
      getFlag(system, key) {
        return this.flags?.[system]?.[key];
      },
      toObject() {
        return {
          ...foundry.utils.deepClone(sourceDrawing),
          _id: this.id
        };
      }
    }],
    async deleteEmbeddedDocuments() {
      throw new Error("deleteEmbeddedDocuments should not be called");
    },
    async createEmbeddedDocuments() {
      throw new Error("createEmbeddedDocuments should not be called");
    }
  };

  assert.equal(await compendiums.refreshPremadeSceneDrawings(document, { drawings: [sourceDrawing] }), false);
});

test("Premade compendium document updates include the existing pack document id", () => {
  const document = {
    id: "existingPackDoc001",
    toObject() {
      return { _id: "fallbackPackDoc001" };
    }
  };

  assert.deepEqual(
    compendiums.compendiumDocumentUpdateData(document, {
      _id: "sourceDocumentId",
      folder: "folder001",
      name: "Updated Entry"
    }),
    {
      _id: "existingPackDoc001",
      folder: "folder001",
      name: "Updated Entry"
    }
  );
});

test("Premade compendium lock helpers detect and sync metadata-only lock state", async () => {
  const calls = [];
  const pack = {
    metadata: { locked: true },
    async configure(update) {
      calls.push(update);
    }
  };

  assert.equal(compendiums.isCompendiumPackLocked(pack), true);

  await compendiums.setCompendiumPackLocked(pack, false);
  assert.deepEqual(calls, [{ locked: false }]);
  assert.equal(pack.metadata.locked, false);
  assert.equal(pack.locked, false);
  assert.equal(compendiums.isCompendiumPackLocked(pack), false);

  await compendiums.setCompendiumPackLocked(pack, true);
  assert.deepEqual(calls, [{ locked: false }, { locked: true }]);
  assert.equal(pack.metadata.locked, true);
  assert.equal(pack.locked, true);
  assert.equal(compendiums.isCompendiumPackLocked(pack), true);
});

test("Premade compendium lock helper reports when Foundry keeps a pack locked", async () => {
  const calls = [];
  const pack = {
    metadata: { locked: true },
    get locked() {
      return true;
    },
    async configure(update) {
      calls.push(update);
    }
  };

  assert.equal(await compendiums.setCompendiumPackLocked(pack, false), false);
  assert.deepEqual(calls, [{ locked: false }]);
  assert.equal(pack.metadata.locked, false);
  assert.equal(compendiums.isCompendiumPackLocked(pack), true);
});

test("Premade compendium startup skip treats package packs as protected", () => {
  assert.equal(
    compendiums.shouldSkipPremadePackWrites({ metadata: { packageType: "system", locked: false } }, { skipLockedPacks: true }),
    true
  );
  assert.equal(
    compendiums.shouldSkipPremadePackWrites({ metadata: { packageType: "world", locked: false } }, { skipLockedPacks: true }),
    false
  );
  assert.equal(
    compendiums.shouldSkipPremadePackWrites({ metadata: { packageType: "system", locked: false } }, { skipLockedPacks: false }),
    false
  );
});

test("Premade rules journal refresh replaces stale embedded page rows", async () => {
  const rulesJournals = await journals.getPremadeJournals();
  const battleJournal = rulesJournals.find(journal => journal.name === "06. Divine Battles");
  assert.ok(battleJournal, "Divine Battles source journal");

  const stalePages = Array.from({ length: 3 }, (_, index) => ({
    id: `oldPage${index}`,
    name: "Timing, Initiative, and Turns",
    flags: {
      [SYSTEM_ID]: {
        premade: true,
        kind: "rules-reference",
        slug: `stale-timing-${index}`
      }
    },
    toObject() {
      return {
        _id: this.id,
        name: this.name,
        type: "text",
        text: { content: "<p>Stale repeated page.</p>" },
        flags: this.flags
      };
    }
  }));
  const document = {
    pages: stalePages,
    deleted: [],
    created: [],
    async deleteEmbeddedDocuments(documentType, ids) {
      this.deleted.push({ documentType, ids });
    },
    async createEmbeddedDocuments(documentType, pages) {
      this.created.push({ documentType, pages });
    }
  };

  const changed = await compendiums.refreshPremadeJournalPages(document, battleJournal);

  assert.equal(changed, true);
  assert.deepEqual(document.deleted, [{ documentType: "JournalEntryPage", ids: ["oldPage0", "oldPage1", "oldPage2"] }]);
  assert.equal(document.created.length, 1);
  assert.equal(document.created[0].documentType, "JournalEntryPage");
  assert.deepEqual(
    document.created[0].pages.map(page => page.name),
    battleJournal.pages.map(page => page.name)
  );
  assert.ok(document.created[0].pages.some(page => page.name === "Battle of Fists Actions and Defenses"));
  assert.ok(document.created[0].pages.some(page => page.name === "Battle of Wits Actions and Defenses"));
});

function groupByType(documents) {
  const grouped = new Map();
  for (const document of documents) {
    if (!grouped.has(document.type)) grouped.set(document.type, []);
    grouped.get(document.type).push(document);
  }
  return grouped;
}

function plainText(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function plainWordCount(value) {
  const text = plainText(value);
  return text ? text.split(/\s+/).length : 0;
}

function escapeRegExp(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
