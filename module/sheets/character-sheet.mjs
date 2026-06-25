import { getDragEventData, itemFromDropData } from "../util/drop-data.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { DialogV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class PTGCharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["part-time-gods", "sheet", "character"],
    position: {
      width: 900,
      height: 820
    },
    window: {
      title: "PTG.Sheet.CharacterSheet",
      resizable: true
    },
    dragDrop: [{ dropSelector: ".ptg-sheet" }],
    form: {
      closeOnSubmit: false,
      submitOnChange: true,
      handler: PTGCharacterSheet._onSubmit
    }
  };

  static PARTS = {
    form: {
      template: "systems/part-time-gods/templates/actor/character-sheet.hbs"
    }
  };

  static async _onSubmit(event, form, formData) {
    const data = formData?.object ?? {};
    return this.actor.update(data);
  }

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
    context.inventorySections = this.#prepareInventorySections(context.inventory);
    context.creationSteps = this.#prepareCreationSteps(context.inventory);
    context.gearSummary = this.#prepareGearSummary(context.inventory.gear);
    context.skillColumns = this.#prepareSkillColumns();
    context.manifestationColumns = this.#prepareManifestationColumns();
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

    this.element.querySelector("[data-character-creator]")?.addEventListener("click", () => this.#openCharacterCreator());
  }

  async _onDrop(event) {
    const data = getDragEventData(event);
    const item = await itemFromDropData(data);

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
      panel.classList.toggle("active", panel.dataset.ptgPanel === tabName);
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
      truths: ["truth"],
      relics: ["relic"],
      powers: ["power"],
      bonds: ["bond"],
      worshippers: ["worshipper"],
      vassals: ["vassal"],
      blessings: ["blessing"],
      curses: ["curse"],
      conditions: ["condition"],
      gear: ["weapon", "armor"]
    };

    return Object.fromEntries(
      Object.entries(groups).map(([group, types]) => [
        group,
        types
          .flatMap(type => this.actor.items.filter(item => item.type === type))
          .filter(item => group !== "gear" || item.system.held !== false || item.system.equipped)
          .sort((a, b) => a.name.localeCompare(b.name))
      ])
    );
  }

  #prepareInventorySections(inventory) {
    return [
      { key: "truths", title: "Truths", family: "Divine Identity", mode: "usable", items: inventory.truths },
      { key: "relics", title: "Relics", family: "Divine Identity", mode: "usable", items: inventory.relics },
      { key: "powers", title: "Powers", family: "Divine Identity", mode: "usable", items: inventory.powers },
      { key: "bonds", title: "Bonds", family: "Attachments", mode: "attachment", items: inventory.bonds },
      { key: "worshippers", title: "Worshippers", family: "Attachments", mode: "attachment", items: inventory.worshippers },
      { key: "vassals", title: "Vassals", family: "Attachments", mode: "attachment", items: inventory.vassals },
      { key: "conditions", title: "Conditions", family: "Character State", mode: "usable", items: inventory.conditions },
      { key: "blessings", title: "Blessings", family: "Boons and Burdens", mode: "usable", items: inventory.blessings },
      { key: "curses", title: "Curses", family: "Boons and Burdens", mode: "usable", items: inventory.curses }
    ];
  }

  #prepareCreationSteps(inventory) {
    const identity = this.actor.system.identity ?? {};
    const resources = this.actor.system.resources ?? {};
    const hasChoice = type => inventory.choices.some(item => item.type === type);
    const hasIdentity = key => Boolean(String(identity[key] ?? "").trim());
    const countItems = groups => groups.reduce((total, group) => total + (inventory[group]?.length ?? 0), 0);
    const formatCount = (count, singular, plural = `${singular}s`) => count === 1 ? `1 ${singular}` : `${count} ${plural}`;

    const attachmentCount = countItems(["bonds", "worshippers", "vassals", "relics", "truths"]);
    const blessingCount = inventory.blessings?.length ?? 0;
    const curseCount = inventory.curses?.length ?? 0;
    const hasCoreChoices = ["occupation", "archetype", "dominion", "theology"].every(key => hasIdentity(key));
    const hasFinalDetails = Boolean(
      String(this.actor.system.specialties ?? "").trim()
      || String(resources.legendaryActs ?? "").trim()
      || Number(resources.xpGained ?? 0)
      || Number(resources.xpSpent ?? 0)
      || Number(resources.spark ?? 1) > 1
    );

    return [
      {
        number: 1,
        title: "Occupation",
        source: "Book pp. 37-50",
        complete: hasIdentity("occupation") || hasChoice("occupation"),
        detail: identity.occupation || "No occupation selected"
      },
      {
        number: 2,
        title: "Archetype",
        source: "Book pp. 51-59",
        complete: hasIdentity("archetype") || hasChoice("archetype"),
        detail: identity.archetype || "No archetype selected"
      },
      {
        number: 3,
        title: "Dominion",
        source: "Book pp. 60-66",
        complete: hasIdentity("dominion") || hasChoice("domain"),
        detail: identity.dominion || "No dominion selected"
      },
      {
        number: 4,
        title: "Theology",
        source: "Book pp. 67-100",
        complete: hasIdentity("theology") || hasChoice("theology"),
        detail: identity.theology || "No theology selected"
      },
      {
        number: 5,
        title: "Attachments",
        source: "Book pp. 105-124",
        complete: attachmentCount > 0,
        detail: attachmentCount > 0 ? formatCount(attachmentCount, "attachment") : "No attachments added"
      },
      {
        number: 6,
        title: "Final Touches",
        source: "Book pp. 125-128",
        complete: hasFinalDetails || (hasCoreChoices && attachmentCount > 0),
        detail: `${formatCount(blessingCount, "blessing")} / ${formatCount(curseCount, "curse")}`
      }
    ];
  }

  #prepareGearSummary(items) {
    return items.reduce((summary, item) => {
      const amount = Number(item.system.amount ?? 1);
      summary.cost += Number(item.system.cost ?? 0) * amount;
      summary.weight += Number(item.system.weight ?? 0) * amount;
      summary.equippedArmor += item.type === "armor" && item.system.equipped ? Number(item.system.rating ?? 0) : 0;
      return summary;
    }, {
      cost: 0,
      weight: 0,
      equippedArmor: 0
    });
  }

  #prepareSkillColumns() {
    return [
      ["athletics", "crafts", "deception", "discipline", "empathy", "fighting", "fortitude"],
      ["influence", "intuition", "knowledge", "marksman", "medicine", "might", "perception"],
      ["perform", "speed", "stealth", "survival", "tech", "travel"]
    ].map(column => column.filter(key => CONFIG.PTG.skills[key]));
  }

  #prepareManifestationColumns() {
    return [
      ["aegis", "beckon", "journey", "minion", "puppetry"],
      ["oracle", "ruin", "shaping", "soul"]
    ].map(column => column.filter(key => CONFIG.PTG.manifestations[key]));
  }

  async #onItemAction(button) {
    const item = this.actor.items.get(button.closest("[data-item-id]")?.dataset.itemId);
    const action = button.dataset.itemAction;

    if (!item) return;

    if (action === "edit") return item.sheet.render({ force: true });

    if (action === "delete") {
      const confirmed = await DialogV2.confirm({
        window: { title: `Delete ${item.name}` },
        content: `<p>Remove <strong>${item.name}</strong> from ${this.actor.name}?</p>`,
        rejectClose: false,
        modal: true
      });

      if (confirmed) await item.delete();
      return;
    }

    if (action === "apply") return this.actor.applyChoice(item);

    if (action === "use") return this.actor.useOwnedItem(item);

    if (action === "condition-reduce") return this.actor.reduceCondition(item);

    if (action === "equip") {
      await item.update({ "system.equipped": !item.system.equipped });
      return;
    }

    if (action === "hold") {
      await item.update({ "system.held": item.system.held === false });
      return;
    }

    if (action === "strain-plus" || action === "strain-minus") {
      const current = Number(item.system.strain?.value ?? 0);
      const max = Number(item.system.strain?.max ?? item.system.level ?? 0);
      const delta = action === "strain-plus" ? 1 : -1;
      await item.update({ "system.strain.value": Math.clamp(current + delta, 0, max) });
    }
  }

  async #openCharacterCreator() {
    const choices = await this.#loadCreationChoices();
    const types = ["occupation", "archetype", "domain", "theology"];
    const identity = this.actor.system.identity ?? {};
    const attachments = this.actor.system.attachments ?? {};
    const resources = this.actor.system.resources ?? {};
    const identityKeys = {
      occupation: "occupation",
      archetype: "archetype",
      domain: "dominion",
      theology: "theology"
    };

    const content = `
      <div class="ptg-creator-dialog">
        ${types.map((type, index) => {
          const current = identity[identityKeys[type]] || "";
          const options = choices[type] ?? [];

          return `
            <fieldset>
              <legend>Step ${index + 1}: ${escapeHTML(creatorTypeLabel(type))}</legend>
              <select name="${type}">
                <option value="">${current ? `Keep ${escapeHTML(current)}` : `Choose ${escapeHTML(creatorTypeLabel(type))}`}</option>
                ${options.map(option => `<option value="${escapeHTML(option.uuid)}">${escapeHTML(option.name)}</option>`).join("")}
              </select>
              <p class="hint">${current ? `Current: ${escapeHTML(current)}` : "No selection applied yet."}</p>
            </fieldset>
          `;
        }).join("")}
        <fieldset>
          <legend>Step 5: Attachments</legend>
          <label>Bonds <textarea name="attachments.bonds">${escapeHTML(attachments.bonds ?? "")}</textarea></label>
          <label>Worshippers <textarea name="attachments.worshippers">${escapeHTML(attachments.worshippers ?? "")}</textarea></label>
          <label>Vassals <textarea name="attachments.vassals">${escapeHTML(attachments.vassals ?? "")}</textarea></label>
        </fieldset>
        <fieldset>
          <legend>Step 6: Final Touches</legend>
          <label>God/dess Of <input type="text" name="identity.concept" value="${escapeHTML(identity.concept ?? "")}"></label>
          <label>Age & Ethnicity <input type="text" name="identity.ageEthnicity" value="${escapeHTML(identity.ageEthnicity ?? "")}"></label>
          <label>Specialties <textarea name="specialties">${escapeHTML(this.actor.system.specialties ?? "")}</textarea></label>
          <label>Legendary Acts <textarea name="resources.legendaryActs">${escapeHTML(resources.legendaryActs ?? "")}</textarea></label>
        </fieldset>
      </div>
    `;

    const selections = await DialogV2.prompt({
      window: { title: `${this.actor.name}: Character Creator` },
      content,
      rejectClose: false,
      modal: true,
      ok: {
        label: "Apply Choices",
        callback: (event, button) => ({
          choices: Object.fromEntries(types.map(type => [type, button.form.elements[type]?.value ?? ""])),
          updates: {
            "system.attachments.bonds": button.form.elements["attachments.bonds"]?.value ?? "",
            "system.attachments.worshippers": button.form.elements["attachments.worshippers"]?.value ?? "",
            "system.attachments.vassals": button.form.elements["attachments.vassals"]?.value ?? "",
            "system.identity.concept": button.form.elements["identity.concept"]?.value ?? "",
            "system.identity.ageEthnicity": button.form.elements["identity.ageEthnicity"]?.value ?? "",
            "system.specialties": button.form.elements.specialties?.value ?? "",
            "system.resources.legendaryActs": button.form.elements["resources.legendaryActs"]?.value ?? ""
          }
        })
      }
    });

    if (!selections) return;

    const selectedTypes = types.filter(type => selections.choices[type]);
    await this.actor.update(selections.updates);

    for (const type of selectedTypes) {
      if (identity[identityKeys[type]]) {
        ui.notifications.warn(`${creatorTypeLabel(type)} is already set for ${this.actor.name}.`);
        continue;
      }

      const uuid = selections.choices[type];
      const sourceItem = await fromUuid(uuid);
      if (!sourceItem) continue;

      const source = sourceItem.toObject();
      delete source._id;

      const [ownedItem] = await this.actor.createEmbeddedDocuments("Item", [source]);
      const applied = await this.actor.applyChoice(ownedItem);
      if (!applied) await ownedItem.delete();
    }

    if (!selectedTypes.length) ui.notifications.info("Updated character creator details.");
  }

  async #loadCreationChoices() {
    const byType = {
      occupation: [],
      archetype: [],
      domain: [],
      theology: []
    };
    const pack = game.packs.get("part-time-gods.character-creation");
    let documents = [];

    if (pack) {
      documents = await pack.getDocuments();
    }

    if (!documents.length) {
      documents = game.items.filter(item => item.getFlag("part-time-gods", "premadeChoice"));
    }

    for (const item of documents) {
      if (!byType[item.type]) continue;
      byType[item.type].push(item);
    }

    for (const options of Object.values(byType)) {
      options.sort((a, b) => a.name.localeCompare(b.name));
    }

    return byType;
  }
}

function creatorTypeLabel(type) {
  return {
    occupation: "Occupation",
    archetype: "Archetype",
    domain: "Dominion",
    theology: "Theology"
  }[type] ?? type;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}
