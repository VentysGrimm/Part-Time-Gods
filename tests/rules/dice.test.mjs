import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment, queueRolls } from "../helpers/foundry-test-env.mjs";

installFoundryTestEnvironment();
const { PTGDiceEngine } = await import("../../module/dice/ptg-dice-engine.mjs");

test("PTG dice count 7-9 as one success and 10 as two successes", async () => {
  queueRolls([6, 7, 8, 9, 10, 1]);
  const outcome = await PTGDiceEngine.rollPool(6, { difficulty: 5, sendToChat: false });

  assert.equal(outcome.successes, 5);
  assert.equal(outcome.passed, true);
  assert.equal(outcome.margin, 0);
  assert.equal(outcome.boosts, 0);
  assert.equal(outcome.criticalFailure, false);
});

test("PTG dice use awaited Roll evaluation without sync or removed async options", async () => {
  const OriginalRoll = globalThis.Roll;
  globalThis.Roll = class FoundryV14Roll extends OriginalRoll {
    evaluateSync() {
      throw new Error("sync random dice are not supported");
    }

    async evaluate(options) {
      assert.equal(options, undefined);
      return super.evaluate();
    }
  };

  try {
    queueRolls([7]);
    const outcome = await PTGDiceEngine.rollPool(1, { difficulty: 1, sendToChat: false });

    assert.equal(outcome.successes, 1);
    assert.equal(outcome.passed, true);
  } finally {
    globalThis.Roll = OriginalRoll;
  }
});

test("Fate Die rolls one die for zero or negative pools", async () => {
  queueRolls([10], [1]);

  const success = await PTGDiceEngine.rollPool(0, { difficulty: 2, sendToChat: false });
  assert.equal(success.fateDie, true);
  assert.equal(success.dice, 1);
  assert.equal(success.successes, 2);
  assert.equal(success.passed, true);

  const failure = await PTGDiceEngine.rollPool(-2, { sendToChat: false });
  assert.equal(failure.fateDie, true);
  assert.equal(failure.dice, 1);
  assert.equal(failure.successes, 0);
  assert.equal(failure.criticalFailure, true);
  assert.equal(failure.criticalConsequenceCount, 1);
});

test("Difficulty margin produces one Boost per three extra successes", async () => {
  queueRolls([7, 8, 9, 10, 10]);
  const outcome = await PTGDiceEngine.rollPool(5, { difficulty: 4, sendToChat: false });

  assert.equal(outcome.successes, 7);
  assert.equal(outcome.margin, 3);
  assert.equal(outcome.boosts, 1);
  assert.equal(outcome.passed, true);
});

test("Critical failure counts one consequence per one-result", async () => {
  queueRolls([1, 1, 3]);
  const outcome = await PTGDiceEngine.rollPool(3, { difficulty: 1, sendToChat: false });

  assert.equal(outcome.successes, 0);
  assert.equal(outcome.ones, 2);
  assert.equal(outcome.criticalFailure, true);
  assert.equal(outcome.criticalConsequenceCount, 2);
  assert.equal(outcome.passed, false);
});

test("Skill Combo and Manifestation checks preserve base pool math", async () => {
  const actor = {
    uuid: "Actor.test",
    name: "Test God",
    system: {
      skills: { athletics: 2, speed: 3, stealth: 1 },
      manifestations: { ruin: 4 }
    }
  };

  queueRolls([7, 7, 7, 7, 7, 7], [10, 10, 7, 6, 1, 1]);
  const skill = await PTGDiceEngine.rollSkillCombo(actor, "athletics", "speed", {
    bonus: 2,
    penalty: 1,
    modifierDetails: { Tool: 1 },
    sendToChat: false
  });
  assert.equal(skill.basePool, 5);
  assert.equal(skill.poolSize, 7);
  assert.equal(skill.successes, 6);

  const manifestation = await PTGDiceEngine.rollManifestation(actor, "ruin", "stealth", {
    penalty: 1,
    sendToChat: false
  });
  assert.equal(manifestation.basePool, 5);
  assert.equal(manifestation.poolSize, 4);
  assert.equal(manifestation.successes, 5);
});
