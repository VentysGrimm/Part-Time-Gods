import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment } from "../helpers/foundry-test-env.mjs";

test("PTG combat controls builds its dialog from collection-backed combatants", async () => {
  installFoundryTestEnvironment();

  let promptConfig = null;
  foundry.applications.api.DialogV2.prompt = async config => {
    promptConfig = config;
    return null;
  };

  game.user = { isGM: true };

  const combatant = {
    id: "qa-combatant",
    name: "QA Character",
    actor: {
      items: [],
      system: { derived: { initiative: 2 } },
      conditionRollEffects: () => ({ modifiers: [] })
    }
  };

  const { openPTGCombatControls } = await import("../../module/combat/ptg-combat.mjs?dialog-render");
  await openPTGCombatControls({
    combat: {
      name: "QA Combat",
      combatants: new Map([[combatant.id, combatant]])
    }
  });

  assert.ok(promptConfig, "combat helper prompts for an action");
  assert.match(promptConfig.content, /QA Character/);
  assert.match(promptConfig.content, /Post Round and Turn Sequence/);
});

test("PTG initiative updates collection-backed combatants", async () => {
  installFoundryTestEnvironment();

  const rollInputs = [];
  globalThis.Roll = class {
    constructor(formula, data) {
      this.formula = formula;
      this.data = data;
      rollInputs.push({ formula, data });
      this.total = Number(data.initiative ?? 0) + 5;
    }

    async evaluate() {
      return this;
    }
  };

  const characterCombatant = {
    id: "qa-character",
    actor: {
      type: "character",
      system: { derived: { initiative: 5 } },
      conditionRollEffects: ({ mode }) => mode === "initiative" ? { modifiers: [{ value: 2 }] } : { modifiers: [] }
    }
  };
  const antagonistCombatant = {
    id: "qa-antagonist",
    actor: {
      type: "antagonist",
      system: { initiative: 4 },
      conditionRollEffects: ({ mode }) => mode === "initiative" ? { modifiers: [{ value: -1 }] } : { modifiers: [] }
    }
  };
  const updateCalls = [];
  const combat = {
    combatants: new Map([
      [characterCombatant.id, characterCombatant],
      [antagonistCombatant.id, antagonistCombatant]
    ]),
    updateEmbeddedDocuments: async (documentType, updates) => {
      updateCalls.push({ documentType, updates });
    }
  };

  const { rollPTGInitiative } = await import("../../module/combat/ptg-combat.mjs?initiative");
  const updates = await rollPTGInitiative(combat);

  assert.deepEqual(rollInputs, [
    { formula: "1d10 + @initiative", data: { initiative: 7 } },
    { formula: "1d10 + @initiative", data: { initiative: 3 } }
  ]);
  assert.deepEqual(updates, [
    { _id: "qa-character", initiative: 12 },
    { _id: "qa-antagonist", initiative: 8 }
  ]);
  assert.deepEqual(updateCalls, [{
    documentType: "Combatant",
    updates: [
      { _id: "qa-character", initiative: 12 },
      { _id: "qa-antagonist", initiative: 8 }
    ]
  }]);
});

test("PTG statblock combat rolls count d10 successes", async () => {
  installFoundryTestEnvironment();

  globalThis.Roll = class {
    constructor(formula) {
      this.formula = formula;
      this.dice = [];
    }

    async evaluate() {
      this.dice = [{ results: [7, 9, 10, 4].map(result => ({ result })) }];
      return this;
    }
  };

  const { rollPTGStatblockPool } = await import("../../module/combat/ptg-combat.mjs?statblock-roll");
  const result = await rollPTGStatblockPool({
    name: "QA Antagonist",
    system: { attack: 4 }
  }, "attack");

  assert.equal(result.pool, 4);
  assert.equal(result.successes, 4);
  assert.equal(result.roll.formula, "4d10");
});

test("PTG combat controls records action markers for a selected combatant", async () => {
  installFoundryTestEnvironment();

  foundry.applications.api.DialogV2.prompt = async () => ({
    combatantId: "qa-combatant",
    action: "quickAction",
    notes: "QA quick action marker"
  });
  game.user = { isGM: true };

  const createdMessages = [];
  ChatMessage.create = async data => {
    createdMessages.push(data);
    return data;
  };

  const updateCalls = [];
  const combatant = {
    id: "qa-combatant",
    name: "QA Character",
    actor: {
      name: "QA Character",
      items: [],
      system: { resources: { health: { value: 5, max: 8 } } }
    },
    getFlag: () => null,
    update: async update => {
      updateCalls.push(update);
    }
  };
  const combat = {
    name: "QA Combat",
    round: 3,
    combatants: new Map([[combatant.id, combatant]])
  };
  game.combat = combat;

  const { openPTGCombatControls } = await import("../../module/combat/ptg-combat.mjs?action-marker");
  const result = await openPTGCombatControls({ combat });

  assert.equal(result, combatant);
  assert.deepEqual(updateCalls, [{
    "flags.part-time-gods.combat": {
      round: 3,
      quickAction: true,
      standardAction: false,
      quickDefense: false,
      standardDefense: false,
      notes: "QA quick action marker"
    }
  }]);
  assert.match(createdMessages[0].content, /Quick Action/);
  assert.match(createdMessages[0].content, /QA quick action marker/);
});

test("PTG combat controls applies healing to a selected combatant actor", async () => {
  installFoundryTestEnvironment();

  foundry.applications.api.DialogV2.prompt = async () => ({
    combatantId: "qa-combatant",
    action: "healing",
    healingResource: "health",
    healingAmount: 2,
    notes: "QA combat healing"
  });
  game.user = { isGM: true };

  const createdMessages = [];
  ChatMessage.create = async data => {
    createdMessages.push(data);
    return data;
  };

  const updates = [];
  const actor = {
    name: "QA Character",
    items: [],
    system: {
      resources: {
        health: { value: 5, max: 8 },
        psyche: { value: 8, max: 8 }
      }
    },
    async update(update) {
      updates.push(update);
      if ("system.resources.health.value" in update) {
        this.system.resources.health.value = update["system.resources.health.value"];
      }
    }
  };
  const combatant = {
    id: "qa-combatant",
    name: "QA Character",
    actor
  };
  const combat = {
    name: "QA Combat",
    round: 3,
    combatants: new Map([[combatant.id, combatant]])
  };

  const { openPTGCombatControls } = await import("../../module/combat/ptg-combat.mjs?healing");
  const result = await openPTGCombatControls({ combat });

  assert.equal(result, combatant);
  assert.deepEqual(updates, [{ "system.resources.health.value": 7 }]);
  assert.equal(actor.system.resources.health.value, 7);
  assert.match(createdMessages[0].content, /Recover or Heal/);
  assert.match(createdMessages[0].content, /Health 5 -&gt; 7/);
  assert.match(createdMessages[0].content, /QA combat healing/);
});

test("PTG combat controls restores scalar statblock health above zero", async () => {
  installFoundryTestEnvironment();

  foundry.applications.api.DialogV2.prompt = async () => ({
    combatantId: "qa-antagonist",
    action: "healing",
    healingResource: "health",
    healingAmount: 1,
    notes: "QA antagonist restore"
  });
  game.user = { isGM: true };

  const createdMessages = [];
  ChatMessage.create = async data => {
    createdMessages.push(data);
    return data;
  };

  const updates = [];
  const actor = {
    name: "QA Antagonist",
    items: [],
    system: {
      health: 0,
      psyche: 2
    },
    async update(update) {
      updates.push(update);
      if ("system.health" in update) {
        this.system.health = update["system.health"];
      }
    }
  };
  const combatant = {
    id: "qa-antagonist",
    name: "QA Antagonist",
    actor
  };
  const combat = {
    name: "QA Combat",
    round: 3,
    combatants: new Map([[combatant.id, combatant]])
  };

  const { openPTGCombatControls } = await import("../../module/combat/ptg-combat.mjs?scalar-healing");
  const result = await openPTGCombatControls({ combat });

  assert.equal(result, combatant);
  assert.deepEqual(updates, [{ "system.health": 1 }]);
  assert.equal(actor.system.health, 1);
  assert.match(createdMessages[0].content, /Recover or Heal/);
  assert.match(createdMessages[0].content, /Health 0 -&gt; 1/);
  assert.match(createdMessages[0].content, /QA antagonist restore/);
});

test("PTG combat controls applies selected Psyche damage to a combatant actor", async () => {
  installFoundryTestEnvironment();

  foundry.applications.api.DialogV2.prompt = async () => ({
    combatantId: "qa-combatant",
    action: "damage",
    damageResource: "psyche",
    damage: 3,
    applyArmor: true,
    damageTag: "social pressure",
    notes: "QA psyche damage"
  });
  game.user = { isGM: true };

  const createdMessages = [];
  ChatMessage.create = async data => {
    createdMessages.push(data);
    return data;
  };

  const updates = [];
  const actor = {
    name: "QA Character",
    items: [{ type: "armor", system: { equipped: true, rating: 5 } }],
    system: {
      resources: {
        health: { value: 6, max: 8 },
        psyche: { value: 7, max: 8 }
      },
      derived: { armor: 5 }
    },
    async update(update) {
      updates.push(update);
      if ("system.resources.psyche.value" in update) {
        this.system.resources.psyche.value = update["system.resources.psyche.value"];
      }
    }
  };
  const combatant = {
    id: "qa-combatant",
    name: "QA Character",
    actor
  };
  const combat = {
    name: "QA Combat",
    round: 3,
    combatants: new Map([[combatant.id, combatant]])
  };

  const { openPTGCombatControls } = await import("../../module/combat/ptg-combat.mjs?damage-resource");
  const result = await openPTGCombatControls({ combat });

  assert.equal(result, combatant);
  assert.deepEqual(updates, [{ "system.resources.psyche.value": 4 }]);
  assert.equal(actor.system.resources.health.value, 6);
  assert.equal(actor.system.resources.psyche.value, 4);
  assert.match(createdMessages[0].content, /Apply Damage/);
  assert.match(createdMessages[0].content, /Psyche 7 -&gt; 4/);
  assert.doesNotMatch(createdMessages[0].content, /after 5 armor/);
  assert.match(createdMessages[0].content, /QA psyche damage/);
});

test("PTG combat controls are blocked for non-GM users", async () => {
  installFoundryTestEnvironment();

  let prompted = false;
  foundry.applications.api.DialogV2.prompt = async () => {
    prompted = true;
    return null;
  };
  const warnings = [];
  ui.notifications.warn = message => warnings.push(message);
  game.user = { isGM: false };

  const { openPTGCombatControls } = await import("../../module/combat/ptg-combat.mjs?non-gm");
  const result = await openPTGCombatControls({
    combat: {
      name: "QA Combat",
      round: 1,
      combatants: new Map()
    }
  });

  assert.equal(result, null);
  assert.equal(prompted, false);
  assert.deepEqual(warnings, ["Only a GM can update PTG combat state."]);
});
