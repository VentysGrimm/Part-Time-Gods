import { applyConditionToActor, customConditionItem, openApplyConditionDialog } from "../conditions/condition-workflow.mjs";

const SYSTEM_ID = "part-time-gods";
const { DialogV2 } = foundry.applications.api;

const ACTION_LABELS = {
  round: "Round and Turn Sequence",
  quickAction: "Quick Action",
  standardAction: "Standard Action",
  quickDefense: "Quick Defense",
  standardDefense: "Standard Defense",
  reset: "Reset Combatant Actions",
  initiative: "Roll PTG Initiative",
  physicalDamage: "Physical Damage",
  mentalDamage: "Mental Damage",
  condition: "Apply Condition",
  battleFists: "Resolve Battle of Fists",
  battleWits: "Resolve Battle of Wits",
  healing: "Recover or Heal"
};

export function registerPTGCombatHooks() {
  Hooks.on("updateCombat", async (combat, changed) => {
    if (!game.user?.isGM || !("round" in changed)) return;
    await resetCombatRoundActions(combat);
  });
}

export async function openPTGCombatControls({ combat = game.combat } = {}) {
  if (!game.user?.isGM) {
    ui.notifications.warn("Only a GM can update PTG combat state.");
    return null;
  }

  if (!combat) {
    ui.notifications.warn("Start or open a Combat encounter before using PTG combat controls.");
    return null;
  }

  const selection = await selectCombatAction(combat);
  if (!selection) return null;

  if (selection.action === "initiative") {
    await rollPTGInitiative(combat);
    return postCombatCard({
      combat,
      title: ACTION_LABELS.initiative,
      body: "Rolled 1d10 plus each combatant actor's PTG initiative value."
    });
  }

  if (selection.action === "round") {
    return postCombatCard({
      combat,
      title: ACTION_LABELS.round,
      body: roundSequenceHTML()
    });
  }

  const combatant = combat.combatants.get(selection.combatantId);
  if (!combatant) {
    ui.notifications.warn("Choose a combatant for action and defense tracking.");
    return null;
  }

  if (["battleFists", "battleWits"].includes(selection.action)) {
    const defender = combat.combatants.get(selection.targetCombatantId);
    if (!defender?.actor) {
      ui.notifications.warn("Choose a defending combatant for Battle resolution.");
      return null;
    }

    const results = await resolveBattleOutcome(combatant.actor, defender.actor, selection);
    await postCombatCard({
      combat,
      combatant,
      title: ACTION_LABELS[selection.action],
      body: battleOutcomeHTML(results, selection, combatant, defender)
    });
    return combatant;
  }

  if (selection.action === "condition") {
    const target = combat.combatants.get(selection.targetCombatantId);
    await openApplyConditionDialog({
      sourceActor: combatant.actor,
      targetActor: target?.actor ?? combatant.actor,
      name: selection.conditionName,
      category: selection.conditionCategory,
      severity: selection.conditionSeverity,
      effect: selection.notes,
      reason: "GM manual ruling"
    });
    return combatant;
  }

  if (["physicalDamage", "mentalDamage", "healing"].includes(selection.action)) {
    const results = await applyCombatOutcome(combatant.actor, selection);
    await postCombatCard({
      combat,
      combatant,
      title: ACTION_LABELS[selection.action] ?? "Combat Outcome",
      body: combatOutcomeHTML(results, selection)
    });
    return combatant;
  }

  if (selection.action === "reset") {
    await setCombatantActionState(combatant, emptyActionState(combat.round));
  } else {
    await setCombatantActionState(combatant, {
      ...combatantActionState(combatant),
      round: combat.round,
      [selection.action]: true,
      notes: selection.notes
    });
  }

  await postCombatCard({
    combat,
    combatant,
    title: ACTION_LABELS[selection.action] ?? "Combat Action",
    body: combatActionHTML(selection)
  });

  return combatant;
}

export async function rollPTGInitiative(combat = game.combat) {
  if (!combat) return null;

  const updates = [];

  for (const combatant of combat.combatants) {
    const actor = combatant.actor;
    const initiative = actorInitiative(actor);
    const roll = await new Roll("1d10 + @initiative", { initiative }).evaluate();
    updates.push({ _id: combatant.id, initiative: roll.total });
  }

  if (updates.length) await combat.updateEmbeddedDocuments("Combatant", updates);
  return updates;
}

async function selectCombatAction(combat) {
  const combatantOptions = combat.combatants
    .map(combatant => `<option value="${escapeHTML(combatant.id)}">${escapeHTML(combatant.name)}</option>`)
    .join("");
  const targetOptions = combat.combatants
    .map(combatant => `<option value="${escapeHTML(combatant.id)}">${escapeHTML(combatant.name)}</option>`)
    .join("");
  const weaponOptions = combat.combatants
    .flatMap(combatant => actorWeapons(combatant.actor).map(item => ({
      combatant,
      item
    })))
    .map(({ combatant, item }) => `<option value="${escapeHTML(item.uuid)}">${escapeHTML(combatant.name)} - ${escapeHTML(item.name)} (${escapeHTML(weaponRangeLabel(item))}, +${Number(item.system.damage ?? 0)})</option>`)
    .join("");

  const content = `
    <div class="ptg-combat-dialog">
      <div class="ptg-territory-summary">
        <strong>${escapeHTML(combat.name ?? "Combat Encounter")}</strong>
        <span>Tracks PTG2E turn prompts, action use, attack/defense outcomes, damage, armor, Conditions, and recovery.</span>
      </div>
      <div class="form-group">
        <label>Actor / Attacker</label>
        <select name="combatantId">
          <option value="">Encounter helper only</option>
          ${combatantOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Defender / Target</label>
        <select name="targetCombatantId">
          <option value="">None</option>
          ${targetOptions}
        </select>
      </div>
      <div class="form-group">
        <label>Action</label>
        <select name="action">
          <option value="round">Post Round and Turn Sequence</option>
          <option value="initiative">Roll PTG Initiative</option>
          <option value="quickAction">Mark Quick Action Used</option>
          <option value="standardAction">Mark Standard Action Used</option>
          <option value="quickDefense">Mark Quick Defense Used</option>
          <option value="standardDefense">Mark Standard Defense Used</option>
          <option value="battleFists">Resolve Battle of Fists</option>
          <option value="battleWits">Resolve Battle of Wits</option>
          <option value="physicalDamage">Apply Physical Damage</option>
          <option value="mentalDamage">Apply Mental Damage</option>
          <option value="condition">Create or Update Condition</option>
          <option value="healing">Recover or Heal</option>
          <option value="reset">Reset Selected Combatant Actions</option>
        </select>
      </div>
      <div class="ptg-item-fields three">
        <div class="form-group">
          <label>Attack Successes</label>
          <input type="number" name="attackSuccesses" value="0" min="0">
        </div>
        <div class="form-group">
          <label>Defense Successes</label>
          <input type="number" name="defenseSuccesses" value="0" min="0">
        </div>
        <label class="ptg-checkbox">
          <span>Boost Damage</span>
          <input type="checkbox" name="boostDamage">
        </label>
      </div>
      <div class="ptg-item-fields two">
        <div class="form-group">
          <label>Weapon</label>
          <select name="weaponUuid">
            <option value="">Unarmed / no weapon</option>
            ${weaponOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Range / Damage Tag</label>
          <input type="text" name="damageTag" value="" placeholder="Close, Near, Far, bullets, fire, etc.">
        </div>
      </div>
      <div class="ptg-item-fields two">
        <div class="form-group">
          <label>Damage</label>
          <input type="number" name="damage" value="0" min="0">
        </div>
        <label class="ptg-checkbox">
          <span>Apply Equipped Armor to Physical Damage</span>
          <input type="checkbox" name="applyArmor" checked>
        </label>
      </div>
      <div class="ptg-item-fields three">
        <div class="form-group">
          <label>Condition Name</label>
          <input type="text" name="conditionName" value="">
        </div>
        <div class="form-group">
          <label>Category</label>
          <input type="text" name="conditionCategory" value="">
        </div>
        <div class="form-group">
          <label>Severity</label>
          <input type="number" name="conditionSeverity" value="1" min="1">
        </div>
      </div>
      <div class="ptg-item-fields two">
        <div class="form-group">
          <label>Healing Resource</label>
          <select name="healingResource">
            <option value="health">Health</option>
            <option value="psyche">Psyche</option>
          </select>
        </div>
        <div class="form-group">
          <label>Healing / Reduction</label>
          <input type="number" name="healingAmount" value="0" min="0">
        </div>
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea name="notes" rows="3" placeholder="Action, target, ruling, or reminder"></textarea>
      </div>
    </div>
  `;

  return DialogV2.prompt({
    window: {
      title: "PTG Combat Controls",
      resizable: true
    },
    position: {
      width: 620,
      height: 560
    },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Post",
      callback: (event, button) => {
        const form = button.form;
        return {
          combatantId: form.elements.combatantId?.value ?? "",
          targetCombatantId: form.elements.targetCombatantId?.value ?? "",
          action: form.elements.action?.value ?? "round",
          attackSuccesses: Number(form.elements.attackSuccesses?.value ?? 0),
          defenseSuccesses: Number(form.elements.defenseSuccesses?.value ?? 0),
          boostDamage: form.elements.boostDamage?.checked ?? false,
          weaponUuid: form.elements.weaponUuid?.value ?? "",
          damageTag: form.elements.damageTag?.value ?? "",
          damage: Number(form.elements.damage?.value ?? 0),
          applyArmor: form.elements.applyArmor?.checked ?? false,
          conditionName: form.elements.conditionName?.value ?? "",
          conditionCategory: form.elements.conditionCategory?.value ?? "",
          conditionSeverity: Number(form.elements.conditionSeverity?.value ?? 1),
          healingResource: form.elements.healingResource?.value ?? "health",
          healingAmount: Number(form.elements.healingAmount?.value ?? 0),
          notes: form.elements.notes?.value ?? ""
        };
      }
    }
  });
}

function actorInitiative(actor) {
  if (!actor) return 0;
  const base = actor.type === "character"
    ? Number(actor.system.derived?.initiative ?? 0)
    : Number(actor.system.initiative ?? actor.system.derived?.initiative ?? 0);
  return base + conditionCombatModifier(actor, "initiative");
}

async function resetCombatRoundActions(combat) {
  const updates = combat.combatants.map(combatant => ({
    _id: combatant.id,
    [`flags.${SYSTEM_ID}.combat`]: emptyActionState(combat.round)
  }));

  if (updates.length) await combat.updateEmbeddedDocuments("Combatant", updates);
}

async function setCombatantActionState(combatant, state) {
  await combatant.update({ [`flags.${SYSTEM_ID}.combat`]: state });
}

function combatantActionState(combatant) {
  return {
    ...emptyActionState(game.combat?.round ?? 1),
    ...(combatant.getFlag(SYSTEM_ID, "combat") ?? {})
  };
}

function emptyActionState(round) {
  return {
    round,
    quickAction: false,
    standardAction: false,
    quickDefense: false,
    standardDefense: false,
    notes: ""
  };
}

async function applyCombatOutcome(actor, selection) {
  if (!actor) return ["No actor is linked to this combatant."];

  const results = [];

  if (selection.action === "healing") {
    const result = await applyHealing(actor, selection);
    if (result) results.push(...result);
  }

  if (selection.action === "physicalDamage" || selection.action === "mentalDamage") {
    const resource = selection.action === "mentalDamage" ? "psyche" : "health";
    const result = await applyDamage(actor, {
      resource,
      amount: selection.damage,
      applyArmor: selection.action === "physicalDamage" && selection.applyArmor,
      damageTag: selection.damageTag
    });
    if (result) results.push(result);
  }

  if (selection.conditionName) {
    const result = await applyConditionToActor(actor, customConditionItem({
      name: selection.conditionName,
      category: selection.conditionCategory,
      severity: selection.conditionSeverity,
      effect: selection.notes,
      sourceSection: "Battle Outcome"
    }), {
      sourceActor: actor,
      reason: "Damage result"
    });
    if (result) results.push(result);
  }

  if (!results.length) results.push("No damage or Condition changes were applied.");
  return results;
}

async function resolveBattleOutcome(attacker, defender, selection) {
  const results = [];
  const weapon = selection.weaponUuid ? await fromUuid(selection.weaponUuid) : null;
  const attackSuccesses = Math.max(0, Number(selection.attackSuccesses ?? 0));
  const defenseModifier = conditionCombatModifier(defender, "defense");
  const defenseSuccesses = Math.max(0, Number(selection.defenseSuccesses ?? 0) + defenseModifier);
  const margin = attackSuccesses - defenseSuccesses;
  const resource = selection.action === "battleWits" ? "psyche" : "health";
  const weaponDamage = weapon?.type === "weapon" ? weaponDamageBonus(weapon) : 0;
  const boostDamage = selection.boostDamage ? boostDamageBonus(weapon) : 0;
  const flatDamage = Math.max(0, Number(selection.damage ?? 0));
  const conditionDamage = conditionCombatModifier(attacker, "damage");
  const rawDamage = Math.max(0, margin) + weaponDamage + boostDamage + flatDamage + conditionDamage;
  const damageTag = selection.damageTag || weaponRangeLabel(weapon);
  const armor = resource === "health" && selection.applyArmor
    ? actorArmor(defender) + armorProofBonus(defender, damageTag)
    : 0;
  const finalDamage = margin > 0 ? Math.max(0, rawDamage - armor) : 0;
  const weaponQualities = weapon?.type === "weapon" ? qualityEntries(weapon) : [];
  const armorQualities = resource === "health" && selection.applyArmor ? equippedArmorQualities(defender) : [];

  results.push(`${attacker.name} rolled ${attackSuccesses} successes against ${defender.name}'s ${defenseSuccesses} defense successes.`);
  if (defenseModifier) results.push(`${defender.name}: active Conditions changed Defense by ${signedNumber(defenseModifier)}.`);
  if (conditionDamage) results.push(`${attacker.name}: active Conditions changed damage by ${signedNumber(conditionDamage)}.`);
  if (margin <= 0) {
    results.push("Defender wins ties and equal-or-higher Defense results; no damage was applied.");
  } else {
    results.push(`Success margin ${margin}; raw damage ${rawDamage}${weapon ? ` with ${weapon.name}` : ""}${selection.boostDamage ? " and Boost damage" : ""}.`);
    if (armor) results.push(`${defender.name}'s armor reduced damage by ${armor}.`);
    results.push(await applyResourceDamage(defender, resource, finalDamage));
  }

  if (weapon?.type === "weapon") {
    results.push(`Weapon range: ${weaponRangeLabel(weapon)}. Weapon qualities: ${qualityNames(weaponQualities) || "none listed"}.`);
    results.push(...qualityCombatNotes("Weapon", weaponQualities, { boostDamage: selection.boostDamage }));
  }

  if (armorQualities.length) {
    results.push(`Equipped armor qualities: ${qualityNames(armorQualities)}.`);
    results.push(...qualityCombatNotes("Armor", armorQualities, { damageTag }));
  }

  if (selection.conditionName && margin > 0) {
    const conditionResult = await applyConditionToActor(defender, customConditionItem({
      name: selection.conditionName,
      category: selection.conditionCategory || (resource === "psyche" ? "mental" : "physical"),
      severity: selection.conditionSeverity,
      effect: selection.notes,
      sourceSection: "Battle Outcome"
    }), {
      sourceActor: attacker,
      sourceItem: weapon,
      reason: selection.boostDamage ? "Boost" : "Damage result"
    });
    if (conditionResult) results.push(conditionResult);
  }

  return results.filter(Boolean);
}

async function applyDamage(actor, { resource, amount, applyArmor, damageTag = "" }) {
  const resourceInfo = actorResource(actor, resource);
  const rawAmount = Math.max(0, Number(amount ?? 0));
  if (!resourceInfo || !rawAmount) return "";

  const armor = resource === "health" && applyArmor ? actorArmor(actor) + armorProofBonus(actor, damageTag) : 0;
  const finalAmount = Math.max(0, rawAmount - armor);
  const next = Math.max(0, resourceInfo.value - finalAmount);

  await actor.update({ [resourceInfo.path]: next });

  return `${actor.name}: ${resourceLabel(resource)} ${resourceInfo.value} -> ${next}; ${finalAmount} damage applied${armor ? ` after ${armor} armor` : ""}.`;
}

async function applyResourceDamage(actor, resource, amount) {
  const resourceInfo = actorResource(actor, resource);
  const finalAmount = Math.max(0, Number(amount ?? 0));
  if (!resourceInfo) return `${actor.name}: ${resourceLabel(resource)} could not be updated.`;

  const next = Math.max(0, resourceInfo.value - finalAmount);
  await actor.update({ [resourceInfo.path]: next });
  return `${actor.name}: ${resourceLabel(resource)} ${resourceInfo.value} -> ${next}; ${finalAmount} damage applied.`;
}

async function applyHealing(actor, selection) {
  const results = [];
  const amount = Math.max(0, Number(selection.healingAmount ?? 0));

  if (amount > 0) {
    const resource = selection.healingResource === "psyche" ? "psyche" : "health";
    const resourceInfo = actorResource(actor, resource);
    if (resourceInfo) {
      const next = Math.min(resourceInfo.max, resourceInfo.value + amount);
      await actor.update({ [resourceInfo.path]: next });
      results.push(`${actor.name}: ${resourceLabel(resource)} ${resourceInfo.value} -> ${next}; ${next - resourceInfo.value} recovered.`);
    }
  }

  if (selection.conditionName && amount > 0) {
    const condition = actor.items.find(item => item.type === "condition" && item.name === selection.conditionName);
    if (condition) {
      const current = Number(condition.system.severity ?? 1);
      const next = Math.max(0, current - amount);
      if (next <= 0) {
        await condition.delete();
        results.push(`${actor.name}: ${condition.name} removed.`);
      } else {
        await condition.update({ "system.severity": next });
        results.push(`${actor.name}: ${condition.name} reduced ${current} -> ${next}.`);
      }
    }
  }

  if (!results.length) results.push(`${actor.name}: No healing or Condition recovery was applied.`);
  return results;
}

function actorResource(actor, resource) {
  const data = actor.system.resources?.[resource];
  if (data && typeof data === "object") {
    return {
      path: `system.resources.${resource}.value`,
      value: Number(data.value ?? 0),
      max: Number(data.max ?? data.value ?? 0)
    };
  }

  if (actor.system[resource] !== undefined) {
    return {
      path: `system.${resource}`,
      value: Number(actor.system[resource] ?? 0),
      max: Number(actor.system[resource] ?? 0)
    };
  }

  return null;
}

function actorArmor(actor) {
  return Number(actor.system.derived?.armor ?? actor.system.armor ?? 0) + conditionCombatModifier(actor, "armor");
}

function conditionCombatModifier(actor, mode) {
  const effects = actor?.conditionRollEffects?.({ mode, checkMode: mode });
  return (effects?.modifiers ?? []).reduce((total, effect) => total + Number(effect.value ?? 0), 0);
}

function actorWeapons(actor) {
  return actor?.items
    ?.filter(item => item.type === "weapon")
    ?.filter(item => item.system.held !== false || item.system.equipped)
    ?? [];
}

function weaponDamageBonus(weapon) {
  const base = Math.max(0, Number(weapon.system.damage ?? 0));
  const brutal = qualityValue(weapon, "brutal");
  return brutal ? Math.max(base, brutal) : base;
}

function boostDamageBonus(weapon) {
  if (!weapon) return 1;
  const explosive = qualityValue(weapon, "explosive");
  if (explosive) return Math.max(2, explosive);
  return 1;
}

function armorProofBonus(actor, tag) {
  const needle = String(tag ?? "").trim().toLowerCase();
  if (!needle) return 0;

  return actor.items
    .filter(item => item.type === "armor" && item.system.equipped)
    .reduce((total, armor) => total + proofQualityBonus(armor, needle), 0);
}

function proofQualityBonus(armor, tag) {
  let bonus = 0;

  for (const quality of qualityEntries(armor)) {
    if (!quality.key?.endsWith("proof")) continue;
    const armorTag = quality.key.replace("-proof", "");
    if (!armorTag.includes(tag) && !tag.includes(armorTag)) continue;
    bonus += Number(quality.value ?? 2) || 2;
  }

  return bonus;
}

function equippedArmorQualities(actor) {
  return actor.items
    .filter(item => item.type === "armor" && item.system.equipped)
    .flatMap(item => qualityEntries(item));
}

function qualityEntries(item) {
  const structured = item?.system?.qualities;
  if (Array.isArray(structured) && structured.length) {
    return structured.map(quality => normalizeQuality(quality)).filter(Boolean);
  }

  return String(item?.system?.quality ?? "")
    .split(",")
    .map(entry => legacyQuality(entry))
    .filter(Boolean);
}

function normalizeQuality(quality) {
  const name = String(quality?.name ?? quality?.key ?? "").trim();
  if (!name) return null;

  return {
    key: quality.key || slugify(name),
    name,
    value: Number(quality.value ?? 0),
    supported: quality.supported === true,
    effect: quality.effect ?? "",
    automation: quality.automation ?? {},
    notes: quality.notes ?? ""
  };
}

function legacyQuality(entry) {
  const raw = String(entry ?? "").trim();
  if (!raw) return null;
  const match = raw.match(/^(.+?)(?:\s+(\d+))?$/);
  const name = titleCase(match?.[1] ?? raw);
  const key = slugify(name);
  const value = Number(match?.[2] ?? legacyQualityValue(key));

  return {
    key,
    name,
    value,
    supported: ["brutal", "explosive", "defending", "quick", "reach", "ranged", "shield", "resistant", "light", "weak"].includes(key) || key.endsWith("proof"),
    effect: "",
    automation: {},
    notes: ""
  };
}

function legacyQualityValue(key) {
  if (key === "brutal") return 2;
  if (key.endsWith("proof")) return 2;
  if (key === "defending" || key === "shield" || key === "quick") return 1;
  if (key === "weak") return -1;
  if (key === "resistant") return 1;
  if (key === "explosive") return 2;
  return 0;
}

function qualityValue(item, key) {
  const quality = qualityEntries(item).find(entry => entry.key === key);
  return Number(quality?.value ?? 0);
}

function qualityNames(qualities) {
  return qualities
    .map(quality => `${quality.name}${quality.value ? ` ${quality.value}` : ""}`)
    .join(", ");
}

function qualityCombatNotes(prefix, qualities, context = {}) {
  const notes = [];

  for (const quality of qualities) {
    if (quality.key === "brutal") notes.push(`${prefix} quality Brutal sets weapon damage minimum to ${quality.value || 2}.`);
    else if (quality.key === "explosive" && context.boostDamage) notes.push(`${prefix} quality Explosive increased Boost damage.`);
    else if (quality.key.endsWith("proof") && context.damageTag) notes.push(`${prefix} quality ${quality.name} checked against tag/range "${context.damageTag}".`);
    else if (quality.key === "defending" || quality.key === "shield") notes.push(`${prefix} quality ${quality.name} supports defensive/parry rulings; apply the listed defense bonus when the defender uses it.`);
    else if (quality.key === "quick") notes.push(`${prefix} quality Quick supports fast-draw or initiative rulings.`);
    else if (quality.key === "reach") notes.push(`${prefix} quality Reach supports Near engagement or keeping distance.`);
    else if (quality.key === "ranged") notes.push(`${prefix} quality Ranged uses the weapon's range category.`);
    else if (quality.key === "sharp" || quality.key === "crushing" || quality.key === "restraining") notes.push(`${prefix} quality ${quality.name} can justify an appropriate Condition on a Boost.`);
    else if (quality.supported) notes.push(`${prefix} quality ${quality.name}: ${quality.effect || "supported reminder applied."}`);
    else notes.push(`${prefix} quality ${quality.name} is not applied automatically; use the readable quality text for the GM ruling.`);
  }

  return notes;
}

function weaponRangeLabel(weapon) {
  if (!weapon) return "";
  return weapon.system.rangeCategory || weapon.system.range || "Close";
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, char => char.toUpperCase());
}

async function postCombatCard({ combat, combatant = null, title, body }) {
  await ChatMessage.create({
    speaker: combatant?.actor ? ChatMessage.getSpeaker({ actor: combatant.actor }) : ChatMessage.getSpeaker(),
    content: `
      <div class="ptg-chat-card">
        <h3>${escapeHTML(title)}</h3>
        <div><strong>Encounter:</strong> ${escapeHTML(combat.name ?? "Combat Encounter")}</div>
        ${combatant ? `<div><strong>Combatant:</strong> ${escapeHTML(combatant.name)}</div>` : ""}
        ${body}
      </div>
    `
  });
}

function roundSequenceHTML() {
  return `
    <ol>
      <li>Roll initiative for all combatants.</li>
      <li>At the start of each round, clear Quick/Standard action and defense markers.</li>
      <li>On a combatant's turn, choose one Quick Action and one Standard Action as appropriate.</li>
      <li>When reacting to threats, mark Quick Defense or Standard Defense prompts for the defending combatant.</li>
      <li>Resolve attack, damage, armor, and Conditions using the later battle workflow once implemented.</li>
    </ol>
  `;
}

function combatActionHTML(selection) {
  return `
    <div>${escapeHTML(ACTION_LABELS[selection.action] ?? "Combat Action")} recorded for this combatant.</div>
    ${selection.notes ? `<div><strong>Notes:</strong> ${escapeHTML(selection.notes)}</div>` : ""}
  `;
}

function combatOutcomeHTML(results, selection) {
  return `
    <ul>
      ${results.map(result => `<li>${escapeHTML(result)}</li>`).join("")}
    </ul>
    ${selection.notes ? `<div><strong>Notes:</strong> ${escapeHTML(selection.notes)}</div>` : ""}
  `;
}

function battleOutcomeHTML(results, selection, attacker, defender) {
  return `
    <div><strong>Attacker:</strong> ${escapeHTML(attacker.name)}</div>
    <div><strong>Defender:</strong> ${escapeHTML(defender.name)}</div>
    <div><strong>Attack / Defense:</strong> ${Number(selection.attackSuccesses ?? 0)} / ${Number(selection.defenseSuccesses ?? 0)}</div>
    ${selection.damageTag ? `<div><strong>Range / Tag:</strong> ${escapeHTML(selection.damageTag)}</div>` : ""}
    <ul>
      ${results.map(result => `<li>${escapeHTML(result)}</li>`).join("")}
    </ul>
    ${selection.notes ? `<div><strong>Notes:</strong> ${escapeHTML(selection.notes)}</div>` : ""}
  `;
}

function resourceLabel(resource) {
  return {
    health: "Health",
    psyche: "Psyche"
  }[resource] ?? resource;
}

function signedNumber(value) {
  const number = Number(value ?? 0);
  return `${number >= 0 ? "+" : ""}${number}`;
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
