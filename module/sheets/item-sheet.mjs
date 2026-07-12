const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;
const ITEM_IMAGE_FALLBACK = "icons/svg/item-bag.svg";

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
    context.itemImg = itemImageSource(this.item);
    context.itemImageFallback = ITEM_IMAGE_FALLBACK;

    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    wireItemSheetImageFallback(this.element);
    annotateCompactFieldTitles(this.element);
  }
}

function itemImageSource(item) {
  const src = String(item?.img ?? "").trim();
  return src || ITEM_IMAGE_FALLBACK;
}

function wireItemSheetImageFallback(root) {
  for (const image of root?.querySelectorAll?.("img[data-fallback-src]") ?? []) {
    const fallback = image.dataset.fallbackSrc || ITEM_IMAGE_FALLBACK;
    if (!image.getAttribute("src")) image.setAttribute("src", fallback);
    if (image.dataset.ptgFallbackWired) continue;
    image.dataset.ptgFallbackWired = "true";
    image.addEventListener("error", () => {
      if (image.getAttribute("src") !== fallback) image.setAttribute("src", fallback);
    });
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
