import { openAntagonistBuilder } from "../data/premade-actors.mjs";
import { populatePremadeCompendiums } from "../data/premade-compendiums.mjs";
import { openPTGCombatControls } from "../combat/ptg-combat.mjs";
import { openPantheonPoolDialog } from "../workflows/pantheon-pool-workflow.mjs";
import { openMortalDivineBalanceTracker } from "./mortal-divine-tracker.mjs";
import { createOrOpenTerritoryGridScene, openTerritoryGridApp } from "./territory-grid-app.mjs";

const RULES_PACK_ID = "part-time-gods.rules-reference";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

let setupPanel = null;

export function openGMSetupPanel() {
  if (!setupPanel) setupPanel = new GMSetupPanel();
  setupPanel.render({ force: true });
  return setupPanel;
}

export async function openRulesReference() {
  const pack = game.packs?.get(RULES_PACK_ID);
  if (!pack) {
    ui.notifications.warn("Part-Time Gods Rules Reference compendium is not available.");
    return null;
  }

  if (typeof pack.render === "function") {
    pack.render(true);
    return pack;
  }

  const documents = await pack.getDocuments();
  const journal = documents.find(document => document.documentName === "JournalEntry") ?? documents[0] ?? null;
  if (journal?.sheet?.render) {
    journal.sheet.render(true);
    return journal;
  }

  ui.notifications.warn("Part-Time Gods Rules Reference compendium has no readable Journal entries.");
  return null;
}

class GMSetupPanel extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ["part-time-gods", "ptg-gm-setup-window"],
    position: {
      width: 680,
      height: 620
    },
    window: {
      title: "PTG GM Setup",
      resizable: true
    },
    tag: "form"
  };

  static PARTS = {
    form: {
      template: "systems/part-time-gods/templates/apps/gm-setup-panel.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const isGM = Boolean(game.user?.isGM);

    return {
      ...context,
      isGM,
      userRole: isGM ? "GM" : "Player",
      groups: setupGroups().map(group => ({
        ...group,
        actions: group.actions.map(action => ({
          ...action,
          disabled: action.gmOnly && !isGM
        }))
      }))
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);

    for (const button of this.element.querySelectorAll("[data-setup-action]")) {
      button.addEventListener("click", event => this.#onAction(event.currentTarget));
    }
  }

  async #onAction(button) {
    const actionKey = button.dataset.setupAction;
    const action = setupActions()[actionKey];
    if (!action) {
      ui.notifications.warn(`Unsupported PTG setup action: ${actionKey}`);
      return null;
    }

    if (action.gmOnly && !game.user?.isGM) {
      ui.notifications.warn("Only a GM can use that Part-Time Gods setup action.");
      return null;
    }

    if (typeof action.handler !== "function") {
      ui.notifications.warn(`Part-Time Gods setup helper is missing for ${action.label}.`);
      return null;
    }

    try {
      return await action.handler();
    } catch (error) {
      console.error("Part-Time Gods 2E | GM setup action failed.", actionKey, error);
      ui.notifications.error(`${action.label} failed. See the console for details.`);
      return null;
    }
  }
}

function setupGroups() {
  const actions = setupActions();
  return [
    {
      key: "setup",
      label: "Setup",
      actions: [actions["populate-compendia"], actions["territory-scene"], actions["rules-reference"]]
    },
    {
      key: "play",
      label: "Table Tools",
      actions: [
        actions["territory-controls"],
        actions["combat-controls"],
        actions["pantheon-pool"],
        actions["mortal-divine-tracker"],
        actions["antagonist-builder"]
      ]
    }
  ];
}

function setupActions() {
  return {
    "populate-compendia": {
      key: "populate-compendia",
      label: "Populate Compendia",
      icon: "fas fa-database",
      gmOnly: true,
      handler: () => populatePremadeCompendiums({ notify: true })
    },
    "territory-scene": {
      key: "territory-scene",
      label: "Territory Scene",
      icon: "fas fa-map",
      gmOnly: true,
      handler: () => createOrOpenTerritoryGridScene({ activate: false, notify: true })
    },
    "territory-controls": {
      key: "territory-controls",
      label: "Territory Grid",
      icon: "fas fa-crosshairs",
      gmOnly: true,
      handler: () => openTerritoryGridApp()
    },
    "combat-controls": {
      key: "combat-controls",
      label: "Combat Controls",
      icon: "fas fa-shield-alt",
      gmOnly: true,
      handler: () => openPTGCombatControls()
    },
    "pantheon-pool": {
      key: "pantheon-pool",
      label: "Pantheon Pool",
      icon: "fas fa-users",
      gmOnly: false,
      handler: () => openPantheonPoolDialog(defaultPantheonPoolContext())
    },
    "mortal-divine-tracker": {
      key: "mortal-divine-tracker",
      label: "Mortal/Divine Tracker",
      icon: "fas fa-balance-scale",
      gmOnly: true,
      handler: () => openMortalDivineBalanceTracker(defaultCharacterActor())
    },
    "antagonist-builder": {
      key: "antagonist-builder",
      label: "Opposition Builder",
      icon: "fas fa-user-secret",
      gmOnly: true,
      handler: () => openAntagonistBuilder()
    },
    "rules-reference": {
      key: "rules-reference",
      label: "Rules Reference",
      icon: "fas fa-book-open",
      gmOnly: false,
      handler: () => openRulesReference()
    }
  };
}

function defaultPantheonPoolContext() {
  const actor = defaultSelectedActor();
  return {
    pantheon: actor?.type === "pantheon" ? actor : defaultPantheonActor(),
    actingActor: actor?.type === "character" ? actor : defaultCharacterActor()
  };
}

function defaultSelectedActor() {
  return canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null;
}

function defaultCharacterActor() {
  const selected = defaultSelectedActor();
  if (selected?.type === "character") return selected;
  return game.user?.character?.type === "character" ? game.user.character : null;
}

function defaultPantheonActor() {
  return Array.from(game.actors ?? []).find(actor =>
    actor.type === "pantheon" && (game.user?.isGM || actor.isOwner || actor.visible !== false)
  ) ?? null;
}
