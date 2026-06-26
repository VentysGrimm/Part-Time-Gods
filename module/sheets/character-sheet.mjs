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
    context.xpUnspent = Math.max(0, Number(context.system.resources?.xpGained ?? 0) - Number(context.system.resources?.xpSpent ?? 0));
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

    for (const button of this.element.querySelectorAll("[data-ritual-action]")) {
      button.addEventListener("click", event => this.#postRitualCard(event.currentTarget.dataset.ritualAction));
    }

    this.element.querySelector("[data-advancement-purchase]")?.addEventListener("click", () => this.#openAdvancementPurchase());
    this.element.querySelector("[data-spark-advancement]")?.addEventListener("click", () => this.#openSparkAdvancement());

    this.element.querySelector("[data-character-creator]")?.addEventListener("click", () => this.#openCharacterCreator());
  }

  async _onDrop(event) {
    const data = getDragEventData(event);
    const item = await itemFromDropData(data);

    if (!item) return false;

    if (item.parent?.uuid === this.actor.uuid) return false;

    const source = item.toObject();
    delete source._id;

    const [created] = await this.actor.createEmbeddedDocuments("Item", [source]);

    if (["occupation", "archetype", "domain", "theology"].includes(created.type)) {
      const applied = await this.actor.applyChoice(created);
      if (!applied) await created.delete();
    }

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
    const selection = await selectSkillComboRollOptions({
      actor: this.actor,
      primary,
      secondary: this.element.querySelector("[data-roll-secondary]")?.value ?? primary,
      difficulty: Number(this.element.querySelector("[data-roll-difficulty]")?.value ?? 1)
    });

    if (!selection) return;

    if (selection.pantheonDice > 0) {
      const spent = await this.actor.spendResource("pantheon", selection.pantheonDice);
      if (!spent) return;
    }

    await this.actor.rollSkillCombo(selection.primary, selection.secondary, {
      difficulty: selection.difficulty,
      bonus: selection.bonus,
      penalty: selection.penalty,
      modifierDetails: selection.modifierDetails,
      checkMode: selection.checkMode,
      extended: selection.extended,
      boostChoice: selection.boostChoice
    });
  }

  async #rollManifestation(button) {
    const manifestation = button.dataset.rollManifestation;
    const selection = await selectManifestationRollOptions({
      actor: this.actor,
      manifestation,
      skill: this.element.querySelector("[data-roll-manifestation-skill]")?.value ?? "discipline",
      difficulty: Number(this.element.querySelector("[data-roll-difficulty]")?.value ?? 1)
    });

    if (!selection) return;

    if (selection.pantheonDice > 0) {
      const spent = await this.actor.spendResource("pantheon", selection.pantheonDice);
      if (!spent) return;
    }

    const outcome = await this.actor.rollManifestation(selection.manifestation, selection.skill, {
      difficulty: selection.difficulty,
      bonus: selection.bonus,
      penalty: selection.penalty,
      modifierDetails: selection.modifierDetails,
      checkMode: "manifestation",
      boostChoice: selection.boostChoice
    });

    if (outcome.criticalFailure) await postManifestationBacklashSummary(this.actor, selection);

    await postManifestationMeasureSummary(this.actor, outcome, selection);

    if (selection.resistance.enabled) {
      const resistor = Array.from(game.user?.targets ?? [])
        .map(token => token.actor)
        .find(actor => actor?.rollSkillCombo) ?? this.actor;

      await resistor.rollSkillCombo(selection.resistance.primary, selection.resistance.secondary, {
        difficulty: outcome.successes,
        modifierDetails: selection.resistance.modifierDetails,
        checkMode: "opposed",
        flavor: `${resistor.name}: Resist ${CONFIG.PTG.manifestations[selection.manifestation] ?? selection.manifestation}`
      });
    }

    if (selection.ritual.kind !== "none") await postManifestationRitualSummary(this.actor, selection);
  }

  async #postRitualCard(kind) {
    const labels = {
      territory: "Territory Ritual",
      spark: "Spark Ritual",
      otherworldly: "Otherworldly Ritual"
    };

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: `
        <div class="ptg-chat-card">
          <h3>${escapeHTML(labels[kind] ?? "Ritual")}</h3>
          <div>${escapeHTML(this.actor.name)} begins a ${escapeHTML((labels[kind] ?? "ritual").toLowerCase())}.</div>
          <div>Use this card to record requirements, participants, costs, rolls, and GM rulings. Territory map mechanics are not automated in this slice.</div>
        </div>
      `
    });
  }

  async #openAdvancementPurchase() {
    const resources = this.actor.system.resources ?? {};
    const xpGained = Number(resources.xpGained ?? 0);
    const xpSpent = Number(resources.xpSpent ?? 0);
    const xpAvailable = Math.max(0, xpGained - xpSpent);
    const categories = {
      skill: "Skill",
      manifestation: "Manifestation",
      bond: "Bond",
      relic: "Relic",
      truth: "Truth",
      vassal: "Vassal",
      worshipper: "Worshipper"
    };

    const content = `
      <div class="ptg-advancement-dialog">
        <p class="ptg-sheet-note">Available XP: ${xpAvailable}</p>
        <div class="form-group">
          <label>Purchase Type</label>
          <select name="category">
            ${Object.entries(categories).map(([key, label]) => `<option value="${key}">${escapeHTML(label)}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label>Purchase</label>
          <input type="text" name="name" value="" placeholder="Skill, Manifestation, Item, or note">
        </div>
        <div class="form-group">
          <label>XP Cost</label>
          <input type="number" name="cost" value="1" min="0">
        </div>
      </div>
    `;

    const purchase = await DialogV2.prompt({
      window: { title: `${this.actor.name}: Advancement Purchase` },
      content,
      rejectClose: false,
      modal: true,
      ok: {
        label: "Spend XP",
        callback: (event, button) => ({
          category: button.form.elements.category?.value ?? "skill",
          name: button.form.elements.name?.value?.trim() ?? "",
          cost: Math.max(0, Number(button.form.elements.cost?.value ?? 0))
        })
      }
    });

    if (!purchase) return;

    if (!purchase.name) {
      ui.notifications.warn("Advancement purchase needs a name or note.");
      return;
    }

    if (purchase.cost > xpAvailable) {
      ui.notifications.warn(`Not enough XP. ${this.actor.name} has ${xpAvailable} unspent XP.`);
      return;
    }

    await this.actor.update({
      "system.resources.xpSpent": xpSpent + purchase.cost
    });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: `
        <div class="ptg-chat-card">
          <h3>Advancement Purchase</h3>
          <div>${escapeHTML(this.actor.name)} purchased ${escapeHTML(categories[purchase.category] ?? purchase.category)}: ${escapeHTML(purchase.name)}.</div>
          <div>XP Spent: ${purchase.cost}</div>
          <div>Remaining XP: ${xpAvailable - purchase.cost}</div>
        </div>
      `
    });
  }

  async #openSparkAdvancement() {
    const resources = this.actor.system.resources ?? {};
    const currentSpark = Number(resources.spark ?? 1);
    const currentActs = String(resources.legendaryActs ?? "").trim();

    const content = `
      <div class="ptg-advancement-dialog">
        <p class="ptg-sheet-note">Current Spark: ${currentSpark}. Fragment max becomes Spark x3.</p>
        <div class="form-group">
          <label>New Spark</label>
          <input type="number" name="spark" value="${currentSpark + 1}" min="${currentSpark + 1}">
        </div>
        <div class="form-group">
          <label>Free Truth</label>
          <input type="text" name="truth" value="" placeholder="Optional Truth gained from Spark advancement">
        </div>
        <div class="form-group">
          <label>Legendary Act</label>
          <textarea name="legendaryAct" placeholder="What changed the god's legend?"></textarea>
        </div>
      </div>
    `;

    const advancement = await DialogV2.prompt({
      window: { title: `${this.actor.name}: Spark Advancement` },
      content,
      rejectClose: false,
      modal: true,
      ok: {
        label: "Advance Spark",
        callback: (event, button) => ({
          spark: Math.max(currentSpark + 1, Number(button.form.elements.spark?.value ?? currentSpark + 1)),
          truth: button.form.elements.truth?.value?.trim() ?? "",
          legendaryAct: button.form.elements.legendaryAct?.value?.trim() ?? ""
        })
      }
    });

    if (!advancement) return;

    const fragmentMax = Math.max(0, advancement.spark * 3);
    const currentFragments = resources.fragments ?? {};
    const updates = {
      "system.resources.spark": advancement.spark,
      "system.resources.fragments.max": fragmentMax,
      "system.resources.fragments.value": Math.max(Number(currentFragments.value ?? 0), fragmentMax)
    };

    if (advancement.legendaryAct) {
      updates["system.resources.legendaryActs"] = currentActs
        ? `${currentActs}\n${advancement.legendaryAct}`
        : advancement.legendaryAct;
    }

    await this.actor.update(updates);

    if (advancement.truth) {
      await this.actor.createEmbeddedDocuments("Item", [sparkTruthItem(advancement.truth, advancement.spark)]);
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: `
        <div class="ptg-chat-card">
          <h3>Spark Advancement</h3>
          <div>${escapeHTML(this.actor.name)} advanced from Spark ${currentSpark} to Spark ${advancement.spark}.</div>
          <div>Fragment Max: ${fragmentMax}</div>
          ${advancement.truth ? `<div>Free Truth: ${escapeHTML(advancement.truth)}</div>` : ""}
          ${advancement.legendaryAct ? `<div>Legendary Act: ${escapeHTML(advancement.legendaryAct)}</div>` : ""}
        </div>
      `
    });
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
      summary.weight += item.system.held !== false || item.system.equipped ? Number(item.system.weight ?? 0) * amount : 0;
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

    if (["favor", "lead", "follow-up", "devote", "split-attention", "delay", "lose"].includes(action)) {
      return this.actor.requestAttachmentAction(item, action);
    }

    if (action === "equip") {
      await item.update({ "system.equipped": !item.system.equipped });
      return;
    }

    if (action === "hold") {
      await item.update({ "system.held": item.system.held === false });
      return;
    }

    if (action === "strain-plus" || action === "strain-minus") {
      const delta = action === "strain-plus" ? 1 : -1;
      await this.actor.adjustAttachmentStrain(item, delta, "Attachment Strain Changed");
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
          const isOccupation = type === "occupation";

          return `
            <fieldset>
              <legend>Step ${index + 1}: ${escapeHTML(creatorTypeLabel(type))}</legend>
              <select name="${type}" ${isOccupation ? "data-occupation-select" : ""}>
                <option value="">${current ? `Keep ${escapeHTML(current)}` : `Choose ${escapeHTML(creatorTypeLabel(type))}`}</option>
                ${options.map(option => `<option value="${escapeHTML(option.uuid)}">${escapeHTML(option.name)}</option>`).join("")}
              </select>
              ${isOccupation ? `
                <label>Career / Subtype
                  <select name="occupationCareer" data-occupation-career disabled>
                    <option value="">Choose an Occupation first</option>
                    ${options.flatMap(option => creatorCareerOptions(option).map(careerOption => `
                      <option value="${escapeHTML(careerOption.value)}" data-parent-uuid="${escapeHTML(option.uuid)}" hidden>${escapeHTML(careerOption.label)}</option>
                    `)).join("")}
                  </select>
                </label>
                <div class="ptg-career-options" data-occupation-career-details hidden>
                  ${options.flatMap(option => creatorCareerOptions(option).map(careerOption => creatorCareerSummaryHTML(option, careerOption))).join("")}
                </div>
              ` : ""}
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
      window: {
        title: `${this.actor.name}: Character Creator`,
        resizable: true
      },
      classes: ["part-time-gods", "ptg-character-creator-window"],
      position: {
        width: 760,
        height: 720
      },
      content,
      rejectClose: false,
      modal: true,
      render: (event, dialog) => wireOccupationCareerSelector(dialog.element ?? dialog),
      ok: {
        label: "Apply Choices",
        callback: (event, button) => ({
          choices: Object.fromEntries(types.map(type => [type, button.form.elements[type]?.value ?? ""])),
          occupationCareer: button.form.elements.occupationCareer?.value ?? "",
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
    const selectedOccupation = choices.occupation.find(item => item.uuid === selections.choices.occupation);
    if (selectedOccupation && creatorCareerOptions(selectedOccupation).length && !selections.occupationCareer) {
      ui.notifications.warn("Choose an Occupation career/subtype before applying character creation choices.");
      return;
    }

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
      const applied = await this.actor.applyChoice(ownedItem, type === "occupation" ? {
        occupationCareerOption: selections.occupationCareer
      } : {});
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

function creatorCareerOptions(item) {
  const careers = Array.from(item.system?.careerOptions ?? []);
  return careers.flatMap((career, careerIndex) => {
    const attachments = Array.isArray(career.attachments) && career.attachments.length ? career.attachments : [null];
    return attachments.map((attachment, attachmentIndex) => ({
      value: `${careerIndex}:${attachmentIndex}`,
      label: `${item.name} - ${career.name}${attachment ? ` - ${creatorAttachmentLabel(attachment)}` : ""}`,
      parent: item.name,
      career,
      careerIndex,
      attachmentIndex,
      attachment
    }));
  });
}

function creatorAttachmentLabel(attachment) {
  return `Level ${attachment.level ?? 1} ${attachment.name} (${String(attachment.kind ?? "attachment").toUpperCase().slice(0, 1)})`;
}

function creatorCareerSummaryHTML(item, option) {
  const career = option.career;
  const blessing = career.blessing?.name ?? career.blessing ?? "";
  const curse = career.curse?.name ?? career.curse ?? "";
  return `
    <section class="ptg-career-option" data-parent-uuid="${escapeHTML(item.uuid)}" data-career-detail="${escapeHTML(option.value)}" hidden>
      <h3>${escapeHTML(item.name)} - ${escapeHTML(career.name)}</h3>
      <dl>
        <div><dt>Free Time</dt><dd>${Number(career.resources?.freeTime ?? 0)}</dd></div>
        <div><dt>Wealth</dt><dd>${Number(career.resources?.wealth ?? 0)}</dd></div>
      </dl>
      ${option.attachment ? `<p><strong>Attachment:</strong> ${escapeHTML(creatorAttachmentLabel(option.attachment))}</p>` : ""}
      ${blessing ? `<p><strong>Blessing:</strong> ${escapeHTML(blessing)}</p>` : ""}
      ${curse ? `<p><strong>Curse:</strong> ${escapeHTML(curse)}</p>` : ""}
    </section>
  `;
}

function wireOccupationCareerSelector(element) {
  const root = element instanceof HTMLElement ? element : element?.querySelector?.(".ptg-creator-dialog");
  const occupation = root?.querySelector?.("[data-occupation-select]");
  const career = root?.querySelector?.("[data-occupation-career]");
  const details = root?.querySelector?.("[data-occupation-career-details]");
  if (!occupation || !career) return;

  const refresh = () => {
    const parentUuid = occupation.value;
    let visible = 0;
    for (const option of career.querySelectorAll("option[data-parent-uuid]")) {
      const show = option.dataset.parentUuid === parentUuid;
      option.hidden = !show;
      if (show) visible += 1;
    }

    career.disabled = !visible;
    career.options[0].textContent = visible ? "Choose a career/subtype" : "Choose an Occupation first";
    if (!visible || career.selectedOptions[0]?.dataset.parentUuid !== parentUuid) career.value = "";
    if (details) details.hidden = !visible;
    refreshOccupationCareerDetails(root);
  };

  occupation.addEventListener("change", refresh);
  career.addEventListener("change", () => refreshOccupationCareerDetails(root));
  refresh();
}

function refreshOccupationCareerDetails(root) {
  const occupation = root.querySelector("[data-occupation-select]");
  const career = root.querySelector("[data-occupation-career]");
  const details = root.querySelector("[data-occupation-career-details]");
  if (!occupation || !career || !details) return;

  for (const section of details.querySelectorAll("[data-career-detail]")) {
    section.hidden = !(section.dataset.parentUuid === occupation.value && section.dataset.careerDetail === career.value);
  }
}

async function selectSkillComboRollOptions({ actor, primary, secondary, difficulty }) {
  const skillEntries = Object.entries(CONFIG.PTG.skills ?? {});
  const difficulties = Object.entries(CONFIG.PTG.difficulties ?? {});
  const skillOption = ([key, label]) => `<option value="${escapeHTML(key)}" data-rank="${Number(actor.system.skills?.[key] ?? 0)}">${escapeHTML(label)} (${Number(actor.system.skills?.[key] ?? 0)})</option>`;
  const difficultyOptions = difficulties
    .map(([key, value]) => `<option value="${Number(value)}" ${Number(value) === Number(difficulty) ? "selected" : ""}>${escapeHTML(CONFIG.PTG.difficulties[key] ? `${labelCase(key)} (${value})` : String(value))}</option>`)
    .join("");

  const content = `
    <div class="ptg-roll-dialog">
      <div class="form-group">
        <label>Primary Skill</label>
        <select name="primary">
          ${skillEntries.map(entry => skillOption(entry).replace(`value="${escapeHTML(primary)}"`, `value="${escapeHTML(primary)}" selected`)).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Secondary Skill</label>
        <select name="secondary">
          ${skillEntries.map(entry => skillOption(entry).replace(`value="${escapeHTML(secondary)}"`, `value="${escapeHTML(secondary)}" selected`)).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Difficulty</label>
        <select name="difficulty">${difficultyOptions}<option value="custom">Custom</option></select>
      </div>
      <div class="form-group">
        <label>Custom Difficulty</label>
        <input type="number" name="customDifficulty" value="${Number(difficulty)}" min="0">
      </div>
      <div class="form-group">
        <label>Check Mode</label>
        <select name="checkMode">
          <option value="standard">Standard</option>
          <option value="opposed">Opposed</option>
          <option value="extended">Extended</option>
        </select>
      </div>
      <div class="form-group">
        <label>Opposing Successes</label>
        <input type="number" name="opposingSuccesses" value="${Number(difficulty)}" min="0">
      </div>
      <div class="form-group">
        <label>Extended Target</label>
        <input type="number" name="extendedTarget" value="0" min="0">
      </div>
      <div class="form-group">
        <label>Current Progress</label>
        <input type="number" name="extendedCurrent" value="0" min="0">
      </div>
      <div class="form-group">
        <label>Bonus</label>
        <input type="number" name="bonus" value="0">
      </div>
      <div class="form-group">
        <label>Penalty</label>
        <input type="number" name="penalty" value="0">
      </div>
      <div class="form-group">
        <label>Pantheon Dice</label>
        <input type="number" name="pantheonDice" value="0" min="0">
      </div>
      <div class="form-group">
        <label>Specialty</label>
        <input type="text" name="specialtyName" value="" placeholder="Specialty name">
      </div>
      <div class="form-group">
        <label>Specialty Bonus</label>
        <input type="number" name="specialtyBonus" value="0" min="0">
      </div>
      <div class="form-group">
        <label>Tool Modifier</label>
        <input type="number" name="toolModifier" value="0">
      </div>
      <div class="form-group">
        <label>Support Bonus</label>
        <input type="number" name="supportBonus" value="0" min="0">
      </div>
      <div class="form-group">
        <label>Boost Choice</label>
        <input type="text" name="boostChoice" value="" placeholder="Optional planned Boost">
      </div>
      <p class="ptg-sheet-note" data-pool-preview>${skillPoolPreview(actor, primary, secondary, 0, 0)}</p>
    </div>
  `;

  return DialogV2.prompt({
    window: { title: "Skill Combo Check" },
    content,
    rejectClose: false,
    modal: true,
    render: (event, dialog) => wireSkillPoolPreview(dialog.element ?? dialog, actor),
    ok: {
      label: "Roll",
      callback: (event, button) => {
        const form = button.form;
        const difficultyValue = form.elements.difficulty?.value;
        const pantheonDice = Math.max(0, Number(form.elements.pantheonDice?.value ?? 0));
        const specialtyBonus = Math.max(0, Number(form.elements.specialtyBonus?.value ?? 0));
        const toolModifier = Number(form.elements.toolModifier?.value ?? 0);
        const supportBonus = Math.max(0, Number(form.elements.supportBonus?.value ?? 0));
        const specialtyName = form.elements.specialtyName?.value?.trim();
        const checkMode = form.elements.checkMode?.value ?? "standard";
        const baseDifficulty = difficultyValue === "custom"
          ? Number(form.elements.customDifficulty?.value ?? 0)
          : Number(difficultyValue ?? 0);
        const extendedTarget = Math.max(0, Number(form.elements.extendedTarget?.value ?? 0));

        return {
          primary: form.elements.primary?.value ?? primary,
          secondary: form.elements.secondary?.value ?? secondary,
          difficulty: checkMode === "opposed"
            ? Number(form.elements.opposingSuccesses?.value ?? 0)
            : baseDifficulty,
          bonus: Number(form.elements.bonus?.value ?? 0),
          penalty: Number(form.elements.penalty?.value ?? 0),
          pantheonDice,
          checkMode,
          extended: checkMode === "extended" && extendedTarget > 0 ? {
            target: extendedTarget,
            current: Math.max(0, Number(form.elements.extendedCurrent?.value ?? 0))
          } : null,
          boostChoice: form.elements.boostChoice?.value?.trim() ?? "",
          modifierDetails: {
            "Pantheon Dice": pantheonDice,
            [specialtyName ? `Specialty (${specialtyName})` : "Specialty"]: specialtyBonus,
            "Tool": toolModifier,
            "Support": supportBonus
          }
        };
      }
    }
  });
}

function wireSkillPoolPreview(element, actor) {
  const root = element instanceof HTMLElement ? element : element?.querySelector?.(".ptg-roll-dialog")?.closest("form");
  const form = root?.querySelector?.("form") ?? root;
  if (!form?.elements) return;

  const update = () => {
    const preview = form.querySelector("[data-pool-preview]");
    if (!preview) return;

    preview.textContent = skillPoolPreview(
      actor,
      form.elements.primary?.value,
      form.elements.secondary?.value,
      Number(form.elements.bonus?.value ?? 0),
      Number(form.elements.penalty?.value ?? 0),
      {
        pantheonDice: Number(form.elements.pantheonDice?.value ?? 0),
        specialtyBonus: Number(form.elements.specialtyBonus?.value ?? 0),
        toolModifier: Number(form.elements.toolModifier?.value ?? 0),
        supportBonus: Number(form.elements.supportBonus?.value ?? 0)
      }
    );
  };

  for (const name of ["primary", "secondary", "bonus", "penalty", "pantheonDice", "specialtyBonus", "toolModifier", "supportBonus"]) {
    form.elements[name]?.addEventListener("change", update);
    form.elements[name]?.addEventListener("input", update);
  }

  update();
}

function skillPoolPreview(actor, primary, secondary, bonus, penalty, extra = {}) {
  const primaryRank = Number(actor.system.skills?.[primary] ?? 0);
  const secondaryRank = Number(actor.system.skills?.[secondary] ?? 0);
  const basePool = primaryRank + secondaryRank;
  const extraTotal = Number(extra.pantheonDice ?? 0)
    + Number(extra.specialtyBonus ?? 0)
    + Number(extra.toolModifier ?? 0)
    + Number(extra.supportBonus ?? 0);
  const finalPool = basePool + Number(bonus ?? 0) - Number(penalty ?? 0) + extraTotal;
  const fate = finalPool <= 0 ? " Fate Die" : "";

  return `Pool: ${primaryRank} + ${secondaryRank} + ${Number(bonus ?? 0)} - ${Number(penalty ?? 0)} + ${extraTotal} = ${finalPool}${fate}`;
}

async function selectManifestationRollOptions({ actor, manifestation, skill, difficulty }) {
  const manifestationEntries = Object.entries(CONFIG.PTG.manifestations ?? {});
  const skillEntries = Object.entries(CONFIG.PTG.skills ?? {});
  const difficulties = Object.entries(CONFIG.PTG.difficulties ?? {});
  const manifestationOption = ([key, label]) => `<option value="${escapeHTML(key)}" data-rank="${Number(actor.system.manifestations?.[key] ?? 0)}" ${key === manifestation ? "selected" : ""}>${escapeHTML(label)} (${Number(actor.system.manifestations?.[key] ?? 0)})</option>`;
  const skillOption = ([key, label]) => `<option value="${escapeHTML(key)}" data-rank="${Number(actor.system.skills?.[key] ?? 0)}" ${key === skill ? "selected" : ""}>${escapeHTML(label)} (${Number(actor.system.skills?.[key] ?? 0)})</option>`;
  const difficultyOptions = difficulties
    .map(([key, value]) => `<option value="${Number(value)}" ${Number(value) === Number(difficulty) ? "selected" : ""}>${escapeHTML(`${labelCase(key)} (${value})`)}</option>`)
    .join("");

  const content = `
    <div class="ptg-roll-dialog">
      <div class="form-group">
        <label>Manifestation</label>
        <select name="manifestation">${manifestationEntries.map(manifestationOption).join("")}</select>
      </div>
      <div class="form-group">
        <label>Skill</label>
        <select name="skill">${skillEntries.map(skillOption).join("")}</select>
      </div>
      <div class="form-group">
        <label>Difficulty</label>
        <select name="difficulty">${difficultyOptions}<option value="custom">Custom</option></select>
      </div>
      <div class="form-group">
        <label>Custom Difficulty</label>
        <input type="number" name="customDifficulty" value="${Number(difficulty)}" min="0">
      </div>
      <div class="form-group">
        <label>Bonus</label>
        <input type="number" name="bonus" value="0">
      </div>
      <div class="form-group">
        <label>Penalty</label>
        <input type="number" name="penalty" value="0">
      </div>
      <div class="form-group">
        <label>Pantheon Dice</label>
        <input type="number" name="pantheonDice" value="0" min="0">
      </div>
      <div class="form-group">
        <label>Dominion Fit</label>
        <select name="dominionFit">
          <option value="0">Neutral or GM Set (+0)</option>
          <option value="1">Strongly within Dominion (+1)</option>
          <option value="-1">Weak or indirect Dominion (-1)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Measure Focus</label>
        <select name="measure">
          ${Object.entries(CONFIG.PTG.measureOptions ?? {}).map(([key, label]) => `<option value="${escapeHTML(key)}">${escapeHTML(label)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Measure Notes</label>
        <input type="text" name="measureNotes" value="" placeholder="Damage, range, duration, scale, etc.">
      </div>
      <div class="form-group">
        <label>Boost Choice</label>
        <input type="text" name="boostChoice" value="" placeholder="Optional planned Boost">
      </div>
      <label class="ptg-checkbox">
        <input type="checkbox" name="resistanceEnabled">
        <span>Roll Resistance</span>
      </label>
      <div class="form-group">
        <label>Resistance Primary Skill</label>
        <select name="resistancePrimary">${skillEntries.map(skillOption).join("")}</select>
      </div>
      <div class="form-group">
        <label>Resistance Secondary Skill</label>
        <select name="resistanceSecondary">${skillEntries.map(skillOption).join("")}</select>
      </div>
      <div class="form-group">
        <label>Resistance Bonus</label>
        <input type="number" name="resistanceBonus" value="0">
      </div>
      <div class="form-group">
        <label>Resistance Penalty</label>
        <input type="number" name="resistancePenalty" value="0">
      </div>
      <div class="form-group">
        <label>Ritual Context</label>
        <select name="ritualKind">
          <option value="none">None</option>
          <option value="territory">Territory Ritual</option>
          <option value="spark">Spark Ritual</option>
          <option value="otherworldly">Otherworldly Ritual</option>
        </select>
      </div>
      <div class="form-group">
        <label>Ritual Cost / Requirement</label>
        <input type="text" name="ritualRequirement" value="" placeholder="Participants, time, Spark, or scene cost">
      </div>
      <p class="ptg-sheet-note" data-pool-preview>${manifestationPoolPreview(actor, manifestation, skill, 0, 0)}</p>
    </div>
  `;

  return DialogV2.prompt({
    window: { title: "Manifestation Check" },
    content,
    rejectClose: false,
    modal: true,
    render: (event, dialog) => wireManifestationPoolPreview(dialog.element ?? dialog, actor),
    ok: {
      label: "Roll",
      callback: (event, button) => {
        const form = button.form;
        const difficultyValue = form.elements.difficulty?.value;
        const pantheonDice = Math.max(0, Number(form.elements.pantheonDice?.value ?? 0));
        const dominionFit = Number(form.elements.dominionFit?.value ?? 0);
        const resistanceBonus = Number(form.elements.resistanceBonus?.value ?? 0);
        const resistancePenalty = Number(form.elements.resistancePenalty?.value ?? 0);

        return {
          manifestation: form.elements.manifestation?.value ?? manifestation,
          skill: form.elements.skill?.value ?? skill,
          difficulty: difficultyValue === "custom"
            ? Number(form.elements.customDifficulty?.value ?? 0)
            : Number(difficultyValue ?? 0),
          bonus: Number(form.elements.bonus?.value ?? 0),
          penalty: Number(form.elements.penalty?.value ?? 0),
          pantheonDice,
          dominionFit,
          measure: form.elements.measure?.value ?? "detail",
          measureNotes: form.elements.measureNotes?.value?.trim() ?? "",
          boostChoice: form.elements.boostChoice?.value?.trim() ?? "",
          modifierDetails: {
            "Pantheon Dice": pantheonDice,
            "Dominion Fit": dominionFit
          },
          resistance: {
            enabled: Boolean(form.elements.resistanceEnabled?.checked),
            primary: form.elements.resistancePrimary?.value ?? "discipline",
            secondary: form.elements.resistanceSecondary?.value ?? "intuition",
            modifierDetails: {
              "Resistance Bonus": resistanceBonus,
              "Resistance Penalty": -resistancePenalty
            }
          },
          ritual: {
            kind: form.elements.ritualKind?.value ?? "none",
            requirement: form.elements.ritualRequirement?.value?.trim() ?? ""
          }
        };
      }
    }
  });
}

function wireManifestationPoolPreview(element, actor) {
  const root = element instanceof HTMLElement ? element : element?.querySelector?.(".ptg-roll-dialog")?.closest("form");
  const form = root?.querySelector?.("form") ?? root;
  if (!form?.elements) return;

  const update = () => {
    const preview = form.querySelector("[data-pool-preview]");
    if (!preview) return;

    preview.textContent = manifestationPoolPreview(
      actor,
      form.elements.manifestation?.value,
      form.elements.skill?.value,
      Number(form.elements.bonus?.value ?? 0),
      Number(form.elements.penalty?.value ?? 0),
      {
        pantheonDice: Number(form.elements.pantheonDice?.value ?? 0),
        dominionFit: Number(form.elements.dominionFit?.value ?? 0)
      }
    );
  };

  for (const name of ["manifestation", "skill", "bonus", "penalty", "pantheonDice", "dominionFit"]) {
    form.elements[name]?.addEventListener("change", update);
    form.elements[name]?.addEventListener("input", update);
  }

  update();
}

function manifestationPoolPreview(actor, manifestation, skill, bonus, penalty, extra = {}) {
  const manifestationRank = Number(actor.system.manifestations?.[manifestation] ?? 0);
  const skillRank = Number(actor.system.skills?.[skill] ?? 0);
  const extraTotal = Number(extra.pantheonDice ?? 0) + Number(extra.dominionFit ?? 0);
  const finalPool = manifestationRank + skillRank + Number(bonus ?? 0) - Number(penalty ?? 0) + extraTotal;
  const fate = finalPool <= 0 ? " Fate Die" : "";

  return `Pool: ${manifestationRank} + ${skillRank} + ${Number(bonus ?? 0)} - ${Number(penalty ?? 0)} + ${extraTotal} = ${finalPool}${fate}`;
}

function sparkTruthItem(name, spark) {
  return {
    name,
    type: "truth",
    img: "icons/magic/symbols/runes-star-pentagon-blue.webp",
    system: {
      statement: name,
      rank: 1,
      cost: 0,
      fragmentCost: 0,
      activation: "passive",
      effect: `<p>Free Truth gained at Spark ${Number(spark ?? 1)} advancement.</p>`,
      notes: "<p>Created by Spark advancement.</p>",
      rules: {
        summary: `Free Truth gained at Spark ${Number(spark ?? 1)} advancement.`,
        fullText: `<p>Free Truth gained at Spark ${Number(spark ?? 1)} advancement.</p>`,
        source: {
          book: "Part-Time Gods Second Edition",
          page: null,
          section: "Spark Advancement",
          type: "truth"
        }
      },
      usage: {
        kind: "passive",
        trigger: "",
        target: "self",
        cost: {
          freeTime: 0,
          wealth: 0,
          pantheonDice: 0,
          fragments: 0,
          health: 0,
          psyche: 0,
          strain: 0
        }
      },
      automation: {
        enabled: false,
        action: "",
        bonus: null,
        penalty: null,
        roll: null,
        healing: null,
        damage: null,
        condition: null,
        resourceChange: null,
        chatCard: true
      }
    }
  };
}

async function postManifestationMeasureSummary(actor, outcome, selection) {
  if (!outcome?.passed || Number(outcome.successes ?? 0) <= 0) return;

  const measureLabel = CONFIG.PTG.measureOptions?.[selection.measure] ?? selection.measure ?? "Effect Detail";
  const options = Object.entries(CONFIG.PTG.measureOptions ?? {})
    .map(([, label]) => `<li>${escapeHTML(label)}</li>`)
    .join("");

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="ptg-chat-card">
        <h3>${escapeHTML(CONFIG.PTG.manifestations[selection.manifestation] ?? selection.manifestation)} Measures</h3>
        <div>Successes Available: ${Number(outcome.successes ?? 0)}</div>
        <div>Difficulty Margin: ${Number(outcome.margin ?? 0)}</div>
        <div>Selected Focus: ${escapeHTML(measureLabel)}</div>
        ${selection.measureNotes ? `<div>Notes: ${escapeHTML(selection.measureNotes)}</div>` : ""}
        ${selection.boostChoice ? `<div>Planned Boost: ${escapeHTML(selection.boostChoice)}</div>` : ""}
        <div>Common Measure Categories</div>
        <ul>${options}</ul>
        <div>Spend successes on effect Measures such as damage, range, targets, duration, scale, or narrative detail. Any resistance roll should be compared against this Manifestation's successes.</div>
      </div>
    `
  });
}

async function postManifestationBacklashSummary(actor, selection) {
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="ptg-chat-card">
        <h3>${escapeHTML(CONFIG.PTG.manifestations[selection.manifestation] ?? selection.manifestation)} Backlash</h3>
        <div>The Manifestation critically failed. Apply Backlash according to the power, scene stakes, and GM ruling.</div>
        <div>Common results include unintended divine effects, Conditions, collateral damage, Attachment Strain, lost time, resistance complications, or consequences tied to the Dominion.</div>
        ${selection.ritual.kind !== "none" ? `<div>Ritual Context: ${escapeHTML(ritualLabel(selection.ritual.kind))}${selection.ritual.requirement ? `; ${escapeHTML(selection.ritual.requirement)}` : ""}</div>` : ""}
      </div>
    `
  });
}

async function postManifestationRitualSummary(actor, selection) {
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="ptg-chat-card">
        <h3>${escapeHTML(ritualLabel(selection.ritual.kind))}</h3>
        <div>${escapeHTML(actor.name)} is resolving ${escapeHTML(CONFIG.PTG.manifestations[selection.manifestation] ?? selection.manifestation)} as a ritual.</div>
        ${selection.ritual.requirement ? `<div>Requirement: ${escapeHTML(selection.ritual.requirement)}</div>` : ""}
        <div>Track participants, time, costs, rolls, resistance, and final GM ruling here. Territory, Spark, and Otherworldly rituals may require scene-specific setup beyond the roll.</div>
      </div>
    `
  });
}

function ritualLabel(kind) {
  return {
    territory: "Territory Ritual",
    spark: "Spark Ritual",
    otherworldly: "Otherworldly Ritual"
  }[kind] ?? "Ritual";
}

function labelCase(key) {
  return String(key ?? "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, char => char.toUpperCase());
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
