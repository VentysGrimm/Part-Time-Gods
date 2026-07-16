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

  lock.toggleSheetEditLock(app, document);
  const unlocked = lock.sheetEditLockContext(app, document);
  assert.equal(unlocked.sheetLocked, false);
  assert.equal(unlocked.sheetUnlocked, true);
  assert.equal(lock.isSheetEditLocked(app, document), false);
  assert.deepEqual(app.renders, [{ force: true }]);

  lock.toggleSheetEditLock(app, document);
  assert.equal(lock.sheetEditLockContext(app, document).sheetLocked, true);
});

test("player-owned character sheets default to editable and can be locked", () => {
  const app = {
    renders: [],
    render(options) {
      this.renders.push(options);
    }
  };
  const document = { isOwner: true };
  const originalUser = game.user;
  game.user = { id: "player", isGM: false };

  try {
    const initial = lock.sheetEditLockContext(app, document);
    assert.equal(initial.canEditSheet, true);
    assert.equal(initial.sheetLocked, false);
    assert.equal(initial.sheetUnlocked, true);
    assert.equal(lock.isSheetEditLocked(app, document), false);

    lock.toggleSheetEditLock(app, document);
    const locked = lock.sheetEditLockContext(app, document);
    assert.equal(locked.sheetLocked, true);
    assert.equal(locked.sheetUnlocked, false);
    assert.equal(lock.isSheetEditLocked(app, document), true);
    assert.deepEqual(app.renders, [{ force: true }]);
  } finally {
    game.user = originalUser;
  }
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
    assert.equal(permittedContext.sheetLocked, false);
    assert.equal(permittedContext.sheetUnlocked, true);
  } finally {
    game.user = originalUser;
  }
});

test("observer and non-owner character sheets remain read-only despite toggle state", () => {
  const observerApp = {
    renders: [],
    render(options) {
      this.renders.push(options);
    }
  };
  const nonOwnerApp = {
    renders: [],
    render(options) {
      this.renders.push(options);
    }
  };
  const originalUser = game.user;
  const originalConst = globalThis.CONST;
  game.user = { id: "player", isGM: false };
  globalThis.CONST = {
    ...globalThis.CONST,
    DOCUMENT_OWNERSHIP_LEVELS: {
      NONE: 0,
      LIMITED: 1,
      OBSERVER: 2,
      OWNER: 3
    }
  };

  const observer = {
    isOwner: false,
    testUserPermission: (user, level) => user.id === "player" && level === globalThis.CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER
  };
  const nonOwner = {
    isOwner: false,
    testUserPermission: () => false
  };

  try {
    assert.equal(lock.sheetEditLockContext(observerApp, observer).sheetLockState, "Read Only");
    assert.equal(lock.isSheetEditLocked(observerApp, observer), true);
    lock.toggleSheetEditLock(observerApp, observer);
    assert.equal(lock.sheetEditLockContext(observerApp, observer).sheetLockState, "Read Only");
    assert.equal(lock.sheetEditLockContext(observerApp, observer).sheetUnlocked, false);
    assert.deepEqual(observerApp.renders, [{ force: true }]);

    const skill = fakeElement({ tagName: "button", attrs: { "data-roll-skill": "athletics" } });
    const details = fakeElement({ tagName: "button", attrs: { "data-item-action": "toggle-details" } });
    const input = fakeElement({ tagName: "input" });
    const textarea = fakeElement({ tagName: "textarea" });
    const observerRoot = fakeSheetRoot({ buttons: [skill, details], controls: [input, textarea] });
    const observerContext = lock.wireSheetEditLock(observerApp, observerRoot, observer);

    assert.equal(observerContext.canEditSheet, false);
    assert.equal(observerRoot.classList.contains("is-readonly"), true);
    assert.equal(observerRoot.dataset.ptgSheetLocked, "false");
    assert.equal(skill.disabled, true);
    assert.equal(details.disabled, false);
    assert.equal(input.disabled, true);
    assert.equal(textarea.disabled, false);
    assert.equal(textarea.readOnly, true);

    lock.toggleSheetEditLock(nonOwnerApp, nonOwner);
    const nonOwnerRoot = fakeSheetRoot({ controls: [fakeElement({ tagName: "input" })] });
    const nonOwnerContext = lock.wireSheetEditLock(nonOwnerApp, nonOwnerRoot, nonOwner);

    assert.equal(nonOwnerContext.canEditSheet, false);
    assert.equal(nonOwnerContext.sheetUnlocked, false);
    assert.equal(nonOwnerRoot.classList.contains("is-readonly"), true);
    assert.equal(nonOwnerRoot.querySelectorAll("input, select, textarea")[0].disabled, true);
  } finally {
    game.user = originalUser;
    globalThis.CONST = originalConst;
  }
});

test("locked character sheets leave gameplay buttons usable while blocking edit controls", () => {
  const app = {};
  const document = { isOwner: true };
  const input = fakeElement({ tagName: "input" });
  const textarea = fakeElement({ tagName: "textarea" });
  const imageEdit = fakeElement({ tagName: "img", attrs: { "data-edit": "img" } });
  const buttons = {
    toggle: fakeElement({ tagName: "button", attrs: { "data-ptg-edit-lock-toggle": "" } }),
    tab: fakeElement({ tagName: "button", attrs: { "data-ptg-tab": "front" } }),
    skill: fakeElement({ tagName: "button", attrs: { "data-roll-skill": "athletics" } }),
    manifestation: fakeElement({ tagName: "button", attrs: { "data-roll-manifestation": "aegis" } }),
    ritual: fakeElement({ tagName: "button", attrs: { "data-ritual-action": "territory" } }),
    combatRoll: fakeElement({ tagName: "button", attrs: { "data-combat-roll": "fists" } }),
    combatControls: fakeElement({ tagName: "button", attrs: { "data-combat-controls": "" } }),
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
    controls: [input, textarea],
    imageEdits: [imageEdit],
    toggle: buttons.toggle
  });

  const context = lock.wireSheetEditLock(app, root, document);

  assert.equal(context.sheetLocked, true);
  for (const key of ["toggle", "tab", "skill", "manifestation", "ritual", "combatRoll", "combatControls", "resourceWorkflow", "itemUse", "details", "creator"]) {
    assert.equal(buttons[key].disabled, false, `${key} should remain usable while locked`);
  }
  for (const key of ["itemEdit", "itemDelete", "resourceStep"]) {
    assert.equal(buttons[key].disabled, true, `${key} should be blocked while locked`);
    assert.equal(buttons[key].attributes["aria-disabled"], "true");
  }
  assert.equal(input.disabled, true);
  assert.equal(textarea.disabled, false);
  assert.equal(textarea.readOnly, true);
  assert.equal(textarea.attributes.readonly, "");
  assert.equal(textarea.attributes["aria-readonly"], "true");
  assert.equal(imageEdit.dataset.ptgEditLocked, "true");
});

test("player-owned unlocked character sheets leave creator and edit controls enabled", () => {
  const app = {};
  const document = { isOwner: true };
  const buttons = {
    creator: fakeElement({ tagName: "button", attrs: { "data-character-creator": "" } }),
    itemEdit: fakeElement({ tagName: "button", attrs: { "data-item-action": "edit" } }),
    resourceStep: fakeElement({ tagName: "button", attrs: { "data-resource-step": "health" } })
  };
  const input = fakeElement({ tagName: "input" });
  const root = fakeSheetRoot({ buttons: Object.values(buttons), controls: [input] });
  const originalUser = game.user;
  game.user = { id: "player", isGM: false };

  try {
    const context = lock.wireSheetEditLock(app, root, document);

    assert.equal(context.sheetUnlocked, true);
    assert.equal(input.disabled, false);
    assert.equal(buttons.creator.disabled, false);
    assert.equal(buttons.itemEdit.disabled, false);
    assert.equal(buttons.resourceStep.disabled, false);
  } finally {
    game.user = originalUser;
  }
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
  const textarea = fakeElement({ tagName: "textarea" });
  const root = fakeSheetRoot({ buttons: Object.values(buttons), controls: [textarea] });

  const context = lock.wireSheetEditLock(app, root, document);

  assert.equal(context.canEditSheet, false);
  assert.equal(buttons.tab.disabled, false);
  assert.equal(buttons.details.disabled, false);
  assert.equal(buttons.skill.disabled, true);
  assert.equal(buttons.itemUse.disabled, true);
  assert.equal(textarea.disabled, false);
  assert.equal(textarea.readOnly, true);
  assert.equal(textarea.attributes["aria-readonly"], "true");
});

function fakeSheetRoot({ buttons = [], controls = [], imageEdits = [], toggle = null } = {}) {
  const classes = new Set();
  return {
    classList: {
      toggle(name, force) {
        if (force) classes.add(name);
        else classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      }
    },
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
