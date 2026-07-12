import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment } from "../helpers/foundry-test-env.mjs";

installFoundryTestEnvironment();

const pantheonSheet = await import("../../module/sheets/pantheon-sheet.mjs");

test("Pantheon member context hides private character resources without permission", () => {
  const actor = characterActor({
    isOwner: false,
    testUserPermission: () => false
  });

  const context = pantheonSheet.preparePantheonMemberContext(actor, {
    user: { id: "player", isGM: false },
    canManageMembers: false
  });

  assert.equal(context.limited, true);
  assert.equal(context.canOpen, false);
  assert.equal(context.health, undefined);
  assert.match(context.summary, /do not have permission/);
});

test("Pantheon member context shows party overview for permitted characters", () => {
  const actor = characterActor({
    isOwner: false,
    testUserPermission: (user, level) => user.id === "player" && level === "OBSERVER",
    ownership: { player: 2, gm: 3 }
  });
  game.users = new Map([
    ["player", { name: "Player" }],
    ["gm", { name: "GM" }]
  ]);

  const context = pantheonSheet.preparePantheonMemberContext(actor, {
    user: { id: "player", isGM: false },
    canManageMembers: true
  });

  assert.equal(context.limited, false);
  assert.equal(context.canOpen, true);
  assert.equal(context.dominion, "Smoke");
  assert.equal(context.health, "4 / 7");
  assert.equal(context.psyche, "3 / 6");
  assert.equal(context.fragments, "2 / 3");
  assert.equal(context.attachments, 2);
  assert.deepEqual(context.warnings, ["Strained Bond Strain 1 / 2"]);
  assert.equal(context.owners, "GM");
});

test("Pantheon member add options list visible unlinked characters only", () => {
  const actors = [
    characterActor({ uuid: "Actor.linked", name: "Linked", isOwner: true }),
    characterActor({ uuid: "Actor.visible", name: "Visible", isOwner: false, testUserPermission: (user, level) => level === "OBSERVER" }),
    characterActor({ uuid: "Actor.hidden", name: "Hidden", isOwner: false, testUserPermission: () => false }),
    { uuid: "Actor.npc", name: "NPC", type: "antagonist" }
  ];

  const options = pantheonSheet.pantheonMemberAddOptions({
    actors,
    currentMembers: [{ uuid: "Actor.linked" }],
    user: { id: "player", isGM: false }
  });

  assert.deepEqual(options, [{ uuid: "Actor.visible", name: "Visible" }]);
});

test("Pantheon member management follows owner and GM permissions", () => {
  const pantheon = {
    isOwner: false,
    testUserPermission: (user, level) => user.id === "owner" && level === "OWNER"
  };

  assert.equal(pantheonSheet.canManagePantheonMembers(pantheon, { id: "gm", isGM: true }), true);
  assert.equal(pantheonSheet.canManagePantheonMembers(pantheon, { id: "owner", isGM: false }), true);
  assert.equal(pantheonSheet.canManagePantheonMembers(pantheon, { id: "observer", isGM: false }), false);
});

function characterActor({
  uuid = "Actor.qa",
  name = "QA Character",
  isOwner = true,
  testUserPermission = () => false,
  ownership = {}
} = {}) {
  return {
    uuid,
    name,
    type: "character",
    img: "icons/svg/mystery-man.svg",
    isOwner,
    ownership,
    testUserPermission,
    system: {
      identity: {
        dominion: "Smoke",
        theology: "Household"
      },
      resources: {
        spark: 1,
        health: { value: 4, max: 7 },
        psyche: { value: 3, max: 6 },
        fragments: { value: 2, max: 3 }
      }
    },
    items: [
      { type: "bond", name: "Strained Bond", system: { strain: { value: 1, max: 2 } } },
      { type: "worshipper", name: "Follower", system: { strain: { value: 0, max: 1 } } }
    ]
  };
}
