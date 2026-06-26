import { PTGDiceEngine } from "../../dice/ptg-dice-engine.mjs";

const { DialogV2 } = foundry.applications.api;

export class PartTimeGodsActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();

    if (this.type !== "character") return;

    const system = this.system;
    const skills = system.skills;
    const spark = Number(system.resources.spark ?? 1);

    const healthMax = Math.max(1, Number(skills.fortitude ?? 0) + spark + 5);
    const psycheMax = Math.max(1, Number(skills.discipline ?? 0) + spark + 5);

    system.resources.health.max = healthMax;
    system.resources.psyche.max = psycheMax;
    system.resources.fragments.max = Math.max(0, (spark * 3) - Number(system.resources.permanentFragmentLoss ?? 0));
    system.resources.health.value = clamp(system.resources.health.value, 0, healthMax);
    system.resources.psyche.value = clamp(system.resources.psyche.value, 0, psycheMax);
    system.resources.fragments.value = clamp(system.resources.fragments.value, 0, system.resources.fragments.max);

    system.derived.initiative = Number(skills.perception ?? 0) + Number(skills.speed ?? 0);
    system.derived.strength = Math.max(1, Number(skills.might ?? 0));
    system.derived.movement = Math.max(1, Number(skills.speed ?? 0));
    system.derived.armor = this.items
      .filter(item => item.type === "armor" && item.system.equipped)
      .reduce((total, item) => total + Number(item.system.rating ?? 0), 0);
    system.derived.carriedWeight = this.items
      .filter(item => ["weapon", "armor"].includes(item.type) && (item.system.held !== false || item.system.equipped))
      .reduce((total, item) => total + Number(item.system.weight ?? 0) * Number(item.system.amount ?? 1), 0);
  }

  async rollSkillCombo(primary, secondary, options = {}) {
    return PTGDiceEngine.rollSkillCombo(this, primary, secondary, options);
  }

  async rollManifestation(manifestation, skill, options = {}) {
    return PTGDiceEngine.rollManifestation(this, manifestation, skill, options);
  }

  async spendResource(resource, amount = 1) {
    const path = `system.resources.${resource}`;
    const data = foundry.utils.getProperty(this, path);

    if (typeof data === "number") {
      if (data < amount) {
        ui.notifications.warn(`Not enough ${resource}.`);
        return false;
      }

      await this.update({ [path]: data - amount });
      return true;
    }

    const current = Number(data?.value ?? 0);

    if (current < amount) {
      ui.notifications.warn(`Not enough ${resource}.`);
      return false;
    }

    await this.update({ [`${path}.value`]: current - amount });
    return true;
  }

  async adjustDowntimeResources({
    action = "adjust",
    freeTimeDelta = 0,
    wealthDelta = 0,
    reason = "",
    notes = "",
    allowNegative = false,
    capAtMax = false
  } = {}) {
    if (this.type !== "character") return false;

    const resources = this.system.resources ?? {};
    const before = {
      freeTime: Number(resources.freeTime ?? 0),
      wealth: Number(resources.wealth ?? 0)
    };
    const max = {
      freeTime: Number(resources.freeTimeMax ?? 0),
      wealth: Number(resources.wealthMax ?? 0)
    };
    const requestedDeltas = {
      freeTime: Number(freeTimeDelta ?? 0),
      wealth: Number(wealthDelta ?? 0)
    };
    const after = {
      freeTime: before.freeTime + requestedDeltas.freeTime,
      wealth: before.wealth + requestedDeltas.wealth
    };

    if (capAtMax) {
      after.freeTime = Math.min(after.freeTime, max.freeTime);
      after.wealth = Math.min(after.wealth, max.wealth);
    }

    if (!allowNegative && (after.freeTime < 0 || after.wealth < 0)) {
      ui.notifications.warn("Free Time and Wealth cannot go below 0 without an override.");
      return false;
    }

    const deltas = {
      freeTime: after.freeTime - before.freeTime,
      wealth: after.wealth - before.wealth
    };

    const nextLog = [
      ...(Array.isArray(resources.resourceLog) ? resources.resourceLog : []),
      {
        order: (Array.isArray(resources.resourceLog) ? resources.resourceLog.length : 0) + 1,
        action,
        reason,
        notes,
        actorUuid: this.uuid,
        actorName: this.name,
        delta: deltas,
        before,
        after,
        allowNegative: Boolean(allowNegative),
        capAtMax: Boolean(capAtMax),
        createdAt: new Date().toISOString()
      }
    ].slice(-100);

    await this.update({
      "system.resources.freeTime": Math.max(allowNegative ? Number.MIN_SAFE_INTEGER : 0, after.freeTime),
      "system.resources.wealth": Math.max(allowNegative ? Number.MIN_SAFE_INTEGER : 0, after.wealth),
      "system.resources.resourceLog": nextLog
    });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <div class="ptg-chat-card">
          <h3>${escapeHTML(resourceActionLabel(action))}</h3>
          <div><strong>Actor:</strong> ${escapeHTML(this.name)}</div>
          <div><strong>Reason:</strong> ${escapeHTML(reason || resourceActionLabel(action))}</div>
          <div><strong>Free Time:</strong> ${before.freeTime} ${signedNumber(deltas.freeTime)} = ${after.freeTime}</div>
          <div><strong>Wealth:</strong> ${before.wealth} ${signedNumber(deltas.wealth)} = ${after.wealth}</div>
          ${notes ? `<div><strong>Notes:</strong> ${escapeHTML(notes)}</div>` : ""}
          ${allowNegative ? "<div><strong>Override:</strong> Negative values allowed.</div>" : ""}
        </div>
      `
    });

    return true;
  }

  async goToWork({ freeTimeGain = null, wealthGain = null, notes = "", allowExceedMax = false } = {}) {
    const resources = this.system.resources ?? {};
    const occupationFreeTime = Number(resources.occupationFreeTime ?? 0);
    const occupationWealth = Number(resources.occupationWealth ?? 0);
    const currentFreeTime = Number(resources.freeTime ?? 0);
    const currentWealth = Number(resources.wealth ?? 0);
    const freeTimeMax = Math.max(Number(resources.freeTimeMax ?? 0), occupationFreeTime);
    const wealthMax = Math.max(Number(resources.wealthMax ?? 0), occupationWealth);
    const targetFreeTime = allowExceedMax
      ? currentFreeTime + Number(freeTimeGain ?? occupationFreeTime)
      : Math.min(freeTimeMax, currentFreeTime + Number(freeTimeGain ?? occupationFreeTime));
    const targetWealth = allowExceedMax
      ? currentWealth + Number(wealthGain ?? occupationWealth)
      : Math.min(wealthMax, currentWealth + Number(wealthGain ?? occupationWealth));

    await this.update({
      "system.resources.freeTimeMax": freeTimeMax,
      "system.resources.wealthMax": wealthMax
    });

    return this.adjustDowntimeResources({
      action: "goingToWork",
      freeTimeDelta: targetFreeTime - currentFreeTime,
      wealthDelta: targetWealth - currentWealth,
      reason: "Going to Work",
      notes,
      capAtMax: !allowExceedMax
    });
  }

  async applyDivineMortality({
    action = "dead",
    state = "",
    timer = "",
    notes = "",
    permanentFragmentLossDelta = 0,
    health = null,
    psyche = null,
    fragments = null,
    devourTargetUuid = "",
    devourFragmentLoss = 1
  } = {}) {
    if (this.type !== "character") return false;

    const resources = this.system.resources ?? {};
    const mortality = this.system.mortality ?? {};
    const nextState = state || (["devour", "fragmentLoss"].includes(action)
      ? mortality.state ?? "alive"
      : mortalityStateForAction(action));
    const before = mortalitySnapshot(this);
    const permanentLoss = Math.max(0, Number(resources.permanentFragmentLoss ?? 0) + Number(permanentFragmentLossDelta ?? 0));
    const fragmentMax = Math.max(0, (Number(resources.spark ?? 1) * 3) - permanentLoss);
    const updates = {
      "system.mortality.state": nextState,
      "system.mortality.timer": timer,
      "system.mortality.notes": notes,
      "system.mortality.lastTransitionAt": new Date().toISOString(),
      "system.resources.permanentFragmentLoss": permanentLoss,
      "system.resources.fragments.max": fragmentMax,
      "system.resources.fragments.value": Math.min(Number(fragments ?? resources.fragments?.value ?? 0), fragmentMax)
    };

    if (health !== null && health !== undefined) updates["system.resources.health.value"] = Math.max(0, Number(health));
    if (psyche !== null && psyche !== undefined) updates["system.resources.psyche.value"] = Math.max(0, Number(psyche));

    if (action === "reconstitute") {
      updates["system.resources.health.value"] = Number(health ?? this.system.resources?.health?.max ?? 1);
      updates["system.resources.psyche.value"] = Number(psyche ?? this.system.resources?.psyche?.max ?? 1);
      updates["system.resources.fragments.value"] = Math.min(Number(fragments ?? fragmentMax), fragmentMax);
      updates["system.mortality.reconstitutionDue"] = "";
    }

    if (action === "reconstituting") {
      updates["system.mortality.reconstitutionDue"] = timer;
    }

    let devourTarget = null;
    if (action === "devour" && devourTargetUuid) {
      devourTarget = await fromUuid(devourTargetUuid);
      if (devourTarget?.update) {
        await applyDevouredTargetUpdate(devourTarget, this, devourFragmentLoss, notes);
      }
    }

    const after = {
      ...before,
      state: nextState,
      health: {
        value: Number(updates["system.resources.health.value"] ?? before.health.value),
        max: before.health.max
      },
      psyche: {
        value: Number(updates["system.resources.psyche.value"] ?? before.psyche.value),
        max: before.psyche.max
      },
      permanentFragmentLoss: permanentLoss,
      fragments: {
        value: updates["system.resources.fragments.value"],
        max: fragmentMax
      }
    };
    const logEntry = {
      order: (Array.isArray(mortality.log) ? mortality.log.length : 0) + 1,
      action,
      state: nextState,
      timer,
      notes,
      actorUuid: this.uuid,
      actorName: this.name,
      devourTargetUuid,
      devourTargetName: devourTarget?.name ?? "",
      permanentFragmentLossDelta: Number(permanentFragmentLossDelta ?? 0),
      before,
      after,
      createdAt: new Date().toISOString()
    };

    updates["system.mortality.log"] = [
      ...(Array.isArray(mortality.log) ? mortality.log : []),
      logEntry
    ].slice(-100);

    await this.update(updates);
    await postMortalityCard(this, logEntry);
    return true;
  }

  async applyChoice(item, options = {}) {
    if (!["occupation", "archetype", "domain", "theology"].includes(item.type)) return false;

    const applied = this.getFlag("part-time-gods", "appliedChoices") ?? {};
    const key = `${item.type}:${item.name}`;

    if (applied[key]) {
      ui.notifications.warn(`${item.name} has already been applied to ${this.name}.`);
      return false;
    }

    const careerSelection = item.type === "occupation" ? await selectOccupationCareer(item, options) : null;
    if (careerSelection === false) return false;

    const archetypeSelection = item.type === "archetype" ? await selectArchetypeOptions(item) : null;
    if (archetypeSelection === false) return false;

    const domainSelection = item.type === "domain" ? await selectDomainOptions(item, this) : null;
    if (domainSelection === false) return false;

    const theologySelection = item.type === "theology" && item.system.undecided ? await selectUndecidedTheologyGrants(item) : null;
    if (theologySelection === false) return false;

    const grants = choiceGrants(item.system.grants ?? {}, { careerSelection, archetypeSelection, domainSelection, theologySelection });
    const attachmentDefinitions = await selectAttachmentDefinitions(grants.attachments, item);
    if (attachmentDefinitions === false) return false;
    grants.attachments = attachmentDefinitions;
    const updates = {};
    const identityPath = {
      occupation: "system.identity.occupation",
      archetype: "system.identity.archetype",
      domain: "system.identity.dominion",
      theology: "system.identity.theology"
    }[item.type];

    updates[identityPath] = careerSelection?.career ? `${item.name} - ${careerSelection.career.name}` : domainSelection?.title || item.name;

    if (domainSelection) {
      updates["system.identity.concept"] = domainSelection.title;
      updates["system.identity.dominionTitle"] = domainSelection.title;
      updates["system.identity.dominionPortfolio"] = domainSelection.portfolio;
      updates["system.identity.dominionSpecificity"] = domainSelection.specificity;
      updates["system.identity.dominionLimitations"] = domainSelection.limitations;
      updates["system.identity.dominionLandmarkBondName"] = domainSelection.landmarkName;
    }

    if (careerSelection?.career) {
      updates["system.resources.occupationFreeTime"] = Number(careerSelection.career.resources?.freeTime ?? 0);
      updates["system.resources.occupationWealth"] = Number(careerSelection.career.resources?.wealth ?? 0);
    }

    for (const [skill, bonus] of Object.entries(grants.skills ?? {})) {
      updates[`system.skills.${skill}`] = Number(this.system.skills?.[skill] ?? 0) + Number(bonus);
    }

    for (const [manifestation, bonus] of Object.entries(grants.manifestations ?? {})) {
      updates[`system.manifestations.${manifestation}`] =
        Number(this.system.manifestations?.[manifestation] ?? 0) + Number(bonus);
    }

    for (const [resource, bonus] of Object.entries(grants.resources ?? {})) {
      const path = `system.resources.${resource}`;
      const current = foundry.utils.getProperty(this, path);

      if (typeof current === "number") updates[path] = current + Number(bonus);
      else updates[`${path}.value`] = Number(current?.value ?? 0) + Number(bonus);
    }

    syncStartingValues(updates, this.system);
    if (item.type === "theology" && !item.system.undecided) {
      grants.blessing = theologyAbilityGrant(item, "blessing");
      grants.curse = theologyAbilityGrant(item, "curse");
    }

    await this.update(updates);

    if (careerSelection?.career && item.parent?.uuid === this.uuid) {
      await item.update({ "system.career": careerSelection.career.name });
    }

    const embedded = [
      ...embeddedAttachmentItems(grants.attachments, item)
    ];
    if (grants.blessing) embedded.push(simpleEmbeddedItem("blessing", grants.blessing, item));
    if (grants.curse) embedded.push(simpleEmbeddedItem("curse", grants.curse, item));

    const createdEmbedded = embedded.length ? await this.createEmbeddedDocuments("Item", embedded) : [];
    const landmarkBond = createdEmbedded.find(created => created.type === "bond" && created.system.kind === "landmark");

    if (landmarkBond) {
      await this.update({
        "system.identity.dominionLandmarkBondUuid": landmarkBond.uuid,
        "system.identity.dominionLandmarkBondName": landmarkBond.name
      });
    }

    if (domainSelection && item.parent?.uuid === this.uuid) {
      await item.update({
        "system.customTitle": domainSelection.title,
        "system.specificPortfolio": domainSelection.portfolio,
        "system.specificity": domainSelection.specificity,
        "system.limitations": paragraph(domainSelection.limitations),
        "system.gmNotes": paragraph(domainSelection.gmNotes),
        "system.landmarkBondUuid": landmarkBond?.uuid ?? "",
        "system.landmarkBondName": landmarkBond?.name ?? domainSelection.landmarkName
      });
    }

    await this.setFlag("part-time-gods", "appliedChoices", {
      ...applied,
      [key]: true
    });

    if (domainSelection) {
      const choiceDetails = this.getFlag("part-time-gods", "choiceDetails") ?? {};
      await this.setFlag("part-time-gods", "choiceDetails", {
        ...choiceDetails,
        dominion: {
          category: item.name,
          title: domainSelection.title,
          portfolio: domainSelection.portfolio,
          specificity: domainSelection.specificity,
          blessing: domainSelection.blessing?.name ?? "",
          curse: domainSelection.curse?.name ?? "",
          landmarkBondName: domainSelection.landmarkName,
          uuid: item.uuid
        }
      });
    }

    if (item.type === "theology") {
      const choiceDetails = this.getFlag("part-time-gods", "choiceDetails") ?? {};
      await this.setFlag("part-time-gods", "choiceDetails", {
        ...choiceDetails,
        theology: {
          name: item.name,
          undecided: Boolean(item.system.undecided),
          blessing: item.system.blessingData?.name ?? item.system.grants?.blessing ?? "",
          curse: item.system.curseData?.name ?? item.system.grants?.curse ?? "",
          skillPoints: item.system.undecided ? Number(item.system.skillPoints ?? 8) : 0,
          manifestationPoints: item.system.undecided ? Number(item.system.manifestationPoints ?? 2) : 0,
          uuid: item.uuid
        }
      });
    }

    if (careerSelection?.career) {
      const choiceDetails = this.getFlag("part-time-gods", "choiceDetails") ?? {};
      await this.setFlag("part-time-gods", "choiceDetails", {
        ...choiceDetails,
        occupation: {
          parent: item.name,
          career: careerSelection.career.name,
          attachment: careerSelection.attachment?.name ?? "",
          uuid: item.uuid
        }
      });
    }

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `<p><strong>${this.name}</strong> applied <strong>${careerSelection?.career ? `${item.name} - ${careerSelection.career.name}` : item.name}</strong>.</p>`
    });

    return true;
  }

  async useOwnedItem(item) {
    if (!item) return false;

    if (item.type === "power" && Number(item.system.cost ?? 0) > 0) {
      const spent = await this.spendResource("fragments", Number(item.system.cost));
      if (!spent) return false;
    }

    if (["truth", "relic"].includes(item.type) && Number(item.system.fragmentCost ?? 0) > 0) {
      const spent = await this.spendResource("fragments", Number(item.system.fragmentCost));
      if (!spent) return false;
    }

    const costResults = await this.#spendUsageCosts(item);
    if (costResults === false) return false;

    if (item.type === "weapon") {
      const difficulty = 1;
      await this.rollSkillCombo("fighting", "might", {
        difficulty,
        flavor: `${this.name}: ${item.name}`
      });

      if (item.system.automation?.enabled) {
        const automationResults = await this.#applyItemAutomation(item);
        if (automationResults.length) await this.#postAutomationMessage(item.name, automationResults, item);
      }

      return true;
    }

    const automationResults = item.system.automation?.enabled
      ? await this.#applyItemAutomation(item)
      : [];
    const results = [
      ...costResults,
      ...automationResults
    ];

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: await this.#renderItemUseCard({ item, results })
    });

    return true;
  }

  async reduceCondition(item, amount = 1) {
    if (!item || item.type !== "condition") return false;

    const current = Number(item.system.severity ?? 1);
    const next = Math.max(0, current - Math.max(1, Number(amount ?? 1)));

    if (next <= 0) {
      await item.delete();
      await this.#postAutomationMessage("Condition Removed", [`${item.name} was removed from ${this.name}.`], item);
      return true;
    }

    await item.update({ "system.severity": next });
    await this.#postAutomationMessage("Condition Reduced", [`${item.name} reduced to severity ${next}.`], item);
    return true;
  }

  async adjustBondStrain(item, delta = 1, reason = "Bond Strain") {
    return this.adjustAttachmentStrain(item, delta, reason);
  }

  async adjustAttachmentStrain(item, delta = 1, reason = "Attachment Strain") {
    if (!isAttachmentItem(item)) return false;

    const current = Number(item.system.strain?.value ?? 0);
    const max = Math.max(0, Number(item.system.strain?.max ?? item.system.level ?? 0));
    const next = clamp(current + Number(delta ?? 0), 0, max);

    await item.update({ "system.strain.value": next });
    await this.#postAutomationMessage(reason, [
      `${item.name}: Strain ${current} -> ${next} / ${max}.`
    ], item);

    return true;
  }

  async requestBondFavor(item) {
    return this.requestAttachmentAction(item, "favor");
  }

  async requestAttachmentAction(item, action = "favor") {
    if (!isAttachmentItem(item)) return false;
    if (item.type === "worshipper" && action === "favor") return this.requestWorshipperPrayer(item);

    const config = attachmentActionConfig(action, item);
    if (!config) return false;
    const results = [];

    if (config.strainDelta) {
      const changed = await this.adjustAttachmentStrain(item, config.strainDelta, config.reason);
      if (!changed) return false;
      const strain = item.system.strain ?? {};
      results.push(`${item.name}: Strain ${Number(strain.value ?? 0)} / ${Math.max(0, Number(strain.max ?? item.system.level ?? 0))}.`);
    }

    if (action === "lose") {
      const failing = await this.#createFailingFromAttachment(item);
      results.push(failing ? `${item.name} was converted into Failing: ${failing.name}.` : `${item.name} was marked as lost.`);
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <div class="ptg-chat-card">
          <h3>${escapeHTML(item.name)} ${escapeHTML(config.title)}</h3>
          <div>Attachment Type: ${escapeHTML(attachmentTypeLabel(item))}</div>
          <div>${escapeHTML(config.text)}</div>
          ${results.length ? `<ul>${results.map(result => `<li>${escapeHTML(result)}</li>`).join("")}</ul>` : ""}
        </div>
      `
    });

    return true;
  }

  async requestWorshipperPrayer(item, preset = {}) {
    if (!item || item.type !== "worshipper") return false;

    const selection = await selectWorshipperRequest(item, preset);
    if (!selection) return false;

    const results = [];
    const beforeStrain = Number(item.system.strain?.value ?? 0);
    const maxStrain = Math.max(0, Number(item.system.strain?.max ?? item.system.level ?? 0));
    if (selection.strainDelta) {
      const changed = await this.adjustAttachmentStrain(item, selection.strainDelta, "Worshipper Request Risk");
      const nextStrain = clamp(beforeStrain + Number(selection.strainDelta ?? 0), 0, maxStrain);
      results.push(changed
        ? `${item.name}: Strain ${beforeStrain} -> ${nextStrain} / ${maxStrain}.`
        : `${item.name}: Strain could not be adjusted.`);
    }

    const resourceResults = await this.#applyWorshipperResourceChange(selection);
    results.push(...resourceResults);

    const requestLog = Array.isArray(item.system.requestLog) ? item.system.requestLog : [];
    const entry = {
      order: requestLog.length + 1,
      actorUuid: this.uuid,
      actorName: this.name,
      itemUuid: item.uuid,
      itemName: item.name,
      requestType: selection.requestType,
      request: selection.request,
      cost: selection.cost,
      risk: selection.risk,
      consequence: selection.consequence,
      result: selection.result,
      notes: selection.notes,
      strainDelta: selection.strainDelta,
      resource: selection.resource,
      resourceDelta: selection.resourceDelta,
      createdAt: new Date().toISOString()
    };

    await item.update({
      "system.requestType": selection.requestType,
      "system.currentRisk": selection.risk,
      "system.riskNotes": paragraph(selection.consequence || selection.notes),
      "system.requestLog": [...requestLog, entry].slice(-50)
    });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: worshipperRequestCard(this, item, selection, results)
    });

    return true;
  }

  async #applyWorshipperResourceChange(selection) {
    const resource = selection.resource;
    const delta = Number(selection.resourceDelta ?? 0);
    if (!resource || !delta) return [];

    const path = `system.resources.${resource}`;
    const current = foundry.utils.getProperty(this, path);

    if (typeof current === "number") {
      const next = Math.max(0, current + delta);
      await this.update({ [path]: next });
      return [`${resourceLabel(resource)} ${current} -> ${next}.`];
    }

    if (current && typeof current === "object") {
      const value = Number(current.value ?? 0);
      const max = Number(current.max ?? value);
      const next = Math.max(0, Math.min(max, value + delta));
      await this.update({ [`${path}.value`]: next });
      return [`${resourceLabel(resource)} ${value} -> ${next}.`];
    }

    return [`${resourceLabel(resource)} change ${signedNumber(delta)} recorded; no matching actor resource path.`];
  }

  async #createFailingFromAttachment(item) {
    if (!item || item.type === "curse") return null;

    const [failing] = await this.createEmbeddedDocuments("Item", [{
      name: `Failing: ${item.name}`,
      type: "curse",
      img: "icons/magic/unholy/silhouette-robe-evil-power.webp",
      system: {
        source: item.name,
        trigger: "Lost Attachment",
        pantheonDice: 0,
        effect: `<p>${escapeHTML(item.name)} was lost or cut away. Define the exact Failing with the GM using the PTG2E Losing Bonds guidance.</p>`,
        notes: sourceNotes(item),
        rules: sourceRules(`Failing created from losing ${item.name}.`, item, "curse"),
        usage: narrativeUsage("triggered"),
        automation: defaultAutomation()
      }
    }]);

    await item.delete();
    return failing;
  }

  async #spendUsageCosts(item) {
    const costs = Object.entries(item.system.usage?.cost ?? {})
      .map(([resource, amount]) => ({
        resource: normalizeResourceName(resource),
        amount: Number(amount ?? 0)
      }))
      .filter(cost => cost.amount > 0);

    if (!costs.length) return [];

    for (const cost of costs) {
      const current = actorResource(this, cost.resource);
      if (!current) continue;

      if (current.value < cost.amount) {
        ui.notifications.warn(`Not enough ${resourceLabel(cost.resource)}.`);
        return false;
      }
    }

    const results = [];

    for (const cost of costs) {
      const current = actorResource(this, cost.resource);
      if (!current) continue;

      await this.spendResource(cost.resource, cost.amount);
      results.push(`${resourceLabel(cost.resource)} -${cost.amount}.`);
    }

    return results;
  }

  async #applyItemAutomation(item) {
    const automation = item.system.automation ?? {};
    const results = [];

    if (automation.resourceChange) {
      const actors = this.#automationActors(item, automation.resourceChange);
      for (const actor of actors) {
        const result = await this.#applyResourceChange(actor, automation.resourceChange);
        if (result) results.push(result);
      }
    }

    if (automation.healing) {
      const actors = this.#automationActors(item, automation.healing);
      for (const actor of actors) {
        results.push(...await this.#applyHealing(actor, automation.healing));
      }
    }

    if (automation.damage) {
      const actors = this.#automationActors(item, automation.damage);
      for (const actor of actors) {
        const result = await this.#applyDamage(actor, automation.damage);
        if (result) results.push(result);
      }
    }

    if (automation.condition) {
      const actors = this.#automationActors(item, automation.condition);
      for (const actor of actors) {
        const result = await this.#applyConditionAutomation(actor, item, automation.condition);
        if (result) results.push(result);
      }
    }

    return results;
  }

  #automationActors(item, detail = {}) {
    const targetMode = String(detail.target ?? item.system.usage?.target ?? item.system.automation?.target ?? "self").toLowerCase();
    const wantsTargets = ["target", "targeted", "targets", "ally", "enemy", "enemies"].includes(targetMode);

    if (!wantsTargets) return [this];

    const actors = Array.from(game.user?.targets ?? [])
      .map(token => token.actor)
      .filter(actor => actor?.update);

    if (!actors.length) {
      ui.notifications.warn(`${item.name} needs at least one targeted token.`);
    }

    return actors;
  }

  async #applyResourceChange(actor, change) {
    const resource = normalizeResourceName(change.resource ?? change.key ?? "");
    const amount = Number(change.amount ?? change.value ?? 0);
    if (!resource || !Number.isFinite(amount) || amount === 0) return "";

    const current = actorResource(actor, resource);
    if (!current) return "";

    const next = clamp(current.value + amount, 0, current.max);
    await actor.update({ [current.path]: next });
    return `${actor.name}: ${resourceLabel(resource)} ${amount > 0 ? "+" : ""}${amount}.`;
  }

  async #applyHealing(actor, healing) {
    const updates = {};
    const results = [];

    for (const resource of ["health", "psyche"]) {
      const amount = Number(healing[resource] ?? healing.amount ?? 0);
      if (!amount) continue;

      const current = actorResource(actor, resource);
      if (!current) continue;

      const next = clamp(current.value + amount, 0, current.max);
      updates[current.path] = next;
      results.push(`${actor.name}: ${resourceLabel(resource)} healed ${next - current.value}.`);
    }

    if (Object.keys(updates).length) await actor.update(updates);

    const conditionAmount = Number(healing.conditions ?? healing.condition ?? 0);
    if (conditionAmount > 0) {
      const reduced = await this.#reduceOwnedConditions(actor, conditionAmount, healing.category ?? "");
      if (reduced.length) results.push(...reduced);
    }

    return results;
  }

  async #applyDamage(actor, damage) {
    const resource = damage.resource === "psyche" || damage.type === "mental" ? "psyche" : "health";
    const rawAmount = Number(damage.amount ?? damage.value ?? 0);
    if (!rawAmount) return "";

    const armor = resource === "health" && damage.applyArmor !== false ? Number(actor.system.derived?.armor ?? 0) : 0;
    const amount = Math.max(0, rawAmount - armor);
    const current = actorResource(actor, resource);
    if (!current) return "";

    const next = clamp(current.value - amount, 0, current.max);
    await actor.update({ [current.path]: next });
    return `${actor.name}: ${resourceLabel(resource)} took ${amount} damage${armor ? ` after ${armor} armor` : ""}.`;
  }

  async #applyConditionAutomation(actor, item, condition) {
    const action = condition.action ?? item.system.automation?.action ?? "";
    const amount = Number(condition.amount ?? condition.severity ?? item.system.severity ?? 1);

    if (action === "remove-condition" || condition.remove) {
      const removed = await this.#reduceOwnedConditions(actor, amount || 1, condition.category ?? "", condition.name ?? "");
      return removed.length ? removed.join(" ") : "";
    }

    if (item.type === "condition") {
      return `${actor.name}: ${item.name} is tracked at severity ${Number(item.system.severity ?? 1)}.`;
    }

    if (!condition.name) return "";

    await actor.createEmbeddedDocuments("Item", [{
      name: condition.name,
      type: "condition",
      img: "icons/svg/daze.svg",
      system: {
        category: condition.category ?? "",
        severity: Math.max(1, amount || 1),
        effect: condition.effect ? paragraph(condition.effect) : "",
        notes: item.system.notes ?? "",
        rules: sourceRules(condition.effect ?? `${condition.name} applied by ${item.name}.`, item, "condition"),
        usage: narrativeUsage("passive"),
        automation: defaultAutomation()
      }
    }]);

    return `${actor.name}: ${condition.name} condition applied.`;
  }

  async #reduceOwnedConditions(actor, amount, category = "", name = "") {
    const matches = actor.items
      .filter(item => item.type === "condition")
      .filter(item => !category || item.system.category === category)
      .filter(item => !name || item.name === name)
      .sort((a, b) => Number(b.system.severity ?? 1) - Number(a.system.severity ?? 1));
    const results = [];
    let remaining = Math.max(1, Number(amount ?? 1));

    for (const condition of matches) {
      if (remaining <= 0) break;

      const current = Number(condition.system.severity ?? 1);
      const next = Math.max(0, current - remaining);
      remaining -= current - next;

      if (next <= 0) {
        await condition.delete();
        results.push(`${actor.name}: ${condition.name} removed.`);
      } else {
        await condition.update({ "system.severity": next });
        results.push(`${actor.name}: ${condition.name} reduced to severity ${next}.`);
      }
    }

    return results;
  }

  async #postAutomationMessage(title, results, item = null) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: await this.#renderItemUseCard({ item, title, results })
    });
  }

  async #renderItemUseCard({ item = null, title = "", results = [] } = {}) {
    const usage = item?.system.usage ?? {};
    const rules = item?.system.rules ?? {};
    const source = rules.source ?? {};
    const costs = Object.entries(usage.cost ?? {})
      .map(([resource, amount]) => ({
        resource: normalizeResourceName(resource),
        label: resourceLabel(normalizeResourceName(resource)),
        amount: Number(amount ?? 0)
      }))
      .filter(cost => cost.amount > 0);
    const remaining = costs
      .map(cost => {
        const resource = actorResource(this, cost.resource);
        if (!resource) return null;

        return {
          label: cost.label,
          value: resource.value,
          max: resource.max === Number.MAX_SAFE_INTEGER ? null : resource.max
        };
      })
      .filter(Boolean);

    return renderTemplate("systems/part-time-gods/templates/chat/item-use-card.hbs", {
      title: title || item?.name || "Part-Time Gods",
      actorName: this.name,
      itemName: item?.name ?? "",
      itemType: item ? typeLabel(item.type) : "",
      summary: rules.summary ?? "",
      effect: item?.system.effect ?? item?.system.benefit ?? item?.system.description ?? "",
      source: source.book ? {
        book: source.book,
        page: source.page ?? null,
        section: source.section ?? ""
      } : null,
      usage: usage.kind ? {
        kind: usage.kind,
        trigger: usage.trigger ?? "",
        target: usage.target ?? ""
      } : null,
      costs,
      remaining,
      results: results.map(result => ({ text: result }))
    });
  }
}

async function selectOccupationCareer(item, selectionOptions = {}) {
  const careers = Array.from(item.system.careerOptions ?? []);
  if (!careers.length) return null;

  const options = careerAttachmentOptions(careers);
  const requestedOption = String(selectionOptions.occupationCareerOption ?? "");
  if (requestedOption) {
    const [careerIndex, attachmentIndex] = requestedOption.split(":").map(value => Number(value));
    const option = options.find(entry => entry.careerIndex === careerIndex && entry.attachmentIndex === attachmentIndex);
    if (option) {
      return {
        career: careers[option.careerIndex],
        attachment: careers[option.careerIndex].attachments?.[option.attachmentIndex] ?? null
      };
    }
  }

  if (options.length === 1) {
    const option = options[0];
    return {
      career: careers[option.careerIndex],
      attachment: careers[option.careerIndex].attachments?.[option.attachmentIndex] ?? null
    };
  }

  const content = `
    <div class="ptg-career-dialog">
      <div class="form-group">
        <label>Career and Attachment</label>
        <select name="careerOption">
          ${options.map((option, index) => `<option value="${index}">${escapeHTML(option.label)}</option>`).join("")}
        </select>
      </div>
      <div class="ptg-career-options">
        ${careers.map(careerSummaryHTML).join("")}
      </div>
    </div>
  `;

  const index = await DialogV2.prompt({
    window: { title: `Choose ${item.name} Career` },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Apply",
      callback: (event, button) => Number(button.form.elements.careerOption?.value ?? 0)
    }
  });

  if (index === null || index === undefined) return false;

  const option = options[index] ?? options[0];
  return {
    career: careers[option.careerIndex],
    attachment: careers[option.careerIndex].attachments?.[option.attachmentIndex] ?? null
  };
}

async function selectArchetypeOptions(item) {
  const attachments = Array.from(item.system.attachmentOptions ?? []);
  const blessings = Array.from(item.system.blessingOptions ?? []);
  const curses = Array.from(item.system.curseOptions ?? []);
  if (!attachments.length && !blessings.length && !curses.length) return null;

  const content = `
    <div class="ptg-career-dialog">
      ${selectFieldHTML("attachmentOption", "Attachment", attachments.map(attachmentLabel))}
      ${selectFieldHTML("blessingOption", "Blessing", blessings.map(option => option.name ?? "Blessing"))}
      ${selectFieldHTML("curseOption", "Curse", curses.map(option => option.name ?? "Curse"))}
      <div class="ptg-career-options">
        ${archetypeOptionsHTML("Blessings", blessings)}
        ${archetypeOptionsHTML("Curses", curses)}
      </div>
    </div>
  `;

  const selection = await DialogV2.prompt({
    window: { title: `Choose ${item.name} Options` },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Apply",
      callback: (event, button) => ({
        attachmentIndex: Number(button.form.elements.attachmentOption?.value ?? 0),
        blessingIndex: Number(button.form.elements.blessingOption?.value ?? 0),
        curseIndex: Number(button.form.elements.curseOption?.value ?? 0)
      })
    }
  });

  if (selection === null || selection === undefined) return false;

  return {
    attachment: attachments[selection.attachmentIndex] ?? null,
    blessing: blessings[selection.blessingIndex] ?? null,
    curse: curses[selection.curseIndex] ?? null
  };
}

async function selectDomainOptions(item, actor) {
  const attachments = normalizeAttachmentGrants(item.system.grants?.attachments ?? {});
  const landmark = attachments.find(attachment => attachment.kind === "landmark");
  const blessings = Array.from(item.system.blessingOptions ?? []);
  const curses = Array.from(item.system.curseOptions ?? []);
  const defaultTitle = actor.system.identity?.concept || `God/dess of ${item.system.portfolio || item.name}`;
  const defaultPortfolio = item.system.specificPortfolio || item.system.portfolio || item.name;
  const defaultLandmark = item.system.landmarkBondName || landmark?.name || `${item.name} Landmark`;

  const content = `
    <div class="ptg-career-dialog">
      <div class="form-group">
        <label>Divine Title</label>
        <input type="text" name="title" value="${escapeHTML(defaultTitle)}" placeholder="God of Storms">
      </div>
      <div class="form-group">
        <label>Specific Portfolio</label>
        <input type="text" name="portfolio" value="${escapeHTML(defaultPortfolio)}" placeholder="Storms, snipers, old city gates">
      </div>
      <div class="form-group">
        <label>Dominion Scope</label>
        <select name="specificity">
          <option value="specific" ${item.system.specificity !== "broad" ? "selected" : ""}>Specific Dominion</option>
          <option value="broad" ${item.system.specificity === "broad" ? "selected" : ""}>Broad Dominion</option>
        </select>
      </div>
      <div class="form-group">
        <label>Limitations</label>
        <textarea name="limitations">${escapeHTML(htmlToText(item.system.limitations ?? ""))}</textarea>
      </div>
      <div class="form-group">
        <label>GM Notes</label>
        <textarea name="gmNotes">${escapeHTML(htmlToText(item.system.gmNotes ?? ""))}</textarea>
      </div>
      <div class="form-group">
        <label>Landmark Bond</label>
        <input type="text" name="landmarkName" value="${escapeHTML(defaultLandmark)}">
      </div>
      <div class="form-group">
        <label>Landmark Location</label>
        <input type="text" name="landmarkLocation" value="${escapeHTML(landmark?.location ?? "")}">
      </div>
      ${selectFieldHTML("blessingOption", "Dominion Blessing", blessings.map(option => option.name ?? "Blessing"))}
      ${selectFieldHTML("curseOption", "Dominion Curse", curses.map(option => option.name ?? "Curse"))}
      <div class="ptg-career-options">
        ${archetypeOptionsHTML("Blessings", blessings)}
        ${archetypeOptionsHTML("Curses", curses)}
      </div>
    </div>
  `;

  const selection = await DialogV2.prompt({
    window: { title: `Define ${item.name} Dominion` },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Apply",
      callback: (event, button) => ({
        title: button.form.elements.title?.value?.trim() ?? "",
        portfolio: button.form.elements.portfolio?.value?.trim() ?? "",
        specificity: button.form.elements.specificity?.value ?? "specific",
        limitations: button.form.elements.limitations?.value?.trim() ?? "",
        gmNotes: button.form.elements.gmNotes?.value?.trim() ?? "",
        landmarkName: button.form.elements.landmarkName?.value?.trim() ?? "",
        landmarkLocation: button.form.elements.landmarkLocation?.value?.trim() ?? "",
        blessingIndex: Number(button.form.elements.blessingOption?.value ?? -1),
        curseIndex: Number(button.form.elements.curseOption?.value ?? -1)
      })
    }
  });

  if (selection === null || selection === undefined) return false;

  if (!selection.title || !selection.portfolio || !selection.landmarkName) {
    ui.notifications.warn("Dominion title, specific portfolio, and Landmark Bond are required.");
    return false;
  }

  if ((blessings.length && selection.blessingIndex < 0) || (curses.length && selection.curseIndex < 0)) {
    ui.notifications.warn("Choose one Dominion Blessing and one Dominion Curse.");
    return false;
  }

  return {
    ...selection,
    blessing: blessings[selection.blessingIndex] ?? null,
    curse: curses[selection.curseIndex] ?? null
  };
}

function selectFieldHTML(name, label, options) {
  if (!options.length) return "";

  return `
    <div class="form-group">
      <label>${escapeHTML(label)}</label>
      <select name="${name}">
        ${options.map((option, index) => `<option value="${index}">${escapeHTML(option)}</option>`).join("")}
      </select>
    </div>
  `;
}

function archetypeOptionsHTML(title, options) {
  if (!options.length) return "";

  return `
    <section class="ptg-career-option">
      <h3>${escapeHTML(title)}</h3>
      ${options.map(option => `<p><strong>${escapeHTML(option.name ?? "")}:</strong> ${escapeHTML(option.effect ?? "")}</p>`).join("")}
    </section>
  `;
}

async function selectUndecidedTheologyGrants(item) {
  const skillPoints = Number(item.system.skillPoints ?? 8);
  const manifestationPoints = Number(item.system.manifestationPoints ?? 2);
  const skillEntries = Object.entries(CONFIG.PTG.skills ?? {});
  const manifestationEntries = Object.entries(CONFIG.PTG.manifestations ?? {});

  const content = `
    <div class="ptg-career-dialog">
      <p>Choose ${skillPoints} different Skills and ${manifestationPoints} different Manifestations.</p>
      <div class="ptg-career-options">
        <section class="ptg-career-option">
          <h3>Skills</h3>
          ${Array.from({ length: skillPoints }, (_, index) => selectFromEntriesHTML(`skill${index}`, skillEntries)).join("")}
        </section>
        <section class="ptg-career-option">
          <h3>Manifestations</h3>
          ${Array.from({ length: manifestationPoints }, (_, index) => selectFromEntriesHTML(`manifestation${index}`, manifestationEntries)).join("")}
        </section>
      </div>
    </div>
  `;

  const selection = await DialogV2.prompt({
    window: { title: `Choose ${item.name} Grants` },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Apply",
      callback: (event, button) => ({
        skills: Array.from({ length: skillPoints }, (_, index) => button.form.elements[`skill${index}`]?.value).filter(Boolean),
        manifestations: Array.from({ length: manifestationPoints }, (_, index) => button.form.elements[`manifestation${index}`]?.value).filter(Boolean)
      })
    }
  });

  if (selection === null || selection === undefined) return false;

  if (new Set(selection.skills).size !== skillPoints || new Set(selection.manifestations).size !== manifestationPoints) {
    ui.notifications.warn("Undecided gods must choose each Skill and Manifestation only once.");
    return false;
  }

  return {
    skills: Object.fromEntries(selection.skills.map(skill => [skill, 1])),
    manifestations: Object.fromEntries(selection.manifestations.map(manifestation => [manifestation, 1])),
    resources: { freeTime: 3 }
  };
}

function selectFromEntriesHTML(name, entries) {
  return `
    <select name="${name}">
      ${entries.map(([key, label]) => `<option value="${escapeHTML(key)}">${escapeHTML(label)}</option>`).join("")}
    </select>
  `;
}

function careerAttachmentOptions(careers) {
  return careers.flatMap((career, careerIndex) => {
    const attachments = Array.isArray(career.attachments) && career.attachments.length ? career.attachments : [null];
    return attachments.map((attachment, attachmentIndex) => ({
      careerIndex,
      attachmentIndex,
      label: `${career.name} - ${attachment ? attachmentLabel(attachment) : "No Attachment"}`
    }));
  });
}

function attachmentLabel(attachment) {
  return `Level ${attachment.level ?? 1} ${attachment.name} (${kindCode(attachment.kind)})`;
}

async function selectAttachmentDefinitions(attachments, sourceItem) {
  const normalized = normalizeAttachmentGrants(attachments);
  const definable = normalized.filter(attachmentRequiresDefinition);
  if (!definable.length) return normalized;

  const content = `
    <div class="ptg-attachment-definition-dialog">
      ${normalized.map((attachment, index) => `
        <section class="ptg-career-option">
          <h3>${escapeHTML(attachmentLabel(attachment))}</h3>
          <div class="form-group">
            <label>Selected Choice</label>
            <input type="text" name="choice.${index}" value="${escapeHTML(attachment.choiceLabel ?? attachment.name ?? "")}" readonly>
          </div>
          <div class="form-group">
            <label>Definition</label>
            <input type="text" name="definition.${index}" value="${escapeHTML(attachment.definition ?? "")}" placeholder="${escapeHTML(attachmentDefinitionPlaceholder(attachment))}">
          </div>
        </section>
      `).join("")}
    </div>
  `;

  const definitions = await DialogV2.prompt({
    window: { title: `Define ${sourceItem.name} Attachments` },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Apply",
      callback: (event, button) => normalized.map((attachment, index) => ({
        ...attachment,
        definition: button.form.elements[`definition.${index}`]?.value?.trim() ?? attachment.definition ?? ""
      }))
    }
  });

  if (definitions === null || definitions === undefined) return false;

  const missing = definitions.filter(attachment => attachmentRequiresDefinition(attachment) && !attachment.definition);
  if (missing.length) {
    ui.notifications.warn("Define each selected Attachment before applying it.");
    return false;
  }

  return definitions;
}

function attachmentRequiresDefinition(attachment) {
  if (!attachment) return false;
  return attachment.requiresDefinition !== false;
}

function attachmentDefinitionPlaceholder(attachment) {
  return {
    individual: "Specific person or relationship",
    group: "Specific group or relationship",
    landmark: "Specific place, landmark, or holding",
    worshipper: "Worshipper group",
    vassal: "Vassal concept",
    relic: "Relic description",
    truth: "Truth statement",
    choice: "Chosen Attachment"
  }[attachment.kind] ?? "What this Attachment means in the fiction";
}

async function selectWorshipperRequest(item, preset = {}) {
  const content = `
    <div class="ptg-advancement-dialog">
      <div class="form-group">
        <label>Request Type</label>
        <select name="requestType">
          <option value="prayer">Prayer</option>
          <option value="request">Request</option>
          <option value="offering">Offering</option>
          <option value="support">Support</option>
          <option value="risk">Risk / Trouble</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div class="form-group">
        <label>Request</label>
        <textarea name="request" rows="3" placeholder="What the god asks or what the worshippers pray for">${escapeHTML(preset.request ?? "")}</textarea>
      </div>
      <div class="form-group">
        <label>Benefit</label>
        <div class="ptg-sheet-note">${item.system.benefit || item.system.summary || "No Worshipper benefit text recorded."}</div>
      </div>
      <div class="ptg-item-fields three">
        <label>
          <span>Cost</span>
          <input type="text" name="cost" value="${escapeHTML(preset.cost ?? "")}" placeholder="Time, offering, promise, scene cost">
        </label>
        <label>
          <span>Risk</span>
          <select name="risk">
            <option value="none">None</option>
            <option value="exposure">Exposure</option>
            <option value="demand">Demand</option>
            <option value="harm">Harm</option>
            <option value="obligation">Obligation</option>
            <option value="schism">Internal Trouble</option>
            <option value="strain">Strain</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <label>
          <span>Strain Delta</span>
          <input type="number" name="strainDelta" value="1">
        </label>
      </div>
      <div class="ptg-item-fields two">
        <label>
          <span>Resource</span>
          <select name="resource">
            <option value="">No resource change</option>
            <option value="fragments">Fragments</option>
            <option value="freeTime">Free Time</option>
            <option value="wealth">Wealth</option>
            <option value="pantheon">Pantheon Dice</option>
          </select>
        </label>
        <label>
          <span>Resource Delta</span>
          <input type="number" name="resourceDelta" value="0">
        </label>
      </div>
      <div class="form-group">
        <label>Consequence</label>
        <textarea name="consequence" rows="3" placeholder="Exposure, danger, obligation, harm, schism, or demand"></textarea>
      </div>
      <div class="form-group">
        <label>Result</label>
        <textarea name="result" rows="3" placeholder="How the prayer/request resolves"></textarea>
      </div>
      <div class="form-group">
        <label>GM Notes</label>
        <textarea name="notes" rows="3"></textarea>
      </div>
    </div>
  `;

  return DialogV2.prompt({
    window: { title: `${item.name}: Worshipper Prayer / Request` },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Post Request",
      callback: (event, button) => ({
        requestType: button.form.elements.requestType?.value ?? "request",
        request: button.form.elements.request?.value?.trim() ?? "",
        cost: button.form.elements.cost?.value?.trim() ?? "",
        risk: button.form.elements.risk?.value ?? "none",
        strainDelta: Number(button.form.elements.strainDelta?.value ?? 0),
        resource: button.form.elements.resource?.value ?? "",
        resourceDelta: Number(button.form.elements.resourceDelta?.value ?? 0),
        consequence: button.form.elements.consequence?.value?.trim() ?? "",
        result: button.form.elements.result?.value?.trim() ?? "",
        notes: button.form.elements.notes?.value?.trim() ?? ""
      })
    }
  });
}

function worshipperRequestCard(actor, item, selection, results) {
  const level = Number(item.system.level ?? 1);
  return `
    <div class="ptg-chat-card">
      <h3>${escapeHTML(item.name)} ${escapeHTML(labelCase(selection.requestType))}</h3>
      <div><strong>Actor:</strong> ${escapeHTML(actor.name)}</div>
      <div><strong>Worshippers:</strong> ${escapeHTML(item.system.group || item.name)} (Level ${level})</div>
      ${selection.request ? `<div><strong>Request:</strong> ${escapeHTML(selection.request)}</div>` : ""}
      <div><strong>Benefit:</strong> ${item.system.benefit || escapeHTML(item.system.summary || "No benefit recorded.")}</div>
      ${selection.cost ? `<div><strong>Cost:</strong> ${escapeHTML(selection.cost)}</div>` : ""}
      <div><strong>Risk:</strong> ${escapeHTML(labelCase(selection.risk))}</div>
      ${selection.consequence ? `<div><strong>Consequence:</strong> ${escapeHTML(selection.consequence)}</div>` : ""}
      ${selection.result ? `<div><strong>Result:</strong> ${escapeHTML(selection.result)}</div>` : ""}
      ${results.length ? `<ul>${results.map(result => `<li>${escapeHTML(result)}</li>`).join("")}</ul>` : ""}
      ${selection.notes ? `<div><strong>GM Notes:</strong> ${escapeHTML(selection.notes)}</div>` : ""}
    </div>
  `;
}

function isAttachmentItem(item) {
  return ["bond", "worshipper", "vassal"].includes(item?.type);
}

function attachmentTypeLabel(item) {
  if (item.type === "bond") return `${kindLabel(item.system.kind)} Bond`;
  if (item.type === "worshipper") return "Worshippers";
  if (item.type === "vassal") return "Vassal";
  return typeLabel(item.type);
}

function attachmentActionConfig(action, item) {
  const label = attachmentTypeLabel(item);
  const worshipper = item.type === "worshipper";
  const vassal = item.type === "vassal";
  const bond = item.type === "bond";

  return {
    favor: {
      title: worshipper ? "Prayer / Request" : vassal ? "Vassal Task" : "Favor",
      reason: `${label} Favor Requested`,
      strainDelta: 1,
      text: worshipper
        ? "The god calls on these Worshippers for prayer, offerings, action, or support. Apply the listed benefit and table rulings, then track Strain."
        : vassal
          ? "The god directs this Vassal to act. Apply its benefit, loyalty, and limits, then track Strain."
          : "The god asks this Bond for help. Apply the Favor details from the Bond rules, related bonus, or table agreement."
    },
    lead: {
      title: "Lead",
      reason: `${label} Lead`,
      strainDelta: 1,
      text: "The god takes the Lead through this Attachment. Use the Attachment's related bonus, position in the fiction, and current Strain to resolve the action."
    },
    "follow-up": {
      title: "Follow-up",
      reason: `${label} Follow-up`,
      strainDelta: 1,
      text: "The god asks this Attachment for a Follow-up after prior help. Apply any free Follow-up exceptions from Blessings, then track Strain if it is not free."
    },
    devote: {
      title: "Devote Scene",
      reason: `${label} Devote Scene`,
      strainDelta: -1,
      text: "The god devotes a Scene to this Attachment. Reduce Strain where the fiction supports recovery and note what attention or care was given."
    },
    "split-attention": {
      title: "Split Attention",
      strainDelta: 0,
      text: "The god tries to balance this Attachment with another demand. Use this chat card to record the competing Scene, cost, or GM ruling."
    },
    delay: {
      title: "Delay",
      strainDelta: 0,
      text: "The god delays answering this Attachment's need. Note the postponed obligation and apply Strain or complications if the GM calls for them."
    },
    lose: {
      title: "Lost Attachment",
      strainDelta: 0,
      text: "This Attachment is lost or cut away. The system creates a Failing item as a prompt for the GM and player to define the lasting consequence."
    }
  }[action] ?? null;
}

function careerSummaryHTML(career) {
  const attachments = Array.isArray(career.attachments) && career.attachments.length
    ? career.attachments.map(attachment => `<li>${escapeHTML(attachmentLabel(attachment))}</li>`).join("")
    : "<li>No Attachment</li>";
  const blessing = concreteAbilityGrant(career.blessing);
  const curse = concreteAbilityGrant(career.curse);

  return `
    <section class="ptg-career-option">
      <h3>${escapeHTML(career.name)}</h3>
      <dl>
        <div><dt>Free Time</dt><dd>${Number(career.resources?.freeTime ?? 0)}</dd></div>
        <div><dt>Wealth</dt><dd>${Number(career.resources?.wealth ?? 0)}</dd></div>
      </dl>
      <strong>Attachments</strong>
      <ul>${attachments}</ul>
      ${blessing ? `<p><strong>Blessing - ${escapeHTML(blessing.name)}:</strong> ${escapeHTML(blessing.effect)}</p>` : ""}
      ${curse ? `<p><strong>Curse - ${escapeHTML(curse.name)}:</strong> ${escapeHTML(curse.effect)}</p>` : ""}
    </section>
  `;
}

function concreteAbilityGrant(grant) {
  if (!grant || typeof grant !== "object") return null;
  if (!grant.name || !grant.effect) return null;

  return grant;
}

function choiceGrants(baseGrants, { careerSelection = null, archetypeSelection = null, domainSelection = null, theologySelection = null } = {}) {
  const grants = {
    skills: { ...(baseGrants.skills ?? {}) },
    manifestations: { ...(baseGrants.manifestations ?? {}) },
    resources: { ...(baseGrants.resources ?? {}) },
    attachments: baseGrants.attachments ?? {},
    blessing: baseGrants.blessing ?? "",
    curse: baseGrants.curse ?? ""
  };

  if (careerSelection?.career) {
    grants.resources = {
      ...grants.resources,
      ...(careerSelection.career.resources ?? {})
    };
    grants.attachments = careerSelection.attachment ? [careerSelection.attachment] : [];
    grants.blessing = careerSelection.career.blessing ?? "";
    grants.curse = careerSelection.career.curse ?? "";
  }

  if (archetypeSelection) {
    grants.attachments = archetypeSelection.attachment ? [archetypeSelection.attachment] : [];
    grants.blessing = archetypeSelection.blessing ?? "";
    grants.curse = archetypeSelection.curse ?? "";
  }

  if (domainSelection) {
    const domainAttachments = normalizeAttachmentGrants(grants.attachments);
    if (!domainAttachments.some(attachment => attachment.kind === "landmark")) {
      domainAttachments.push({
        kind: "landmark",
        name: domainSelection.landmarkName,
        level: 1,
        label: "Landmark Bond"
      });
    }

    grants.attachments = domainAttachments.map(attachment => {
      if (attachment.kind !== "landmark") return attachment;

      return {
        ...attachment,
        name: domainSelection.landmarkName,
        location: domainSelection.landmarkLocation,
        linkedDominion: domainSelection.title
      };
    });
    grants.blessing = domainSelection.blessing ?? "";
    grants.curse = domainSelection.curse ?? "";
  }

  if (theologySelection) {
    grants.skills = {
      ...grants.skills,
      ...(theologySelection.skills ?? {})
    };
    grants.manifestations = {
      ...grants.manifestations,
      ...(theologySelection.manifestations ?? {})
    };
    grants.resources = {
      ...grants.resources,
      ...(theologySelection.resources ?? {})
    };
    grants.blessing = "";
    grants.curse = "";
  }

  return grants;
}

function syncStartingValues(updates, system) {
  for (const resource of ["freeTime", "wealth"]) {
    const valuePath = `system.resources.${resource}`;
    if (!(valuePath in updates)) continue;

    const nextValue = Number(updates[valuePath] ?? 0);
    const maxPath = `system.resources.${resource}Max`;
    const currentMax = Number(system.resources?.[`${resource}Max`] ?? 0);
    updates[maxPath] = Math.max(currentMax, nextValue);
  }

  const nextSpark = Number(updates["system.resources.spark"] ?? system.resources?.spark ?? 1);
  const fragmentMax = Math.max(0, nextSpark * 3);
  const currentFragments = system.resources?.fragments ?? {};

  updates["system.resources.fragments.max"] = Math.max(Number(currentFragments.max ?? 0), fragmentMax);

  if (!("system.resources.fragments.value" in updates) && Number(currentFragments.value ?? 0) === 0) {
    updates["system.resources.fragments.value"] = fragmentMax;
  }

  syncDerivedPool(updates, system, "health", "fortitude", nextSpark);
  syncDerivedPool(updates, system, "psyche", "discipline", nextSpark);
}

function syncDerivedPool(updates, system, resource, skill, spark) {
  const current = system.resources?.[resource] ?? {};
  const currentValue = Number(current.value ?? 0);
  const currentMax = Number(current.max ?? 0);
  const nextSkill = Number(updates[`system.skills.${skill}`] ?? system.skills?.[skill] ?? 0);
  const nextMax = Math.max(1, nextSkill + spark + 5);

  updates[`system.resources.${resource}.max`] = nextMax;

  if (currentValue >= currentMax) {
    updates[`system.resources.${resource}.value`] = nextMax;
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(Number(value ?? max), min), max);
}

function signedNumber(value) {
  const number = Number(value ?? 0);
  return `${number >= 0 ? "+" : ""}${number}`;
}

function labelCase(value) {
  return String(value ?? "")
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^./, char => char.toUpperCase());
}

function resourceActionLabel(action) {
  return {
    spend: "Resource Spend",
    restore: "Resource Restore",
    adjust: "Resource Adjustment",
    scene: "Scene Passage",
    session: "Session Resource Helper",
    goingToWork: "Going to Work"
  }[action] ?? "Resource Change";
}

function mortalityStateForAction(action) {
  return {
    dead: "dead",
    ghost: "ghost",
    reconstituting: "reconstituting",
    reconstitute: "alive",
    fragmentLoss: "alive",
    devour: "devoured"
  }[action] ?? "alive";
}

function mortalitySnapshot(actor) {
  const resources = actor.system.resources ?? {};
  return {
    state: actor.system.mortality?.state ?? "alive",
    health: {
      value: Number(resources.health?.value ?? 0),
      max: Number(resources.health?.max ?? 0)
    },
    psyche: {
      value: Number(resources.psyche?.value ?? 0),
      max: Number(resources.psyche?.max ?? 0)
    },
    fragments: {
      value: Number(resources.fragments?.value ?? 0),
      max: Number(resources.fragments?.max ?? 0)
    },
    permanentFragmentLoss: Number(resources.permanentFragmentLoss ?? 0)
  };
}

async function applyDevouredTargetUpdate(target, devourer, fragmentLoss, notes) {
  if (target.type !== "character") return;

  const resources = target.system.resources ?? {};
  const mortality = target.system.mortality ?? {};
  const permanentLoss = Math.max(0, Number(resources.permanentFragmentLoss ?? 0) + Math.max(0, Number(fragmentLoss ?? 0)));
  const fragmentMax = Math.max(0, (Number(resources.spark ?? 1) * 3) - permanentLoss);
  const logEntry = {
    order: (Array.isArray(mortality.log) ? mortality.log.length : 0) + 1,
    action: "devoured",
    state: "devoured",
    notes,
    actorUuid: target.uuid,
    actorName: target.name,
    devouredByUuid: devourer.uuid,
    devouredByName: devourer.name,
    permanentFragmentLossDelta: Math.max(0, Number(fragmentLoss ?? 0)),
    before: mortalitySnapshot(target),
    createdAt: new Date().toISOString()
  };

  logEntry.after = {
    ...logEntry.before,
    state: "devoured",
    permanentFragmentLoss: permanentLoss,
    fragments: {
      value: Math.min(Number(resources.fragments?.value ?? 0), fragmentMax),
      max: fragmentMax
    }
  };

  await target.update({
    "system.mortality.state": "devoured",
    "system.mortality.notes": notes,
    "system.mortality.lastTransitionAt": logEntry.createdAt,
    "system.mortality.devouredByUuid": devourer.uuid,
    "system.mortality.devouredByName": devourer.name,
    "system.resources.permanentFragmentLoss": permanentLoss,
    "system.resources.fragments.max": fragmentMax,
    "system.resources.fragments.value": logEntry.after.fragments.value,
    "system.mortality.log": [
      ...(Array.isArray(mortality.log) ? mortality.log : []),
      logEntry
    ].slice(-100)
  });
}

async function postMortalityCard(actor, entry) {
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="ptg-chat-card">
        <h3>${escapeHTML(mortalityActionLabel(entry.action))}</h3>
        <div><strong>Actor:</strong> ${escapeHTML(actor.name)}</div>
        <div><strong>State:</strong> ${escapeHTML(entry.before.state)} -> ${escapeHTML(entry.state)}</div>
        <div><strong>Health:</strong> ${entry.before.health.value}/${entry.before.health.max} -> ${entry.after.health.value}/${entry.after.health.max}</div>
        <div><strong>Psyche:</strong> ${entry.before.psyche.value}/${entry.before.psyche.max} -> ${entry.after.psyche.value}/${entry.after.psyche.max}</div>
        <div><strong>Fragments:</strong> ${entry.before.fragments.value}/${entry.before.fragments.max} -> ${entry.after.fragments.value}/${entry.after.fragments.max}</div>
        <div><strong>Permanent Fragment Loss:</strong> ${entry.before.permanentFragmentLoss} -> ${entry.after.permanentFragmentLoss}</div>
        ${entry.timer ? `<div><strong>Timer:</strong> ${escapeHTML(entry.timer)}</div>` : ""}
        ${entry.devourTargetName ? `<div><strong>Devouring Target:</strong> ${escapeHTML(entry.devourTargetName)}</div>` : ""}
        ${entry.notes ? `<div><strong>Notes:</strong> ${escapeHTML(entry.notes)}</div>` : ""}
      </div>
    `
  });
}

function mortalityActionLabel(action) {
  return {
    dead: "Divine Death",
    ghost: "Ghost State",
    reconstituting: "Reconstitution Timer",
    reconstitute: "Reconstituted",
    fragmentLoss: "Permanent Fragment Loss",
    devour: "Devouring",
    devoured: "Devoured"
  }[action] ?? "Divine Mortality";
}

function normalizeResourceName(resource) {
  return {
    freeTime: "freeTime",
    free_time: "freeTime",
    pantheonDice: "pantheon",
    pantheon_dice: "pantheon"
  }[resource] ?? resource;
}

function resourceLabel(resource) {
  return {
    freeTime: "Free Time",
    health: "Health",
    pantheon: "Pantheon Dice",
    psyche: "Psyche",
    fragments: "Fragments",
    wealth: "Wealth"
  }[resource] ?? resource;
}

function actorResource(actor, resource) {
  const nested = actor.system.resources?.[resource];

  if (typeof nested === "number") {
    const max = Number(actor.system.resources?.[`${resource}Max`] ?? Number.MAX_SAFE_INTEGER);
    return {
      path: `system.resources.${resource}`,
      value: Number(nested ?? 0),
      max: Number.isFinite(max) ? max : Number.MAX_SAFE_INTEGER
    };
  }

  if (nested && typeof nested === "object") {
    const value = Number(nested.value ?? 0);
    const max = Number(nested.max ?? Number.MAX_SAFE_INTEGER);
    return {
      path: `system.resources.${resource}.value`,
      value,
      max: Number.isFinite(max) ? max : Number.MAX_SAFE_INTEGER
    };
  }

  if (typeof actor.system?.[resource] === "number") {
    return {
      path: `system.${resource}`,
      value: Number(actor.system[resource] ?? 0),
      max: Number.MAX_SAFE_INTEGER
    };
  }

  return null;
}

function embeddedAttachmentItems(attachments, sourceItem) {
  const items = [];

  for (const attachment of normalizeAttachmentGrants(attachments)) {
    const level = Math.max(1, Number(attachment.level ?? 1));
    const definition = String(attachment.definition ?? "").trim();
    const name = definition || attachment.name;
    const label = attachment.label ?? `${kindLabel(attachment.kind)} Bond`;
    const choiceLabel = attachment.choiceLabel ?? attachment.name ?? label;
    const sourceName = sourceItem.name;
    const type = attachmentDocumentType(attachment.kind);
    const strain = {
      value: 0,
      max: level
    };
    const definitionText = definition ? `<p>Definition: ${escapeHTML(definition)}.</p>` : "";
    const common = {
      level,
      choiceSource: sourceName,
      choiceKind: attachment.choiceKind ?? attachment.kind,
      choiceLabel,
      definition,
      description: `<p>${escapeHTML(sourceName)} grants this ${escapeHTML(label.toLowerCase())}: ${escapeHTML(choiceLabel)}.</p>${definitionText}${attachment.linkedDominion ? `<p>Linked Dominion: ${escapeHTML(attachment.linkedDominion)}.</p>` : ""}`,
      notes: sourceNotes(sourceItem),
      rules: sourceRules(`${sourceName} grants ${label.toLowerCase()} ${level}.`, sourceItem, type),
      usage: narrativeUsage(type === "truth" || type === "relic" ? "active" : "narrative"),
      automation: defaultAutomation()
    };

    items.push({
      name,
      type,
      img: attachmentIcon(type),
      system: embeddedAttachmentSystem(type, attachment, sourceItem, common, strain)
    });
  }

  return items;
}

function embeddedAttachmentSystem(type, attachment, sourceItem, common, strain) {
  if (type === "bond") {
    return {
      ...common,
      kind: attachment.kind,
      location: attachment.location ?? attachment.definition ?? "",
      linkedDominionUuid: sourceItem.uuid ?? "",
      strain
    };
  }

  if (type === "worshipper") {
    return {
      ...common,
      group: attachment.definition || attachment.name,
      size: "",
      benefit: common.description,
      strain
    };
  }

  if (type === "vassal") {
    return {
      ...common,
      concept: attachment.definition || attachment.name,
      loyalty: 0,
      benefit: common.description,
      strain
    };
  }

  if (type === "relic") {
    return {
      ...common,
      cost: 0,
      bonus: "",
      effect: common.description
    };
  }

  if (type === "truth") {
    return {
      ...common,
      statement: attachment.definition || attachment.name,
      rank: levelFromCommon(common),
      cost: 0,
      fragmentCost: 0,
      activation: "Passive",
      effect: common.description
    };
  }

  return common;
}

function levelFromCommon(common) {
  return Math.max(1, Number(common.level ?? 1));
}

function attachmentDocumentType(kind) {
  if (["individual", "group", "landmark", "bond"].includes(kind)) return "bond";
  if (kind === "worshipper") return "worshipper";
  if (kind === "vassal") return "vassal";
  if (kind === "relic") return "relic";
  if (kind === "truth") return "truth";
  return "bond";
}

function attachmentIcon(type) {
  return {
    bond: "icons/sundries/documents/document-sealed-red.webp",
    worshipper: "icons/environment/people/group.webp",
    vassal: "icons/creatures/magical/spirit-undead-winged-blue.webp",
    relic: "icons/commodities/treasure/token-runed-os-grey.webp",
    truth: "icons/magic/symbols/rune-sigil-black-pink.webp"
  }[type] ?? "icons/svg/item-bag.svg";
}

function normalizeAttachmentGrants(attachments) {
  if (Array.isArray(attachments)) {
    return attachments.map(attachment => ({
      ...attachment,
      kind: attachment.kind,
      name: attachment.name,
      level: attachment.level ?? 1,
      label: attachment.label ?? attachmentGrantLabel(attachment.kind),
      choiceKind: attachment.choiceKind ?? attachment.kind,
      choiceLabel: attachment.choiceLabel ?? attachment.name,
      requiresDefinition: attachment.requiresDefinition !== false
    })).filter(attachment => attachment.name && attachment.kind);
  }

  return Object.entries(attachments ?? {}).flatMap(([key, value]) => {
    const config = ATTACHMENT_GRANTS[key];
    if (!config) return [];

    return {
      kind: config.kind,
      name: typeof value === "string" && value.trim() ? value : config.name,
      level: Math.max(1, isNumeric(value) ? Number(value) : config.defaultLevel),
      label: config.label,
      choiceKind: config.kind,
      choiceLabel: config.name,
      definition: typeof value === "string" && value.trim() ? value : "",
      requiresDefinition: true
    };
  });
}

function simpleEmbeddedItem(type, grant, sourceItem) {
  const detail = typeof grant === "object" && grant !== null ? grant : { name: grant };
  const sourceName = sourceItem.name;
  const label = typeLabel(type);
  const name = detail.name;
  const effect = detail.effect ?? `${label} granted by ${sourceName}.`;
  const system = {
    source: sourceName,
    trigger: "",
    effect: paragraph(effect),
    notes: sourceNotes(sourceItem),
    rules: mergeSourceRules(detail.rules, effect, sourceItem, type),
    usage: detail.usage ?? narrativeUsage(detail.usageKind ?? (type === "curse" ? "triggered" : "passive")),
    automation: {
      ...defaultAutomation(),
      ...(detail.automation ?? {})
    }
  };

  if (type === "blessing") system.bonus = detail.bonus ?? "";
  if (type === "curse") system.pantheonDice = detail.pantheonDice ?? 1;

  return {
    name,
    type,
    img: type === "blessing"
      ? "icons/magic/holy/prayer-hands-glowing-yellow.webp"
      : "icons/magic/unholy/silhouette-robe-evil-power.webp",
    system
  };
}

function theologyAbilityGrant(item, type) {
  const data = type === "blessing" ? item.system.blessingData : item.system.curseData;
  const name = data?.name || item.system.grants?.[type] || "";
  if (!name) return "";

  const summary = type === "blessing" ? item.system.blessingSummary : item.system.curseSummary;
  const effect = data?.effect || htmlToText(summary) || `${typeLabel(type)} granted by ${item.name}.`;
  return {
    ...(data ?? {}),
    name,
    effect,
    usageKind: data?.usageKind ?? (type === "curse" ? "triggered" : "passive")
  };
}

function mergeSourceRules(rules, effect, sourceItem, type) {
  const merged = sourceRules(rules?.summary ?? effect, sourceItem, type, rules?.fullText ?? paragraph(effect));
  if (rules?.source?.section) merged.source.section = rules.source.section;
  return merged;
}

function sourceRules(summary, sourceItem, type, fullText = "") {
  const source = sourceReference(sourceItem);

  return {
    summary,
    fullText: fullText || sourceItem.system.description || paragraph(summary),
    source: {
      ...source,
      type
    }
  };
}

function sourceReference(item) {
  return {
    book: "Part-Time Gods Second Edition",
    page: Number(item.getFlag?.("part-time-gods", "page") ?? item.flags?.["part-time-gods"]?.page ?? 0) || null,
    section: item.name,
    type: item.type
  };
}

function sourceNotes(item) {
  const source = sourceReference(item);
  return `<p>Source: ${escapeHTML(source.book)}${source.page ? `, p. ${source.page}` : ""}; ${escapeHTML(source.section)}.</p>`;
}

function paragraph(text) {
  return `<p>${escapeHTML(text)}</p>`;
}

function narrativeUsage(kind = "narrative") {
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

function defaultAutomation() {
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

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function htmlToText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function isNumeric(value) {
  return value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value));
}

function typeLabel(type) {
  return game.i18n.localize(`TYPES.Item.${type}`) || type;
}

function kindLabel(kind) {
  return {
    individual: "Individual",
    group: "Group",
    landmark: "Landmark",
    worshipper: "Worshipper",
    vassal: "Vassal",
    relic: "Relic",
    truth: "Truth"
  }[kind] ?? "Group";
}

function kindCode(kind) {
  return {
    individual: "I",
    group: "G",
    landmark: "L",
    worshipper: "W",
    vassal: "V",
    relic: "R",
    truth: "T"
  }[kind] ?? "G";
}

function attachmentGrantLabel(kind) {
  if (["individual", "group", "landmark"].includes(kind)) return `${kindLabel(kind)} Bond`;
  if (kind === "worshipper") return "Worshippers Entitlement";
  if (kind === "vassal") return "Vassal Entitlement";
  if (kind === "relic") return "Relic Entitlement";
  if (kind === "truth") return "Truth Entitlement";
  return `${kindLabel(kind)} Attachment`;
}

const ATTACHMENT_GRANTS = {
  individualBond: {
    label: "Individual Bond",
    kind: "individual",
    name: "Individual Bond",
    defaultLevel: 2
  },
  groupBond: {
    label: "Group Bond",
    kind: "group",
    name: "Group Bond",
    defaultLevel: 2
  },
  landmarkBond: {
    label: "Landmark Bond",
    kind: "landmark",
    name: "Landmark Bond",
    defaultLevel: 2
  }
};
