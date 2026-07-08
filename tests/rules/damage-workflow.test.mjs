import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment } from "../helpers/foundry-test-env.mjs";

test("Health damage applies equipped armor and matching proof qualities", async () => {
  installFoundryTestEnvironment();

  const createdMessages = [];
  ChatMessage.create = async data => {
    createdMessages.push(data);
    return data;
  };
  game.user = { isGM: true };

  const updates = [];
  const actor = {
    documentName: "Actor",
    uuid: "Actor.qa-character",
    name: "QA Character",
    system: {
      resources: {
        health: { value: 8, max: 8 },
        psyche: { value: 8, max: 8 }
      },
      derived: { armor: 0 }
    },
    items: [
      {
        type: "armor",
        system: {
          equipped: true,
          rating: 2,
          qualities: [{ key: "fire-proof", name: "Fire Proof", value: 2 }]
        }
      },
      {
        type: "armor",
        system: {
          equipped: false,
          rating: 10,
          qualities: [{ key: "fire-proof", name: "Fire Proof", value: 10 }]
        }
      }
    ],
    async update(update) {
      updates.push(update);
      if ("system.resources.health.value" in update) this.system.resources.health.value = update["system.resources.health.value"];
      if ("system.resources.psyche.value" in update) this.system.resources.psyche.value = update["system.resources.psyche.value"];
    }
  };

  const { applyDamageToActor } = await import("../../module/workflows/damage-workflow.mjs");
  const result = await applyDamageToActor(actor, {
    resource: "health",
    amount: 6,
    applyArmor: true,
    damageTag: "fire",
    reason: "QA armor mitigation"
  });

  assert.equal(result.rawAmount, 6);
  assert.equal(result.baseArmor, 2);
  assert.equal(result.proofArmor, 2);
  assert.equal(result.finalAmount, 2);
  assert.equal(result.before, 8);
  assert.equal(result.after, 6);
  assert.deepEqual(updates, [{ "system.resources.health.value": 6 }]);
  assert.match(createdMessages[0].content, /Armor/);
  assert.match(createdMessages[0].content, /(Tag Armor|PTG\.Damage\.TagArmor)/);
});
