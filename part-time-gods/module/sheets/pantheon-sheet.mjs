const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class PTGPantheonSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["part-time-gods", "sheet", "pantheon"],
    position: {
      width: 720,
      height: 620
    },
    window: {
      title: "PTG.Sheet.PantheonSheet"
    }
  };

  static PARTS = {
    form: {
      template: "systems/part-time-gods/templates/actor/pantheon-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.actor = this.actor;
    context.system = this.actor.system;

    return context;
  }
}
