const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class PTGItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["part-time-gods", "sheet", "item"],
    position: {
      width: 720,
      height: 760
    },
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

    return context;
  }
}
