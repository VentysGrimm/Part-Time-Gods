import { PTG_IMAGE_FALLBACK, imageSource, wireImageFallbacks } from "../util/image-fallback.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;
const ITEM_IMAGE_FALLBACK = PTG_IMAGE_FALLBACK;

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
    const context = await super._prepareContext(options);

    context.item = this.item;
    context.system = this.item.system;
    context.itemTypeLabel = game.i18n.localize(`TYPES.Item.${this.item.type}`);
    context.config = CONFIG.PTG;
    context.itemImg = imageSource(this.item?.img, ITEM_IMAGE_FALLBACK);
    context.itemImageFallback = ITEM_IMAGE_FALLBACK;

    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    wireImageFallbacks(this.element, ITEM_IMAGE_FALLBACK);
    annotateCompactFieldTitles(this.element);
  }
}

function annotateCompactFieldTitles(root) {
  for (const control of root?.querySelectorAll?.("input:not([type='checkbox']), select, textarea") ?? []) {
    const value = control.tagName === "SELECT"
      ? control.selectedOptions?.[0]?.textContent
      : control.value;
    const title = String(value ?? "").trim();
    if (title && !control.getAttribute("title")) control.setAttribute("title", title);
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
