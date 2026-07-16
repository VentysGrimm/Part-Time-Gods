import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment } from "../helpers/foundry-test-env.mjs";

test("drop data resolves Foundry Item sources used by actor-sheet drag/drop", async () => {
  installFoundryTestEnvironment();

  const { getDragEventData, itemFromDropData } = await import("../../module/util/drop-data.mjs");

  const eventData = { type: "Item", id: "world-armor" };
  const event = {
    dataTransfer: {
      getData: type => type === "text/plain" ? JSON.stringify(eventData) : ""
    }
  };

  assert.deepEqual(getDragEventData(event), eventData);

  assert.deepEqual(getDragEventData({
    dataTransfer: {
      types: ["application/json"],
      getData: type => type === "application/json" ? JSON.stringify({ type: "Actor", id: "world-actor" }) : ""
    }
  }), { type: "Actor", id: "world-actor" });

  assert.deepEqual(getDragEventData({
    dataTransfer: {
      types: ["text/html"],
      getData: type => type === "text/html" ? '<a class="content-link" data-uuid="Actor.html-actor">QA Character</a>' : ""
    }
  }), { type: "Actor", uuid: "Actor.html-actor" });

  assert.deepEqual(getDragEventData({
    dataTransfer: {
      types: ["text/html"],
      getData: type => type === "text/html" ? '<a class="content-link" data-uuid="Item.html-armor">QA Armor</a>' : ""
    }
  }), { type: "Item", uuid: "Item.html-armor" });

  const uuidItem = { documentName: "Item", name: "UUID Truth", type: "truth" };
  globalThis.fromUuid = async uuid => uuid === "Item.uuid-truth" ? uuidItem : null;
  assert.equal(await itemFromDropData({ type: "Item", uuid: "Item.uuid-truth" }), uuidItem);

  const packItem = { documentName: "Item", name: "Pack Dominion", type: "domain" };
  game.packs.set("part-time-gods.premade-items", {
    documentName: "Item",
    getDocument: async id => id === "pack-domain" ? packItem : null
  });
  assert.equal(await itemFromDropData({
    type: "Item",
    pack: "part-time-gods.premade-items",
    id: "pack-domain"
  }), packItem);

  const worldItem = { documentName: "Item", name: "World Armor", type: "armor" };
  game.items = new Map([["world-armor", worldItem]]);
  assert.equal(await itemFromDropData({ type: "Item", id: "world-armor" }), worldItem);
  assert.equal(await itemFromDropData({ type: "Item", _id: "world-armor" }), worldItem);

  class TestItemDocument {
    constructor(data) {
      Object.assign(this, data);
      this.documentName = "Item";
    }
  }

  globalThis.Item = { implementation: TestItemDocument };
  const embedded = await itemFromDropData({
    type: "Item",
    data: { name: "Embedded Weapon", type: "weapon" }
  });

  assert.ok(embedded instanceof TestItemDocument);
  assert.equal(embedded.name, "Embedded Weapon");
  assert.equal(embedded.type, "weapon");
  assert.equal(await itemFromDropData({ type: "Actor", id: "actor-id" }), null);
});
