import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment } from "../helpers/foundry-test-env.mjs";

installFoundryTestEnvironment();

const lock = await import("../../module/sheets/sheet-edit-lock.mjs");

test("sheet edit locks default editable owner sheets to protected state", () => {
  const app = {
    renders: [],
    render(options) {
      this.renders.push(options);
    }
  };
  const document = { isOwner: true };

  const initial = lock.sheetEditLockContext(app, document);
  assert.equal(initial.canEditSheet, true);
  assert.equal(initial.sheetLocked, true);
  assert.equal(initial.sheetUnlocked, false);
  assert.equal(lock.isSheetEditLocked(app, document), true);

  lock.toggleSheetEditLock(app);
  const unlocked = lock.sheetEditLockContext(app, document);
  assert.equal(unlocked.sheetLocked, false);
  assert.equal(unlocked.sheetUnlocked, true);
  assert.equal(lock.isSheetEditLocked(app, document), false);
  assert.deepEqual(app.renders, [{ force: true }]);

  lock.toggleSheetEditLock(app);
  assert.equal(lock.sheetEditLockContext(app, document).sheetLocked, true);
});

test("sheet edit locks respect document permissions", () => {
  const app = {};
  const denied = {
    isOwner: false,
    testUserPermission: () => false
  };
  const permitted = {
    isOwner: false,
    testUserPermission: (user, level) => user.id === "player" && level === "OWNER"
  };

  const originalUser = game.user;
  game.user = { id: "player", isGM: false };

  try {
    const deniedContext = lock.sheetEditLockContext(app, denied);
    assert.equal(deniedContext.canEditSheet, false);
    assert.equal(deniedContext.sheetLocked, false);
    assert.equal(deniedContext.sheetLockState, "Read Only");
    assert.equal(lock.isSheetEditLocked(app, denied), true);

    const permittedContext = lock.sheetEditLockContext(app, permitted);
    assert.equal(permittedContext.canEditSheet, true);
    assert.equal(permittedContext.sheetLocked, true);
  } finally {
    game.user = originalUser;
  }
});

test("locked character sheets leave gameplay buttons usable while blocking edit controls", () => {
  const app = {};
  const document = { isOwner: true };
  const input = fakeElement({ tagName: "input" });
  const imageEdit = fakeElement({ tagName: "img", attrs: { "data-edit": "img" } });
  const buttons = {
    toggle: fakeElement({ tagName: "button", attrs: { "data-ptg-edit-lock-toggle": "" } }),
    tab: fakeElement({ tagName: "button", attrs: { "data-ptg-tab": "front" } }),
    skill: fakeElement({ tagName: "button", attrs: { "data-roll-skill": "athletics" } }),
    manifestation: fakeElement({ tagName: "button", attrs: { "data-roll-manifestation": "aegis" } }),
    ritual: fakeElement({ tagName: "button", attrs: { "data-ritual-action": "territory" } }),
    resourceWorkflow: fakeElement({ tagName: "button", attrs: { "data-resource-workflow": "work" } }),
    itemUse: fakeElement({ tagName: "button", attrs: { "data-item-action": "use" } }),
    details: fakeElement({ tagName: "button", attrs: { "data-item-action": "toggle-details" } }),
    itemEdit: fakeElement({ tagName: "button", attrs: { "data-item-action": "edit" } }),
    itemDelete: fakeElement({ tagName: "button", attrs: { "data-item-action": "delete" } }),
    creator: fakeElement({ tagName: "button", attrs: { "data-character-creator": "" } }),
    resourceStep: fakeElement({ tagName: "button", attrs: { "data-resource-step": "health" } })
  };
  const root = fakeSheetRoot({
    buttons: Object.values(buttons),
    controls: [input],
    imageEdits: [imageEdit],
    toggle: buttons.toggle
  });

  const context = lock.wireSheetEditLock(app, root, document);

  assert.equal(context.sheetLocked, true);
  for (const key of ["toggle", "tab", "skill", "manifestation", "ritual", "resourceWorkflow", "itemUse", "details"]) {
    assert.equal(buttons[key].disabled, false, `${key} should remain usable while locked`);
  }
  for (const key of ["itemEdit", "itemDelete", "creator", "resourceStep"]) {
    assert.equal(buttons[key].disabled, true, `${key} should be blocked while locked`);
    assert.equal(buttons[key].attributes["aria-disabled"], "true");
  }
  assert.equal(input.disabled, true);
  assert.equal(imageEdit.dataset.ptgEditLocked, "true");
});

test("read-only character sheets do not expose locked-owner gameplay actions", () => {
  const app = {};
  const document = {
    isOwner: false,
    testUserPermission: () => false
  };
  const buttons = {
    tab: fakeElement({ tagName: "button", attrs: { "data-ptg-tab": "front" } }),
    details: fakeElement({ tagName: "button", attrs: { "data-item-action": "toggle-details" } }),
    skill: fakeElement({ tagName: "button", attrs: { "data-roll-skill": "athletics" } }),
    itemUse: fakeElement({ tagName: "button", attrs: { "data-item-action": "use" } })
  };
  const root = fakeSheetRoot({ buttons: Object.values(buttons) });

  const context = lock.wireSheetEditLock(app, root, document);

  assert.equal(context.canEditSheet, false);
  assert.equal(buttons.tab.disabled, false);
  assert.equal(buttons.details.disabled, false);
  assert.equal(buttons.skill.disabled, true);
  assert.equal(buttons.itemUse.disabled, true);
});

function fakeSheetRoot({ buttons = [], controls = [], imageEdits = [], toggle = null } = {}) {
  return {
    classList: { toggle() {} },
    dataset: {},
    matches: selector => selector === ".ptg-sheet",
    querySelector(selector) {
      if (selector === "[data-ptg-edit-lock-toggle]") return toggle;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "input, select, textarea") return controls;
      if (selector === "button") return buttons;
      if (selector === "[contenteditable='true'], .ProseMirror[contenteditable='true']") return [];
      if (selector === "[data-edit]") return imageEdits;
      return [];
    }
  };
}

function fakeElement({ tagName = "button", attrs = {} } = {}) {
  const element = {
    tagName,
    attributes: { ...attrs },
    dataset: datasetFromAttrs(attrs),
    disabled: false,
    addEventListener() {},
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    matches(selector) {
      return selector
        .split(",")
        .map(part => part.trim())
        .some(part => matchesSimpleSelector(this, part));
    }
  };
  return element;
}

function datasetFromAttrs(attrs) {
  return Object.fromEntries(Object.entries(attrs)
    .filter(([key]) => key.startsWith("data-"))
    .map(([key, value]) => [dataKey(key), value]));
}

function matchesSimpleSelector(element, selector) {
  if (selector === String(element.tagName).toLowerCase()) return true;
  const attrMatch = selector.match(/^\[([^=\]]+)(?:=(["']?)(.*?)\2)?\]$/);
  if (!attrMatch) return false;

  const [, attrName,, expected] = attrMatch;
  if (!(attrName in element.attributes)) return false;
  if (expected == null) return true;
  return String(element.attributes[attrName]) === expected;
}

function dataKey(attribute) {
  return attribute
    .slice(5)
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
