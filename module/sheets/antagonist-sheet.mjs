import { openAntagonistBuilder } from "../data/premade-actors.mjs";
import { openPTGCombatControls, rollPTGStatblockPool } from "../combat/ptg-combat.mjs";

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
    context.canUseCombatControls = game.user?.isGM;

    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);

    this.element.querySelector("[data-antagonist-builder]")?.addEventListener("click", () => openAntagonistBuilder());
    this.element.querySelector("[data-antagonist-combat-controls]")?.addEventListener("click", () => openPTGCombatControls());
    for (const button of this.element.querySelectorAll("[data-antagonist-combat-roll]")) {
      button.addEventListener("click", event => this.#rollCombatStat(event.currentTarget.dataset.antagonistCombatRoll));
    }
  }

  async #rollCombatStat(stat) {
    const result = await rollPTGStatblockPool(this.actor, stat);
    if (!result) {
      ui.notifications.warn(`${this.actor.name} has no ${combatStatLabel(stat)} pool to roll.`);
      return null;
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: `
        <div class="ptg-chat-card">
          <h3>${escapeHTML(this.actor.name)}: ${escapeHTML(combatStatLabel(stat))}</h3>
          <div>Statblock pool: ${Number(result.pool)}d10.</div>
          <div>Successes: <strong>${Number(result.successes)}</strong></div>
          <div>Use this with PTG Combat Controls for Battle of Fists, Battle of Wits, damage, Conditions, and action tracking.</div>
        </div>
      `
    });

    return result;
  }
}

function combatStatLabel(stat) {
  return {
    attack: "Attack",
    defense: "Defense"
  }[stat] ?? "Combat Roll";
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
