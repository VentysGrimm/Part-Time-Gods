import { openAntagonistBuilder } from "../data/premade-actors.mjs";
import { populatePremadeCompendiums } from "../data/premade-compendiums.mjs";
import { openPTGCombatControls } from "../combat/ptg-combat.mjs";
import { openPantheonPoolDialog } from "../workflows/pantheon-pool-workflow.mjs";
import { openMortalDivineBalanceTracker } from "./mortal-divine-tracker.mjs";
import { createOrOpenTerritoryGridScene, openTerritoryInterface } from "./territory-grid-app.mjs";
import { SYSTEM_ID, localize, localizeFallback } from "../util/localization.mjs";

const RULES_PACK_ID = "part-time-gods.rules-reference";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

let setupPanel = null;

export function openGMSetupPanel() {
  if (!setupPanel) setupPanel = new GMSetupPanel();
  setupPanel.render({ force: true });
  return setupPanel;
}

export function registerGMSetupSettings() {
  game.settings.register(SYSTEM_ID, "showGMSetupOnReady", {
    name: localize("PTG.Settings.ShowGMSetupOnReady.Name"),
    hint: localize("PTG.Settings.ShowGMSetupOnReady.Hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(SYSTEM_ID, "gmSetupFirstRunComplete", {
    name: localize("PTG.Settings.GMSetupFirstRunComplete.Name"),
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });
}

export function registerGMSetupControls() {
  Hooks.on("getSceneControlButtons", controls => {
    const tool = {
      name: "ptg-gm-setup",
      title: localize("PTG.Setup.ControlTitle"),
      icon: "fas fa-tools",
      button: true,
      visible: Boolean(game.user?.isGM),
      onChange: () => openGMSetupPanel()
    };

    if (Array.isArray(controls)) {
      let group = controls.find(control => control.name === "ptg");
      if (!group) {
        group = {
          name: "ptg",
          title: localize("PTG.Setup.ControlGroup"),
          icon: "fas fa-map",
          layer: "controls",
          tools: []
        };
        controls.push(group);
      }

      group.tools ??= [];
      if (!group.tools.some(existing => existing.name === tool.name)) group.tools.unshift(tool);
      return;
    }

    if (!controls || typeof controls !== "object") return;

    controls.ptg ??= {
      name: "ptg",
      title: localize("PTG.Setup.ControlGroup"),
      icon: "fas fa-map",
      layer: "controls",
      tools: {}
    };

    const tools = controls.ptg.tools;
    if (Array.isArray(tools)) {
      if (!tools.some(existing => existing.name === tool.name)) tools.unshift(tool);
    } else {
      controls.ptg.tools = {
        [tool.name]: tool,
        ...(tools ?? {})
      };
    }
  });
}

export async function maybeOpenFirstRunGMSetup() {
  if (!game.user?.isGM) return false;
  if (!game.settings.get(SYSTEM_ID, "showGMSetupOnReady")) return false;
  if (game.settings.get(SYSTEM_ID, "gmSetupFirstRunComplete")) return false;

  await game.settings.set(SYSTEM_ID, "gmSetupFirstRunComplete", true);
  ui.notifications.info(localize("PTG.Setup.FirstRunNotification"));
  openGMSetupPanel();
  return true;
}

export async function openRulesReference() {
  const pack = game.packs?.get(RULES_PACK_ID);
  if (!pack) {
    ui.notifications.warn(localize("PTG.Setup.Notifications.RulesReferenceMissing"));
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

  ui.notifications.warn(localize("PTG.Setup.Notifications.RulesReferenceEmpty"));
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
      title: "PTG.Setup.WindowTitle",
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
      title: localize("PTG.Setup.Title"),
      subtitle: localize("PTG.Setup.Subtitle"),
      userRole: isGM ? localize("PTG.Setup.Roles.GM") : localize("PTG.Setup.Roles.Player"),
      firstRunTitle: localize("PTG.Setup.FirstRunTitle"),
      firstRunHint: localize("PTG.Setup.FirstRunHint"),
      gmActionsDisabled: localize("PTG.Setup.GMActionsDisabled"),
      gmBadge: localize("PTG.Setup.GMBadge"),
      groups: setupGroups().map(group => ({
        ...group,
        actions: group.actions.filter(Boolean).map(action => ({
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
      ui.notifications.warn(localize("PTG.Setup.Notifications.UnsupportedAction", { action: actionKey }));
      return null;
    }

    if (action.gmOnly && !game.user?.isGM) {
      ui.notifications.warn(localize("PTG.Setup.Notifications.GMOnly"));
      return null;
    }

    if (typeof action.handler !== "function") {
      ui.notifications.warn(localize("PTG.Setup.Notifications.MissingHelper", { label: action.label }));
      return null;
    }

    try {
      return await action.handler();
    } catch (error) {
      console.error("Part-Time Gods 2E | GM setup action failed.", actionKey, error);
      ui.notifications.error(localize("PTG.Setup.Notifications.ActionFailed", { label: action.label }));
      return null;
    }
  }
}

function setupGroups() {
  const actions = setupActions();
  return [
    {
      key: "setup",
      label: localize("PTG.Setup.Groups.Setup.Label"),
      hint: localize("PTG.Setup.Groups.Setup.Hint"),
      actions: [actions["populate-compendia"], actions["territory-scene"], actions["rules-reference"]]
    },
    {
      key: "play",
      label: localize("PTG.Setup.Groups.Play.Label"),
      hint: localize("PTG.Setup.Groups.Play.Hint"),
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
  const definitions = {
    "populate-compendia": {
      key: "populate-compendia",
      labelKey: "PTG.Setup.Actions.PopulateCompendia.Label",
      hintKey: "PTG.Setup.Actions.PopulateCompendia.Hint",
      icon: "fas fa-database",
      gmOnly: true,
      handler: () => populatePremadeCompendiums({ notify: true })
    },
    "territory-scene": {
      key: "territory-scene",
      labelKey: "PTG.Setup.Actions.TerritoryScene.Label",
      hintKey: "PTG.Setup.Actions.TerritoryScene.Hint",
      icon: "fas fa-map",
      gmOnly: true,
      handler: () => createOrOpenTerritoryGridScene({ activate: false, notify: true })
    },
    "territory-controls": {
      key: "territory-controls",
      labelKey: "PTG.Setup.Actions.TerritoryGrid.Label",
      hintKey: "PTG.Setup.Actions.TerritoryGrid.Hint",
      icon: "fas fa-crosshairs",
      gmOnly: true,
      handler: () => openTerritoryInterface()
    },
    "combat-controls": {
      key: "combat-controls",
      labelKey: "PTG.Setup.Actions.CombatControls.Label",
      hintKey: "PTG.Setup.Actions.CombatControls.Hint",
      icon: "fas fa-shield-alt",
      gmOnly: true,
      handler: () => openPTGCombatControls()
    },
    "pantheon-pool": {
      key: "pantheon-pool",
      labelKey: "PTG.Setup.Actions.PantheonPool.Label",
      hintKey: "PTG.Setup.Actions.PantheonPool.Hint",
      icon: "fas fa-users",
      gmOnly: false,
      handler: () => openPantheonPoolDialog(defaultPantheonPoolContext())
    },
    "mortal-divine-tracker": {
      key: "mortal-divine-tracker",
      labelKey: "PTG.Setup.Actions.MortalDivineTracker.Label",
      hintKey: "PTG.Setup.Actions.MortalDivineTracker.Hint",
      icon: "fas fa-balance-scale",
      gmOnly: true,
      handler: () => openMortalDivineBalanceTracker(defaultCharacterActor())
    },
    "antagonist-builder": {
      key: "antagonist-builder",
      labelKey: "PTG.Setup.Actions.OppositionBuilder.Label",
      hintKey: "PTG.Setup.Actions.OppositionBuilder.Hint",
      icon: "fas fa-user-secret",
      gmOnly: true,
      handler: () => openAntagonistBuilder()
    },
    "rules-reference": {
      key: "rules-reference",
      labelKey: "PTG.Setup.Actions.RulesReference.Label",
      hintKey: "PTG.Setup.Actions.RulesReference.Hint",
      icon: "fas fa-book-open",
      gmOnly: false,
      handler: () => openRulesReference()
    }
  };

  return Object.fromEntries(
    Object.entries(definitions).map(([key, action]) => [
      key,
      {
        ...action,
        label: localizeFallback(action.labelKey, action.key),
        hint: localizeFallback(action.hintKey, "")
      }
    ])
  );
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
