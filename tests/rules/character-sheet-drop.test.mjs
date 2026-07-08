import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment } from "../helpers/foundry-test-env.mjs";

test("character sheet drop copies armor into the actor gear inventory", async () => {
  installFoundryTestEnvironment();

  const worldArmor = {
    documentName: "Item",
    id: "world-armor",
    uuid: "Item.world-armor",
    name: "QA Armor Live Proof",
    type: "armor",
    parent: null,
    toObject: () => ({
      _id: "world-armor",
      name: "QA Armor Live Proof",
      type: "armor",
      system: {
        amount: 1,
        rating: 2,
        cost: 0,
        weight: 0,
        equipped: true
      }
    })
  };
  game.items = new Map([[worldArmor.id, worldArmor]]);

  const createdDocuments = [];
  const actor = {
    uuid: "Actor.qa-character",
    async createEmbeddedDocuments(documentType, documents) {
      createdDocuments.push({ documentType, documents });
      return documents.map(data => ({ ...data, type: data.type }));
    }
  };

  const { PTGCharacterSheet } = await import("../../module/sheets/character-sheet.mjs?armor-drop");
  const sheet = Object.assign(Object.create(PTGCharacterSheet.prototype), { actor });
  const result = await sheet._onDrop(dropEvent({ type: "Item", id: worldArmor.id }));

  assert.equal(result, false);
  assert.equal(createdDocuments.length, 1);
  assert.equal(createdDocuments[0].documentType, "Item");
  assert.deepEqual(createdDocuments[0].documents, [{
    name: "QA Armor Live Proof",
    type: "armor",
    system: {
      amount: 1,
      rating: 2,
      cost: 0,
      weight: 0,
      equipped: true
    }
  }]);
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
