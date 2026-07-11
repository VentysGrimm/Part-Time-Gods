import { mergeSheetEditLockContext, wireSheetEditLock } from "./sheet-edit-lock.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class PTGItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["part-time-gods", "sheet", "item"],
    position: fitSheetPosition(720, 760, { minWidth: 360, minHeight: 360 }),
    window: {
      title: "PTG.Sheet.ItemSheet",
      resizable: true
    }
  };

  static PARTS = {
    form: {
      template: "systems/part-time-gods/templates/item/item-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = mergeSheetEditLockContext(await super._prepareContext(options), this, this.item);

    context.item = this.item;
    context.system = this.item.system;
    context.itemTypeLabel = game.i18n.localize(`TYPES.Item.${this.item.type}`);
    context.config = CONFIG.PTG;

    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    wireSheetEditLock(this, this.element, this.item);
  }
}

function fitSheetPosition(width, height, { minWidth = 360, minHeight = 320, marginX = 64, marginY = 120 } = {}) {
  const viewportWidth = Number(globalThis.window?.innerWidth ?? width);
  const viewportHeight = Number(globalThis.window?.innerHeight ?? height);
  const minFitWidth = Math.min(minWidth, Math.max(240, viewportWidth - 16));
  const minFitHeight = Math.min(minHeight, Math.max(240, viewportHeight - 16));
  const availableWidth = Math.max(minFitWidth, viewportWidth - marginX);
  const availableHeight = Math.max(minFitHeight, viewportHeight - marginY);

  return {
    width: Math.min(width, availableWidth),
    height: Math.min(height, availableHeight)
  };
}
