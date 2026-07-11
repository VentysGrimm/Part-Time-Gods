import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment, SYSTEM_ID } from "../helpers/foundry-test-env.mjs";

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

test("Chapter 4 rules data covers dice, resource, and consequence procedures", () => {
  const chapterFourRules = items.PTG_PREMADE_ITEMS.filter(item => item.type === "power" && item.flags?.[SYSTEM_ID]?.kind === "chapter-4-rule");
  const criticalFailureEffects = items.PTG_PREMADE_ITEMS.filter(item => item.type === "condition" && item.flags?.[SYSTEM_ID]?.kind === "critical-failure-effect");
  const tableNames = new Set(rollTables.PTG_PREMADE_ROLL_TABLES.map(table => table.name));

  assert.equal(chapterFourRules.length, 22);
  assert.equal(criticalFailureEffects.length, 11);
  for (const name of ["Rolling Dice", "Fate Die", "Boosts", "Pantheon Pool", "Going to Work", "Interacting with Territory"]) {
    const item = chapterFourRules.find(candidate => candidate.name === name);
    assert.ok(item, `${name} Chapter 4 rule item`);
    assert.equal(item.system.usage.kind, "chapter-4-rule");
    assert.ok(item.system.automation.action, `${name} automation action`);
    assert.match(item.system.sourceId, /^ptg2e\.chapter-4\.rule\./);
  }

  const fateDie = chapterFourRules.find(item => item.name === "Fate Die");
  assert.equal(fateDie.system.automation.roll.fateDie, true);
  assert.equal(fateDie.system.automation.roll.successesOnSuccess, 2);

  const boosts = chapterFourRules.find(item => item.name === "Boosts");
  assert.equal(boosts.system.automation.roll.boostThreshold, 3);

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

test("Chapter 5 battle data covers actions, defenses, gear, and conditions", () => {
  const chapterFiveRules = items.PTG_PREMADE_ITEMS.filter(item => item.type === "power" && item.flags?.[SYSTEM_ID]?.kind === "chapter-5-rule");
  const battleActions = items.PTG_PREMADE_ITEMS.filter(item => item.type === "power" && item.flags?.[SYSTEM_ID]?.kind === "battle-action");
  const chapterFiveItems = items.PTG_PREMADE_ITEMS.filter(item => {
    const page = Number(item.flags?.[SYSTEM_ID]?.page ?? item.system?.sourcePage ?? 0);
    return page >= 205 && page <= 212;
  });
  const counts = groupByType(chapterFiveItems);

  assert.equal(chapterFiveRules.length, 16);
  assert.equal(battleActions.length, 46);
  for (const name of ["Determining Initiative", "Turn Sequence", "Taking Damage", "Anatomy of Damage", "Armor", "Weapons", "Range"]) {
    const item = chapterFiveRules.find(candidate => candidate.name === name);
    assert.ok(item, `${name} Chapter 5 rule item`);
    assert.equal(item.system.usage.kind, "chapter-5-rule");
    assert.match(item.system.sourceId, /^ptg2e\.chapter-5\.rule\./);
  }

  for (const name of [
    "Battle of Fists Quick Action: Feint",
    "Battle of Fists Standard Action: Close Combat Attack",
    "Battle of Fists Standard Defense: Dodge",
    "Battle of Wits Quick Action: Mislead",
    "Battle of Wits Standard Action: Fast Talk",
    "Battle of Wits Standard Defense: Stand My Ground"
  ]) {
    const item = battleActions.find(candidate => candidate.name === name);
    assert.ok(item, `${name} battle action`);
    assert.equal(item.system.automation.roll.type, "battle-action");
    assert.ok(["quick", "standard"].includes(item.system.activation));
    assert.ok(["health", "psyche"].includes(item.system.automation.roll.damageResource));
  }

  assert.ok((counts.get("condition") ?? []).length >= 20);
  assert.ok((counts.get("gearQuality") ?? []).length >= 42);
  assert.ok((counts.get("armor") ?? []).length >= 14);
  assert.ok((counts.get("weapon") ?? []).length >= 9);
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

test("Premade territory scene drawings use Foundry v14 drawing schema", () => {
  const [scene] = scenes.getPremadeScenes();

  assert.equal(scene.drawings.length, 24);
  for (const drawing of scene.drawings) {
    assert.match(drawing.author, /^[A-Za-z0-9]{16}$/, `${drawing.name} has a non-null author id`);
    assert.equal(drawing.shape?.type, "r", `${drawing.name} uses v14 rectangle shape code`);
    assert.equal(typeof drawing.shape?.width, "number", `${drawing.name} shape width`);
    assert.equal(typeof drawing.shape?.height, "number", `${drawing.name} shape height`);
  }
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

test("Territory scene background update preserves grid overlay fields", () => {
  const update = territory.territorySceneBackgroundUpdateData({
    backgroundSrc: "worlds/ptg/territory.jpg",
    backgroundColor: "#112233"
  });

  assert.equal(update["background.src"], "worlds/ptg/territory.jpg");
  assert.equal(update.backgroundColor, "#112233");

  const cleared = territory.territorySceneBackgroundUpdateData({
    backgroundSrc: "worlds/ptg/old.jpg",
    backgroundColor: "not-a-color",
    clearImage: true
  });

  assert.equal(cleared["background.src"], "");
  assert.equal(cleared.backgroundColor, "#f4f0e8");
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

function groupByType(documents) {
  const grouped = new Map();
  for (const document of documents) {
    if (!grouped.has(document.type)) grouped.set(document.type, []);
    grouped.get(document.type).push(document);
  }
  return grouped;
}
