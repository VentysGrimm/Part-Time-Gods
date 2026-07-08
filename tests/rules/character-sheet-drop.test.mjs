import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment } from "../helpers/foundry-test-env.mjs";

const DROP_MATRIX_TYPES = [
  "occupation",
  "archetype",
  "domain",
  "theology",
  "blessing",
  "curse",
  "truth",
  "relic",
  "bond",
  "worshipper",
  "vassal",
  "condition",
  "weapon",
  "armor"
];

test("character sheet drop copies the #131 item matrix into actor inventory", async () => {
  installFoundryTestEnvironment();

  game.items = new Map();

  const createdDocuments = [];
  const appliedChoices = [];
  const actor = {
    uuid: "Actor.qa-character",
    async createEmbeddedDocuments(documentType, documents) {
      createdDocuments.push({ documentType, documents });
      return documents.map(data => ({
        ...data,
        type: data.type,
        async delete() {}
      }));
    },
    async applyChoice(item) {
      appliedChoices.push(item.type);
      return true;
    }
  };

  const { PTGCharacterSheet } = await import("../../module/sheets/character-sheet.mjs?matrix-drop");
  const sheet = Object.assign(Object.create(PTGCharacterSheet.prototype), { actor });

  for (const type of DROP_MATRIX_TYPES) {
    const item = matrixItem(type);
    game.items.set(item.id, item);
    assert.equal(await sheet._onDrop(dropEvent({ type: "Item", id: item.id })), false);
  }

  assert.equal(createdDocuments.length, DROP_MATRIX_TYPES.length);
  assert.deepEqual(createdDocuments.map(entry => entry.documentType), DROP_MATRIX_TYPES.map(() => "Item"));
  assert.deepEqual(createdDocuments.map(entry => entry.documents[0].type), DROP_MATRIX_TYPES);
  assert.deepEqual(appliedChoices, ["occupation", "archetype", "domain", "theology"]);

  const armorDocument = createdDocuments.find(entry => entry.documents[0].type === "armor").documents[0];
  assert.deepEqual(armorDocument, {
    name: "QA Armor Live Proof",
    type: "armor",
    system: {
      amount: 1,
      rating: 2,
      cost: 0,
      weight: 0,
      equipped: true
    }
  });
});

test("character sheet drop rejects items in mismatched typed sections", async () => {
  installFoundryTestEnvironment();

  const warnings = [];
  ui.notifications.warn = message => warnings.push(message);

  const armor = {
    documentName: "Item",
    id: "world-armor",
    name: "QA Armor Live Proof",
    type: "armor",
    parent: null,
    toObject: () => ({ name: "QA Armor Live Proof", type: "armor", system: {} })
  };
  game.items = new Map([[armor.id, armor]]);

  let created = false;
  const actor = {
    uuid: "Actor.qa-character",
    async createEmbeddedDocuments() {
      created = true;
      return [];
    }
  };

  const { PTGCharacterSheet } = await import("../../module/sheets/character-sheet.mjs?typed-drop");
  const sheet = Object.assign(Object.create(PTGCharacterSheet.prototype), { actor });
  const result = await sheet._onDrop(dropEvent(
    { type: "Item", id: armor.id },
    { dataset: { itemDropType: "truth" } }
  ));

  assert.equal(result, false);
  assert.equal(created, false);
  assert.deepEqual(warnings, ["Drop a TYPES.Item.truth item in this section."]);
});

function dropEvent(data, closestTarget = null) {
  return {
    dataTransfer: {
      getData: type => type === "text/plain" ? JSON.stringify(data) : ""
    },
    target: {
      closest: selector => selector === "[data-item-drop-type]" ? closestTarget : null
    }
  };
}

function matrixItem(type) {
  const id = `world-${type}`;
  const name = type === "armor" ? "QA Armor Live Proof" : `QA ${type}`;
  return {
    documentName: "Item",
    id,
    uuid: `Item.${id}`,
    name,
    type,
    parent: null,
    toObject: () => ({
      _id: id,
      name,
      type,
      system: type === "armor"
        ? {
            amount: 1,
            rating: 2,
            cost: 0,
            weight: 0,
            equipped: true
          }
        : {}
    })
  };
}
