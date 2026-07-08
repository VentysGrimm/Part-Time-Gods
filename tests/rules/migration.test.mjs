import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment, SYSTEM_ID } from "../helpers/foundry-test-env.mjs";

test("PTG schema migration preserves legacy attachment text in actor flags", async () => {
  installFoundryTestEnvironment();

  const settingsValues = new Map([[`${SYSTEM_ID}.schemaVersion`, 0]]);
  game.user = { isGM: true };
  game.settings = {
    get: (scope, key) => settingsValues.get(`${scope}.${key}`),
    set: async (scope, key, value) => {
      settingsValues.set(`${scope}.${key}`, value);
      return value;
    },
    register: () => {}
  };

  const actorUpdates = [];
  game.actors = [
    {
      type: "character",
      system: {
        attachments: {
          bonds: "Mortal family anchor",
          blessings: "Can still call the rain",
          curses: "   "
        }
      },
      getFlag: (scope, key) => scope === SYSTEM_ID && key === "legacyAttachmentText"
        ? { relics: "Keep existing relic note" }
        : {},
      update: async update => {
        actorUpdates.push(update);
      }
    },
    {
      type: "antagonist",
      system: { attachments: { bonds: "Ignored antagonist text" } },
      getFlag: () => ({}),
      update: async () => {
        throw new Error("non-character actors should not be migrated");
      }
    }
  ];

  const messages = [];
  ChatMessage.create = async data => {
    messages.push(data);
    return data;
  };

  const { PTG_SYSTEM_SCHEMA_VERSION, runPTGMigrations } = await import("../../module/migration/ptg-migrations.mjs?schema-preserve");
  await runPTGMigrations({ notify: true });

  assert.equal(settingsValues.get(`${SYSTEM_ID}.schemaVersion`), PTG_SYSTEM_SCHEMA_VERSION);
  assert.equal(actorUpdates.length, 1);
  assert.deepEqual(actorUpdates[0][`flags.${SYSTEM_ID}.legacyAttachmentText`], {
    relics: "Keep existing relic note",
    bonds: "Mortal family anchor",
    blessings: "Can still call the rain"
  });
  assert.equal(actorUpdates[0][`flags.${SYSTEM_ID}.attachmentSourceOfTruth`], "embedded-items");
  assert.match(messages[0].content, /Characters scanned:<\/strong> 1/);
  assert.match(messages[0].content, /Legacy attachment fields preserved:<\/strong> 2/);
});

test("canonical embedded item migration converts legacy sheet notes once", async () => {
  installFoundryTestEnvironment();

  const createdItems = [];
  const actorUpdates = [];
  const setFlags = [];
  const actor = {
    type: "character",
    name: "Legacy QA Character",
    system: {
      conditions: "Bloodied & rattled",
      attachments: {
        bonds: "Already migrated bond text",
        relics: "Key of Rain\n\nOpens old weather doors."
      }
    },
    items: [
      {
        type: "bond",
        flags: {
          [SYSTEM_ID]: {
            canonicalMigration: "canonical-embedded-items-v1",
            legacyPath: "system.attachments.bonds"
          }
        }
      }
    ],
    getFlag: () => ({}),
    createEmbeddedDocuments: async (documentType, data) => {
      createdItems.push({ documentType, data });
      return data;
    },
    update: async update => {
      actorUpdates.push(update);
    },
    setFlag: async (scope, key, value) => {
      setFlags.push({ scope, key, value });
      return value;
    }
  };

  const { migrateActorToCanonicalEmbeddedItems } = await import("../../module/migration/canonical-embedded-items.mjs?canonical-notes");
  const result = await migrateActorToCanonicalEmbeddedItems(actor);

  assert.deepEqual(result, {
    migrated: true,
    createdItems: 2,
    clearedFields: 3
  });
  assert.equal(createdItems[0].documentType, "Item");
  assert.deepEqual(createdItems[0].data.map(item => item.type), ["condition", "relic"]);
  assert.equal(createdItems[0].data[0].name, "Legacy Condition Notes");
  assert.equal(createdItems[0].data[0].flags[SYSTEM_ID].legacyPath, "system.conditions");
  assert.equal(createdItems[0].data[0].flags[SYSTEM_ID].canonicalEmbeddedItem, true);
  assert.match(createdItems[0].data[0].system.effect, /Bloodied &amp; rattled/);
  assert.equal(createdItems[0].data[1].name, "Legacy Relic Notes");
  assert.match(createdItems[0].data[1].system.description, /Opens old weather doors\./);
  assert.deepEqual(actorUpdates, [{
    "system.conditions": "",
    "system.attachments.bonds": "",
    "system.attachments.relics": ""
  }]);
  assert.equal(setFlags[0].scope, SYSTEM_ID);
  assert.equal(setFlags[0].key, "schemaMigrations");
  assert.equal(setFlags[0].value.canonicalEmbeddedItems.id, "canonical-embedded-items-v1");
  assert.equal(setFlags[0].value.canonicalEmbeddedItems.createdItems, 2);
  assert.deepEqual(setFlags[0].value.canonicalEmbeddedItems.clearedFields, [
    "system.conditions",
    "system.attachments.bonds",
    "system.attachments.relics"
  ]);
});
