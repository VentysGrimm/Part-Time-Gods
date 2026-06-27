const { DialogV2 } = foundry.applications.api;

export async function openApplyDamageDialog(options = {}) {
  const targetActors = selectableActors(options.targetActor);
  if (!targetActors.length) {
    ui.notifications.warn("No editable actors are available for applying damage.");
    return null;
  }

  const defaultTargetUuid = options.targetActor?.uuid ?? targetActors[0]?.uuid ?? "";
  const defaultResource = options.resource === "psyche" ? "psyche" : "health";
  const defaultAmount = Math.max(0, Number(options.amount ?? 0));
  const defaultApplyArmor = options.applyArmor ?? defaultResource === "health";
  const sourceLabel = options.sourceItem?.name || options.sourceActor?.name || options.reason || "Chat card action";

  const content = `
    <div class="ptg-damage-apply-dialog">
      <div class="ptg-territory-summary">
        <strong>Apply PTG2E Damage</strong>
        <span>${escapeHTML(sourceLabel)}</span>
      </div>
      <div class="form-group">
        <label>Target Actor</label>
        <select name="targetUuid">
          ${targetActors.map(actor => `<option value="${escapeHTML(actor.uuid)}" ${actor.uuid === defaultTargetUuid ? "selected" : ""}>${escapeHTML(actor.name)}</option>`).join("")}
        </select>
      </div>
      <section class="ptg-item-fields three">
        <label>
          <span>Track</span>
          <select name="resource">
            <option value="health" ${defaultResource === "health" ? "selected" : ""}>Health</option>
            <option value="psyche" ${defaultResource === "psyche" ? "selected" : ""}>Psyche</option>
          </select>
        </label>
        <label>
          <span>Damage</span>
          <input name="amount" type="number" value="${defaultAmount}" min="0">
        </label>
        <label>
          <span>Tag / Range</span>
          <input name="damageTag" type="text" value="${escapeHTML(options.damageTag ?? "")}" placeholder="Close, fire, bullets, etc.">
        </label>
      </section>
      <label class="ptg-checkbox">
        <input type="checkbox" name="applyArmor" ${defaultApplyArmor ? "checked" : ""}>
        <span>Apply equipped armor to Health damage</span>
      </label>
      <label>
        <span>Reason</span>
        <input name="reason" type="text" value="${escapeHTML(options.reason ?? "Chat card action")}">
      </label>
    </div>
  `;

  const result = await DialogV2.prompt({
    window: {
      title: "Apply Damage",
      resizable: true
    },
    position: {
      width: 560,
      height: 420
    },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Apply Damage",
      callback: (event, button) => ({
        targetUuid: button.form.elements.targetUuid?.value ?? "",
        resource: button.form.elements.resource?.value ?? defaultResource,
        amount: Number(button.form.elements.amount?.value ?? 0),
        damageTag: button.form.elements.damageTag?.value?.trim() ?? "",
        applyArmor: button.form.elements.applyArmor?.checked ?? false,
        reason: button.form.elements.reason?.value?.trim() ?? ""
      })
    }
  });

  if (!result) return null;

  const actor = result.targetUuid ? await fromUuid(result.targetUuid) : null;
  if (!actor) {
    ui.notifications.warn("Choose an actor before applying damage.");
    return null;
  }

  return applyDamageToActor(actor, {
    ...result,
    sourceActor: options.sourceActor,
    sourceItem: options.sourceItem
  });
}

export async function applyDamageToActor(actor, options = {}) {
  if (!actor || !canModifyActor(actor)) {
    ui.notifications.warn(`You do not have permission to update ${actor?.name ?? "that actor"}.`);
    return null;
  }

  const resource = options.resource === "psyche" ? "psyche" : "health";
  const resourceInfo = actorResource(actor, resource);
  if (!resourceInfo) {
    ui.notifications.warn(`${actor.name} does not have a ${resourceLabel(resource)} track.`);
    return null;
  }

  const rawAmount = Math.max(0, Number(options.amount ?? 0));
  const baseArmor = resource === "health" && options.applyArmor ? actorArmor(actor) : 0;
  const proofArmor = resource === "health" && options.applyArmor ? armorProofBonus(actor, options.damageTag) : 0;
  const armor = baseArmor + proofArmor;
  const finalAmount = Math.max(0, rawAmount - armor);
  const next = Math.max(0, resourceInfo.value - finalAmount);

  await actor.update({ [resourceInfo.path]: next });

  const entry = {
    actorUuid: actor.uuid,
    actorName: actor.name,
    sourceActorUuid: options.sourceActor?.uuid ?? "",
    sourceActorName: options.sourceActor?.name ?? "",
    sourceItemUuid: options.sourceItem?.uuid ?? "",
    sourceItemName: options.sourceItem?.name ?? "",
    resource,
    rawAmount,
    baseArmor,
    proofArmor,
    armor,
    finalAmount,
    before: resourceInfo.value,
    after: next,
    damageTag: options.damageTag ?? "",
    reason: options.reason ?? "Chat card action",
    appliedAt: new Date().toISOString()
  };

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: options.sourceActor ?? actor }),
    content: damageChatCard(entry)
  });

  return entry;
}

function damageChatCard(entry) {
  return `
    <div class="ptg-chat-card" data-ptg-chat-card="damage" data-actor-uuid="${escapeHTML(entry.actorUuid)}">
      <h3>${escapeHTML(resourceLabel(entry.resource))} Damage</h3>
      <div><strong>Target:</strong> ${escapeHTML(entry.actorName)}</div>
      ${entry.sourceActorName ? `<div><strong>Source:</strong> ${escapeHTML(entry.sourceActorName)}</div>` : ""}
      ${entry.sourceItemName ? `<div><strong>Item:</strong> ${escapeHTML(entry.sourceItemName)}</div>` : ""}
      <div><strong>Reason:</strong> ${escapeHTML(entry.reason)}</div>
      ${entry.damageTag ? `<div><strong>Tag:</strong> ${escapeHTML(entry.damageTag)}</div>` : ""}
      <div><strong>Raw Damage:</strong> ${entry.rawAmount}</div>
      ${entry.baseArmor ? `<div><strong>Armor:</strong> -${entry.baseArmor}</div>` : ""}
      ${entry.proofArmor ? `<div><strong>Tag Armor:</strong> -${entry.proofArmor}</div>` : ""}
      <div><strong>Applied:</strong> ${entry.finalAmount}</div>
      <div><strong>${escapeHTML(resourceLabel(entry.resource))}:</strong> ${entry.before} -> ${entry.after}</div>
      <div class="ptg-chat-actions">
        <button type="button" data-ptg-chat-action="open-actor">Open Target</button>
        <button type="button" data-ptg-chat-action="apply-condition">Apply Condition</button>
      </div>
    </div>
  `;
}

function selectableActors(preferredActor = null) {
  const actors = new Map();
  if (preferredActor && canModifyActor(preferredActor)) actors.set(preferredActor.uuid, preferredActor);

  for (const token of Array.from(game.user?.targets ?? [])) {
    if (token.actor && canModifyActor(token.actor)) actors.set(token.actor.uuid, token.actor);
  }

  for (const token of Array.from(canvas?.tokens?.controlled ?? [])) {
    if (token.actor && canModifyActor(token.actor)) actors.set(token.actor.uuid, token.actor);
  }

  for (const actor of game.actors ?? []) {
    if (canModifyActor(actor)) actors.set(actor.uuid, actor);
  }

  return Array.from(actors.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function canModifyActor(actor) {
  return Boolean(actor && (game.user?.isGM || actor.isOwner));
}

function actorResource(actor, resource) {
  const data = actor.system.resources?.[resource];
  if (!data || typeof data !== "object") return null;

  return {
    path: `system.resources.${resource}.value`,
    value: Number(data.value ?? 0),
    max: Number(data.max ?? 0)
  };
}

function actorArmor(actor) {
  const derived = Number(actor.system.derived?.armor ?? 0);
  if (derived > 0) return derived;

  return actor.items
    .filter(item => item.type === "armor" && item.system.equipped)
    .reduce((total, item) => total + Number(item.system.rating ?? 0), 0);
}

function armorProofBonus(actor, damageTag = "") {
  const tag = slugify(damageTag);
  if (!tag) return 0;

  return actor.items
    .filter(item => item.type === "armor" && item.system.equipped)
    .flatMap(item => qualityEntries(item))
    .filter(quality => quality.key.endsWith("proof") && tagMatchesProof(tag, quality.key))
    .reduce((total, quality) => total + Math.max(0, Number(quality.value ?? 0)), 0);
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
    key: slugify(quality.key || name),
    name,
    value: Number(quality.value ?? 0)
  };
}

function legacyQuality(entry) {
  const raw = String(entry ?? "").trim();
  if (!raw) return null;
  const match = raw.match(/^(.+?)(?:\s+(\d+))?$/);
  const name = match?.[1] ?? raw;

  return {
    key: slugify(name),
    name,
    value: Number(match?.[2] ?? 0) || 2
  };
}

function tagMatchesProof(tag, proofKey) {
  const proofTag = proofKey.replace(/-?proof$/, "");
  return Boolean(proofTag && (tag.includes(proofTag) || proofTag.includes(tag)));
}

function resourceLabel(resource) {
  return {
    health: "Health",
    psyche: "Psyche"
  }[resource] ?? resource;
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
