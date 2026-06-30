import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment } from "../helpers/foundry-test-env.mjs";

installFoundryTestEnvironment();
const { PartTimeGodsActor } = await import("../../module/documents/actor/part-time-gods-actor.mjs");

test("Character derived resources follow Spark and skill formulas", () => {
  const actor = Object.assign(Object.create(PartTimeGodsActor.prototype), {
    type: "character",
    system: {
      skills: {
        fortitude: 4,
        discipline: 2,
        perception: 2,
        speed: 3,
        might: 0
      },
      resources: {
        spark: 3,
        permanentFragmentLoss: 2,
        health: { value: 99, max: 0 },
        psyche: { value: 99, max: 0 },
        fragments: { value: 99, max: 0 }
      },
      derived: {}
    },
    items: [
      { type: "armor", system: { equipped: true, rating: 2, weight: 3, amount: 1 } },
      { type: "armor", system: { equipped: false, rating: 5, weight: 4, amount: 1 } },
      { type: "weapon", system: { held: true, weight: 2, amount: 2 } }
    ]
  });

  actor.prepareDerivedData();

  assert.equal(actor.system.resources.health.max, 12);
  assert.equal(actor.system.resources.health.value, 12);
  assert.equal(actor.system.resources.psyche.max, 10);
  assert.equal(actor.system.resources.psyche.value, 10);
  assert.equal(actor.system.resources.fragments.max, 7);
  assert.equal(actor.system.resources.fragments.value, 7);
  assert.equal(actor.system.derived.initiative, 5);
  assert.equal(actor.system.derived.strength, 1);
  assert.equal(actor.system.derived.movement, 3);
  assert.equal(actor.system.derived.armor, 2);
  assert.equal(actor.system.derived.carriedWeight, 11);
});
