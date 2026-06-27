const SYSTEM_ID = "part-time-gods";
const { DialogV2 } = foundry.applications.api;

export async function loadPremadeConditions() {
  const pack = game.packs.get(`${SYSTEM_ID}.premade-items`);
  let documents = [];
  if (pack) documents = await pack.getDocuments();
  if (!documents.length) documents = game.items.filter(item => item.getFlag(SYSTEM_ID, "premade") && item.type === "condition");

  return documents
    .filter(item => item.type === "condition")
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function customConditionItem(condition = {}) {
  const name = condition.name || "Custom Condition";
  const effect = condition.effect || `${name} affects the character until the GM resolves its fictional cause.`;
  const recovery = condition.recovery || "Recover when the Condition's fictional cause ends, through care, rest, or a suitable power.";
  const sourcePage = Number(condition.sourcePage ?? 0) || null;
  const severity = clampSeverity(condition.severity);
  const category = condition.category || "physical";
  const appliesTo = condition.appliesTo || "fictional";
  const duration = condition.duration || "scene-or-fiction";
  const sourceSection = condition.sourceSection || "Custom Condition";

  return {
    name,
    type: "condition",
    img: condition.img || "icons/svg/aura.svg",
    system: {
      category,
      severity,
      severityMode: condition.severityMode || "level",
      appliesTo,
      duration,
      recovery,
      removal: condition.removal || recovery,
      sourcePage,
      sourceSection,
      rollModifier: condition.rollModifier ?? null,
      effect: paragraph(effect),
      notes: sourcePage
        ? `<p>Source: Part-Time Gods Second Edition, p. ${sourcePage}.</p><p><strong>Recovery:</strong> ${escapeHTML(recovery)}</p>`
        : `<p><strong>Recovery:</strong> ${escapeHTML(recovery)}</p>`,
      rules: {
        summary: effect,
        fullText: paragraph(effect),
        source: {
          book: "Part-Time Gods Second Edition",
          page: sourcePage,
          section: sourceSection,
          type: "condition"
        }
      },
      usage: {
        kind: "passive",
        trigger: "applied",
        target: "self",
        cost: resourceCost()
      },
      automation: {
        enabled: true,
        action: "track-condition",
        bonus: null,
        penalty: null,
        roll: null,
        healing: null,
        damage: null,
        condition: {
          name,
          category,
          severity,
          appliesTo,
          duration,
          recovery,
          rollModifier: condition.rollModifier ?? null
        },
        resourceChange: null,
        chatCard: true
      }
    }
  };
}

export async function conditionItemFromSelection(selection = {}) {
  const premadeItem = selection.premade ? await fromUuid(selection.premade) : null;
  const source = premadeItem ? premadeItem.toObject() : customConditionItem(selection);
  delete source._id;

  source.system = {
    ...(source.system ?? {}),
    severity: clampSeverity(selection.severity ?? source.system?.severity ?? 1)
  };

  return source;
}

export async function openApplyConditionDialog(options = {}) {
  const targetActors = selectableActors(options.targetActor);
  if (!targetActors.length) {
    ui.notifications.warn("No editable actors are available for applying a Condition.");
    return null;
  }

  const defaultTargetUuid = options.targetActor?.uuid ?? targetActors[0]?.uuid ?? "";
  const premade = await loadPremadeConditions();
  const sourceLabel = options.sourceItem?.name || options.sourceActor?.name || options.reason || "GM ruling";

  const content = `
    <div class="ptg-condition-apply-dialog">
      <div class="ptg-territory-summary">
        <strong>Apply PTG2E Condition</strong>
        <span>${escapeHTML(sourceLabel)}</span>
      </div>
      <div class="form-group">
        <label>Target Actor</label>
        <select name="targetUuid">
          ${targetActors.map(actor => `<option value="${escapeHTML(actor.uuid)}" ${actor.uuid === defaultTargetUuid ? "selected" : ""}>${escapeHTML(actor.name)}</option>`).join("")}
        </select>
      </div>
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
          <input name="name" type="text" value="${escapeHTML(options.name ?? "")}" placeholder="Custom Condition">
        </label>
        <label>
          <span>Category</span>
          <select name="category">
            ${["physical", "mental", "crossover"].map(category => `<option value="${category}" ${category === options.category ? "selected" : ""}>${titleCase(category)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Severity</span>
          <input name="severity" type="number" value="${clampSeverity(options.severity ?? 1)}" min="1" max="10">
        </label>
      </section>
      <section class="ptg-item-fields two">
        <label>
          <span>Source</span>
          <select name="source">
            ${["Damage result", "Boost", "Weapon or armor quality", "Manifestation or power effect", "Truth or Relic use", "Antagonist special ability", "GM manual ruling"].map(reason => `<option value="${escapeHTML(reason)}" ${reason === options.reason ? "selected" : ""}>${escapeHTML(reason)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Duration</span>
          <input name="duration" type="text" value="${escapeHTML(options.duration ?? "scene-or-fiction")}">
        </label>
      </section>
      <label>
        <span>Effect</span>
        <textarea name="effect" placeholder="What does this Condition do?">${escapeHTML(options.effect ?? "")}</textarea>
      </label>
      <label>
        <span>Recovery</span>
        <textarea name="recovery" placeholder="How can this Condition be recovered or removed?">${escapeHTML(options.recovery ?? "")}</textarea>
      </label>
    </div>
  `;

  const result = await DialogV2.prompt({
    window: {
      title: "Apply Condition",
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
      label: "Apply Condition",
      callback: (event, button) => ({
        targetUuid: button.form.elements.targetUuid?.value ?? "",
        premade: button.form.elements.premade?.value ?? "",
        name: button.form.elements.name?.value?.trim() ?? "",
        category: button.form.elements.category?.value ?? "physical",
        severity: Number(button.form.elements.severity?.value ?? 1),
        source: button.form.elements.source?.value ?? options.reason ?? "GM manual ruling",
        duration: button.form.elements.duration?.value?.trim() ?? "",
        effect: button.form.elements.effect?.value?.trim() ?? "",
        recovery: button.form.elements.recovery?.value?.trim() ?? ""
      })
    }
  });

  if (!result) return null;

  const actor = result.targetUuid ? await fromUuid(result.targetUuid) : null;
  if (!actor) {
    ui.notifications.warn("Choose an actor before applying a Condition.");
    return null;
  }

  return applyConditionToActor(actor, await conditionItemFromSelection(result), {
    sourceActor: options.sourceActor,
    sourceItem: options.sourceItem,
    reason: result.source
  });
}

export async function applyConditionToActor(actor, itemData, options = {}) {
  if (!actor || !itemData) return null;
  if (!canModifyActor(actor)) {
    ui.notifications.warn(`You do not have permission to update ${actor.name}.`);
    return null;
  }

  const conditionName = String(itemData.name ?? "").trim();
  if (!conditionName) {
    ui.notifications.warn("Enter a Condition name or choose a premade Condition.");
    return null;
  }

  const conditionData = {
    ...itemData,
    name: conditionName,
    type: "condition",
    system: {
      ...(itemData.system ?? {}),
      severity: clampSeverity(itemData.system?.severity ?? options.severity ?? 1)
    }
  };
  const existing = actor.items.find(item => item.type === "condition" && item.name === conditionName);
  let mode = options.duplicateMode ?? "prompt";
  let result = "added";
  let appliedItem = null;

  if (existing) {
    mode = mode === "prompt" ? await chooseDuplicateMode(actor, existing, conditionData) : mode;
    if (!mode || mode === "cancel") return null;

    if (mode === "increase") {
      const current = Number(existing.system.severity ?? 1);
      const next = clampSeverity(Math.max(current, current + Number(conditionData.system.severity ?? 1)));
      await existing.update({
        "system.category": conditionData.system.category || existing.system.category || "",
        "system.severity": next,
        "system.effect": conditionData.system.effect || existing.system.effect || "",
        "system.notes": conditionData.system.notes || existing.system.notes || "",
        "system.duration": conditionData.system.duration || existing.system.duration || ""
      });
      result = `increased ${current} -> ${next}`;
      appliedItem = existing;
    } else if (mode === "replace") {
      await existing.update({
        name: conditionData.name,
        img: conditionData.img,
        system: conditionData.system
      });
      result = "replaced";
      appliedItem = existing;
    }
  }

  if (!appliedItem) {
    const createData = mode === "separate" && existing
      ? { ...conditionData, name: duplicateName(actor, conditionName) }
      : conditionData;
    const [created] = await actor.createEmbeddedDocuments("Item", [createData]);
    appliedItem = created;
    result = mode === "separate" && existing ? "added separately" : "added";
  }

  await postConditionChatCard(actor, appliedItem, {
    result,
    sourceActor: options.sourceActor,
    sourceItem: options.sourceItem,
    reason: options.reason ?? "GM manual ruling"
  });

  return `${actor.name}: ${appliedItem.name} ${result} at severity ${Number(appliedItem.system.severity ?? conditionData.system.severity ?? 1)}.`;
}

function selectableActors(preferredActor = null) {
  const actors = new Map();
  if (preferredActor) actors.set(preferredActor.uuid, preferredActor);

  for (const token of Array.from(game.user?.targets ?? [])) {
    if (token.actor) actors.set(token.actor.uuid, token.actor);
  }

  for (const token of Array.from(canvas?.tokens?.controlled ?? [])) {
    if (token.actor) actors.set(token.actor.uuid, token.actor);
  }

  for (const actor of game.actors ?? []) {
    if (canModifyActor(actor)) actors.set(actor.uuid, actor);
  }

  return Array.from(actors.values()).sort((a, b) => a.name.localeCompare(b.name));
}

async function chooseDuplicateMode(actor, existing, incoming) {
  const content = `
    <div class="ptg-condition-duplicate-dialog">
      <p><strong>${escapeHTML(actor.name)}</strong> already has <strong>${escapeHTML(existing.name)}</strong>.</p>
      <p>Existing severity ${Number(existing.system.severity ?? 1)}; incoming severity ${Number(incoming.system?.severity ?? 1)}.</p>
      <div class="form-group">
        <label>Duplicate Handling</label>
        <select name="mode">
          <option value="increase">Increase existing severity</option>
          <option value="replace">Replace existing Condition</option>
          <option value="separate">Add separate Condition</option>
          <option value="cancel">Cancel</option>
        </select>
      </div>
    </div>
  `;

  return DialogV2.prompt({
    window: { title: "Condition Already Exists" },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Continue",
      callback: (event, button) => button.form.elements.mode?.value ?? "increase"
    }
  });
}

async function postConditionChatCard(actor, condition, { result, sourceActor, sourceItem, reason } = {}) {
  const sourceLabel = [
    sourceActor?.name,
    sourceItem?.name,
    reason
  ].filter(Boolean).join(" - ") || "GM manual ruling";

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: sourceActor ?? actor }),
    content: `
      <div class="ptg-chat-card">
        <h3>Condition ${escapeHTML(titleCase(result))}</h3>
        <div><strong>Target:</strong> ${escapeHTML(actor.name)}</div>
        <div><strong>Condition:</strong> ${escapeHTML(condition.name)}</div>
        <div><strong>Category:</strong> ${escapeHTML(condition.system.category ?? "")}</div>
        <div><strong>Severity:</strong> ${Number(condition.system.severity ?? 1)}</div>
        <div><strong>Source:</strong> ${escapeHTML(sourceLabel)}</div>
        ${condition.system.effect ? `<div><strong>Effect:</strong> ${condition.system.effect}</div>` : ""}
      </div>
    `
  });
}

function canModifyActor(actor) {
  return Boolean(game.user?.isGM || actor?.isOwner || actor?.canUserModify?.(game.user, "update"));
}

function duplicateName(actor, name) {
  let index = 2;
  let next = `${name} ${index}`;
  while (actor.items.some(item => item.type === "condition" && item.name === next)) {
    index += 1;
    next = `${name} ${index}`;
  }
  return next;
}

function clampSeverity(value) {
  return Math.max(1, Math.min(10, Number(value ?? 1) || 1));
}

function resourceCost() {
  return {
    freeTime: 0,
    wealth: 0,
    pantheonDice: 0,
    fragments: 0,
    health: 0,
    psyche: 0,
    strain: 0
  };
}

function paragraph(value) {
  return `<p>${escapeHTML(value)}</p>`;
}

function titleCase(value) {
  const text = String(value ?? "");
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
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
