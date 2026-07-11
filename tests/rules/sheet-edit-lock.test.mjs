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
