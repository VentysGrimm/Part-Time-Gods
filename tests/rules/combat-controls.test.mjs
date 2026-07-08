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
