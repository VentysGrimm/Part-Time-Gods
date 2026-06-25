export class PTGDiceEngine {
  static async rollPool(poolSize, options = {}) {
    const difficulty = Number(options.difficulty ?? 0);
    const flavor = options.flavor ?? "";
    const sendToChat = options.sendToChat ?? true;
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
      criticalFailure: successes === 0 && ones > 0
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
      basePool,
      bonus,
      penalty,
      modifierDetails,
      flavor: `${actor.name}: ${primaryLabel} + ${secondaryLabel}`
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
      basePool,
      bonus,
      penalty,
      modifierDetails,
      flavor: `${actor.name}: ${manifestationLabel} + ${skillLabel}`
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

    const content = `
      <div class="ptg-chat-card">
        <h3>${flavor}</h3>
        <div>Base Pool: ${outcome.basePool}d10</div>
        <div>Modifiers: +${outcome.bonus} / -${outcome.penalty}</div>
        ${modifierRows}
        <div>Final Pool: ${outcome.poolSize}d10${outcome.fateDie ? " (Fate Die)" : ""}</div>
        <div>Successes: ${outcome.successes}</div>
        <div>Difficulty: ${outcome.difficulty}</div>
        <div>Margin: ${outcome.margin}</div>
        <strong>${resultText}</strong>
      </div>
    `;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker(),
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
