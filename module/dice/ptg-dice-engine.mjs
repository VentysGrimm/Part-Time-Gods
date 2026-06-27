export class PTGDiceEngine {
  static async rollPool(poolSize, options = {}) {
    const difficulty = Number(options.difficulty ?? 0);
    const flavor = options.flavor ?? "";
    const sendToChat = options.sendToChat ?? true;
    const actor = options.actor ?? null;
    const basePool = Number(options.basePool ?? poolSize);
    const bonus = Number(options.bonus ?? 0);
    const penalty = Number(options.penalty ?? 0);
    const modifierDetails = options.modifierDetails ?? {};
    const finalPool = Number(poolSize);
    const fateDie = finalPool <= 0;
    const dice = fateDie ? 1 : Math.max(1, finalPool);
    const roll = await new Roll(`${dice}d10`).evaluate({ async: true });

    let successes = 0;
    let ones = 0;

    for (const result of roll.dice[0]?.results ?? []) {
      const value = result.result;

      if (fateDie) {
        if (value === 10) successes = 1;
      } else if (value === 10) successes += 2;
      else if (value >= 7) successes += 1;

      if (value === 1) ones += 1;
    }

    const outcome = {
      roll,
      poolSize: finalPool,
      basePool,
      bonus,
      penalty,
      modifierDetails,
      dice,
      fateDie,
      successes,
      difficulty,
      passed: successes >= difficulty,
      margin: successes - difficulty,
      criticalFailure: successes === 0 && ones > 0,
      checkMode: options.checkMode ?? "standard",
      extended: options.extended ?? null,
      boostChoice: options.boostChoice ?? "",
      conditionWarnings: options.conditionWarnings ?? [],
      actor,
      actorUuid: options.actorUuid ?? actor?.uuid ?? "",
      actorName: options.actorName ?? actor?.name ?? "",
      sourceItemUuid: options.sourceItemUuid ?? "",
      sourceItemName: options.sourceItemName ?? "",
      reason: options.reason ?? (flavor || "Roll result")
    };

    if (sendToChat) await this.createChatCard(outcome, flavor);

    return outcome;
  }

  static async rollSkillCombo(actor, primarySkill, secondarySkill, options = {}) {
    const primary = Number(actor.system.skills?.[primarySkill] ?? 0);
    const secondary = Number(actor.system.skills?.[secondarySkill] ?? 0);
    const basePool = primary + secondary;
    const bonus = Number(options.bonus ?? 0);
    const penalty = Number(options.penalty ?? 0);
    const modifierDetails = sanitizeModifierDetails(options.modifierDetails);
    const modifierTotal = Object.values(modifierDetails).reduce((total, value) => total + Number(value ?? 0), 0);
    const primaryLabel = CONFIG.PTG.skills[primarySkill] ?? primarySkill;
    const secondaryLabel = CONFIG.PTG.skills[secondarySkill] ?? secondarySkill;

    return this.rollPool(basePool + bonus - penalty + modifierTotal, {
      ...options,
      actor,
      actorUuid: actor.uuid,
      actorName: actor.name,
      basePool,
      bonus,
      penalty,
      modifierDetails,
      flavor: options.flavor ?? `${actor.name}: ${primaryLabel} + ${secondaryLabel}`
    });
  }

  static async rollManifestation(actor, manifestation, skill, options = {}) {
    const divine = Number(actor.system.manifestations?.[manifestation] ?? 0);
    const mortal = Number(actor.system.skills?.[skill] ?? 0);
    const basePool = divine + mortal;
    const bonus = Number(options.bonus ?? 0);
    const penalty = Number(options.penalty ?? 0);
    const modifierDetails = sanitizeModifierDetails(options.modifierDetails);
    const modifierTotal = Object.values(modifierDetails).reduce((total, value) => total + Number(value ?? 0), 0);
    const manifestationLabel = CONFIG.PTG.manifestations[manifestation] ?? manifestation;
    const skillLabel = CONFIG.PTG.skills[skill] ?? skill;

    return this.rollPool(basePool + bonus - penalty + modifierTotal, {
      ...options,
      actor,
      actorUuid: actor.uuid,
      actorName: actor.name,
      basePool,
      bonus,
      penalty,
      modifierDetails,
      flavor: options.flavor ?? `${actor.name}: ${manifestationLabel} + ${skillLabel}`
    });
  }

  static async createChatCard(outcome, flavor = "") {
    const resultText = outcome.criticalFailure
      ? "Critical Failure"
      : outcome.passed
        ? "Success"
        : "Failure";
    const modifierRows = Object.entries(outcome.modifierDetails ?? {})
      .filter(([, value]) => Number(value ?? 0) !== 0)
      .map(([label, value]) => `<div>${escapeHTML(label)}: ${Number(value) >= 0 ? "+" : ""}${Number(value)}</div>`)
      .join("");
    const extendedProgress = outcome.extended
      ? Number(outcome.extended.current ?? 0) + outcome.successes
      : 0;
    const extendedRows = outcome.extended
      ? `
        <div>Extended Progress: ${extendedProgress} / ${Number(outcome.extended.target ?? 0)}</div>
        <div>Extended Result: ${extendedProgress >= Number(outcome.extended.target ?? 0) ? "Complete" : "In Progress"}</div>
      `
      : "";
    const boostRows = outcome.margin > 0
      ? `<div>Boost: ${escapeHTML(outcome.boostChoice || `${outcome.margin} extra success${outcome.margin === 1 ? "" : "es"} available`)}</div>`
      : "";
    const criticalRows = outcome.criticalFailure
      ? "<div>Consequence: The GM may introduce a complication, Condition, Strain, lost time, or other PTG2E setback.</div>"
      : "";
    const conditionRows = (outcome.conditionWarnings ?? []).length
      ? `
        <section>
          <h4>Active Conditions</h4>
          <ul>
            ${outcome.conditionWarnings.map(warning => `<li>${escapeHTML(warning)}</li>`).join("")}
          </ul>
        </section>
      `
      : "";
    const actorData = outcome.actorUuid ? ` data-actor-uuid="${escapeHTML(outcome.actorUuid)}"` : "";
    const itemData = outcome.sourceItemUuid ? ` data-item-uuid="${escapeHTML(outcome.sourceItemUuid)}"` : "";
    const damageAmount = Math.max(0, Number(outcome.margin ?? 0));
    const chatActions = `
      <div class="ptg-chat-actions">
        ${outcome.actorUuid ? `<button type="button" data-ptg-chat-action="open-actor">Open Actor</button>` : ""}
        <button type="button" data-ptg-chat-action="apply-damage" data-resource="health" data-amount="${damageAmount}" data-reason="Roll result">Health Damage</button>
        <button type="button" data-ptg-chat-action="apply-damage" data-resource="psyche" data-amount="${damageAmount}" data-apply-armor="false" data-reason="Roll result">Psyche Damage</button>
        <button type="button" data-ptg-chat-action="apply-condition" data-severity="${Math.max(1, damageAmount || 1)}" data-reason="Roll result">Apply Condition</button>
      </div>
    `;

    const content = `
      <div class="ptg-chat-card" data-ptg-chat-card="roll"${actorData}${itemData} data-margin="${outcome.margin}" data-successes="${outcome.successes}" data-reason="${escapeHTML(outcome.reason)}">
        <h3>${escapeHTML(flavor)}</h3>
        <div>Mode: ${escapeHTML(labelCase(outcome.checkMode))}</div>
        <div>Base Pool: ${outcome.basePool}d10</div>
        <div>Modifiers: +${outcome.bonus} / -${outcome.penalty}</div>
        ${modifierRows}
        <div>Final Pool: ${outcome.poolSize}d10${outcome.fateDie ? " (Fate Die)" : ""}</div>
        <div>Successes: ${outcome.successes}</div>
        <div>Difficulty: ${outcome.difficulty}</div>
        <div>Margin: ${outcome.margin}</div>
        ${extendedRows}
        ${boostRows}
        ${criticalRows}
        ${conditionRows}
        <strong>${resultText}</strong>
        ${chatActions}
      </div>
    `;

    await ChatMessage.create({
      speaker: outcome.actor ? ChatMessage.getSpeaker({ actor: outcome.actor }) : ChatMessage.getSpeaker(),
      content,
      rolls: [outcome.roll]
    });
  }
}

function sanitizeModifierDetails(details = {}) {
  return Object.fromEntries(
    Object.entries(details)
      .map(([key, value]) => [key, Number(value ?? 0)])
      .filter(([, value]) => Number.isFinite(value) && value !== 0)
  );
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

function labelCase(key) {
  return String(key ?? "")
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^./, char => char.toUpperCase());
}
