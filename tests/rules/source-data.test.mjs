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
