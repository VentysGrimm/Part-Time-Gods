const unlockedSheets = new WeakSet();

const ALLOWED_LOCKED_BUTTON_SELECTOR = [
  "[data-ptg-edit-lock-toggle]",
  "[data-ptg-tab]",
  ".tabs [data-tab]",
  ".sheet-tabs [data-tab]"
].join(", ");

export function sheetEditLockContext(application, document, { editable = true } = {}) {
  const canEdit = Boolean(editable && canEditDocument(document));
  const unlocked = canEdit && unlockedSheets.has(application);
  const locked = canEdit && !unlocked;

  return {
    canEditSheet: canEdit,
    sheetLocked: locked,
    sheetUnlocked: unlocked,
    sheetLockState: canEdit ? (unlocked ? "Unlocked" : "Locked") : "Read Only",
    sheetLockLabel: canEdit ? (unlocked ? "Lock Sheet" : "Unlock Sheet") : "Read Only",
    sheetLockHint: canEdit
      ? (unlocked ? "Editing enabled" : "Protected from accidental edits")
      : "You do not have permission to edit this document.",
    sheetLockTitle: canEdit
      ? (unlocked ? "Lock this sheet to prevent accidental edits" : "Unlock this sheet to edit fields and controls")
      : "Document permissions prevent editing"
  };
}

export function mergeSheetEditLockContext(context, application, document) {
  return {
    ...context,
    ...sheetEditLockContext(application, document, { editable: context.editable !== false })
  };
}

export function wireSheetEditLock(application, root, document) {
  if (!root) return sheetEditLockContext(application, document, { editable: false });

  const context = sheetEditLockContext(application, document, { editable: true });
  const sheetRoot = root.matches?.(".ptg-sheet") ? root : root.querySelector?.(".ptg-sheet") ?? root;
  sheetRoot.classList.toggle("is-locked", context.sheetLocked);
  sheetRoot.classList.toggle("is-unlocked", context.sheetUnlocked);
  sheetRoot.classList.toggle("is-readonly", !context.canEditSheet);
  sheetRoot.dataset.ptgSheetLocked = String(context.sheetLocked);

  const toggle = sheetRoot.querySelector("[data-ptg-edit-lock-toggle]");
  if (toggle && !toggle.dataset.ptgLockWired) {
    toggle.dataset.ptgLockWired = "true";
    toggle.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      toggleSheetEditLock(application);
    });
  }

  applySheetEditLock(sheetRoot, context);
  return context;
}

export function toggleSheetEditLock(application) {
  if (unlockedSheets.has(application)) unlockedSheets.delete(application);
  else unlockedSheets.add(application);
  application.render?.({ force: true });
}

export function isSheetEditLocked(application, document = null) {
  if (document && !canEditDocument(document)) return true;
  return !unlockedSheets.has(application);
}

function applySheetEditLock(root, context) {
  if (!context.sheetLocked && context.canEditSheet) return;

  for (const control of root.querySelectorAll("input, select, textarea")) {
    if (control.matches("[data-ptg-edit-lock-toggle]")) continue;
    control.disabled = true;
    control.setAttribute("aria-disabled", "true");
  }

  for (const button of root.querySelectorAll("button")) {
    if (button.matches(ALLOWED_LOCKED_BUTTON_SELECTOR)) continue;
    button.disabled = true;
    button.setAttribute("aria-disabled", "true");
  }

  for (const editable of root.querySelectorAll("[contenteditable='true'], .ProseMirror[contenteditable='true']")) {
    editable.dataset.ptgWasContenteditable = "true";
    editable.setAttribute("contenteditable", "false");
    editable.setAttribute("aria-readonly", "true");
  }

  for (const imageEdit of root.querySelectorAll("[data-edit]")) {
    imageEdit.dataset.ptgEditLocked = "true";
    imageEdit.setAttribute("aria-disabled", "true");
  }
}

function canEditDocument(document) {
  if (!document) return false;
  if (document.isOwner || globalThis.game?.user?.isGM) return true;

  const user = globalThis.game?.user;
  if (!user || typeof document.testUserPermission !== "function") return false;

  const ownerLevel = globalThis.CONST?.DOCUMENT_OWNERSHIP_LEVELS?.OWNER ?? "OWNER";
  try {
    return Boolean(document.testUserPermission(user, ownerLevel));
  } catch (error) {
    return false;
  }
}
