const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class PTGCharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["part-time-gods", "sheet", "character"],
    position: {
      width: 900,
      height: 820
    },
    window: {
      title: "PTG.Sheet.CharacterSheet"
    },
    dragDrop: [{ dropSelector: ".ptg-sheet" }]
  };

  static PARTS = {
    form: {
      template: "systems/part-time-gods/templates/actor/character-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.actor = this.actor;
    context.system = this.actor.system;
    context.skills = CONFIG.PTG.skills;
    context.manifestations = CONFIG.PTG.manifestations;
    context.difficulties = CONFIG.PTG.difficulties;
    context.skillEntries = Object.entries(CONFIG.PTG.skills);
    context.manifestationEntries = Object.entries(CONFIG.PTG.manifestations);
    context.items = this.actor.items;
    context.inventory = this.#prepareInventory();
    context.itemTypeLabels = Object.fromEntries(
      Object.keys(CONFIG.Item.dataModels ?? {}).map(type => [type, game.i18n.localize(`TYPES.Item.${type}`)])
    );

    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);

    for (const tab of this.element.querySelectorAll("[data-ptg-tab]")) {
      tab.addEventListener("click", event => this.#activateTab(event.currentTarget.dataset.ptgTab));
    }

    for (const button of this.element.querySelectorAll("[data-roll-skill]")) {
      button.addEventListener("click", event => this.#rollSkill(event.currentTarget));
    }

    for (const button of this.element.querySelectorAll("[data-roll-manifestation]")) {
      button.addEventListener("click", event => this.#rollManifestation(event.currentTarget));
    }

    for (const button of this.element.querySelectorAll("[data-item-action]")) {
      button.addEventListener("click", event => this.#onItemAction(event.currentTarget));
    }
  }

  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const item = await Item.implementation.fromDropData(data);

    if (!item) return false;

    if (item.parent?.uuid === this.actor.uuid) return false;

    const source = item.toObject();
    delete source._id;

    await this.actor.createEmbeddedDocuments("Item", [source]);
    return false;
  }

  #activateTab(tabName) {
    for (const tab of this.element.querySelectorAll("[data-ptg-tab]")) {
      tab.classList.toggle("active", tab.dataset.ptgTab === tabName);
    }

    for (const panel of this.element.querySelectorAll("[data-ptg-panel]")) {
      panel.hidden = panel.dataset.ptgPanel !== tabName;
    }
  }

  async #rollSkill(button) {
    const primary = button.dataset.rollSkill;
    const secondary = this.element.querySelector("[data-roll-secondary]")?.value ?? primary;
    const difficulty = Number(this.element.querySelector("[data-roll-difficulty]")?.value ?? 1);

    await this.actor.rollSkillCombo(primary, secondary, { difficulty });
  }

  async #rollManifestation(button) {
    const manifestation = button.dataset.rollManifestation;
    const skill = this.element.querySelector("[data-roll-manifestation-skill]")?.value ?? "discipline";
    const difficulty = Number(this.element.querySelector("[data-roll-difficulty]")?.value ?? 1);

    await this.actor.rollManifestation(manifestation, skill, { difficulty });
  }

  #prepareInventory() {
    const groups = {
      choices: ["occupation", "archetype", "domain", "theology"],
      divine: ["truth", "relic", "power"],
      attachments: ["bond", "worshipper", "vassal", "blessing", "curse"],
      gear: ["weapon", "armor"]
    };

    return Object.fromEntries(
      Object.entries(groups).map(([group, types]) => [
        group,
        types.flatMap(type => this.actor.items.filter(item => item.type === type)).sort((a, b) => a.name.localeCompare(b.name))
      ])
    );
  }

  async #onItemAction(button) {
    const item = this.actor.items.get(button.closest("[data-item-id]")?.dataset.itemId);
    const action = button.dataset.itemAction;

    if (!item) return;

    if (action === "edit") return item.sheet.render(true);

    if (action === "delete") {
      const confirmed = await Dialog.confirm({
        title: `Delete ${item.name}`,
        content: `<p>Remove <strong>${item.name}</strong> from ${this.actor.name}?</p>`
      });

      if (confirmed) await item.delete();
      return;
    }

    if (action === "apply") return this.actor.applyChoice(item);

    if (action === "use") return this.actor.useOwnedItem(item);

    if (action === "equip") {
      await item.update({ "system.equipped": !item.system.equipped });
      return;
    }

    if (action === "strain-plus" || action === "strain-minus") {
      const current = Number(item.system.strain?.value ?? 0);
      const max = Number(item.system.strain?.max ?? item.system.level ?? 0);
      const delta = action === "strain-plus" ? 1 : -1;
      await item.update({ "system.strain.value": Math.clamp(current + delta, 0, max) });
    }
  }
}
