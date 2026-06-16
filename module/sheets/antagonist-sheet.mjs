const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class PTGAntagonistSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["part-time-gods", "sheet", "antagonist"],
    position: {
      width: 640,
      height: 620
    },
    window: {
      title: "PTG.Sheet.AntagonistSheet"
    }
  };

  static PARTS = {
    form: {
      template: "systems/part-time-gods/templates/actor/antagonist-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.actor = this.actor;
    context.system = this.actor.system;

    return context;
  }
}
