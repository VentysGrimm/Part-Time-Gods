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

  const { openPTGCombatControls } = await import("../../module/combat/ptg-combat.mjs");
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

  globalThis.Roll = class {
    constructor(formula, data) {
      this.formula = formula;
      this.data = data;
      this.total = Number(data.initiative ?? 0) + 5;
    }

    async evaluate() {
      return this;
    }
  };

  const combatant = {
    id: "qa-combatant",
    actor: {
      type: "character",
      system: { derived: { initiative: 2 } },
      conditionRollEffects: () => ({ modifiers: [] })
    }
  };
  const updateCalls = [];
  const combat = {
    combatants: new Map([[combatant.id, combatant]]),
    updateEmbeddedDocuments: async (documentType, updates) => {
      updateCalls.push({ documentType, updates });
    }
  };

  const { rollPTGInitiative } = await import("../../module/combat/ptg-combat.mjs");
  const updates = await rollPTGInitiative(combat);

  assert.deepEqual(updates, [{ _id: "qa-combatant", initiative: 7 }]);
  assert.deepEqual(updateCalls, [{
    documentType: "Combatant",
    updates: [{ _id: "qa-combatant", initiative: 7 }]
  }]);
});
