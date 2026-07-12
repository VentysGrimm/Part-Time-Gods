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
      items: [
        {
          type: "blessing",
          system: {
            automation: {
              enabled: true,
              bonus: { initiative: 2 }
            }
          }
        },
        {
          type: "weapon",
          system: {
            held: true,
            quality: "Quick"
          }
        }
      ],
      conditionRollEffects: ({ mode }) => mode === "initiative"
        ? { modifiers: [{ value: 1 }] }
        : { modifiers: [] }
    }
  });

  const roll = combatant.getInitiativeRoll();

  assert.equal(roll.formula, PTG_INITIATIVE_FORMULA);
  assert.deepEqual(roll.data, { initiative: 9 });
  assert.deepEqual(rollInputs, [{ formula: PTG_INITIATIVE_FORMULA, data: { initiative: 9 } }]);
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

test("actor initiative ignores inactive item modifiers", async () => {
  installFoundryTestEnvironment();

  const { actorInitiative, itemInitiativeModifier } = await import("../../module/combat/ptg-combat.mjs?inactive-items");
  const actor = {
    type: "character",
    system: { derived: { initiative: 5 } },
    items: new Map([
      ["active", {
        type: "blessing",
        system: {
          automation: {
            enabled: true,
            bonus: { initiative: 2 }
          }
        }
      }],
      ["inactive", {
        type: "blessing",
        system: {
          active: false,
          automation: {
            enabled: true,
            bonus: { initiative: 10 }
          }
        }
      }],
      ["penalty", {
        type: "curse",
        system: {
          automation: {
            enabled: true,
            penalty: { initiative: 1 }
          }
        }
      }],
      ["unheld", {
        type: "weapon",
        system: {
          held: false,
          quality: "Quick"
        }
      }]
    ]),
    conditionRollEffects: ({ mode }) => mode === "initiative"
      ? { modifiers: [{ value: -1 }] }
      : { modifiers: [] }
  };

  assert.equal(itemInitiativeModifier(actor), 1);
  assert.equal(actorInitiative(actor), 5);
});
