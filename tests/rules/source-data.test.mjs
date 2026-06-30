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

function groupByType(documents) {
  const grouped = new Map();
  for (const document of documents) {
    if (!grouped.has(document.type)) grouped.set(document.type, []);
    grouped.get(document.type).push(document);
  }
  return grouped;
}
