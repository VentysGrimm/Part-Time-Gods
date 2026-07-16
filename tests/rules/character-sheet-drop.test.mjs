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
  "power",
  "gearQuality",
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
    isOwner: true,
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
  const { toggleSheetEditLock } = await import("../../module/sheets/sheet-edit-lock.mjs");
  const sheet = Object.assign(Object.create(PTGCharacterSheet.prototype), { actor });
  toggleSheetEditLock(sheet);

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
    isOwner: true,
    async createEmbeddedDocuments() {
      created = true;
      return [];
    }
  };

  const { PTGCharacterSheet } = await import("../../module/sheets/character-sheet.mjs?typed-drop");
  const { toggleSheetEditLock } = await import("../../module/sheets/sheet-edit-lock.mjs");
  const sheet = Object.assign(Object.create(PTGCharacterSheet.prototype), { actor });
  toggleSheetEditLock(sheet);
  const result = await sheet._onDrop(dropEvent(
    { type: "Item", id: armor.id },
    { dataset: { itemDropType: "truth" } }
  ));

  assert.equal(result, false);
  assert.equal(created, false);
  assert.deepEqual(warnings, ["Drop a TYPES.Item.truth item in this section."]);
});

test("character sheet drop converts Attachment of Choice items into concrete attachments", async () => {
  installFoundryTestEnvironment();

  const createdDocuments = [];
  const promptCalls = [];
  foundry.applications.api.DialogV2.prompt = async options => {
    promptCalls.push(options);
    return {
      kind: "relic",
      name: "QA Dropped Relic",
      definition: "A brass key to the rain",
      level: 3
    };
  };

  const attachmentChoice = {
    documentName: "Item",
    id: "attachment-choice",
    uuid: "Item.attachment-choice",
    name: "Choice of Relic",
    type: "attachment",
    parent: null,
    system: {
      level: 3,
      choiceSource: "QA Choice Source",
      choiceLabel: "Relic of Choice",
      summary: "Choose a relic granted by the source."
    }
  };
  game.items = new Map([[attachmentChoice.id, attachmentChoice]]);

  const actor = {
    type: "character",
    uuid: "Actor.qa-character",
    isOwner: true,
    async createEmbeddedDocuments(documentType, documents) {
      createdDocuments.push({ documentType, documents });
      return documents;
    }
  };

  const { PTGCharacterSheet } = await import("../../module/sheets/character-sheet.mjs?attachment-choice-drop");
  const { toggleSheetEditLock } = await import("../../module/sheets/sheet-edit-lock.mjs");
  const sheet = Object.assign(new PTGCharacterSheet(), {
    actor,
    element: null,
    render: () => {}
  });
  toggleSheetEditLock(sheet);

  assert.equal(await sheet._onDrop(dropEvent({ type: "Item", id: attachmentChoice.id })), false);
  assert.equal(promptCalls.length, 1);
  assert.equal(promptCalls[0].window.title, "Choose Attachment Type");
  assert.equal(createdDocuments.length, 1);
  assert.equal(createdDocuments[0].documentType, "Item");

  const relic = createdDocuments[0].documents[0];
  assert.equal(relic.name, "QA Dropped Relic");
  assert.equal(relic.type, "relic");
  assert.equal(relic.system.cost, 3);
  assert.equal(relic.system.choiceSource, "QA Choice Source");
  assert.equal(relic.system.choiceKind, "relic");
  assert.equal(relic.system.choiceLabel, "Relic of Choice");
  assert.match(relic.system.description, /A brass key to the rain/);
  assert.equal(relic.flags["part-time-gods"].canonicalSource, "attachment-choice-drop");
  assert.equal(relic.flags["part-time-gods"].sourceItemUuid, attachmentChoice.uuid);
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
