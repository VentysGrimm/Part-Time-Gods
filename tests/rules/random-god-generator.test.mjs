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

test("divine identity generation covers the #174 manual QA choice matrix", () => {
  const matrix = [
    {
      label: "artist guardian rivers saints",
      context: {
        occupation: "Artist",
        archetype: "The Guardian",
        dominion: "Rivers",
        theology: "Cult of the Saints"
      },
      expected: {
        concept: "God/dess of Rivers",
        title: /Rivers/,
        epithet: /Guardian/,
        taboo: /guardian/i,
        offering: /artist/i,
        mythSeed: /Cult of the Saints/
      }
    },
    {
      label: "medical sage smoke meskhenet",
      context: {
        occupation: "Medical",
        archetype: "The Sage",
        dominion: "Smoke",
        theology: "Order of Meskhenet"
      },
      expected: {
        concept: "God/dess of Smoke",
        title: /Smoke/,
        epithet: /Sage/,
        taboo: /sage/i,
        offering: /medical/i,
        mythSeed: /Order of Meskhenet/
      }
    },
    {
      label: "no choices",
      context: {},
      expected: {
        concept: "God/dess of Crossroads",
        title: /Crossroads/,
        epithet: /Wanderer/,
        taboo: /wanderer/i,
        offering: /mortal work/i,
        mythSeed: /Household Saints/
      }
    },
    {
      label: "one choice dominion only",
      context: {
        dominion: "Neon Signs"
      },
      expected: {
        concept: "God/dess of Neon Signs",
        title: /Neon Signs/,
        epithet: /Wanderer/,
        taboo: /wanderer/i,
        offering: /mortal work/i,
        mythSeed: /Household Saints/
      }
    },
    {
      label: "one choice archetype only",
      context: {
        archetype: "The Rebel"
      },
      expected: {
        concept: "God/dess of Rebel",
        title: /Rebel/,
        epithet: /Rebel/,
        taboo: /rebel/i,
        offering: /mortal work/i,
        mythSeed: /Household Saints/
      }
    }
  ];

  for (const entry of matrix) {
    const identity = generateDivineIdentity(entry.context);

    assert.equal(identity.concept, entry.expected.concept, `${entry.label}: concept`);
    assert.match(identity.divineTitle, entry.expected.title, `${entry.label}: title`);
    assert.match(identity.divineEpithet, entry.expected.epithet, `${entry.label}: epithet`);
    assert.match(identity.divineTaboo, entry.expected.taboo, `${entry.label}: taboo`);
    assert.match(identity.divineOffering, entry.expected.offering, `${entry.label}: offering`);
    assert.match(identity.divineMythSeed, entry.expected.mythSeed, `${entry.label}: myth seed`);

    for (const key of ["divineName", "divineSymbol", "divineOmen", "divineTone"]) {
      assert.equal(typeof identity[key], "string", `${entry.label}: ${key} type`);
      assert.ok(identity[key].length > 0, `${entry.label}: ${key} populated`);
    }
  }
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
