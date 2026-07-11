import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment } from "../helpers/foundry-test-env.mjs";

test("PTG Combatant initiative roll uses the Foundry combat tracker formula", async () => {
  installFoundryTestEnvironment();

  const rollInputs = [];
  globalThis.Roll = class {
    constructor(formula, data) {
      this.formula = formula;
      this.data = data;
      rollInputs.push({ formula, data });
    }
  };

  const { PartTimeGodsCombatant } = await import("../../module/combat/ptg-combatant.mjs?character");
  const { PTG_INITIATIVE_FORMULA } = await import("../../module/combat/ptg-combat.mjs?formula");
  const combatant = new PartTimeGodsCombatant({
    actor: {
      type: "character",
      system: { derived: { initiative: 5 } },
      conditionRollEffects: ({ mode }) => mode === "initiative"
        ? { modifiers: [{ value: 1 }] }
        : { modifiers: [] }
    }
  });

  const roll = combatant.getInitiativeRoll();

  assert.equal(roll.formula, PTG_INITIATIVE_FORMULA);
  assert.deepEqual(roll.data, { initiative: 6 });
  assert.deepEqual(rollInputs, [{ formula: PTG_INITIATIVE_FORMULA, data: { initiative: 6 } }]);
});

test("PTG Combatant initiative roll uses listed statblock initiative", async () => {
  installFoundryTestEnvironment();

  globalThis.Roll = class {
    constructor(formula, data) {
      this.formula = formula;
      this.data = data;
    }
  };

  const { PartTimeGodsCombatant } = await import("../../module/combat/ptg-combatant.mjs?antagonist");
  const combatant = new PartTimeGodsCombatant({
    actor: {
      type: "antagonist",
      system: { initiative: 4 },
      conditionRollEffects: ({ mode }) => mode === "initiative"
        ? { modifiers: [{ value: -1 }] }
        : { modifiers: [] }
    }
  });

  const roll = combatant.getInitiativeRoll("1d10 + @initiative");

  assert.equal(roll.formula, "1d10 + @initiative");
  assert.deepEqual(roll.data, { initiative: 3 });
});
