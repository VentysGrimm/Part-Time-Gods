import { openAntagonistBuilder } from "../data/premade-actors.mjs";

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
      title: "PTG.Sheet.AntagonistSheet",
      resizable: true
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
    context.canUseSetupTools = game.user?.isGM;

    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);

    this.element.querySelector("[data-antagonist-builder]")?.addEventListener("click", () => openAntagonistBuilder());
  }
}
