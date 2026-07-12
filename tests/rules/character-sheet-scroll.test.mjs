import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment } from "../helpers/foundry-test-env.mjs";

installFoundryTestEnvironment();

const { shouldCaptureCharacterSheetScroll } = await import("../../module/sheets/character-sheet.mjs?scroll");

function targetMatching(selectorText) {
  return {
    closest(selector) {
      return selector.split(",").map(part => part.trim()).includes(selectorText) ? {} : null;
    }
  };
}

test("character sheet captures scroll before button and resource actions", () => {
  assert.equal(shouldCaptureCharacterSheetScroll(targetMatching("button")), true);
  assert.equal(shouldCaptureCharacterSheetScroll(targetMatching("[data-item-action]")), true);
  assert.equal(shouldCaptureCharacterSheetScroll(targetMatching("[data-resource-box]")), true);
  assert.equal(shouldCaptureCharacterSheetScroll(targetMatching("[data-resource-step]")), true);
  assert.equal(shouldCaptureCharacterSheetScroll(targetMatching("[data-flat-resource-step]")), true);
});

test("character sheet captures scroll before form controls submit sheet changes", () => {
  assert.equal(shouldCaptureCharacterSheetScroll(targetMatching("input")), true);
  assert.equal(shouldCaptureCharacterSheetScroll(targetMatching("select")), true);
  assert.equal(shouldCaptureCharacterSheetScroll(targetMatching("textarea")), true);
});

test("character sheet ignores passive clicks outside actionable controls", () => {
  assert.equal(shouldCaptureCharacterSheetScroll({ closest: () => null }), false);
  assert.equal(shouldCaptureCharacterSheetScroll(null), false);
});
