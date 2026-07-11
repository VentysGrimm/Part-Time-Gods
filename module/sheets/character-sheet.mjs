import { conditionItemFromSelection, loadPremadeConditions } from "../conditions/condition-workflow.mjs";
import { getDragEventData, itemFromDropData } from "../util/drop-data.mjs";
import { localizeFallback } from "../util/localization.mjs";
import { openPantheonPoolDialog, pantheonPoolMax, pantheonPoolOptions, spendPantheonDiceForActor } from "../workflows/pantheon-pool-workflow.mjs";
import { generateRandomGod } from "../util/random-god-generator.mjs";
import { isSheetEditLocked, mergeSheetEditLockContext, wireSheetEditLock } from "./sheet-edit-lock.mjs";

const SYSTEM_ID = "part-time-gods";
const PTG_DIALOG_CLASSES = ["part-time-gods", "ptg-sheet-dialog"];
const { ActorSheetV2 } = foundry.applications.sheets;
const { DialogV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class PTGCharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  #activeTab = "front";
  #expandedItemDetails = new Set();
  #tabScrollPositions = new Map();

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
    if (isSheetEditLocked(this, this.actor)) return false;
    const data = formData?.object ?? {};
    return this.actor.update(data);
  }

  async _prepareContext(options) {
    const context = mergeSheetEditLockContext(await super._prepareContext(options), this, this.actor);

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
    context.choiceDetails = this.actor.getFlag("part-time-gods", "choiceDetails") ?? {};
    const resourceTracks = this.#prepareResourceTracks();
    context.resourceTracks = resourceTracks;
    context.frontResourceTracks = resourceTracks.filter(track => track.key !== "fragments");
    context.fragmentResourceTrack = resourceTracks.find(track => track.key === "fragments");
    context.downtimeResourceTracks = this.#prepareDowntimeResourceTracks();
    context.gearSummary = this.#prepareGearSummary(context.inventory.gear);
    context.pantheonMembership = this.#preparePantheonMembership();
    context.xpPurchases = xpPurchaseHistoryWithLegacy(context.system.resources);
    context.xpSpent = xpSpentFromPurchases(context.xpPurchases);
    context.xpUnspent = Math.max(0, Number(context.system.resources?.xpGained ?? 0) - context.xpSpent);
    context.skillColumns = this.#prepareSkillColumns();
    context.manifestationColumns = this.#prepareManifestationColumns();
    context.itemTypeLabels = Object.fromEntries(
      Object.keys(CONFIG.Item.dataModels ?? {}).map(type => [type, game.i18n.localize(`TYPES.Item.${type}`)])
    );

    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    wireSheetEditLock(this, this.element, this.actor);

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
    for (const button of this.element.querySelectorAll("[data-item-create]")) {
      button.addEventListener("click", event => this.#createOwnedItem(event.currentTarget.dataset.itemCreate));
    }
    for (const row of this.element.querySelectorAll("[data-item-id]")) {
      row.setAttribute("draggable", "true");
      row.addEventListener("dragstart", event => this.#onItemDragStart(event));
    }

    for (const button of this.element.querySelectorAll("[data-ritual-action]")) {
      button.addEventListener("click", event => this.#openRitualDialog(event.currentTarget.dataset.ritualAction));
    }

    this.element.querySelector("[data-advancement-purchase]")?.addEventListener("click", () => this.#openAdvancementPurchase());
    this.element.querySelector("[data-xp-award]")?.addEventListener("click", () => this.#openXPAward());
    this.element.querySelector("[data-spark-advancement]")?.addEventListener("click", () => this.#openSparkAdvancement());
    for (const button of this.element.querySelectorAll("[data-resource-workflow]")) {
      button.addEventListener("click", event => this.#openResourceWorkflow(event.currentTarget.dataset.resourceWorkflow));
    }
    this.element.querySelector("[data-condition-create]")?.addEventListener("click", () => this.#openConditionCreateDialog());
    for (const button of this.element.querySelectorAll("[data-resource-box]")) {
      button.addEventListener("click", event => this.#onResourceBox(event));
      button.addEventListener("contextmenu", event => this.#onResourceBox(event));
    }
    for (const button of this.element.querySelectorAll("[data-resource-step]")) {
      button.addEventListener("click", event => this.#onResourceStep(event.currentTarget));
    }
    for (const button of this.element.querySelectorAll("[data-flat-resource-box]")) {
      button.addEventListener("click", event => this.#onFlatResourceBox(event));
      button.addEventListener("contextmenu", event => this.#onFlatResourceBox(event));
    }
    for (const button of this.element.querySelectorAll("[data-flat-resource-step]")) {
      button.addEventListener("click", event => this.#onFlatResourceStep(event.currentTarget));
    }
    this.element.querySelector("[data-mortality-workflow]")?.addEventListener("click", () => this.#openMortalityWorkflow());
    for (const button of this.element.querySelectorAll("[data-pantheon-pool-workflow]")) {
      button.addEventListener("click", event => this.#openPantheonPoolWorkflow(event.currentTarget));
    }

    this.element.querySelector("[data-character-creator]")?.addEventListener("click", () => this.#openCharacterCreator());
    this.#activateTab(this.#activeTab, { restoreScroll: true });
  }

  async _onDrop(event) {
    if (isSheetEditLocked(this, this.actor)) {
      ui.notifications.warn("Unlock this sheet before dropping Items onto it.");
      return false;
    }

    const data = getDragEventData(event);
    const item = await itemFromDropData(data);
    const sectionType = event.target.closest("[data-item-drop-type]")?.dataset.itemDropType ?? "";

    if (!item) return false;
    if (item.type === "attachment") return this.#createAttachmentOfChoiceFromDrop(item);

    if (sectionType && item.type !== sectionType) {
      ui.notifications.warn(`Drop a ${itemTypeLabel(sectionType)} item in this section.`);
      return false;
    }

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

  async #createAttachmentOfChoiceFromDrop(sourceItem) {
    if (this.actor.type !== "character") {
      ui.notifications.warn("Drop Attachment of Choice Items onto a character Actor sheet.");
      return false;
    }

    const selection = await promptAttachmentOfChoice(sourceItem);
    if (!selection) return false;

    const itemData = attachmentOfChoiceItemData(sourceItem, selection);
    await this.actor.createEmbeddedDocuments("Item", [itemData]);
    this.render(false);
    return false;
  }

  #onItemDragStart(event) {
    const item = this.actor.items.get(event.currentTarget.dataset.itemId);
    if (!item) return;

    event.dataTransfer.setData("text/plain", JSON.stringify(item.toDragData()));
    event.dataTransfer.effectAllowed = "copyMove";
  }

  #activateTab(tabName, { restoreScroll = true } = {}) {
    const currentPanel = this.element.querySelector(`[data-ptg-panel="${this.#activeTab}"]`);
    if (currentPanel) this.#tabScrollPositions.set(this.#activeTab, currentPanel.scrollTop);
    this.#activeTab = tabName;

    for (const tab of this.element.querySelectorAll("[data-ptg-tab]")) {
      tab.classList.toggle("active", tab.dataset.ptgTab === tabName);
    }

    let activePanel = null;
    for (const panel of this.element.querySelectorAll("[data-ptg-panel]")) {
      panel.hidden = panel.dataset.ptgPanel !== tabName;
      panel.classList.toggle("active", panel.dataset.ptgPanel === tabName);
      if (panel.dataset.ptgPanel === tabName) activePanel = panel;
    }

    if (activePanel && restoreScroll) activePanel.scrollTop = this.#tabScrollPositions.get(tabName) ?? 0;
  }

  async #rollSkill(button) {
    const primary = button.dataset.rollSkill;
    const secondary = primary;
    const selection = await selectSkillComboRollOptions({
      actor: this.actor,
      primary,
      secondary,
      difficulty: 1,
      repetition: skillRepetitionState(this.actor, primary, secondary)
    });

    if (!selection) return;

    if (selection.pantheonDice > 0) {
      const spent = await spendPantheonDiceForActor(this.actor, selection.pantheonDice, {
        pantheonUuid: selection.pantheonUuid,
        reason: "Skill Combo Check",
        notes: skillComboLabel(selection.primary, selection.secondary),
        permissionConfirmed: true
      });
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

    await recordSkillRepetition(this.actor, selection.primary, selection.secondary, selection.checkMode);
  }

  async #rollManifestation(button) {
    const manifestation = button.dataset.rollManifestation;
    const selection = await selectManifestationRollOptions({
      actor: this.actor,
      manifestation,
      skill: "discipline",
      difficulty: 1
    });

    if (!selection) return;

    if (selection.pantheonDice > 0) {
      const spent = await spendPantheonDiceForActor(this.actor, selection.pantheonDice, {
        pantheonUuid: selection.pantheonUuid,
        reason: "Manifestation Check",
        notes: `${manifestationLabel(selection.manifestation)} + ${skillLabel(selection.skill)}`,
        permissionConfirmed: true
      });
      if (!spent) return;
    }

    if (selection.fragments > 0) {
      const spent = await this.actor.spendResource("fragments", selection.fragments);
      if (!spent) return;
    }

    const outcome = await this.actor.rollManifestation(selection.manifestation, selection.skill, {
      difficulty: selection.difficulty,
      bonus: selection.bonus,
      penalty: selection.penalty,
      modifierDetails: selection.modifierDetails,
      checkMode: "manifestation",
      boostChoice: selection.boostChoice,
      reason: "Manifestation roll"
    });

    if (outcome.criticalFailure) {
      await postManifestationBacklashSummary(this.actor, selection);
    } else if (outcome.passed) {
      const measures = await selectManifestationMeasureSpending(outcome, selection);
      if (measures === false) return;
      await postManifestationMeasureSummary(this.actor, outcome, selection, measures);
    }

    if (selection.resistance.enabled) {
      const resistor = Array.from(game.user?.targets ?? [])
        .map(token => token.actor)
        .find(actor => actor?.rollSkillCombo) ?? this.actor;

      const resistanceOutcome = await resistor.rollSkillCombo(selection.resistance.primary, selection.resistance.secondary, {
        difficulty: outcome.successes,
        modifierDetails: selection.resistance.modifierDetails,
        checkMode: "opposed",
        flavor: `${resistor.name}: Resist ${CONFIG.PTG.manifestations[selection.manifestation] ?? selection.manifestation}`
      });
      await postManifestationResistanceSummary(this.actor, resistor, outcome, resistanceOutcome, selection);
    }

    if (selection.ritual.kind !== "none") await postManifestationRitualSummary(this.actor, selection);
  }

  async #openRitualDialog(kind) {
    const label = ritualLabel(kind);
    const selection = await selectRitualRollOptions({
      actor: this.actor,
      kind,
      primary: "discipline",
      secondary: "intuition",
      difficulty: 1
    });

    if (!selection) return;

    if (!selection.primary || !selection.secondary) {
      ui.notifications.warn("Choose the required ritual skills before rolling.");
      return;
    }

    if (!Number.isFinite(selection.difficulty) || selection.difficulty < 0) {
      ui.notifications.warn("Choose a valid ritual difficulty before rolling.");
      return;
    }

    if (selection.pantheonDice > 0) {
      const spent = await spendPantheonDiceForActor(this.actor, selection.pantheonDice, {
        pantheonUuid: selection.pantheonUuid,
        reason: `${label} Ritual`,
        notes: skillComboLabel(selection.primary, selection.secondary),
        permissionConfirmed: true
      });
      if (!spent) return;
    }

    await this.actor.rollSkillCombo(selection.primary, selection.secondary, {
      difficulty: selection.difficulty,
      bonus: selection.bonus,
      penalty: selection.penalty,
      modifierDetails: selection.modifierDetails,
      checkMode: "ritual",
      boostChoice: selection.boostChoice,
      flavor: `${this.actor.name}: ${label}`
    });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: `
        <div class="ptg-chat-card">
          <h3>${escapeHTML(label)}</h3>
          <div>${escapeHTML(this.actor.name)} resolves a ritual with ${escapeHTML(skillComboLabel(selection.primary, selection.secondary))} against difficulty ${Number(selection.difficulty)}.</div>
          ${selection.requirement ? `<div>Requirement: ${escapeHTML(selection.requirement)}</div>` : ""}
          ${selection.notes ? `<div>Notes: ${escapeHTML(selection.notes)}</div>` : ""}
          <div>Track participants, time, costs, scene effects, resistance, and final GM ruling here.</div>
        </div>
      `
    });
  }

  async #openAdvancementPurchase() {
    const resources = this.actor.system.resources ?? {};
    const xpGained = Number(resources.xpGained ?? 0);
    const existingPurchases = xpPurchaseHistoryWithLegacy(resources);
    const xpSpent = xpSpentFromPurchases(existingPurchases);
    const xpAvailable = Math.max(0, xpGained - xpSpent);

    const content = `
      <div class="ptg-dialog-body ptg-advancement-dialog ptg-xp-dialog ptg-spend-xp-body">
        <div class="ptg-xp-summary">
          <span>Total XP: ${xpGained}</span>
          <span>Spent XP: ${xpSpent}</span>
          <strong>Available XP: ${xpAvailable}</strong>
        </div>
        <p class="ptg-sheet-note">Costs use the PTG2E Experience Spending Chart on book pp. 130 and 135.</p>
        ${buildXpPurchaseRows(this.actor)}
        <div class="form-group">
          <label>Source / Downtime Note</label>
          <textarea name="sourceNote" rows="3" placeholder="Optional story, downtime, training, or GM audit note"></textarea>
        </div>
      </div>
    `;

    const purchase = await DialogV2.prompt({
      window: { title: `${this.actor.name}: Spend XP`, resizable: true },
      classes: ptgDialogClasses("ptg-spend-xp-dialog"),
      content,
      rejectClose: false,
      modal: true,
      ok: {
        label: "Spend XP",
        callback: (event, button) => collectXpPurchases(button.form, this.actor)
      }
    });

    if (!purchase?.length) return;

    const validation = validateXpPurchases(this.actor, purchase, xpAvailable);
    if (!validation.valid) {
      ui.notifications.warn(validation.message);
      return;
    }

    for (const entry of purchase) {
      await this.#applyAdvancementPurchase(entry);
      await this.#recordAdvancementLog("purchase", {
        ...entry,
        remainingXP: xpAvailable - xpSpentFromPurchases(purchase.filter(item => item.order <= entry.order))
      });
    }

    const nextPurchases = [
      ...existingPurchases,
      ...purchase.map(entry => ({
        id: entry.id,
        type: entry.type,
        category: entry.category,
        label: entry.label,
        targetId: entry.itemId || entry.targetKey || "",
        targetName: entry.name,
        targetLevel: entry.targetLevel,
        cost: entry.cost,
        source: entry.sourceNote,
        createdAt: entry.createdAt
      }))
    ];
    const nextSpent = xpSpentFromPurchases(nextPurchases);

    await this.actor.update({
      "system.resources.xpPurchases": nextPurchases,
      "system.resources.xpSpent": nextSpent
    });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: `
        <div class="ptg-chat-card">
          <h3>Advancement Purchase</h3>
          <div>${escapeHTML(this.actor.name)} spent ${xpSpentFromPurchases(purchase)} XP.</div>
          <ul>${purchase.map(entry => `<li>${escapeHTML(entry.label)}: ${escapeHTML(entry.name)} (${entry.cost} XP)</li>`).join("")}</ul>
          <div>XP Spent Total: ${nextSpent}</div>
          <div>Remaining XP: ${Math.max(0, xpGained - nextSpent)}</div>
          ${purchase[0]?.sourceNote ? `<div>Source: ${escapeHTML(purchase[0].sourceNote)}</div>` : ""}
        </div>
      `
    });
  }

  async #openXPAward() {
    const resources = this.actor.system.resources ?? {};
    const xpGained = Number(resources.xpGained ?? 0);
    const content = `
      <div class="ptg-dialog-body ptg-advancement-dialog ptg-award-xp-body">
        <p class="ptg-sheet-note">After a Session usually awards about 3-5 XP. After a Story usually adds 1-5 XP.</p>
        <div class="form-group">
          <label>Award Type</label>
          <select name="kind">
            <option value="session">After a Session</option>
            <option value="story">After a Story</option>
            <option value="custom">Custom Award</option>
          </select>
        </div>
        <div class="form-group">
          <label>XP Awarded</label>
          <input type="number" name="amount" value="4" min="0">
        </div>
        <div class="form-group">
          <label>Reason</label>
          <textarea name="reason" rows="4" placeholder="Showing up, Bond Scenes, Curses, Spotlight, Teamwork, memorable moment, lesson learned, story objective, or custom award"></textarea>
        </div>
      </div>
    `;

    const award = await DialogV2.prompt({
      window: { title: `${this.actor.name}: Award XP` },
      classes: ptgDialogClasses("ptg-award-xp-dialog"),
      content,
      rejectClose: false,
      modal: true,
      ok: {
        label: "Award XP",
        callback: (event, button) => ({
          kind: button.form.elements.kind?.value ?? "session",
          amount: Math.max(0, Number(button.form.elements.amount?.value ?? 0)),
          reason: button.form.elements.reason?.value?.trim() ?? ""
        })
      }
    });

    if (!award || award.amount <= 0) return;

    await this.actor.update({
      "system.resources.xpGained": xpGained + award.amount
    });

    await this.#recordAdvancementLog("award", {
      ...award,
      previousXP: xpGained,
      nextXP: xpGained + award.amount
    });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: `
        <div class="ptg-chat-card">
          <h3>XP Award</h3>
          <div>${escapeHTML(this.actor.name)} gains ${award.amount} XP (${escapeHTML(award.kind === "story" ? "After a Story" : award.kind === "session" ? "After a Session" : "Custom Award")}).</div>
          <div>Total XP Gained: ${xpGained + award.amount}</div>
          ${award.reason ? `<div>Reason: ${escapeHTML(award.reason)}</div>` : ""}
        </div>
      `
    });
  }

  async #openResourceWorkflow(defaultMode = "freeTime") {
    const resources = this.actor.system.resources ?? {};
    const defaultAction = defaultMode === "work" ? "goingToWork" : "spend";
    const defaultFreeTime = defaultMode === "work"
      ? Number(resources.occupationFreeTime ?? 0)
      : defaultMode === "wealth" ? 0 : 1;
    const defaultWealth = defaultMode === "work"
      ? Number(resources.occupationWealth ?? 0)
      : defaultMode === "wealth" ? 1 : 0;
    const content = `
      <div class="ptg-dialog-body ptg-advancement-dialog ptg-resource-workflow-body">
        <div class="form-group">
          <label>Action</label>
          <select name="action">
            <option value="spend" ${defaultAction === "spend" ? "selected" : ""}>Spend</option>
            <option value="restore">Restore</option>
            <option value="adjust">Adjust</option>
            <option value="scene">Scene Passage</option>
            <option value="goingToWork" ${defaultAction === "goingToWork" ? "selected" : ""}>Going to Work</option>
          </select>
        </div>
        <div class="ptg-item-fields two">
          <label>
            <span>Free Time</span>
            <input type="number" name="freeTime" value="${defaultFreeTime}" min="0">
          </label>
          <label>
            <span>Wealth</span>
            <input type="number" name="wealth" value="${defaultWealth}" min="0">
          </label>
        </div>
        <div class="ptg-item-fields two">
          <label>
            <span>Occupation Free Time</span>
            <input type="number" value="${Number(resources.occupationFreeTime ?? 0)}" readonly>
          </label>
          <label>
            <span>Occupation Wealth</span>
            <input type="number" value="${Number(resources.occupationWealth ?? 0)}" readonly>
          </label>
        </div>
        <div class="form-group">
          <label>Reason</label>
          <input type="text" name="reason" value="${defaultAction === "goingToWork" ? "Going to Work" : ""}" placeholder="Travel, upkeep, scene passage, work, GM adjustment">
        </div>
        <div class="form-group">
          <label>Notes</label>
          <textarea name="notes" rows="4" placeholder="GM override, work scene, session note, or ruling"></textarea>
        </div>
        <label class="ptg-checkbox">
          <input type="checkbox" name="allowNegative">
          <span>Allow negative values as a GM override</span>
        </label>
        <label class="ptg-checkbox">
          <input type="checkbox" name="allowExceedMax">
          <span>Allow Going to Work to exceed current max values</span>
        </label>
      </div>
    `;

    const selection = await DialogV2.prompt({
      window: { title: `${this.actor.name}: Free Time and Wealth` },
      content,
      rejectClose: false,
      modal: true,
      ok: {
        label: "Apply",
        callback: (event, button) => ({
          action: button.form.elements.action?.value ?? "spend",
          freeTime: Math.max(0, Number(button.form.elements.freeTime?.value ?? 0)),
          wealth: Math.max(0, Number(button.form.elements.wealth?.value ?? 0)),
          reason: button.form.elements.reason?.value?.trim() ?? "",
          notes: button.form.elements.notes?.value?.trim() ?? "",
          allowNegative: Boolean(button.form.elements.allowNegative?.checked),
          allowExceedMax: Boolean(button.form.elements.allowExceedMax?.checked)
        })
      }
    });

    if (!selection) return;

    if (selection.action === "goingToWork") {
      await this.actor.goToWork({
        freeTimeGain: selection.freeTime,
        wealthGain: selection.wealth,
        notes: selection.notes,
        allowExceedMax: selection.allowExceedMax
      });
      return;
    }

    const multiplier = ["spend", "scene"].includes(selection.action) ? -1 : 1;
    const reason = selection.reason || resourceWorkflowDefaultReason(selection.action);

    await this.actor.adjustDowntimeResources({
      action: selection.action,
      freeTimeDelta: selection.action === "scene" && selection.freeTime === 0 ? -1 : selection.freeTime * multiplier,
      wealthDelta: selection.wealth * multiplier,
      reason,
      notes: selection.notes,
      allowNegative: selection.allowNegative,
      capAtMax: selection.action === "restore"
    });
  }

  async #openMortalityWorkflow() {
    const resources = this.actor.system.resources ?? {};
    const mortality = this.actor.system.mortality ?? {};
    const actorOptions = game.actors
      .filter(actor => actor.type === "character" && actor.uuid !== this.actor.uuid)
      .map(actor => `<option value="${escapeHTML(actor.uuid)}">${escapeHTML(actor.name)}</option>`)
      .join("");
    const content = `
      <div class="ptg-dialog-body ptg-advancement-dialog ptg-spark-advancement-body">
        <div class="form-group">
          <label>Workflow</label>
          <select name="action">
            <option value="dead">Mark Dead</option>
            <option value="ghost">Mark Ghost</option>
            <option value="reconstituting">Start Reconstitution</option>
            <option value="reconstitute">Resolve Reconstitution</option>
            <option value="fragmentLoss">Permanent Fragment Loss</option>
            <option value="devour">Devour Divine Essence</option>
          </select>
        </div>
        <div class="ptg-item-fields two">
          <label>
            <span>State</span>
            <select name="state">
              <option value="">Default for workflow</option>
              <option value="alive" ${mortality.state === "alive" ? "selected" : ""}>Alive</option>
              <option value="dead" ${mortality.state === "dead" ? "selected" : ""}>Dead</option>
              <option value="ghost" ${mortality.state === "ghost" ? "selected" : ""}>Ghost</option>
              <option value="reconstituting" ${mortality.state === "reconstituting" ? "selected" : ""}>Reconstituting</option>
              <option value="devoured" ${mortality.state === "devoured" ? "selected" : ""}>Devoured</option>
            </select>
          </label>
          <label>
            <span>Timer / Scene Marker</span>
            <input type="text" name="timer" value="${escapeHTML(mortality.timer ?? "")}">
          </label>
        </div>
        <div class="ptg-item-fields three">
          <label>
            <span>Health</span>
            <input type="number" name="health" value="${Number(resources.health?.value ?? 0)}" min="0">
          </label>
          <label>
            <span>Psyche</span>
            <input type="number" name="psyche" value="${Number(resources.psyche?.value ?? 0)}" min="0">
          </label>
          <label>
            <span>Fragments</span>
            <input type="number" name="fragments" value="${Number(resources.fragments?.value ?? 0)}" min="0">
          </label>
        </div>
        <div class="ptg-item-fields two">
          <label>
            <span>Permanent Fragment Loss Delta</span>
            <input type="number" name="permanentFragmentLossDelta" value="0" min="0">
          </label>
          <label>
            <span>Devouring Target</span>
            <select name="devourTargetUuid">
              <option value="">Choose target</option>
              ${actorOptions}
            </select>
          </label>
        </div>
        <div class="form-group">
          <label>Notes</label>
          <textarea name="notes" rows="4" placeholder="Death cause, ghost limits, reconstitution outcome, Fragment loss reason, or devouring details">${escapeHTML(mortality.notes ?? "")}</textarea>
        </div>
      </div>
    `;

    const selection = await DialogV2.prompt({
      window: { title: `${this.actor.name}: Divine Mortality` },
      content,
      rejectClose: false,
      modal: true,
      ok: {
        label: "Apply",
        callback: (event, button) => ({
          action: button.form.elements.action?.value ?? "dead",
          state: button.form.elements.state?.value ?? "",
          timer: button.form.elements.timer?.value?.trim() ?? "",
          health: Number(button.form.elements.health?.value ?? 0),
          psyche: Number(button.form.elements.psyche?.value ?? 0),
          fragments: Number(button.form.elements.fragments?.value ?? 0),
          permanentFragmentLossDelta: Math.max(0, Number(button.form.elements.permanentFragmentLossDelta?.value ?? 0)),
          devourTargetUuid: button.form.elements.devourTargetUuid?.value ?? "",
          notes: button.form.elements.notes?.value?.trim() ?? ""
        })
      }
    });

    if (!selection) return;

    await this.actor.applyDivineMortality({
      ...selection,
      devourFragmentLoss: selection.permanentFragmentLossDelta || 1
    });
  }

  async #applyAdvancementPurchase(purchase) {
    const updates = {};

    if (purchase.category === "skill" && purchase.skill) {
      updates[`system.skills.${purchase.skill}`] = purchase.targetLevel;
    } else if (purchase.category === "manifestation" && purchase.manifestation) {
      updates[`system.manifestations.${purchase.manifestation}`] = purchase.targetLevel;
    } else if (purchase.category === "freeTime") {
      const current = Number(this.actor.system.resources?.occupationFreeTime ?? 0);
      const delta = Math.max(0, purchase.targetLevel - current);
      updates["system.resources.occupationFreeTime"] = purchase.targetLevel;
      updates["system.resources.freeTime"] = Number(this.actor.system.resources?.freeTime ?? 0) + delta;
      updates["system.resources.freeTimeMax"] = Math.max(Number(this.actor.system.resources?.freeTimeMax ?? 0) + delta, purchase.targetLevel);
    } else if (purchase.category === "wealth") {
      const current = Number(this.actor.system.resources?.occupationWealth ?? 0);
      const delta = Math.max(0, purchase.targetLevel - current);
      updates["system.resources.occupationWealth"] = purchase.targetLevel;
      updates["system.resources.wealth"] = Number(this.actor.system.resources?.wealth ?? 0) + delta;
      updates["system.resources.wealthMax"] = Math.max(Number(this.actor.system.resources?.wealthMax ?? 0) + delta, purchase.targetLevel);
    } else if (purchase.category === "specialty") {
      updates["system.specialties"] = appendLine(this.actor.system.specialties, purchase.name);
    }

    if (Object.keys(updates).length) await this.actor.update(updates);

    const item = purchase.itemId ? this.actor.items.get(purchase.itemId) : null;
    if (item) await applyItemAdvancement(item, purchase);

    if (purchase.category === "truth" && !item) {
      await this.actor.createEmbeddedDocuments("Item", [sparkTruthItem(purchase.name, this.actor.system.resources?.spark ?? 1)]);
    }

    if (["bond", "vassal", "worshipper"].includes(purchase.category) && !item) {
      await this.actor.createEmbeddedDocuments("Item", [advancementAttachmentItem(purchase)]);
    }

    if (["dominion", "choiceChange", "storyUpgrade"].includes(purchase.category)) {
      const existing = this.actor.getFlag(SYSTEM_ID, "advancementNotes") ?? [];
      await this.actor.setFlag(SYSTEM_ID, "advancementNotes", [
        ...existing,
        {
          category: purchase.category,
          name: purchase.name,
          targetLevel: purchase.targetLevel,
          freeUpgrade: purchase.freeUpgrade,
          choiceRefund: purchase.choiceRefund,
          justification: purchase.justification,
          recordedAt: Date.now()
        }
      ]);
    }
  }

  async #recordAdvancementLog(kind, details) {
    const log = this.actor.getFlag(SYSTEM_ID, "advancementLog") ?? [];
    await this.actor.setFlag(SYSTEM_ID, "advancementLog", [
      ...log,
      {
        kind,
        ...details,
        recordedAt: Date.now()
      }
    ]);
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
      classes: ptgDialogClasses("ptg-spark-advancement-dialog"),
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

    const fragmentMax = Math.max(0, (advancement.spark * 3) - Number(resources.permanentFragmentLoss ?? 0));
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
          .map(item => this.#enrichInventoryItem(item))
      ])
    );
  }

  #enrichInventoryItem(item) {
    const system = item.system ?? {};
    const details = [
      itemDetail("Choice Type", system.choiceKind),
      itemDetail("Choice", system.choiceLabel),
      itemDetail("Definition", system.definition),
      itemDetail("Choice Source", system.choiceSource),
      itemDetail("Request Type", system.requestType),
      itemDetail("Current Risk", system.currentRisk),
      itemDetail("Summary", system.summary || system.rules?.summary),
      itemDetail("Benefit", system.benefit),
      itemDetail("Effect", system.effect),
      itemDetail("Description", system.description),
      itemDetail("Related Bonus", system.relatedBonus || system.bonus),
      itemDetail("Related Detriment", system.relatedDetriment),
      itemDetail("Automation", system.automationNotes)
    ].filter(Boolean);

    return {
      id: item.id,
      uuid: item.uuid,
      name: item.name,
      type: item.type,
      img: item.img,
      system,
      hasDetails: details.length > 0,
      expanded: this.#expandedItemDetails.has(item.id),
      sheetDetails: details,
      sheetSummary: details[0]?.html ?? ""
    };
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

  #prepareResourceTracks() {
    const resources = this.actor.system.resources ?? {};
    return [
      resourceTrack("health", "PTG.Resources.Health", "Health", resources.health, "5 + Fortitude + Spark", 10, "PTG.Help.Health"),
      resourceTrack("psyche", "PTG.Resources.Psyche", "Psyche", resources.psyche, "5 + Discipline + Spark", 10, "PTG.Help.Psyche"),
      resourceTrack("fragments", "PTG.Resources.Fragments", "Fragments", resources.fragments, "Spark x3", 20, "PTG.Help.Fragments")
    ];
  }

  #prepareDowntimeResourceTracks() {
    const resources = this.actor.system.resources ?? {};
    return [
      flatResourceTrack("freeTime", "PTG.Resources.FreeTime", "Free Time", resources.freeTime, resources.freeTimeMax, "freeTime", 10, "PTG.Help.FreeTime"),
      flatResourceTrack("wealth", "PTG.Resources.Wealth", "Wealth", resources.wealth, resources.wealthMax, "wealth", 10, "PTG.Help.Wealth")
    ];
  }

  async #onResourceBox(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const key = button.dataset.resourceBox;
    const value = Number(button.dataset.resourceValue ?? 0);
    const current = Number(foundry.utils.getProperty(this.actor, `system.resources.${key}.value`) ?? 0);
    const next = event.type === "contextmenu" || event.shiftKey || event.ctrlKey || event.metaKey
      ? Math.max(0, value - 1)
      : value;

    if (next === current) return;
    await this.#updateResourceTrack(key, next);
  }

  async #onResourceStep(button) {
    const key = button.dataset.resourceStep;
    const delta = Number(button.dataset.resourceDelta ?? 0);
    const current = Number(foundry.utils.getProperty(this.actor, `system.resources.${key}.value`) ?? 0);
    await this.#updateResourceTrack(key, current + delta);
  }

  async #onFlatResourceBox(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const key = button.dataset.flatResourceBox;
    const value = Number(button.dataset.resourceValue ?? 0);
    const current = Number(foundry.utils.getProperty(this.actor, `system.resources.${key}`) ?? 0);
    const next = event.type === "contextmenu" || event.shiftKey || event.ctrlKey || event.metaKey
      ? Math.max(0, value - 1)
      : value;

    if (next === current) return;
    await this.#updateFlatResource(key, next);
  }

  async #onFlatResourceStep(button) {
    const key = button.dataset.flatResourceStep;
    const delta = Number(button.dataset.resourceDelta ?? 0);
    const current = Number(foundry.utils.getProperty(this.actor, `system.resources.${key}`) ?? 0);
    await this.#updateFlatResource(key, current + delta);
  }

  async #updateResourceTrack(key, value) {
    const resource = foundry.utils.getProperty(this.actor, `system.resources.${key}`) ?? {};
    const max = Math.max(0, Number(resource.max ?? 0));
    const next = Math.max(0, Math.min(max, Number(value) || 0));
    await this.actor.update({ [`system.resources.${key}.value`]: next });
  }

  async #updateFlatResource(key, value) {
    const max = Math.max(0, Number(foundry.utils.getProperty(this.actor, `system.resources.${key}Max`) ?? 0));
    const next = Math.max(0, Math.min(max, Number(value) || 0));
    await this.actor.update({ [`system.resources.${key}`]: next });
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
      || xpSpentFromPurchases(xpPurchaseHistoryWithLegacy(resources))
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

  #preparePantheonMembership() {
    return game.actors
      .filter(actor => actor.type === "pantheon")
      .filter(actor => Array.from(actor.system.members ?? []).some(member => member.uuid === this.actor.uuid))
      .map(actor => ({
        uuid: actor.uuid,
        name: actor.name,
        territory: actor.system.territory ?? "",
        pool: `${Number(actor.system.pantheonPool?.value ?? 0)} / ${pantheonPoolMax(actor)}`
      }));
  }

  async #openPantheonPoolWorkflow(button) {
    const pantheon = button.dataset.pantheonUuid ? await fromUuid(button.dataset.pantheonUuid) : null;
    return openPantheonPoolDialog({ pantheon, actingActor: this.actor });
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

    if (action === "toggle-details") {
      this.#toggleItemDetails(item.id);
      return;
    }

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
    if (action === "condition-recover") return this.actor.recoverCondition(item);
    if (action === "condition-increase") {
      const current = Number(item.system.severity ?? 1);
      const next = Math.min(10, current + 1);
      await item.update({ "system.severity": next });
      return;
    }
    if (action === "worshipper-request") return this.actor.requestWorshipperPrayer(item);
    if (action === "vassal-task") return this.actor.requestVassalTask(item);

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

  #toggleItemDetails(itemId) {
    if (!itemId) return;
    if (this.#expandedItemDetails.has(itemId)) this.#expandedItemDetails.delete(itemId);
    else this.#expandedItemDetails.add(itemId);
    this.render(false);
  }

  async #createOwnedItem(type) {
    if (!type || (!game.user?.isGM && !this.actor.isOwner)) {
      ui.notifications.warn("You do not have permission to create embedded Items on this actor.");
      return null;
    }

    const itemData = ["bond", "relic", "worshipper", "vassal"].includes(type)
      ? await this.#promptOwnedItemCreation(type)
      : manualOwnedItemData(type);

    if (!itemData) return null;

    const [item] = await this.actor.createEmbeddedDocuments("Item", [itemData]);

    item.sheet.render({ force: true });
    return item;
  }

  async #promptOwnedItemCreation(type) {
    const label = itemTypeLabel(type);
    const content = ownedItemCreationContent(type, label);

    const creation = await DialogV2.prompt({
      window: { title: `${this.actor.name}: Add ${label}`, resizable: true },
      classes: ptgDialogClasses("ptg-item-create-dialog", `ptg-${type}-create-dialog`),
      content,
      rejectClose: false,
      modal: true,
      ok: {
        label: `Create ${label}`,
        callback: (event, button) => collectOwnedItemCreation(button.form, type, label)
      }
    });

    return creation ? manualOwnedItemData(type, creation) : null;
  }

  async #openCharacterCreator() {
    const choices = await this.#loadCreationChoices();
    const types = ["occupation", "archetype", "domain", "theology"];
    const identity = this.actor.system.identity ?? {};
    const resources = this.actor.system.resources ?? {};
    const skillEntries = Object.entries(CONFIG.PTG.skills ?? {});
    const manifestationEntries = Object.entries(CONFIG.PTG.manifestations ?? {});
    const existingTruths = this.actor.items.filter(item => item.type === "truth");
    const ownedAttachmentCounts = {
      bonds: this.actor.items.filter(item => item.type === "bond").length,
      worshippers: this.actor.items.filter(item => item.type === "worshipper").length,
      vassals: this.actor.items.filter(item => item.type === "vassal").length,
      relics: this.actor.items.filter(item => item.type === "relic").length,
      truths: existingTruths.length
    };
    const identityKeys = {
      occupation: "occupation",
      archetype: "archetype",
      domain: "dominion",
      theology: "theology"
    };

    const content = `
      <div class="ptg-creator-dialog">
        <nav class="ptg-creator-steps" aria-label="Character creator steps">
          ${["Occupation", "Archetype", "Dominion", "Theology", "Attachments", "Final Touches"].map((label, index) => `
            <button type="button" data-creator-step-button="${index}" class="${index === 0 ? "active" : ""}">
              <span>${index + 1}</span>
              <strong>${escapeHTML(label)}</strong>
            </button>
          `).join("")}
        </nav>
        <div class="ptg-creator-toolbar">
          <button type="button" data-random-god>Random God</button>
          <span data-random-god-summary></span>
        </div>
        <div class="ptg-creator-body">
        ${types.map((type, index) => {
          const current = identity[identityKeys[type]] || "";
          const options = choices[type] ?? [];
          const isOccupation = type === "occupation";
          const isArchetype = type === "archetype";

          return `
            <fieldset data-creator-step="${index}" ${index === 0 ? "" : "hidden"}>
              <legend>Step ${index + 1}: ${escapeHTML(creatorTypeLabel(type))}</legend>
              <select name="${type}" ${isOccupation ? "data-occupation-select" : ""} ${isArchetype ? "data-archetype-select" : ""}>
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
              ${isArchetype ? creatorArchetypeOptionsHTML(options) : ""}
              <p class="hint">${current ? `Current: ${escapeHTML(current)}` : "No selection applied yet."}</p>
            </fieldset>
          `;
        }).join("")}
        <fieldset data-creator-step="4" hidden>
          <legend>Step 5: Attachments</legend>
          <div class="ptg-creator-owned-counts">
            ${Object.entries(ownedAttachmentCounts).map(([key, count]) => `
              <span><strong>${escapeHTML(labelCase(key))}</strong> ${count}</span>
            `).join("")}
          </div>
        </fieldset>
        <fieldset data-creator-step="5" hidden>
          <legend>Step 6: Final Touches</legend>
          <section class="ptg-creator-budget-block">
            <h3>Starting Skill Points</h3>
            <p class="ptg-sheet-note">Spend exactly 10 points across Skills.</p>
            <div class="ptg-creator-budget-grid">
              ${skillEntries.map(([key, label]) => `
                <label>
                  <span>${escapeHTML(label)}</span>
                  <input type="number" name="creator.skills.${escapeHTML(key)}" value="0" min="0">
                </label>
              `).join("")}
            </div>
          </section>
          <section class="ptg-creator-budget-block">
            <h3>Starting Manifestation Points</h3>
            <p class="ptg-sheet-note">Spend exactly 4 points across Manifestations.</p>
            <div class="ptg-creator-budget-grid manifestations">
              ${manifestationEntries.map(([key, label]) => `
                <label>
                  <span>${escapeHTML(label)}</span>
                  <input type="number" name="creator.manifestations.${escapeHTML(key)}" value="0" min="0">
                </label>
              `).join("")}
            </div>
          </section>
          <section class="ptg-creator-budget-block">
            <h3>Starting Attachments</h3>
            <label>Attachment Points Planned <input type="number" name="creator.attachmentPoints" value="5" min="0"></label>
            <label>Free Starting Truth <input type="text" name="creator.startingTruth" value="${existingTruths.length ? escapeHTML(existingTruths[0].name) : ""}" placeholder="The free Truth chosen in Step Five"></label>
          </section>
          <section class="ptg-creator-budget-block">
            <h3>Starting Divine Resources</h3>
            <label>Spark <input type="number" name="creator.spark" value="${Number(resources.spark ?? 1)}" min="1"></label>
            <label>Starting Fragments <input type="number" name="creator.fragments" value="${Number(resources.fragments?.value ?? 3)}" min="0"></label>
          </section>
          <label>God/dess Of <input type="text" name="identity.concept" value="${escapeHTML(identity.concept ?? "")}"></label>
          <label>Age & Ethnicity <input type="text" name="identity.ageEthnicity" value="${escapeHTML(identity.ageEthnicity ?? "")}"></label>
          <label>Specialties <textarea name="specialties">${escapeHTML(this.actor.system.specialties ?? "")}</textarea></label>
          <label>Legendary Acts <textarea name="resources.legendaryActs">${escapeHTML(resources.legendaryActs ?? "")}</textarea></label>
        </fieldset>
        </div>
        <footer class="ptg-creator-navigation">
          <button type="button" data-creator-prev disabled>Previous</button>
          <span data-creator-progress>Step 1 of 6</span>
          <button type="button" data-creator-next>Next</button>
        </footer>
      </div>
    `;

    const selections = await DialogV2.prompt({
      window: {
        title: `${this.actor.name}: Character Creator`,
        resizable: true
      },
      classes: ptgDialogClasses("ptg-character-creator-window"),
      position: fitDialogPosition(760, 720, { minWidth: 360, minHeight: 360 }),
      content,
      rejectClose: false,
      modal: true,
      render: (event, dialog) => wireCharacterCreatorDialog(dialog.element ?? dialog, { choices }),
      ok: {
        label: "Apply Choices",
        callback: (event, button) => ({
          choices: Object.fromEntries(types.map(type => [type, button.form.elements[type]?.value ?? ""])),
          occupationCareer: button.form.elements.occupationCareer?.value ?? "",
          archetypeOptions: {
            attachmentIndex: button.form.elements.archetypeAttachment?.value ?? "",
            blessingIndex: button.form.elements.archetypeBlessing?.value ?? "",
            curseIndex: button.form.elements.archetypeCurse?.value ?? ""
          },
          updates: {
            "system.identity.concept": button.form.elements["identity.concept"]?.value ?? "",
            "system.identity.ageEthnicity": button.form.elements["identity.ageEthnicity"]?.value ?? "",
            "system.specialties": button.form.elements.specialties?.value ?? "",
            "system.resources.legendaryActs": button.form.elements["resources.legendaryActs"]?.value ?? "",
            "system.resources.spark": Number(button.form.elements["creator.spark"]?.value ?? 1),
            "system.resources.fragments.value": Number(button.form.elements["creator.fragments"]?.value ?? 3),
            "system.resources.fragments.max": 3
          },
          budget: {
            skills: readPointInputs(button.form, "creator.skills", skillEntries.map(([key]) => key)),
            manifestations: readPointInputs(button.form, "creator.manifestations", manifestationEntries.map(([key]) => key)),
            attachmentPoints: Number(button.form.elements["creator.attachmentPoints"]?.value ?? 0),
            startingTruth: button.form.elements["creator.startingTruth"]?.value?.trim() ?? "",
            spark: Number(button.form.elements["creator.spark"]?.value ?? 1),
            fragments: Number(button.form.elements["creator.fragments"]?.value ?? 3)
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

    const selectedArchetype = choices.archetype.find(item => item.uuid === selections.choices.archetype);
    if (selectedArchetype) {
      const archetypeErrors = validateCreatorArchetypeSelection(selectedArchetype, selections.archetypeOptions);
      if (archetypeErrors.length) {
        await showCharacterCreationValidation(archetypeErrors);
        return;
      }
    }

    const validationErrors = validateCharacterCreationBudget(selections, this.actor);
    if (validationErrors.length) {
      await showCharacterCreationValidation(validationErrors);
      return;
    }

    const confirmed = await confirmCharacterCreatorApplication(this.actor, selections, choices, selectedTypes);
    if (!confirmed) return;

    for (const [skill, points] of Object.entries(selections.budget.skills)) {
      if (points > 0) selections.updates[`system.skills.${skill}`] = Number(this.actor.system.skills?.[skill] ?? 0) + points;
    }

    for (const [manifestation, points] of Object.entries(selections.budget.manifestations)) {
      if (points > 0) {
        selections.updates[`system.manifestations.${manifestation}`] =
          Number(this.actor.system.manifestations?.[manifestation] ?? 0) + points;
      }
    }

    await this.actor.update(selections.updates);

    const matchingTruths = this.actor.items.filter(item => item.type === "truth" && item.name === selections.budget.startingTruth);
    if (selections.budget.startingTruth && !matchingTruths.length) {
      await this.actor.createEmbeddedDocuments("Item", [startingTruthItem(selections.budget.startingTruth)]);
    }

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
      const applied = await this.actor.applyChoice(ownedItem, {
        confirm: false,
        ...(type === "occupation" ? { occupationCareerOption: selections.occupationCareer } : {}),
        ...(type === "archetype" ? { archetypeOptions: selections.archetypeOptions } : {})
      });
      if (!applied) await ownedItem.delete();
    }

    if (!selectedTypes.length) ui.notifications.info("Updated character creator details.");
  }

  async #openConditionCreateDialog() {
    const premade = await loadPremadeConditions();
    const content = `
      <div class="ptg-condition-create-dialog">
        <div class="form-group">
          <label>Premade Condition</label>
          <select name="premade">
            <option value="">Custom Condition</option>
            ${premade.map(item => `<option value="${escapeHTML(item.uuid)}">${escapeHTML(item.name)} (${escapeHTML(item.system.category ?? "condition")})</option>`).join("")}
          </select>
        </div>
        <section class="ptg-item-fields three">
          <label>
            <span>Name</span>
            <input name="name" type="text" placeholder="Custom Condition">
          </label>
          <label>
            <span>Category</span>
            <select name="category">
              <option value="physical">Physical</option>
              <option value="mental">Mental</option>
              <option value="crossover">Crossover</option>
            </select>
          </label>
          <label>
            <span>Severity</span>
            <input name="severity" type="number" value="1" min="1" max="10">
          </label>
          <label>
            <span>Applies To</span>
            <select name="appliesTo">
              <option value="health">Health</option>
              <option value="psyche">Psyche</option>
              <option value="both">Both</option>
              <option value="fictional">Fictional State</option>
            </select>
          </label>
          <label>
            <span>Duration</span>
            <input name="duration" type="text" value="scene-or-fiction">
          </label>
          <label>
            <span>Source Page</span>
            <input name="sourcePage" type="number" value="207" min="0">
          </label>
        </section>
        <label>
          <span>Effect</span>
          <textarea name="effect" placeholder="What does this Condition do?"></textarea>
        </label>
        <label>
          <span>Recovery</span>
          <textarea name="recovery" placeholder="How can this Condition be recovered or removed?"></textarea>
        </label>
      </div>
    `;

    const result = await DialogV2.prompt({
      window: { title: `${this.actor.name}: Add Condition` },
      content,
      rejectClose: false,
      modal: true,
      ok: {
        label: "Add Condition",
        callback: (event, button) => ({
          premade: button.form.elements.premade?.value ?? "",
          name: button.form.elements.name?.value?.trim() ?? "",
          category: button.form.elements.category?.value ?? "physical",
          severity: Number(button.form.elements.severity?.value ?? 1),
          appliesTo: button.form.elements.appliesTo?.value ?? "fictional",
          duration: button.form.elements.duration?.value?.trim() ?? "",
          sourcePage: Number(button.form.elements.sourcePage?.value ?? 0),
          effect: button.form.elements.effect?.value?.trim() ?? "",
          recovery: button.form.elements.recovery?.value?.trim() ?? ""
        })
      }
    });

    if (!result) return;

    const source = await conditionItemFromSelection(result);

    if (!source.name) {
      ui.notifications.warn("Enter a Condition name or choose a premade Condition.");
      return;
    }

    await this.actor.createEmbeddedDocuments("Item", [source]);
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

    const seen = Object.fromEntries(Object.keys(byType).map(type => [type, new Set()]));

    for (const item of documents) {
      if (!byType[item.type]) continue;
      const key = normalizeCreatorChoiceKey(item);
      if (seen[item.type].has(key)) continue;
      seen[item.type].add(key);
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

function normalizeCreatorChoiceKey(item) {
  return String(item.name ?? "")
    .trim()
    .replace(/^the\s+/i, "")
    .toLowerCase();
}

function itemDetail(label, value) {
  const html = sheetDetailDisplayHTML(value);
  if (!html) return null;

  return {
    label,
    html
  };
}

const DETAIL_ALLOWED_TAGS = new Set(["a", "blockquote", "br", "code", "em", "i", "li", "ol", "p", "pre", "strong", "b", "table", "tbody", "td", "th", "thead", "tr", "ul"]);
const DETAIL_ENTITY_MAP = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: '"',
  "#39": "'"
};

export function sheetDetailDisplayHTML(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const decoded = decodeSheetDetailEntities(raw);
  const htmlSource = containsAllowedSheetDetailTag(decoded) ? decoded : raw;
  if (containsAllowedSheetDetailTag(htmlSource)) return sanitizeSheetDetailHTML(htmlSource);

  return `<p>${escapeHTML(decoded)}</p>`;
}

function decodeSheetDetailEntities(value) {
  return String(value ?? "").replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (match, entity) => {
    const key = entity.toLowerCase();
    if (Object.hasOwn(DETAIL_ENTITY_MAP, key)) return DETAIL_ENTITY_MAP[key];
    if (key.startsWith("#x")) {
      const codePoint = Number.parseInt(key.slice(2), 16);
      return isValidCodePoint(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    if (key.startsWith("#")) {
      const codePoint = Number.parseInt(key.slice(1), 10);
      return isValidCodePoint(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    return match;
  });
}

function containsAllowedSheetDetailTag(value) {
  return /<\/?(a|blockquote|br|code|em|i|li|ol|p|pre|strong|b|table|tbody|td|th|thead|tr|ul)\b/i.test(String(value ?? ""));
}

function sanitizeSheetDetailHTML(value) {
  const stripped = decodeSheetDetailEntities(value)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|svg|math)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|svg|math)\b[^>]*\/?\s*>/gi, "");

  const sanitized = stripped.replace(/<\/?([a-z][\w-]*)([^>]*)>/gi, (match, tag, attributes) => {
    const name = tag.toLowerCase();
    if (!DETAIL_ALLOWED_TAGS.has(name)) return "";
    if (match.startsWith("</")) return `</${name}>`;
    if (name === "br") return "<br>";
    if (name === "a") return sanitizeSheetDetailLink(attributes);
    return `<${name}>`;
  }).trim();

  return sanitized || `<p>${escapeHTML(stripSheetDetailHTML(stripped))}</p>`;
}

function sanitizeSheetDetailLink(attributes) {
  const href = String(attributes ?? "").match(/\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const url = decodeSheetDetailEntities(href?.[2] ?? href?.[3] ?? href?.[4] ?? "").trim();
  if (!/^(https?:|mailto:|#|\/)/i.test(url)) return "<a>";
  return `<a href="${escapeHTML(url)}" target="_blank" rel="noreferrer">`;
}

function isValidCodePoint(value) {
  return Number.isInteger(value) && value >= 0 && value <= 0x10FFFF;
}

function stripSheetDetailHTML(value) {
  return String(value ?? "").replace(/<[^>]*>/g, "").trim();
}

function resourceTrack(key, labelKey, fallbackLabel, resource, formula, minimumBoxes = 0, helpKey = "") {
  const label = localizeFallback(labelKey, fallbackLabel);
  const max = Math.max(0, Number(resource?.max ?? 0));
  const value = Math.max(0, Math.min(max, Number(resource?.value ?? 0)));
  const boxCount = Math.max(max, minimumBoxes);

  return {
    key,
    label,
    help: helpKey ? localizeFallback(helpKey, "") : "",
    value,
    max,
    formula,
    boxes: Array.from({ length: boxCount }, (_, index) => {
      const count = index + 1;
      return {
        value: count,
        filled: count <= value,
        label: `${label} ${count}${max ? ` of ${max}` : ""}`
      };
    })
  };
}

function flatResourceTrack(key, labelKey, fallbackLabel, value, max, workflow, minimumBoxes = 0, helpKey = "") {
  const label = localizeFallback(labelKey, fallbackLabel);
  const trackMax = Math.max(0, Number(max ?? 0));
  const trackValue = Math.max(0, Math.min(trackMax, Number(value ?? 0)));
  const boxCount = Math.max(trackMax, minimumBoxes);

  return {
    key,
    label,
    help: helpKey ? localizeFallback(helpKey, "") : "",
    value: trackValue,
    max: trackMax,
    workflow,
    maxName: `system.resources.${key}Max`,
    boxes: Array.from({ length: boxCount }, (_, index) => {
      const count = index + 1;
      return {
        value: count,
        filled: count <= trackValue,
        label: `${label} ${count}${trackMax ? ` of ${trackMax}` : ""}`
      };
    })
  };
}

function readPointInputs(form, prefix, keys) {
  return Object.fromEntries(keys.map(key => [
    key,
    Math.max(0, Number(form.elements[`${prefix}.${key}`]?.value ?? 0))
  ]));
}

function fitDialogPosition(width, height, { minWidth = 360, minHeight = 320, marginX = 64, marginY = 120 } = {}) {
  const viewportWidth = Number(globalThis.window?.innerWidth ?? width);
  const viewportHeight = Number(globalThis.window?.innerHeight ?? height);
  const minFitWidth = Math.min(minWidth, Math.max(240, viewportWidth - 16));
  const minFitHeight = Math.min(minHeight, Math.max(240, viewportHeight - 16));
  const availableWidth = Math.max(minFitWidth, viewportWidth - marginX);
  const availableHeight = Math.max(minFitHeight, viewportHeight - marginY);

  return {
    width: Math.min(width, availableWidth),
    height: Math.min(height, availableHeight)
  };
}

function validateCharacterCreationBudget(selections, actor) {
  const errors = [];
  const skillTotal = pointTotal(selections.budget.skills);
  const manifestationTotal = pointTotal(selections.budget.manifestations);
  const existingTruths = actor.items.filter(item => item.type === "truth").length;

  if (skillTotal !== 10) errors.push(`Starting Skill points must total 10; current total is ${skillTotal}.`);
  if (manifestationTotal !== 4) errors.push(`Starting Manifestation points must total 4; current total is ${manifestationTotal}.`);
  if (!selections.budget.startingTruth && existingTruths < 1) errors.push("Choose or enter one free starting Truth.");
  if (Number(selections.budget.attachmentPoints ?? 0) !== 5) errors.push(`Starting Attachment points must total 5; current total is ${Number(selections.budget.attachmentPoints ?? 0)}.`);
  if (Number(selections.budget.spark ?? 0) !== 1) errors.push(`Starting Spark must be 1; current value is ${Number(selections.budget.spark ?? 0)}.`);
  if (Number(selections.budget.fragments ?? 0) !== 3) errors.push(`Starting Fragments must be 3 at Spark 1; current value is ${Number(selections.budget.fragments ?? 0)}.`);

  return errors;
}

async function confirmCharacterCreatorApplication(actor, selections, choices, selectedTypes) {
  return DialogV2.confirm({
    window: { title: `${actor.name}: Apply Character Creator`, resizable: true },
    classes: ptgDialogClasses("ptg-character-creator-confirm-window"),
    position: fitDialogPosition(560, 480, { minWidth: 320, minHeight: 280 }),
    content: characterCreatorPreviewHTML(actor, selections, choices, selectedTypes),
    rejectClose: false,
    modal: true
  });
}

function characterCreatorPreviewHTML(actor, selections, choices, selectedTypes) {
  const selectedRows = selectedTypes.map(type => {
    const selected = choices[type]?.find(item => item.uuid === selections.choices[type]);
    if (!selected) return "";

    const details = [];
    if (type === "occupation" && selections.occupationCareer) details.push(`Career: ${creatorCareerLabel(selected, selections.occupationCareer)}`);
    if (type === "archetype") details.push(...creatorArchetypePreviewRows(selected, selections.archetypeOptions));

    return `<li><strong>${escapeHTML(creatorTypeLabel(type))}</strong>: ${escapeHTML(selected.name)}${details.length ? `<ul>${details.map(detail => `<li>${escapeHTML(detail)}</li>`).join("")}</ul>` : ""}</li>`;
  }).filter(Boolean).join("");

  const skillTotal = pointTotal(selections.budget.skills);
  const manifestationTotal = pointTotal(selections.budget.manifestations);
  const existingTruths = actor.items.filter(item => item.type === "truth").length;

  return `
    <div class="ptg-creator-apply-preview">
      <p><strong>${escapeHTML(actor.name)}</strong> will apply the selected character creator changes.</p>
      <section>
        <h3>Choices</h3>
        ${selectedRows ? `<ul>${selectedRows}</ul>` : "<p>No new core choices selected; only final details will be updated.</p>"}
      </section>
      <section>
        <h3>Starting Budgets</h3>
        <ul>
          <li>Skill Points: ${skillTotal} / 10</li>
          <li>Manifestation Points: ${manifestationTotal} / 4</li>
          <li>Attachment Points Planned: ${Number(selections.budget.attachmentPoints ?? 0)} / 5</li>
          <li>Spark: ${Number(selections.budget.spark ?? 0)}</li>
          <li>Starting Fragments: ${Number(selections.budget.fragments ?? 0)}</li>
          <li>Starting Truth: ${escapeHTML(selections.budget.startingTruth || (existingTruths ? "Existing Truth retained" : "None"))}</li>
        </ul>
      </section>
    </div>
  `;
}

function creatorCareerLabel(item, value) {
  return creatorCareerOptions(item).find(option => option.value === value)?.label ?? value;
}

function creatorArchetypePreviewRows(item, selection) {
  const attachments = Array.from(item.system.attachmentOptions ?? []);
  const blessings = Array.from(item.system.blessingOptions ?? []);
  const curses = Array.from(item.system.curseOptions ?? []);
  const rows = [];
  const attachment = attachments[Number(selection.attachmentIndex)];
  const blessing = blessings[Number(selection.blessingIndex)];
  const curse = curses[Number(selection.curseIndex)];

  if (attachment) rows.push(`Attachment: ${creatorArchetypeOptionLabel(attachment, "attachment")}`);
  if (blessing) rows.push(`Blessing: ${creatorArchetypeOptionLabel(blessing, "blessing")}`);
  if (curse) rows.push(`Curse: ${creatorArchetypeOptionLabel(curse, "curse")}`);
  return rows;
}

function validateCreatorArchetypeSelection(item, selection) {
  const errors = [];
  const attachments = Array.from(item.system.attachmentOptions ?? []);
  const blessings = Array.from(item.system.blessingOptions ?? []);
  const curses = Array.from(item.system.curseOptions ?? []);

  if (!attachments.length) errors.push(`${item.name} has no Archetype Attachment options recorded.`);
  if (!blessings.length) errors.push(`${item.name} has no Archetype Blessing options recorded.`);
  if (!curses.length) errors.push(`${item.name} has no Archetype Curse options recorded.`);
  if (attachments.length && !isValidOptionIndex(selection.attachmentIndex, attachments)) errors.push(`Choose an Attachment option for ${item.name}.`);
  if (blessings.length && !isValidOptionIndex(selection.blessingIndex, blessings)) errors.push(`Choose a Blessing option for ${item.name}.`);
  if (curses.length && !isValidOptionIndex(selection.curseIndex, curses)) errors.push(`Choose a Curse option for ${item.name}.`);

  return errors;
}

function isValidOptionIndex(value, options) {
  const index = Number(value);
  return Number.isInteger(index) && index >= 0 && index < options.length;
}

function pointTotal(points) {
  return Object.values(points ?? {}).reduce((total, value) => total + Number(value ?? 0), 0);
}

function resourceWorkflowDefaultReason(action) {
  return {
    spend: "Resource Spend",
    restore: "Resource Restore",
    adjust: "Resource Adjustment",
    scene: "Scene Passage",
    goingToWork: "Going to Work"
  }[action] ?? "Resource Change";
}

async function showCharacterCreationValidation(errors) {
  await DialogV2.prompt({
    window: { title: "Character Creator Validation", resizable: true },
    classes: ptgDialogClasses("ptg-character-creator-validation-window"),
    position: fitDialogPosition(560, 360, { minWidth: 320, minHeight: 240 }),
    content: `
      <div class="ptg-dialog-body ptg-advancement-dialog">
        <p class="ptg-sheet-note">Fix these starting character budgets before applying the creator.</p>
        <ul>
          ${errors.map(error => `<li>${escapeHTML(error)}</li>`).join("")}
        </ul>
      </div>
    `,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Review",
      callback: () => true
    }
  });
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

function creatorArchetypeOptionsHTML(options) {
  return `
    <section class="ptg-archetype-choice-panel" data-archetype-options hidden>
      <div class="ptg-item-fields three">
        <label>Attachment
          <select name="archetypeAttachment" data-archetype-option-select="attachment" disabled>
            <option value="">Choose an Archetype first</option>
            ${options.flatMap(option => creatorArchetypeOptionOptions(option, "attachment")).join("")}
          </select>
        </label>
        <label>Blessing
          <select name="archetypeBlessing" data-archetype-option-select="blessing" disabled>
            <option value="">Choose an Archetype first</option>
            ${options.flatMap(option => creatorArchetypeOptionOptions(option, "blessing")).join("")}
          </select>
        </label>
        <label>Curse
          <select name="archetypeCurse" data-archetype-option-select="curse" disabled>
            <option value="">Choose an Archetype first</option>
            ${options.flatMap(option => creatorArchetypeOptionOptions(option, "curse")).join("")}
          </select>
        </label>
      </div>
      <div class="ptg-career-options" data-archetype-option-details hidden>
        ${options.map(creatorArchetypeSummaryHTML).join("")}
      </div>
    </section>
  `;
}

function creatorArchetypeOptionOptions(item, kind) {
  const options = {
    attachment: Array.from(item.system?.attachmentOptions ?? []),
    blessing: Array.from(item.system?.blessingOptions ?? []),
    curse: Array.from(item.system?.curseOptions ?? [])
  }[kind] ?? [];

  return options.map((option, index) => `
    <option value="${index}" data-parent-uuid="${escapeHTML(item.uuid)}" hidden>${escapeHTML(creatorArchetypeOptionLabel(option, kind))}</option>
  `);
}

function creatorArchetypeSummaryHTML(item) {
  const attachments = Array.from(item.system?.attachmentOptions ?? []);
  const blessings = Array.from(item.system?.blessingOptions ?? []);
  const curses = Array.from(item.system?.curseOptions ?? []);

  return `
    <section class="ptg-career-option" data-archetype-detail="${escapeHTML(item.uuid)}" hidden>
      <h3>${escapeHTML(item.name)}</h3>
      <p><strong>Defining Trait:</strong> ${escapeHTML(item.system?.definingTrait ?? "")}</p>
      ${creatorOptionListHTML("Attachment Options", attachments.map(option => creatorArchetypeOptionLabel(option, "attachment")))}
      ${creatorOptionListHTML("Blessing Options", blessings.map(option => creatorArchetypeOptionLabel(option, "blessing")))}
      ${creatorOptionListHTML("Curse Options", curses.map(option => creatorArchetypeOptionLabel(option, "curse")))}
    </section>
  `;
}

function creatorOptionListHTML(label, options) {
  if (!options.length) return `<p><strong>${escapeHTML(label)}:</strong> Missing option data.</p>`;
  return `
    <p><strong>${escapeHTML(label)}:</strong></p>
    <ul>
      ${options.map(option => `<li>${escapeHTML(option)}</li>`).join("")}
    </ul>
  `;
}

function creatorArchetypeOptionLabel(option, kind) {
  if (kind === "attachment") return creatorAttachmentLabel(option);
  const name = option?.name ?? creatorTypeLabel(kind);
  const effect = htmlToPlainText(option?.effect ?? option?.rulesText ?? option?.rules?.summary ?? "");
  return effect ? `${name} - ${effect}` : name;
}

function htmlToPlainText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
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

function wireArchetypeOptionSelector(element) {
  const root = element instanceof HTMLElement ? element : element?.querySelector?.(".ptg-creator-dialog");
  const archetype = root?.querySelector?.("[data-archetype-select]");
  const panel = root?.querySelector?.("[data-archetype-options]");
  const details = root?.querySelector?.("[data-archetype-option-details]");
  const selects = Array.from(root?.querySelectorAll?.("[data-archetype-option-select]") ?? []);
  if (!archetype || !panel || !selects.length) return;

  const refresh = () => {
    const parentUuid = archetype.value;
    let visibleCount = 0;

    panel.hidden = !parentUuid;
    for (const select of selects) {
      let visible = 0;
      for (const option of select.querySelectorAll("option[data-parent-uuid]")) {
        const show = option.dataset.parentUuid === parentUuid;
        option.hidden = !show;
        if (show) visible += 1;
      }

      select.disabled = !visible;
      select.options[0].textContent = visible ? `Choose ${select.dataset.archetypeOptionSelect}` : "Choose an Archetype first";
      if (!visible || select.selectedOptions[0]?.dataset.parentUuid !== parentUuid) select.value = "";
      visibleCount += visible;
    }

    if (details) {
      details.hidden = !visibleCount;
      for (const section of details.querySelectorAll("[data-archetype-detail]")) {
        section.hidden = section.dataset.archetypeDetail !== parentUuid;
      }
    }
  };

  archetype.addEventListener("change", refresh);
  refresh();
}

function wireCharacterCreatorDialog(element, { choices = {} } = {}) {
  const root = element instanceof HTMLElement ? element.querySelector?.(".ptg-creator-dialog") ?? element : element?.querySelector?.(".ptg-creator-dialog");
  if (!root) return;

  wireOccupationCareerSelector(root);
  wireArchetypeOptionSelector(root);
  wireRandomGodButton(root, choices);
  wireCreatorWizard(root);
}

function wireRandomGodButton(root, choices) {
  const button = root.querySelector("[data-random-god]");
  const summary = root.querySelector("[data-random-god-summary]");
  if (!button) return;

  button.addEventListener("click", () => {
    const result = generateRandomGod();
    setCreatorSelect(root, "occupation", choices.occupation, result.choices.occupation);
    root.querySelector("[data-occupation-select]")?.dispatchEvent(new Event("change", { bubbles: true }));
    setCareerSelect(root, result.choices.occupationCareer);

    setCreatorSelect(root, "archetype", choices.archetype, result.choices.archetype);
    root.querySelector("[data-archetype-select]")?.dispatchEvent(new Event("change", { bubbles: true }));
    selectFirstVisible(root, "[data-archetype-option-select='attachment']");
    selectFirstVisible(root, "[data-archetype-option-select='blessing']");
    selectFirstVisible(root, "[data-archetype-option-select='curse']");

    setCreatorSelect(root, "domain", choices.domain, result.choices.domain);
    setCreatorSelect(root, "theology", choices.theology, result.choices.theology);

    if (summary) {
      const manual = Object.values(result.choices).includes("GM Choice") || Object.values(result.notes).includes("GM Choice");
      summary.textContent = manual ? "Randomized with GM Choice result; review before applying." : "Randomized; review before applying.";
    }
  });
}

function setCreatorSelect(root, name, options, resultName) {
  const select = root.querySelector(`[name='${name}']`);
  if (!select || !resultName || resultName === "GM Choice") return false;

  const match = findCreatorChoice(options, resultName);
  if (!match) return false;

  select.value = match.uuid;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function setCareerSelect(root, resultName) {
  const select = root.querySelector("[data-occupation-career]");
  if (!select || !resultName || resultName === "GM Choice") return false;

  const option = Array.from(select.options).find(candidate => !candidate.hidden && normalizeCreatorText(candidate.textContent).includes(normalizeCreatorText(resultName)));
  if (!option) return false;

  select.value = option.value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function selectFirstVisible(root, selector) {
  const select = root.querySelector(selector);
  const option = Array.from(select?.options ?? []).find(candidate => candidate.value && !candidate.hidden);
  if (select && option) select.value = option.value;
}

function findCreatorChoice(options = [], resultName = "") {
  const normalized = normalizeCreatorText(resultName);
  return options.find(option => {
    const name = normalizeCreatorText(option.name);
    return name === normalized || name === `the ${normalized}` || normalized === `the ${name}` || name.includes(normalized) || normalized.includes(name);
  });
}

function normalizeCreatorText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/s$/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function wireCreatorWizard(root) {
  const panels = Array.from(root.querySelectorAll("[data-creator-step]"));
  const buttons = Array.from(root.querySelectorAll("[data-creator-step-button]"));
  const previous = root.querySelector("[data-creator-prev]");
  const next = root.querySelector("[data-creator-next]");
  const progress = root.querySelector("[data-creator-progress]");
  const body = root.querySelector(".ptg-creator-body");
  let active = 0;

  const show = step => {
    active = Math.min(Math.max(Number(step) || 0, 0), panels.length - 1);

    for (const panel of panels) panel.hidden = Number(panel.dataset.creatorStep) !== active;
    for (const button of buttons) button.classList.toggle("active", Number(button.dataset.creatorStepButton) === active);

    if (previous) previous.disabled = active <= 0;
    if (next) next.disabled = active >= panels.length - 1;
    if (progress) progress.textContent = `Step ${active + 1} of ${panels.length}`;
    if (body) body.scrollTop = 0;
  };

  for (const button of buttons) {
    button.addEventListener("click", () => show(button.dataset.creatorStepButton));
  }

  previous?.addEventListener("click", () => show(active - 1));
  next?.addEventListener("click", () => show(active + 1));
  show(0);
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

async function selectSkillComboRollOptions({ actor, primary, secondary, difficulty, repetition }) {
  const skillEntries = Object.entries(CONFIG.PTG.skills ?? {});
  const difficulties = Object.entries(CONFIG.PTG.difficulties ?? {});
  const conditionEffects = actor.conditionRollEffects?.({ mode: "skill", primary, secondary, checkMode: "standard" }) ?? { modifiers: [], warnings: [] };
  const repetitionPenalty = Number(repetition?.penalty ?? 0);
  const repetitionNote = repetitionPenalty > 0
    ? `Suggested repeated-combo penalty: -${repetitionPenalty} (use ${Number(repetition.count ?? 0) + 1} of ${escapeHTML(repetition.label)}).`
    : "No repeated-combo penalty suggested for this Skill combination.";
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
        <label>Repetition / Pattern Penalty</label>
        <input type="number" name="repetitionPenalty" value="${repetitionPenalty}" min="0">
      </div>
      <div class="form-group">
        <label>Pantheon Dice</label>
        <input type="number" name="pantheonDice" value="0" min="0">
      </div>
      ${pantheonPoolFieldHTML(actor)}
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
      <label class="ptg-checkbox">
        <input type="checkbox" name="applyConditionModifiers" checked>
        <span>Apply active Condition modifiers</span>
      </label>
      ${conditionSummaryHTML(conditionEffects)}
      <p class="ptg-sheet-note">${repetitionNote} Repetition penalties are ignored for Extended Checks.</p>
      <p class="ptg-sheet-note" data-pool-preview>${skillPoolPreview(actor, primary, secondary, 0, 0)}</p>
    </div>
  `;

  return DialogV2.prompt({
    window: { title: "Skill Combo Check", resizable: true },
    classes: ptgDialogClasses("ptg-skill-combo-dialog"),
    position: fitDialogPosition(540, 720, { minWidth: 360, minHeight: 360 }),
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
        const appliedRepetitionPenalty = checkMode === "extended"
          ? 0
          : Math.max(0, Number(form.elements.repetitionPenalty?.value ?? 0));
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
          pantheonUuid: form.elements.pantheonUuid?.value ?? "",
          checkMode,
          extended: checkMode === "extended" && extendedTarget > 0 ? {
            target: extendedTarget,
            current: Math.max(0, Number(form.elements.extendedCurrent?.value ?? 0))
          } : null,
          boostChoice: form.elements.boostChoice?.value?.trim() ?? "",
          applyConditionModifiers: Boolean(form.elements.applyConditionModifiers?.checked),
          modifierDetails: {
            "Pantheon Dice": pantheonDice,
            [specialtyName ? `Specialty (${specialtyName})` : "Specialty"]: specialtyBonus,
            "Tool": toolModifier,
            "Support": supportBonus,
            "Repetition / Pattern": -appliedRepetitionPenalty
          }
        };
      }
    }
  });
}

async function selectRitualRollOptions({ actor, kind, primary, secondary, difficulty }) {
  const skillEntries = Object.entries(CONFIG.PTG.skills ?? {});
  const difficulties = Object.entries(CONFIG.PTG.difficulties ?? {});
  const skillOption = (selected) => ([key, label]) => `<option value="${escapeHTML(key)}" data-rank="${Number(actor.system.skills?.[key] ?? 0)}" ${key === selected ? "selected" : ""}>${escapeHTML(label)} (${Number(actor.system.skills?.[key] ?? 0)})</option>`;
  const difficultyOptions = difficulties
    .map(([key, value]) => `<option value="${Number(value)}" ${Number(value) === Number(difficulty) ? "selected" : ""}>${escapeHTML(`${labelCase(key)} (${value})`)}</option>`)
    .join("");
  const label = ritualLabel(kind);

  const content = `
    <div class="ptg-roll-dialog ptg-ritual-dialog">
      <div class="ptg-ritual-heading">
        <strong>${escapeHTML(label)}</strong>
        <span>Configure the ritual roll, then confirm to create the roll and chat workflow.</span>
      </div>
      <div class="form-group">
        <label>Primary Skill</label>
        <select name="primary" required>${skillEntries.map(skillOption(primary)).join("")}</select>
      </div>
      <div class="form-group">
        <label>Secondary Skill</label>
        <select name="secondary" required>${skillEntries.map(skillOption(secondary)).join("")}</select>
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
      ${pantheonPoolFieldHTML(actor)}
      <div class="form-group">
        <label>Boost Choice</label>
        <input type="text" name="boostChoice" value="" placeholder="Optional planned Boost">
      </div>
      <div class="form-group">
        <label>Ritual Requirement</label>
        <input type="text" name="requirement" value="" placeholder="Participants, time, Spark, place, or scene cost">
      </div>
      <div class="form-group">
        <label>GM Notes</label>
        <textarea name="notes" placeholder="Territory, Spark, Otherworldly setup, resistance, or rulings"></textarea>
      </div>
      <p class="ptg-sheet-note" data-pool-preview>${skillPoolPreview(actor, primary, secondary, 0, 0)}</p>
    </div>
  `;

  return DialogV2.prompt({
    window: { title: label, resizable: true },
    content,
    rejectClose: false,
    modal: true,
    render: (event, dialog) => wireRitualPoolPreview(dialog.element ?? dialog, actor),
    ok: {
      label: "Roll Ritual",
      callback: (event, button) => {
        const form = button.form;
        const difficultyValue = form.elements.difficulty?.value;
        const pantheonDice = Math.max(0, Number(form.elements.pantheonDice?.value ?? 0));
        const bonus = Number(form.elements.bonus?.value ?? 0);
        const penalty = Number(form.elements.penalty?.value ?? 0);
        const selectedDifficulty = difficultyValue === "custom"
          ? Number(form.elements.customDifficulty?.value ?? 0)
          : Number(difficultyValue ?? 0);

        return {
          kind,
          primary: form.elements.primary?.value ?? primary,
          secondary: form.elements.secondary?.value ?? secondary,
          difficulty: selectedDifficulty,
          bonus,
          penalty,
          pantheonDice,
          pantheonUuid: form.elements.pantheonUuid?.value ?? "",
          boostChoice: form.elements.boostChoice?.value?.trim() ?? "",
          requirement: form.elements.requirement?.value?.trim() ?? "",
          notes: form.elements.notes?.value?.trim() ?? "",
          modifierDetails: {
            "Pantheon Dice": pantheonDice
          }
        };
      }
    }
  });
}

function wireRitualPoolPreview(element, actor) {
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
      { pantheonDice: Number(form.elements.pantheonDice?.value ?? 0) }
    );
  };

  for (const name of ["primary", "secondary", "bonus", "penalty", "pantheonDice"]) {
    form.elements[name]?.addEventListener("change", update);
    form.elements[name]?.addEventListener("input", update);
  }

  update();
}

function wireSkillPoolPreview(element, actor) {
  const root = element instanceof HTMLElement ? element : element?.querySelector?.(".ptg-roll-dialog")?.closest("form");
  const form = root?.querySelector?.("form") ?? root;
  if (!form?.elements) return;
  const repetitionInput = form.elements.repetitionPenalty;

  repetitionInput?.addEventListener("input", () => {
    repetitionInput.dataset.manual = "true";
  });

  const update = () => {
    const preview = form.querySelector("[data-pool-preview]");
    if (!preview) return;

    if (repetitionInput && repetitionInput.dataset.manual !== "true") {
      repetitionInput.value = skillRepetitionState(
        actor,
        form.elements.primary?.value,
        form.elements.secondary?.value
      ).penalty;
    }

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
        supportBonus: Number(form.elements.supportBonus?.value ?? 0),
        repetitionPenalty: Number(form.elements.checkMode?.value === "extended" ? 0 : form.elements.repetitionPenalty?.value ?? 0),
        conditionModifier: form.elements.applyConditionModifiers?.checked
          ? conditionModifierTotal(actor.conditionRollEffects?.({
            mode: "skill",
            primary: form.elements.primary?.value,
            secondary: form.elements.secondary?.value,
            checkMode: form.elements.checkMode?.value ?? "standard"
          }))
          : 0
      }
    );
  };

  for (const name of ["primary", "secondary", "bonus", "penalty", "pantheonDice", "specialtyBonus", "toolModifier", "supportBonus", "repetitionPenalty", "checkMode", "applyConditionModifiers"]) {
    form.elements[name]?.addEventListener("change", update);
    form.elements[name]?.addEventListener("input", update);
  }

  update();
}

function pantheonPoolFieldHTML(actor) {
  const options = pantheonPoolOptions(actor);
  const selectedUuid = options.find(option => option.linked)?.uuid ?? options[0]?.uuid ?? "";
  const hasLinked = options.some(option => option.linked);

  if (!options.length) {
    return `<p class="ptg-sheet-note">No shared Pantheon Pool is linked. Pantheon Dice spends will use this character's local Pantheon Dice track.</p>`;
  }

  return `
    <div class="form-group">
      <label>Shared Pantheon Pool</label>
      <select name="pantheonUuid">
        ${hasLinked ? "" : `<option value="" selected>Use character-local Pantheon Dice</option>`}
        ${options.map(option => `<option value="${escapeHTML(option.uuid)}" ${hasLinked && option.uuid === selectedUuid ? "selected" : ""}>${escapeHTML(option.label)}${option.linked ? " - linked" : ""}</option>`).join("")}
      </select>
    </div>
    <p class="ptg-sheet-note">Pantheon Dice are removed from the selected shared pool before the roll. Confirm group permission before spending shared dice.</p>
  `;
}

function conditionSummaryHTML(effects = {}) {
  const modifiers = effects.modifiers ?? [];
  const warnings = effects.warnings ?? [];
  if (!modifiers.length && !warnings.length) {
    return `<p class="ptg-sheet-note">No active Conditions have structured roll modifiers for this check.</p>`;
  }

  return `
    <div class="ptg-sheet-note">
      <strong>Condition Effects</strong>
      <ul>
        ${modifiers.map(effect => `<li>${escapeHTML(effect.name)}: ${signedNumber(effect.value)}${effect.summary ? ` - ${escapeHTML(effect.summary)}` : ""}</li>`).join("")}
        ${warnings.map(effect => `<li>${escapeHTML(effect.name)}: ${escapeHTML(effect.summary || "Warning only")}</li>`).join("")}
      </ul>
    </div>
  `;
}

function conditionModifierTotal(effects = {}) {
  return (effects.modifiers ?? []).reduce((total, effect) => total + Number(effect.value ?? 0), 0);
}

function signedNumber(value) {
  const number = Number(value ?? 0);
  return `${number >= 0 ? "+" : ""}${number}`;
}

function itemTypeLabel(type) {
  return game.i18n.localize(`TYPES.Item.${type}`) || labelCase(type);
}

function defaultItemImage(type) {
  return {
    relic: "icons/commodities/treasure/token-gold-gem-purple.webp",
    truth: "icons/sundries/documents/document-symbol-circle-gold.webp",
    bond: "icons/svg/linked.svg",
    worshipper: "icons/svg/temple.svg",
    vassal: "icons/svg/mystery-man.svg"
  }[type] ?? "icons/svg/item-bag.svg";
}

function ptgDialogClasses(...classes) {
  return [...PTG_DIALOG_CLASSES, ...classes];
}

function manualOwnedItemData(type, { name = "", system = {} } = {}) {
  const itemName = name || `New ${itemTypeLabel(type)}`;
  return {
    name: itemName,
    type,
    img: defaultItemImage(type),
    system,
    flags: canonicalSheetItemFlags("manual-create", type, {
      canonicalId: `manual-create:${slugify(type)}:${slugify(itemName)}:${Date.now().toString(36)}`
    })
  };
}

function ownedItemCreationContent(type, label) {
  const typeFields = {
    bond: `
      <div class="ptg-dialog-row">
        <label>
          <span>Bond Type</span>
          <select name="kind">
            <option value="individual">Individual</option>
            <option value="group">Group</option>
            <option value="landmark">Landmark</option>
          </select>
        </label>
        <label>
          <span>Level</span>
          <input type="number" name="level" value="1" min="1" max="5">
        </label>
      </div>
      <div class="ptg-dialog-row">
        <label>
          <span>Location</span>
          <input type="text" name="location" placeholder="Home, work, neighborhood, or landmark">
        </label>
      </div>
      <label class="ptg-dialog-label">
        <span>Definition</span>
        <textarea name="description" rows="4" placeholder="Who or what this Bond is, and why it matters."></textarea>
      </label>
    `,
    relic: `
      <div class="ptg-dialog-row">
        <label>
          <span>Level</span>
          <input type="number" name="level" value="1" min="1" max="5">
        </label>
        <label>
          <span>Bonus</span>
          <input type="text" name="bonus" placeholder="+1 to a narrow action, or narrative benefit">
        </label>
      </div>
      <label class="ptg-dialog-label">
        <span>Description</span>
        <textarea name="description" rows="4" placeholder="What the Relic is and how it is used."></textarea>
      </label>
    `,
    worshipper: `
      <div class="ptg-dialog-row">
        <label>
          <span>Level</span>
          <input type="number" name="level" value="1" min="1" max="5">
        </label>
        <label>
          <span>Size</span>
          <input type="text" name="size" placeholder="Small group, cult, congregation">
        </label>
      </div>
      <label class="ptg-dialog-label">
        <span>Group</span>
        <input type="text" name="group" placeholder="Who worships this god?">
      </label>
      <label class="ptg-dialog-label">
        <span>Notes</span>
        <textarea name="description" rows="4" placeholder="Requests, needs, current risk, or temple details."></textarea>
      </label>
    `,
    vassal: `
      <div class="ptg-dialog-row">
        <label>
          <span>Level</span>
          <input type="number" name="level" value="1" min="1" max="5">
        </label>
        <label>
          <span>Loyalty</span>
          <input type="number" name="loyalty" value="1" min="0" max="10">
        </label>
      </div>
      <label class="ptg-dialog-label">
        <span>Concept</span>
        <input type="text" name="concept" placeholder="What kind of servant or ally is this?">
      </label>
      <label class="ptg-dialog-label">
        <span>Notes</span>
        <textarea name="description" rows="4" placeholder="Origin, powers, current task, or risk."></textarea>
      </label>
    `
  }[type] ?? "";

  return `
    <div class="ptg-dialog-body ptg-item-create-body">
      <p class="ptg-dialog-help">Create a starting ${escapeHTML(label)} Item. You can edit the full Item sheet after creation.</p>
      <label class="ptg-dialog-label">
        <span>Name</span>
        <input type="text" name="name" value="New ${escapeHTML(label)}" required>
      </label>
      ${typeFields}
    </div>
  `;
}

function collectOwnedItemCreation(form, type, label) {
  const name = form.elements.name?.value?.trim() || `New ${label}`;
  const level = clampInt(form.elements.level?.value, 1, 1, 10);
  const descriptionText = form.elements.description?.value?.trim() ?? "";
  const description = descriptionText ? `<p>${escapeHTML(descriptionText)}</p>` : "";
  const system = {
    level,
    description,
    notes: description
  };

  if (type === "bond") {
    system.kind = form.elements.kind?.value ?? "individual";
    system.location = form.elements.location?.value?.trim() ?? "";
    system.definition = descriptionText;
    system.strain = { value: 0, max: level };
  } else if (type === "relic") {
    system.bonus = form.elements.bonus?.value?.trim() ?? "";
    system.effect = description;
  } else if (type === "worshipper") {
    system.group = form.elements.group?.value?.trim() || name;
    system.size = form.elements.size?.value?.trim() ?? "";
    system.strain = { value: 0, max: level };
  } else if (type === "vassal") {
    system.concept = form.elements.concept?.value?.trim() || name;
    system.loyalty = clampInt(form.elements.loyalty?.value, 1, 0, 10);
    system.strain = { value: 0, max: level };
  }

  return { name, system };
}

async function promptAttachmentOfChoice(sourceItem) {
  const level = attachmentChoiceLevel(sourceItem);
  const content = `
    <div class="ptg-dialog-body ptg-attachment-choice-body">
      <p class="ptg-dialog-help">${escapeHTML(sourceItem.name)} grants an Attachment of Choice at Level ${level}. Choose the concrete attachment to create.</p>
      <div class="ptg-dialog-row">
        <label>
          <span>Attachment Type</span>
          <select name="kind">
            <option value="individual">Individual Bond</option>
            <option value="group">Group Bond</option>
            <option value="landmark">Landmark Bond</option>
            <option value="relic">Relic</option>
            <option value="truth">Truth</option>
            <option value="vassal">Vassal</option>
            <option value="worshipper">Worshipper</option>
          </select>
        </label>
        <label>
          <span>Level / Value</span>
          <input type="number" name="level" value="${level}" readonly>
        </label>
      </div>
      <label class="ptg-dialog-label">
        <span>Name</span>
        <input type="text" name="name" placeholder="Leave blank to use the chosen attachment type">
      </label>
      <label class="ptg-dialog-label">
        <span>Definition</span>
        <textarea name="definition" rows="4" placeholder="Who, what, or where this attachment is in the fiction."></textarea>
      </label>
    </div>
  `;

  return DialogV2.prompt({
    window: { title: "Choose Attachment Type", resizable: true },
    classes: ptgDialogClasses("ptg-attachment-choice-dialog"),
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Create Attachment",
      callback: (event, button) => ({
        kind: button.form.elements.kind?.value ?? "individual",
        name: button.form.elements.name?.value?.trim() ?? "",
        definition: button.form.elements.definition?.value?.trim() ?? "",
        level
      })
    }
  });
}

function attachmentOfChoiceItemData(sourceItem, selection) {
  const kind = selection.kind ?? "individual";
  const type = attachmentChoiceDocumentType(kind);
  const level = Math.max(1, Number(selection.level ?? attachmentChoiceLevel(sourceItem)));
  const kindLabel = attachmentChoiceKindLabel(kind);
  const definition = String(selection.definition ?? "").trim();
  const itemName = selection.name || definition || `${kindLabel} (${sourceItem.name})`;
  const sourceSystem = sourceItem.system ?? {};
  const sourceRules = sourceSystem.rules ?? {};
  const sourceSummary = sourceSystem.summary || sourceRules.summary || `${sourceItem.name} grants ${kindLabel} at Level ${level}.`;
  const sourceText = sourceSystem.description || sourceSystem.benefit || sourceRules.fullText || sourceSystem.relatedBonus || "";
  const definitionText = definition ? `<p>Definition: ${escapeHTML(definition)}.</p>` : "";
  const description = `
    <p>${escapeHTML(sourceSummary)}</p>
    ${definitionText}
    ${sourceText}
  `;
  const common = {
    level,
    choiceSource: sourceSystem.choiceSource || sourceItem.name,
    choiceKind: kind,
    choiceLabel: sourceSystem.choiceLabel || sourceSystem.choice || sourceItem.name,
    definition,
    summary: sourceSummary,
    relatedBonus: sourceSystem.relatedBonus || "",
    relatedDetriment: sourceSystem.relatedDetriment || "",
    sourcePage: sourceSystem.sourcePage ?? sourceRules.source?.page ?? null,
    description,
    notes: sourceSystem.notes || "",
    rules: {
      ...sourceRules,
      summary: sourceSummary,
      fullText: description,
      source: {
        ...(sourceRules.source ?? {}),
        type
      }
    },
    usage: defaultOwnedItemUsage(type === "truth" || type === "relic" ? "active" : "narrative"),
    automation: defaultOwnedItemAutomation()
  };
  const strain = { value: 0, max: level };
  const data = {
    name: itemName,
    type,
    img: defaultItemImage(type),
    system: common,
    flags: canonicalSheetItemFlags("attachment-choice-drop", type, {
      canonicalId: `attachment-choice:${slugify(sourceItem.name)}:${slugify(kind)}:${Date.now().toString(36)}`,
      sourceItemUuid: sourceItem.uuid ?? "",
      sourceItemName: sourceItem.name,
      selectedAttachmentKind: kind
    })
  };

  if (type === "bond") {
    data.system.kind = kind;
    data.system.location = kind === "landmark" ? definition : "";
    data.system.strain = strain;
  } else if (type === "relic") {
    data.system.cost = level;
    data.system.bonus = "";
    data.system.benefit = description;
    data.system.effect = description;
  } else if (type === "truth") {
    data.system.statement = definition || itemName;
    data.system.rank = level;
    data.system.cost = level;
    data.system.fragmentCost = 0;
    data.system.activation = "Passive";
    data.system.benefit = description;
    data.system.effect = description;
  } else if (type === "worshipper") {
    data.system.cost = level;
    data.system.strain = strain;
    data.system.group = definition || itemName;
    data.system.size = "";
    data.system.requestType = "";
    data.system.currentRisk = "";
    data.system.riskNotes = "";
    data.system.requestLog = [];
    data.system.benefit = description;
  } else if (type === "vassal") {
    data.system.cost = level;
    data.system.strain = strain;
    data.system.concept = definition || itemName;
    data.system.loyalty = 0;
    data.system.sourceActorName = "";
    data.system.sourceActorCategory = "";
    data.system.actorTemplate = {};
    data.system.powerHooks = [];
    data.system.benefit = description;
  }

  return data;
}

function attachmentChoiceLevel(sourceItem) {
  const system = sourceItem.system ?? {};
  return Math.max(1, Number(system.level ?? system.cost ?? system.value ?? system.rank ?? 1));
}

function attachmentChoiceDocumentType(kind) {
  if (["individual", "group", "landmark"].includes(kind)) return "bond";
  if (["relic", "truth", "vassal", "worshipper"].includes(kind)) return kind;
  return "bond";
}

function attachmentChoiceKindLabel(kind) {
  return {
    individual: "Individual Bond",
    group: "Group Bond",
    landmark: "Landmark Bond",
    relic: "Relic",
    truth: "Truth",
    vassal: "Vassal",
    worshipper: "Worshipper"
  }[kind] ?? labelCase(kind);
}

function clampInt(value, fallback, min, max) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function skillPoolPreview(actor, primary, secondary, bonus, penalty, extra = {}) {
  const primaryRank = Number(actor.system.skills?.[primary] ?? 0);
  const secondaryRank = Number(actor.system.skills?.[secondary] ?? 0);
  const basePool = primaryRank + secondaryRank;
  const extraTotal = Number(extra.pantheonDice ?? 0)
    + Number(extra.specialtyBonus ?? 0)
    + Number(extra.toolModifier ?? 0)
    + Number(extra.supportBonus ?? 0)
    - Number(extra.repetitionPenalty ?? 0)
    + Number(extra.conditionModifier ?? 0);
  const finalPool = basePool + Number(bonus ?? 0) - Number(penalty ?? 0) + extraTotal;
  const fate = finalPool <= 0 ? " Fate Die" : "";

  return `Pool: ${primaryRank} + ${secondaryRank} + ${Number(bonus ?? 0)} - ${Number(penalty ?? 0)} + ${extraTotal} = ${finalPool}${fate}`;
}

function skillRepetitionState(actor, primary, secondary) {
  const history = actor.getFlag?.(SYSTEM_ID, "skillRepetition") ?? {};
  const key = skillComboKey(primary, secondary);
  const count = history.key === key ? Number(history.count ?? 0) : 0;

  return {
    key,
    count,
    penalty: count >= 2 ? count - 1 : 0,
    label: skillComboLabel(primary, secondary)
  };
}

async function recordSkillRepetition(actor, primary, secondary, checkMode) {
  if (!actor?.setFlag || checkMode === "extended") return;

  const key = skillComboKey(primary, secondary);
  const history = actor.getFlag?.(SYSTEM_ID, "skillRepetition") ?? {};
  const count = history.key === key ? Number(history.count ?? 0) + 1 : 1;

  await actor.setFlag(SYSTEM_ID, "skillRepetition", {
    key,
    label: skillComboLabel(primary, secondary),
    count,
    updatedAt: Date.now()
  });
}

function skillComboKey(primary, secondary) {
  return [primary, secondary].map(value => String(value ?? "")).sort().join("+");
}

function skillComboLabel(primary, secondary) {
  const first = CONFIG.PTG.skills?.[primary] ?? primary;
  const second = CONFIG.PTG.skills?.[secondary] ?? secondary;
  return `${first} + ${second}`;
}

async function selectManifestationRollOptions({ actor, manifestation, skill, difficulty }) {
  const manifestationEntries = Object.entries(CONFIG.PTG.manifestations ?? {});
  const skillEntries = Object.entries(CONFIG.PTG.skills ?? {});
  const difficulties = Object.entries(CONFIG.PTG.difficulties ?? {});
  const conditionEffects = actor.conditionRollEffects?.({ mode: "manifestation", manifestation, skill, checkMode: "manifestation" }) ?? { modifiers: [], warnings: [] };
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
      ${pantheonPoolFieldHTML(actor)}
      <div class="form-group">
        <label>Fragment Spend</label>
        <input type="number" name="fragments" value="0" min="0">
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
        <label>Dominion Scope</label>
        <select name="dominionScopePenalty">
          <option value="0">Specific or clearly covered (+0)</option>
          <option value="1">Broad, stretched, or loosely covered (-1)</option>
          <option value="2">Outside Dominion without table support (-2)</option>
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
      <section class="ptg-item-fields four">
        <label>
          <span>Damage</span>
          <input type="number" name="measureDamage" value="0" min="0">
        </label>
        <label>
          <span>Range</span>
          <input type="text" name="measureRange" value="" placeholder="Touch, Close, Near, Far">
        </label>
        <label>
          <span>Targets</span>
          <input type="number" name="measureTargets" value="1" min="0">
        </label>
        <label>
          <span>Duration</span>
          <input type="text" name="measureDuration" value="" placeholder="Instant, scene, day">
        </label>
      </section>
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
      <label class="ptg-checkbox">
        <input type="checkbox" name="applyConditionModifiers" checked>
        <span>Apply active Condition modifiers</span>
      </label>
      ${conditionSummaryHTML(conditionEffects)}
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
        const fragments = Math.max(0, Number(form.elements.fragments?.value ?? 0));
        const dominionFit = Number(form.elements.dominionFit?.value ?? 0);
        const dominionScopePenalty = Math.max(0, Number(form.elements.dominionScopePenalty?.value ?? 0));
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
          pantheonUuid: form.elements.pantheonUuid?.value ?? "",
          fragments,
          dominionFit,
          dominionScopePenalty,
          measure: form.elements.measure?.value ?? "detail",
          measureNotes: form.elements.measureNotes?.value?.trim() ?? "",
          measureIntent: {
            damage: Math.max(0, Number(form.elements.measureDamage?.value ?? 0)),
            range: form.elements.measureRange?.value?.trim() ?? "",
            targets: Math.max(0, Number(form.elements.measureTargets?.value ?? 0)),
            duration: form.elements.measureDuration?.value?.trim() ?? ""
          },
          boostChoice: form.elements.boostChoice?.value?.trim() ?? "",
          applyConditionModifiers: Boolean(form.elements.applyConditionModifiers?.checked),
          modifierDetails: {
            "Pantheon Dice": pantheonDice,
            "Dominion Fit": dominionFit,
            "Dominion Scope Penalty": -dominionScopePenalty
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
        dominionFit: Number(form.elements.dominionFit?.value ?? 0),
        dominionScopePenalty: Number(form.elements.dominionScopePenalty?.value ?? 0),
        conditionModifier: form.elements.applyConditionModifiers?.checked
          ? conditionModifierTotal(actor.conditionRollEffects?.({
            mode: "manifestation",
            manifestation: form.elements.manifestation?.value,
            skill: form.elements.skill?.value,
            checkMode: "manifestation"
          }))
          : 0
      }
    );
  };

  for (const name of ["manifestation", "skill", "bonus", "penalty", "pantheonDice", "dominionFit", "applyConditionModifiers"]) {
    form.elements[name]?.addEventListener("change", update);
    form.elements[name]?.addEventListener("input", update);
  }

  update();
}

function manifestationPoolPreview(actor, manifestation, skill, bonus, penalty, extra = {}) {
  const manifestationRank = Number(actor.system.manifestations?.[manifestation] ?? 0);
  const skillRank = Number(actor.system.skills?.[skill] ?? 0);
  const extraTotal = Number(extra.pantheonDice ?? 0)
    + Number(extra.dominionFit ?? 0)
    - Number(extra.dominionScopePenalty ?? 0)
    + Number(extra.conditionModifier ?? 0);
  const finalPool = manifestationRank + skillRank + Number(bonus ?? 0) - Number(penalty ?? 0) + extraTotal;
  const fate = finalPool <= 0 ? " Fate Die" : "";

  return `Pool: ${manifestationRank} + ${skillRank} + ${Number(bonus ?? 0)} - ${Number(penalty ?? 0)} + ${extraTotal} = ${finalPool}${fate}`;
}

const ADVANCEMENT_CATEGORIES = {
  skill: "Skill Level",
  manifestation: "Manifestation Level",
  specialty: "New Specialty",
  blessing: "+1 to Blessing",
  curse: "+1 to Curse",
  freeTime: "Occupation Free Time",
  wealth: "Occupation Wealth",
  bond: "Bond Level",
  relic: "Relic Level",
  truth: "New Truth",
  dominion: "New Dominion",
  vassal: "Vassal Level",
  worshipper: "Worshipper Level",
  choiceChange: "Changing Choice",
  storyUpgrade: "Story Upgrade"
};

const XP_PURCHASE_OPTIONS = [
  { key: "skill14", category: "skill", label: "Skill Level 1-4", cost: 4, target: "skill", levels: [1, 2, 3, 4] },
  { key: "skill5", category: "skill", label: "Skill Level 5", cost: 8, target: "skill", levels: [5] },
  { key: "manifestation14", category: "manifestation", label: "Manifestation Level 1-4", cost: 8, target: "manifestation", levels: [1, 2, 3, 4] },
  { key: "manifestation5", category: "manifestation", label: "Manifestation Level 5", cost: 15, target: "manifestation", levels: [5] },
  { key: "specialty", category: "specialty", label: "New Specialty", cost: 3, target: "specialty", levels: [1] },
  { key: "blessing", category: "blessing", label: "+1 to Blessing", cost: 5, target: "item", itemTypes: ["blessing"], levels: [1] },
  { key: "curse", category: "curse", label: "+1 to Curse", cost: 5, target: "item", itemTypes: ["curse"], levels: [1] },
  { key: "freeTime", category: "freeTime", label: "Free Time", target: "resource", levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { key: "wealth", category: "wealth", label: "Wealth", target: "resource", levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { key: "bond14", category: "bond", label: "Bond Level 1-4", cost: 5, target: "namedItem", itemTypes: ["bond"], levels: [1, 2, 3, 4] },
  { key: "bond5", category: "bond", label: "Bond Level 5", cost: 10, target: "namedItem", itemTypes: ["bond"], levels: [5] },
  { key: "dominion", category: "dominion", label: "New Dominion", cost: 25, target: "dominion", levels: [1] },
  { key: "relic", category: "relic", label: "Relic Level 1-5", cost: 7, target: "item", itemTypes: ["relic"], levels: [1, 2, 3, 4, 5] },
  { key: "truth", category: "truth", label: "New Truth", cost: 10, target: "truth", itemTypes: ["truth"], levels: [1] },
  { key: "vassal14", category: "vassal", label: "Vassal Level 1-4", cost: 7, target: "namedItem", itemTypes: ["vassal"], levels: [1, 2, 3, 4] },
  { key: "vassal5", category: "vassal", label: "Vassal Level 5", cost: 13, target: "namedItem", itemTypes: ["vassal"], levels: [5] },
  { key: "worshipper14", category: "worshipper", label: "Worshipper Level 1-4", cost: 7, target: "namedItem", itemTypes: ["worshipper"], levels: [1, 2, 3, 4] },
  { key: "worshipper5", category: "worshipper", label: "Worshipper Level 5", cost: 13, target: "namedItem", itemTypes: ["worshipper"], levels: [5] }
];

function buildXpPurchaseRows(actor) {
  return `
    <div class="ptg-xp-purchase-list">
      ${XP_PURCHASE_OPTIONS.map(option => buildXpPurchaseRow(actor, option)).join("")}
    </div>
  `;
}

function buildXpPurchaseRow(actor, option) {
  const costLabel = option.cost ? `${option.cost} XP` : "New level + 3 XP";
  const levelControl = option.levels.length > 1
    ? `<label><span>Level</span><select name="${option.key}_level">${option.levels.map(level => `<option value="${level}">${level}</option>`).join("")}</select></label>`
    : `<input type="hidden" name="${option.key}_level" value="${option.levels[0]}">`;

  return `
    <section class="ptg-xp-purchase-row">
      <label class="ptg-checkbox">
        <input type="checkbox" name="${option.key}_selected">
        <span>${escapeHTML(option.label)}</span>
      </label>
      <strong>${escapeHTML(costLabel)}</strong>
      <div class="ptg-xp-purchase-controls">
        ${buildXpTargetControl(actor, option)}
        ${levelControl}
      </div>
    </section>
  `;
}

function buildXpTargetControl(actor, option) {
  if (option.target === "skill") {
    return `<label><span>Skill</span><select name="${option.key}_target">${skillLevelOptions(actor)}</select></label>`;
  }

  if (option.target === "manifestation") {
    return `<label><span>Manifestation</span><select name="${option.key}_target">${manifestationLevelOptions(actor)}</select></label>`;
  }

  if (option.target === "resource") {
    return `<input type="hidden" name="${option.key}_target" value="${option.category}">`;
  }

  if (option.target === "specialty") {
    return `<input type="hidden" name="${option.key}_target" value="new-specialty"><span class="ptg-sheet-note">Record the new Specialty text on the sheet after purchase.</span>`;
  }

  if (option.target === "dominion") {
    return `<input type="hidden" name="${option.key}_target" value="new-dominion"><span class="ptg-sheet-note">Records the Dominion purchase for GM follow-up.</span>`;
  }

  if (option.target === "truth") {
    return `<label><span>Truth</span><select name="${option.key}_target"><option value="">Create New Truth placeholder</option>${itemOptions(actor, option.itemTypes)}</select></label>`;
  }

  if (option.target === "namedItem") {
    const noun = option.category === "bond" ? "Bond" : option.category === "vassal" ? "Vassal" : "Worshipper";
    return `
      <label><span>${noun}</span><select name="${option.key}_target"><option value="">Create New ${noun}</option>${itemOptions(actor, option.itemTypes)}</select></label>
      <label><span>${noun} Name</span><input type="text" name="${option.key}_name" value="" placeholder="Required for new ${noun}"></label>
    `;
  }

  return `<label><span>Item</span><select name="${option.key}_target">${itemOptions(actor, option.itemTypes)}</select></label>`;
}

function skillLevelOptions(actor) {
  return Object.entries(CONFIG.PTG.skills ?? {})
    .map(([key, label]) => `<option value="${escapeHTML(key)}">${escapeHTML(label)} (${Number(actor.system.skills?.[key] ?? 0)})</option>`)
    .join("");
}

function manifestationLevelOptions(actor) {
  return Object.entries(CONFIG.PTG.manifestations ?? {})
    .map(([key, label]) => `<option value="${escapeHTML(key)}">${escapeHTML(label)} (${Number(actor.system.manifestations?.[key] ?? 0)})</option>`)
    .join("");
}

function itemOptions(actor, types = []) {
  return actor.items
    .filter(item => types.includes(item.type))
    .map(item => `<option value="${item.id}">${escapeHTML(item.name)}</option>`)
    .join("");
}

function collectXpPurchases(form, actor) {
  const sourceNote = form.elements.sourceNote?.value?.trim() ?? "";
  return XP_PURCHASE_OPTIONS
    .filter(option => Boolean(form.elements[`${option.key}_selected`]?.checked))
    .map((option, index) => {
      const targetLevel = Number(form.elements[`${option.key}_level`]?.value ?? option.levels[0] ?? 0);
      const targetKey = form.elements[`${option.key}_target`]?.value ?? "";
      const item = targetKey ? actor.items.get(targetKey) : null;
      const cost = option.cost ?? advancementBaseCost(option.category, targetLevel);
      const name = xpPurchaseName(actor, option, targetKey, targetLevel, item, form.elements[`${option.key}_name`]?.value?.trim());

      return {
        id: foundry.utils.randomID(),
        order: index + 1,
        type: option.key,
        category: option.category,
        label: option.label,
        targetKey,
        itemId: item?.id ?? "",
        name,
        targetLevel,
        baseCost: cost,
        discount: 0,
        cost,
        freeUpgrade: false,
        choiceRefund: false,
        justification: sourceNote,
        sourceNote,
        createdAt: Date.now()
      };
    });
}

function xpPurchaseName(actor, option, targetKey, targetLevel, item, typedName) {
  if (typedName) return typedName;
  if (item) return item.name;
  if (option.category === "skill") return CONFIG.PTG.skills?.[targetKey] ?? targetKey;
  if (option.category === "manifestation") return CONFIG.PTG.manifestations?.[targetKey] ?? targetKey;
  if (option.category === "freeTime") return `Free Time Level ${targetLevel}`;
  if (option.category === "wealth") return `Wealth Level ${targetLevel}`;
  if (option.category === "specialty") return "New Specialty";
  if (option.category === "dominion") return actor.system.identity?.dominion ? `New Dominion after ${actor.system.identity.dominion}` : "New Dominion";
  if (option.category === "truth") return "New Truth";
  if (option.category === "bond") return "";
  if (option.category === "vassal") return "";
  if (option.category === "worshipper") return "";
  return option.label;
}

function validateXpPurchases(actor, purchases, xpAvailable) {
  if (!purchases.length) return { valid: false, message: "Choose at least one XP purchase." };

  const totalCost = xpSpentFromPurchases(purchases);
  if (totalCost > xpAvailable) return { valid: false, message: `Not enough XP. ${actor.name} has ${xpAvailable} unspent XP.` };

  for (const purchase of purchases) {
    if (["bond", "vassal", "worshipper"].includes(purchase.category) && !purchase.itemId && !purchase.name) {
      return { valid: false, message: `Enter a name for the new ${ADVANCEMENT_CATEGORIES[purchase.category]}.` };
    }

    if (["blessing", "curse", "relic"].includes(purchase.category) && !purchase.itemId) {
      return { valid: false, message: `Choose an existing ${ADVANCEMENT_CATEGORIES[purchase.category]} item for this XP purchase.` };
    }

    if (purchase.category === "skill" && Number(actor.system.skills?.[purchase.targetKey] ?? 0) >= purchase.targetLevel) {
      return { valid: false, message: `${purchase.name} is already level ${purchase.targetLevel} or higher.` };
    }

    if (purchase.category === "manifestation" && Number(actor.system.manifestations?.[purchase.targetKey] ?? 0) >= purchase.targetLevel) {
      return { valid: false, message: `${purchase.name} is already level ${purchase.targetLevel} or higher.` };
    }

    if (purchase.category === "freeTime" && Number(actor.system.resources?.occupationFreeTime ?? 0) >= purchase.targetLevel) {
      return { valid: false, message: "Free Time is already at that level or higher." };
    }

    if (purchase.category === "wealth" && Number(actor.system.resources?.occupationWealth ?? 0) >= purchase.targetLevel) {
      return { valid: false, message: "Wealth is already at that level or higher." };
    }

    const item = purchase.itemId ? actor.items.get(purchase.itemId) : null;
    const currentItemLevel = Number(item?.system?.level ?? item?.system?.rank ?? 0);
    if (item && ["bond", "relic", "vassal", "worshipper"].includes(purchase.category) && currentItemLevel >= purchase.targetLevel) {
      return { valid: false, message: `${item.name} is already level ${purchase.targetLevel} or higher.` };
    }
  }

  return { valid: true, message: "" };
}

function xpPurchaseHistoryWithLegacy(resources = {}) {
  const purchases = Array.isArray(resources.xpPurchases) ? resources.xpPurchases.filter(Boolean) : [];
  const legacySpent = Number(resources.xpSpent ?? 0);
  if (purchases.length || legacySpent <= 0) return purchases;
  return [{
    id: "legacy-xp-spent",
    type: "legacy",
    category: "legacy",
    label: "Existing XP Spent",
    targetId: "",
    targetName: "Existing XP Spent",
    targetLevel: 0,
    cost: legacySpent,
    source: "Migrated from system.resources.xpSpent",
    createdAt: 0
  }];
}

function xpSpentFromPurchases(purchases = []) {
  return purchases.reduce((total, entry) => total + Math.max(0, Number(entry?.cost ?? 0)), 0);
}

function advancementBaseCost(category, targetLevel) {
  const level = Math.max(0, Number(targetLevel ?? 0));

  if (category === "skill") return level >= 5 ? 8 : 4;
  if (category === "manifestation") return level >= 5 ? 15 : 8;
  if (category === "specialty") return 3;
  if (["blessing", "curse"].includes(category)) return 5;
  if (["freeTime", "wealth"].includes(category)) return level + 3;
  if (category === "bond") return level >= 5 ? 10 : 5;
  if (category === "relic") return 7;
  if (category === "truth") return 10;
  if (category === "dominion") return 25;
  if (["vassal", "worshipper"].includes(category)) return level >= 5 ? 13 : 7;
  return 0;
}

function advancementPurchaseName(actor, purchase) {
  if (purchase.name) return purchase.name;

  if (purchase.category === "skill") return CONFIG.PTG.skills?.[purchase.skill] ?? purchase.skill;
  if (purchase.category === "manifestation") return CONFIG.PTG.manifestations?.[purchase.manifestation] ?? purchase.manifestation;
  if (purchase.category === "freeTime") return "Occupation Free Time";
  if (purchase.category === "wealth") return "Occupation Wealth";

  const item = purchase.itemId ? actor.items.get(purchase.itemId) : null;
  if (item) return item.name;

  return ADVANCEMENT_CATEGORIES[purchase.category] ?? purchase.category;
}

async function applyItemAdvancement(item, purchase) {
  const updates = {};
  const level = Math.max(0, Number(purchase.targetLevel ?? 0));

  if (["bond", "relic", "vassal", "worshipper"].includes(item.type)) {
    updates["system.level"] = level;
    if (["bond", "vassal", "worshipper"].includes(item.type)) {
      updates["system.strain.max"] = level;
    }
  } else if (item.type === "truth") {
    updates["system.rank"] = Math.max(1, level || Number(item.system.rank ?? 1));
  } else if (item.type === "curse") {
    updates["system.pantheonDice"] = Math.min(2, Math.max(Number(item.system.pantheonDice ?? 1), 2));
  }

  if (["blessing", "curse"].includes(item.type)) {
    updates["system.notes"] = appendParagraph(
      item.system.notes,
      `XP advancement: ${purchase.freeUpgrade ? "story upgrade" : `${purchase.cost} XP`} applied${purchase.justification ? ` (${purchase.justification})` : ""}.`
    );
  }

  if (Object.keys(updates).length) await item.update(updates);

  if (item.setFlag) {
    await item.setFlag(SYSTEM_ID, "advancement", {
      category: purchase.category,
      targetLevel: level,
      baseCost: purchase.baseCost,
      cost: purchase.cost,
      discount: purchase.discount,
      freeUpgrade: purchase.freeUpgrade,
      choiceRefund: purchase.choiceRefund,
      justification: purchase.justification,
      updatedAt: Date.now()
    });
  }
}

function advancementAttachmentItem(purchase) {
  const level = Math.max(1, Number(purchase.targetLevel ?? 1));
  const data = {
    name: purchase.name,
    type: purchase.category,
    img: {
      bond: "icons/svg/hand.svg",
      vassal: "icons/magic/control/control-influence-puppet.webp",
      worshipper: "icons/environment/people/group.webp"
    }[purchase.category] ?? "icons/svg/mystery-man.svg",
    system: {
      level,
      description: `<p>Created from XP purchase: ${escapeHTML(purchase.label)}.</p>`,
      notes: purchase.sourceNote ? `<p>${escapeHTML(purchase.sourceNote)}</p>` : "",
      usage: defaultOwnedItemUsage("narrative"),
      automation: defaultOwnedItemAutomation(),
      rules: {
        summary: `Created from XP purchase: ${purchase.label}.`,
        fullText: `<p>Created from XP purchase: ${escapeHTML(purchase.label)}.</p>`,
        source: {
          book: "Part-Time Gods 2e",
          page: 130,
          section: "Experience Spending Chart",
          type: purchase.category
        }
      }
    },
    flags: canonicalSheetItemFlags("advancement", purchase.category, {
      canonicalId: `advancement:${slugify(purchase.category)}:${slugify(purchase.label ?? purchase.name)}`,
      advancementCategory: purchase.category,
      advancementLabel: purchase.label
    })
  };

  if (["bond", "vassal", "worshipper"].includes(purchase.category)) data.system.strain = { value: 0, max: level };
  if (purchase.category === "bond") data.system.kind = "individual";
  if (purchase.category === "vassal") data.system.concept = purchase.name;
  if (purchase.category === "worshipper") data.system.group = purchase.name;

  return data;
}

function appendLine(value, line) {
  const current = String(value ?? "").trim();
  const next = String(line ?? "").trim();
  if (!next) return current;
  return current ? `${current}\n${next}` : next;
}

function appendParagraph(value, text) {
  const current = String(value ?? "").trim();
  const next = `<p>${escapeHTML(text)}</p>`;
  return current ? `${current}${next}` : next;
}

function startingTruthItem(name) {
  return {
    name,
    type: "truth",
    img: "icons/magic/symbols/rune-sigil-black-pink.webp",
    system: {
      statement: name,
      rank: 1,
      cost: 0,
      fragmentCost: 0,
      activation: "passive",
      effect: "<p>Free starting Truth chosen during character creation.</p>",
      notes: "<p>Created by the character creator budget validation workflow.</p>",
      rules: {
        summary: "Free starting Truth chosen during character creation.",
        fullText: "<p>Free starting Truth chosen during character creation.</p>",
        source: {
          book: "Part-Time Gods Second Edition",
          page: 134,
          section: "Step Five: Attachments",
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
    },
    flags: canonicalSheetItemFlags("character-creator", "starting-truth", {
      canonicalId: `character-creator:starting-truth:${slugify(name)}`,
      choiceLabel: name
    })
  };
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
    },
    flags: canonicalSheetItemFlags("advancement", "spark-truth", {
      canonicalId: `advancement:spark-truth:${slugify(name)}`,
      spark: Number(spark ?? 1),
      choiceLabel: name
    })
  };
}

function canonicalSheetItemFlags(source, role, extra = {}) {
  return {
    [SYSTEM_ID]: {
      canonicalEmbeddedItem: true,
      canonicalId: extra.canonicalId ?? `${slugify(source)}:${slugify(role)}`,
      canonicalSource: source,
      canonicalRole: role,
      ...extra
    }
  };
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function defaultOwnedItemUsage(kind = "narrative") {
  return {
    kind,
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
  };
}

function defaultOwnedItemAutomation() {
  return {
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
  };
}

async function selectManifestationMeasureSpending(outcome, selection) {
  const successes = Math.max(0, Number(outcome.successes ?? 0));
  if (!successes) return null;

  const entries = Object.entries(CONFIG.PTG.measureOptions ?? {});
  const selectedMeasure = selection.measure ?? "detail";
  const content = `
    <div class="ptg-advancement-dialog">
      <p class="ptg-sheet-note">${successes} success${successes === 1 ? "" : "es"} available for Measures.</p>
      <div class="ptg-creator-budget-grid">
        ${entries.map(([key, label]) => `
          <label>
            <span>${escapeHTML(label)}</span>
            <input type="number" name="measure.${escapeHTML(key)}" value="${key === selectedMeasure ? Math.min(1, successes) : 0}" min="0" max="${successes}">
          </label>
        `).join("")}
      </div>
      <div class="form-group">
        <label>Measure Notes</label>
        <textarea name="measureNotes" rows="4">${escapeHTML(selection.measureNotes ?? "")}</textarea>
      </div>
    </div>
  `;

  const spending = await DialogV2.prompt({
    window: { title: "Spend Manifestation Measures" },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Post Measures",
      callback: (event, button) => {
        const spent = Object.fromEntries(entries.map(([key]) => [
          key,
          Math.max(0, Number(button.form.elements[`measure.${key}`]?.value ?? 0))
        ]));
        const total = Object.values(spent).reduce((sum, value) => sum + Number(value ?? 0), 0);
        return {
          spent,
          total,
          remaining: Math.max(0, successes - total),
          notes: button.form.elements.measureNotes?.value?.trim() ?? ""
        };
      }
    }
  });

  if (spending === null || spending === undefined) return false;

  if (spending.total > successes) {
    ui.notifications.warn(`Measures spent (${spending.total}) cannot exceed successes available (${successes}).`);
    return false;
  }

  return spending;
}

async function postManifestationMeasureSummary(actor, outcome, selection, measures) {
  if (!outcome?.passed || Number(outcome.successes ?? 0) <= 0) return;

  const measureLabel = CONFIG.PTG.measureOptions?.[selection.measure] ?? selection.measure ?? "Effect Detail";
  const intent = selection.measureIntent ?? {};
  const damageAmount = Number(intent.damage ?? 0) || Number(measures?.spent?.damage ?? 0) || Math.max(0, Number(outcome.margin ?? 0));
  const options = Object.entries(CONFIG.PTG.measureOptions ?? {})
    .map(([key, label]) => {
      const count = Number(measures?.spent?.[key] ?? 0);
      return count > 0 ? `<li>${escapeHTML(label)}: ${count}</li>` : "";
    })
    .filter(Boolean)
    .join("");
  const intentRows = [
    Number(intent.damage ?? 0) ? `Damage: ${Number(intent.damage ?? 0)}` : "",
    intent.range ? `Range: ${intent.range}` : "",
    Number(intent.targets ?? 0) ? `Targets: ${Number(intent.targets ?? 0)}` : "",
    intent.duration ? `Duration: ${intent.duration}` : ""
  ].filter(Boolean).map(row => `<li>${escapeHTML(row)}</li>`).join("");

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="ptg-chat-card" data-ptg-chat-card="manifestation-measures" data-actor-uuid="${escapeHTML(actor.uuid)}" data-margin="${Number(outcome.margin ?? 0)}" data-successes="${Number(outcome.successes ?? 0)}" data-reason="Manifestation Measures">
        <h3>${escapeHTML(CONFIG.PTG.manifestations[selection.manifestation] ?? selection.manifestation)} Measures</h3>
        <div>Fragments Spent: ${Number(selection.fragments ?? 0)}</div>
        <div>Dominion Fit: ${signedNumber(selection.dominionFit ?? 0)}</div>
        <div>Dominion Scope Penalty: -${Number(selection.dominionScopePenalty ?? 0)}</div>
        <div>Successes Available: ${Number(outcome.successes ?? 0)}</div>
        <div>Difficulty Margin: ${Number(outcome.margin ?? 0)}</div>
        <div>Selected Focus: ${escapeHTML(measureLabel)}</div>
        <div>Measures Spent: ${Number(measures?.total ?? 0)}</div>
        <div>Unspent Successes: ${Number(measures?.remaining ?? outcome.successes ?? 0)}</div>
        ${measures?.notes ? `<div>Notes: ${escapeHTML(measures.notes)}</div>` : ""}
        ${selection.boostChoice ? `<div>Planned Boost: ${escapeHTML(selection.boostChoice)}</div>` : ""}
        ${options ? `<div>Chosen Measures</div><ul>${options}</ul>` : "<div>No Measures assigned; successes remain available for table rulings.</div>"}
        ${intentRows ? `<div>Declared Effect</div><ul>${intentRows}</ul>` : ""}
        <div>Spend successes on effect Measures such as damage, range, targets, duration, scale, or narrative detail. Any resistance roll should be compared against this Manifestation's successes.</div>
        <div class="ptg-chat-actions">
          <button type="button" data-ptg-chat-action="open-actor">Open Actor</button>
          <button type="button" data-ptg-chat-action="apply-damage" data-resource="health" data-amount="${damageAmount}" data-reason="Manifestation Measures">Health Damage</button>
          <button type="button" data-ptg-chat-action="apply-damage" data-resource="psyche" data-amount="${damageAmount}" data-apply-armor="false" data-reason="Manifestation Measures">Psyche Damage</button>
          <button type="button" data-ptg-chat-action="apply-condition" data-severity="${Math.max(1, damageAmount || 1)}" data-reason="Manifestation Measures">Apply Condition</button>
        </div>
      </div>
    `
  });
}

async function postManifestationResistanceSummary(actor, resistor, manifestationOutcome, resistanceOutcome, selection) {
  const manifestationSuccesses = Number(manifestationOutcome.successes ?? 0);
  const resistanceSuccesses = Number(resistanceOutcome.successes ?? 0);
  const resisted = resistanceSuccesses >= manifestationSuccesses;

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="ptg-chat-card">
        <h3>${escapeHTML(CONFIG.PTG.manifestations[selection.manifestation] ?? selection.manifestation)} Resistance</h3>
        <div>Manifestation Successes: ${manifestationSuccesses}</div>
        <div>Resistor: ${escapeHTML(resistor.name)}</div>
        <div>Resistance Roll: ${escapeHTML(skillComboLabel(selection.resistance.primary, selection.resistance.secondary))}</div>
        <div>Resistance Successes: ${resistanceSuccesses}</div>
        <strong>${resisted ? "Resistance Holds" : "Manifestation Overcomes Resistance"}</strong>
      </div>
    `
  });
}

async function postManifestationBacklashSummary(actor, selection) {
  const consequence = await DialogV2.prompt({
    window: { title: "Manifestation Backlash" },
    content: `
      <div class="ptg-advancement-dialog">
        <div class="form-group">
          <label>Backlash Result</label>
          <select name="result">
            <option value="Unintended divine effect">Unintended divine effect</option>
            <option value="Condition">Condition</option>
            <option value="Collateral damage">Collateral damage</option>
            <option value="Attachment Strain">Attachment Strain</option>
            <option value="Lost time or resources">Lost time or resources</option>
            <option value="Dominion consequence">Dominion consequence</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
        <div class="form-group">
          <label>Notes</label>
          <textarea name="notes" rows="4" placeholder="GM consequence, affected target, Condition, Strain, or scene change"></textarea>
        </div>
      </div>
    `,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Post Backlash",
      callback: (event, button) => ({
        result: button.form.elements.result?.value ?? "Custom",
        notes: button.form.elements.notes?.value?.trim() ?? ""
      })
    }
  });

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="ptg-chat-card">
        <h3>${escapeHTML(CONFIG.PTG.manifestations[selection.manifestation] ?? selection.manifestation)} Backlash</h3>
        <div>The Manifestation critically failed. Apply Backlash according to the power, scene stakes, and GM ruling.</div>
        ${consequence?.result ? `<div>Selected Result: ${escapeHTML(consequence.result)}</div>` : ""}
        ${consequence?.notes ? `<div>Notes: ${escapeHTML(consequence.notes)}</div>` : ""}
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
