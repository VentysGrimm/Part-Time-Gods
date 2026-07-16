import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment } from "../helpers/foundry-test-env.mjs";

installFoundryTestEnvironment();

const {
  applyCharacterCreatorSelections,
  characterCreatorProblemSteps,
  characterCreatorReviewHTML,
  creatorStartingAttachmentItem,
  creatorUpdateValue,
  readCreatorStartingAttachments,
  validateCreatorSourceSelections,
  validateCharacterCreationBudget
} = await import("../../module/sheets/character-sheet.mjs");
const { PartTimeGodsActor } = await import("../../module/documents/actor/part-time-gods-actor.mjs");

test("character creator reads starting attachment rows as backed item selections", () => {
  const form = fakeForm({
    "creator.attachments.0.type": "bond",
    "creator.attachments.0.name": "Mortal Family",
    "creator.attachments.0.level": "3",
    "creator.attachments.0.description": "People who keep the god grounded.",
    "creator.attachments.1.type": "relic",
    "creator.attachments.1.name": "",
    "creator.attachments.1.level": "2",
    "creator.attachments.1.description": ""
  });

  const rows = readCreatorStartingAttachments(form, { rowCount: 3 });

  assert.deepEqual(rows, [
    {
      type: "bond",
      name: "Mortal Family",
      level: 3,
      description: "People who keep the god grounded."
    },
    {
      type: "relic",
      name: "Starting Relic 2",
      level: 2,
      description: ""
    }
  ]);
});

test("character creator validates starting attachment item levels against the planned budget", () => {
  const actor = { items: [] };
  const valid = creatorSelections({
    startingAttachments: [
      { type: "bond", name: "Mortal Family", level: 3, description: "" },
      { type: "relic", name: "Weather Key", level: 2, description: "" }
    ]
  });

  assert.deepEqual(validateCharacterCreationBudget(valid, actor), []);

  const invalid = creatorSelections({
    startingAttachments: [
      { type: "", name: "Missing Type", level: 3, description: "" },
      { type: "vassal", name: "Underleveled", level: 0, description: "" }
    ]
  });

  const errors = validateCharacterCreationBudget(invalid, actor);
  assert.ok(errors.some(error => error.includes("must choose Bond, Relic, Worshipper, or Vassal")));
  assert.ok(errors.some(error => error.includes("must have a Level of at least 1")));
  assert.ok(errors.some(error => error.includes("current total is 3")));
});

test("character creator starting attachment rows create owned item documents", () => {
  const item = creatorStartingAttachmentItem({
    type: "worshipper",
    name: "Street Choir",
    level: 4,
    description: "A late-night congregation."
  });

  assert.equal(item.type, "worshipper");
  assert.equal(item.name, "Street Choir");
  assert.equal(item.system.level, 4);
  assert.deepEqual(item.system.strain, { value: 0, max: 4 });
  assert.equal(item.system.rules.source.section, "Step Five: Attachments");
  assert.equal(item.flags["part-time-gods"].canonicalSource, "character-creator");
});

test("character creator review maps validation errors to creator steps", () => {
  const steps = characterCreatorProblemSteps([
    "Choose an Occupation career/subtype before applying character creation choices.",
    "Starting Skill points must total 10; current total is 7.",
    "Starting Attachment item levels must total 5; current total is 3."
  ]);

  assert.equal(steps.has(0), true);
  assert.equal(steps.has(4), true);
  assert.equal(steps.has(5), true);
  assert.equal(steps.has(2), false);
});

test("character creator review html escapes error text and preserves field updates", () => {
  const html = characterCreatorReviewHTML(["Bad <script>alert(1)</script> choice"]);

  assert.match(html, /role="alert"/);
  assert.match(html, /Bad &lt;script&gt;alert\(1\)&lt;\/script&gt; choice/);
  assert.doesNotMatch(html, /<script>/);
  assert.equal(creatorUpdateValue({ "system.identity.concept": "God of Smoke" }, "system.identity.concept", "Fallback"), "God of Smoke");
  assert.equal(creatorUpdateValue({}, "system.identity.concept", "Fallback"), "Fallback");
});

test("character creator validates stale source selections for review", () => {
  const errors = validateCreatorSourceSelections(
    { choices: { occupation: "Item.missing", domain: "Item.domain-light" } },
    { occupation: [{ uuid: "Item.other", name: "Other" }], domain: [{ uuid: "Item.domain-light", name: "Light" }] },
    ["occupation", "domain"]
  );

  assert.deepEqual(errors, ["Occupation source item could not be found. Re-select that creator choice."]);
});

test("character creator application persists sheet fields, budgets, attachments, and chosen source items", async () => {
  const originalFromUuid = globalThis.fromUuid;
  globalThis.fromUuid = async uuid => uuid === "Item.occupation-medical"
    ? {
      toObject: () => ({
        _id: "source-occupation",
        name: "Medical",
        type: "occupation",
        system: { description: "<p>Source-backed occupation.</p>" }
      })
    }
    : null;

  try {
    const actor = fakeActor();
    const selections = {
      choices: { occupation: "Item.occupation-medical" },
      occupationCareer: "therapist",
      archetypeOptions: {},
      updates: {
        "system.identity.concept": "God/dess of Smoke",
        "system.identity.divineName": "Ashen Mercy",
        "system.identity.divineTitle": "Saint of Quiet Rooms",
        "system.identity.divineEpithet": "The Listening Flame",
        "system.identity.divineSymbol": "Silver matchbook",
        "system.identity.divineOmen": "Hospital lights flicker violet",
        "system.identity.divineTaboo": "Never refuse a final confession",
        "system.identity.divineOffering": "A clean bandage",
        "system.identity.divineMythSeed": "Born from a clinic vigil.",
        "system.identity.divineTone": "Tender and ominous",
        "system.identity.ageEthnicity": "30s, local community roots",
        "system.specialties": "Emergency care",
        "system.resources.legendaryActs": "Saved a city block.",
        "system.resources.spark": 1,
        "system.resources.fragments.value": 3,
        "system.resources.fragments.max": 3
      },
      budget: {
        skills: { athletics: 2, discipline: 8 },
        manifestations: { aegis: 3, ruin: 1 },
        attachmentPoints: 5,
        startingTruth: "I carry a mortal promise",
        startingAttachments: [
          { type: "bond", name: "Clinic Family", level: 2, description: "People from the night shift." },
          { type: "relic", name: "Ash Key", level: 3, description: "Unlocks forgotten rooms." }
        ],
        spark: 1,
        fragments: 3
      }
    };

    const result = await applyCharacterCreatorSelections(actor, selections, {}, ["occupation"]);

    assert.equal(actor.system.identity.concept, "God/dess of Smoke");
    assert.equal(actor.system.identity.divineName, "Ashen Mercy");
    assert.equal(actor.system.identity.divineMythSeed, "Born from a clinic vigil.");
    assert.equal(actor.system.specialties, "Emergency care");
    assert.equal(actor.system.resources.legendaryActs, "Saved a city block.");
    assert.equal(actor.system.resources.fragments.value, 3);
    assert.equal(actor.system.skills.athletics, 3);
    assert.equal(actor.system.skills.discipline, 8);
    assert.equal(actor.system.manifestations.aegis, 4);
    assert.equal(actor.system.manifestations.ruin, 1);

    assert.ok(actor.items.some(item => item.type === "truth" && item.name === "I carry a mortal promise"));
    assert.ok(actor.items.some(item => item.type === "bond" && item.name === "Clinic Family" && item.system.level === 2));
    assert.ok(actor.items.some(item => item.type === "relic" && item.name === "Ash Key" && item.system.cost === 3));
    assert.ok(actor.items.some(item => item.type === "occupation" && item.name === "Medical"));
    assert.deepEqual(actor.appliedChoices, [
      {
        itemName: "Medical",
        itemType: "occupation",
        options: { confirm: false, attachmentDefinitions: "auto", occupationCareerOption: "therapist" }
      }
    ]);
    assert.deepEqual(result.failedChoices, []);
  } finally {
    globalThis.fromUuid = originalFromUuid;
  }
});

test("character creator application reports missing source items", async () => {
  const originalFromUuid = globalThis.fromUuid;
  globalThis.fromUuid = async () => null;

  try {
    const actor = fakeActor();
    const result = await applyCharacterCreatorSelections(
      actor,
      {
        choices: { occupation: "Item.missing" },
        updates: { "system.identity.concept": "Should Not Persist" },
        budget: {
          skills: { athletics: 2 },
          manifestations: { aegis: 1 },
          startingTruth: "Should Not Persist",
          startingAttachments: [{ type: "bond", name: "Should Not Persist", level: 1, description: "" }]
        }
      },
      {},
      ["occupation"]
    );

    assert.deepEqual(result.failedChoices, ["Occupation source item could not be found. Re-select that creator choice."]);
    assert.equal(actor.system.identity.concept, undefined);
    assert.equal(actor.system.skills.athletics, 1);
    assert.equal(actor.system.manifestations.aegis, 1);
    assert.equal(actor.items.some(item => item.type === "occupation"), false);
    assert.equal(actor.items.some(item => item.name === "Should Not Persist"), false);
  } finally {
    globalThis.fromUuid = originalFromUuid;
  }
});

test("character creator passes non-interactive domain options during source application", async () => {
  const originalFromUuid = globalThis.fromUuid;
  globalThis.fromUuid = async uuid => uuid === "Item.domain-elemental"
    ? {
      toObject: () => ({
        _id: "source-domain",
        name: "Elemental",
        type: "domain",
        system: {
          portfolio: "Storms",
          specificity: "broad",
          grants: {}
        }
      })
    }
    : null;

  try {
    const actor = fakeActor();
    const result = await applyCharacterCreatorSelections(
      actor,
      {
        choices: { domain: "Item.domain-elemental" },
        updates: { "system.identity.concept": "God/dess of QA Smoke Tests" },
        budget: {}
      },
      {},
      ["domain"]
    );

    assert.deepEqual(result.failedChoices, []);
    assert.equal(actor.appliedChoices.length, 1);
    assert.equal(actor.appliedChoices[0].options.attachmentDefinitions, "auto");
    assert.equal(actor.appliedChoices[0].options.domainOptions.title, "God/dess of QA Smoke Tests");
    assert.equal(actor.appliedChoices[0].options.domainOptions.portfolio, "Storms");
    assert.equal(actor.appliedChoices[0].options.domainOptions.specificity, "broad");
  } finally {
    globalThis.fromUuid = originalFromUuid;
  }
});

test("creator auto attachment definitions apply source choices without opening definition prompts", async () => {
  const originalPrompt = foundry.applications.api.DialogV2.prompt;
  let promptCalls = 0;
  foundry.applications.api.DialogV2.prompt = async () => {
    promptCalls += 1;
    throw new Error("Attachment definition prompt should not open for creator auto definitions.");
  };

  try {
    const actor = fakePartTimeGodsActor();
    const sourceItem = fakeOwnedOccupationChoice(actor);

    const applied = await actor.applyChoice(sourceItem, {
      confirm: false,
      attachmentDefinitions: "auto",
      occupationCareerOption: "Item.medical::0:0"
    });

    assert.equal(applied, true);
    assert.equal(promptCalls, 0);
    assert.ok(actor.items.some(item =>
      item.type === "bond"
      && item.name === "Therapist Community"
      && item.system.definition === "Therapist Community"
    ));
  } finally {
    foundry.applications.api.DialogV2.prompt = originalPrompt;
  }
});

test("character creator application reports failed source item application", async () => {
  const originalFromUuid = globalThis.fromUuid;
  globalThis.fromUuid = async () => ({
    toObject: () => ({
      _id: "source-occupation",
      name: "Medical",
      type: "occupation",
      system: { description: "<p>Source-backed occupation.</p>" }
    })
  });

  try {
    const actor = fakeActor({ applyChoiceResult: false });
    const result = await applyCharacterCreatorSelections(
      actor,
      {
        choices: { occupation: "Item.occupation-medical" },
        occupationCareer: "therapist",
        updates: {},
        budget: { skills: {}, manifestations: {}, startingAttachments: [] }
      },
      {},
      ["occupation"]
    );

    assert.deepEqual(result.failedChoices, ["Occupation could not be applied to QA Character. Review that creator choice and try again."]);
    assert.equal(actor.items.some(item => item.type === "occupation"), false);
  } finally {
    globalThis.fromUuid = originalFromUuid;
  }
});

test("character creator corrected retry after review applies source choices without doubling budgets", async () => {
  const originalFromUuid = globalThis.fromUuid;
  globalThis.fromUuid = async () => ({
    toObject: () => ({
      _id: "source-occupation",
      name: "Medical",
      type: "occupation",
      system: { description: "<p>Source-backed occupation.</p>" }
    })
  });

  try {
    let allowChoiceApplication = false;
    const actor = fakeActor({ applyChoiceResult: () => allowChoiceApplication });
    const selections = {
      choices: { occupation: "Item.occupation-medical" },
      occupationCareer: "therapist",
      updates: { "system.identity.concept": "God/dess of Smoke" },
      budget: {
        skills: { athletics: 2 },
        manifestations: { aegis: 1 },
        startingAttachments: []
      }
    };

    const failed = await applyCharacterCreatorSelections(actor, selections, {}, ["occupation"]);

    assert.deepEqual(failed.failedChoices, ["Occupation could not be applied to QA Character. Review that creator choice and try again."]);
    assert.equal(actor.system.identity.concept, undefined);
    assert.equal(actor.system.skills.athletics, 1);
    assert.equal(actor.system.manifestations.aegis, 1);
    assert.equal(actor.items.some(item => item.type === "occupation"), false);

    allowChoiceApplication = true;
    const retried = await applyCharacterCreatorSelections(actor, selections, {}, ["occupation"]);

    assert.deepEqual(retried.failedChoices, []);
    assert.equal(actor.system.identity.concept, "God/dess of Smoke");
    assert.equal(actor.system.skills.athletics, 3);
    assert.equal(actor.system.manifestations.aegis, 2);
    assert.equal(actor.items.filter(item => item.type === "occupation" && item.name === "Medical").length, 1);
    assert.deepEqual(actor.appliedChoices, [
      {
        itemName: "Medical",
        itemType: "occupation",
        options: { confirm: false, attachmentDefinitions: "auto", occupationCareerOption: "therapist" }
      },
      {
        itemName: "Medical",
        itemType: "occupation",
        options: { confirm: false, attachmentDefinitions: "auto", occupationCareerOption: "therapist" }
      }
    ]);
  } finally {
    globalThis.fromUuid = originalFromUuid;
  }
});

function creatorSelections(overrides = {}) {
  return {
    budget: {
      skills: { athletics: 10 },
      manifestations: { aegis: 4 },
      attachmentPoints: 5,
      startingAttachments: [],
      startingTruth: "I carry a mortal promise",
      spark: 1,
      fragments: 3,
      ...overrides
    }
  };
}

function fakeForm(values) {
  return {
    elements: Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { value }]))
  };
}

function fakeActor({ applyChoiceResult = true } = {}) {
  return {
    name: "QA Character",
    system: {
      identity: {},
      skills: { athletics: 1 },
      manifestations: { aegis: 1 },
      resources: { spark: 1, fragments: { value: 0, max: 3 } },
      specialties: ""
    },
    items: [],
    appliedChoices: [],
    async update(updates) {
      for (const [path, value] of Object.entries(updates)) setPath(this, path, value);
    },
    async createEmbeddedDocuments(documentType, documents) {
      assert.equal(documentType, "Item");
      const created = documents.map(document => {
        const item = foundry.utils.deepClone(document);
        item.delete = async () => {
          const index = this.items.indexOf(item);
          if (index >= 0) this.items.splice(index, 1);
        };
        return item;
      });
      this.items.push(...created);
      return created;
    },
    async applyChoice(item, options) {
      this.appliedChoices.push({ itemName: item.name, itemType: item.type, options });
      return typeof applyChoiceResult === "function" ? applyChoiceResult(item, options) : applyChoiceResult;
    }
  };
}

function fakePartTimeGodsActor() {
  return Object.assign(Object.create(PartTimeGodsActor.prototype), {
    name: "QA Character",
    uuid: "Actor.qa-character",
    system: {
      identity: {},
      skills: { discipline: 0, fortitude: 0 },
      manifestations: {},
      resources: {
        spark: 1,
        freeTime: 0,
        freeTimeMax: 0,
        wealth: 0,
        wealthMax: 0,
        health: { value: 0, max: 0 },
        psyche: { value: 0, max: 0 },
        fragments: { value: 0, max: 3 }
      }
    },
    items: [],
    flags: {},
    getFlag(scope, key) {
      return this.flags[scope]?.[key];
    },
    async setFlag(scope, key, value) {
      this.flags[scope] ??= {};
      this.flags[scope][key] = value;
    },
    async update(updates) {
      for (const [path, value] of Object.entries(updates)) setPath(this, path, value);
    },
    async createEmbeddedDocuments(documentType, documents) {
      assert.equal(documentType, "Item");
      const created = documents.map((document, index) => {
        const item = foundry.utils.deepClone(document);
        item.uuid = `Item.created-${this.items.length + index}`;
        item.parent = this;
        item.getFlag = (scope, key) => item.flags?.[scope]?.[key];
        item.update = async updates => {
          for (const [path, value] of Object.entries(updates)) setPath(item, path, value);
        };
        return item;
      });
      this.items.push(...created);
      return created;
    }
  });
}

function fakeOwnedOccupationChoice(actor) {
  return {
    name: "Medical",
    type: "occupation",
    uuid: "Item.medical",
    parent: actor,
    flags: {},
    system: {
      description: "<p>Source-backed occupation.</p>",
      grants: {},
      careerOptions: [
        {
          name: "Therapist",
          resources: { freeTime: 2, wealth: 4 },
          attachments: [
            {
              kind: "group",
              name: "Therapist Community",
              level: 2,
              choiceKind: "group",
              choiceLabel: "Therapist Community",
              requiresDefinition: true
            }
          ]
        }
      ]
    },
    getFlag(scope, key) {
      return this.flags?.[scope]?.[key];
    },
    async update(updates) {
      for (const [path, value] of Object.entries(updates)) setPath(this, path, value);
    }
  };
}

function setPath(root, path, value) {
  const parts = path.split(".");
  let target = root;
  for (const part of parts.slice(0, -1)) {
    target[part] ??= {};
    target = target[part];
  }
  target[parts.at(-1)] = value;
}
