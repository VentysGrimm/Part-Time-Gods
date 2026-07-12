import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment } from "../helpers/foundry-test-env.mjs";

installFoundryTestEnvironment();

const { generateDivineIdentity, generateRandomGod } = await import("../../module/util/random-god-generator.mjs");

test("divine identity suggestions include editable identity fields", () => {
  const identity = generateDivineIdentity({
    occupation: "Medical",
    archetype: "The Wanderer",
    dominion: "Smoke",
    theology: "Cult of the Saints"
  });

  assert.equal(identity.concept, "God/dess of Smoke");
  for (const key of ["divineName", "divineTitle", "divineEpithet", "divineSymbol", "divineOmen", "divineTaboo", "divineOffering", "divineMythSeed", "divineTone"]) {
    assert.equal(typeof identity[key], "string");
    assert.ok(identity[key].length > 0, `${key} should be populated`);
  }
  assert.match(identity.divineTitle, /Smoke/);
  assert.match(identity.divineMythSeed, /Cult of the Saints/);
});

test("divine identity generation falls back cleanly when choices are missing", () => {
  const identity = generateDivineIdentity();

  assert.equal(identity.concept, "God/dess of Crossroads");
  assert.match(identity.divineTitle, /Crossroads/);
  assert.match(identity.divineEpithet, /Wanderer/);
  assert.match(identity.divineMythSeed, /Household Saints/);
});

test("divine identity generation follows selected creation themes", () => {
  const identity = generateDivineIdentity({
    occupation: "Artist",
    archetype: "The Guardian",
    dominion: "Rivers",
    theology: "The Old Gods"
  });

  assert.equal(identity.concept, "God/dess of Rivers");
  assert.match(identity.divineTitle, /Rivers/);
  assert.match(identity.divineEpithet, /Guardian/);
  assert.match(identity.divineTaboo, /guardian/i);
  assert.match(identity.divineOffering, /artist/i);
  assert.match(identity.divineMythSeed, /Old Gods/);
});

test("random god helper returns source choices plus a divine identity package", () => {
  const result = generateRandomGod();

  assert.ok(result.choices);
  assert.ok(result.notes);
  assert.ok(Array.isArray(result.log));
  assert.ok(result.log.some(entry => entry.startsWith("Random Occupation - Class:")));
  assert.ok(result.log.some(entry => entry.startsWith("Random Dominion - Type:")));
  assert.ok(result.identity?.concept);
  assert.ok(result.identity?.divineName);
  assert.ok(result.identity?.divineMythSeed);
});
