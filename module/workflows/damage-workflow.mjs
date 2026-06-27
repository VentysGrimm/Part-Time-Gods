import { localize } from "../util/localization.mjs";

const { DialogV2 } = foundry.applications.api;

export async function openApplyDamageDialog(options = {}) {
  const targetActors = selectableActors(options.targetActor);
  if (!targetActors.length) {
    ui.notifications.warn(localize("PTG.Damage.NoEditableActors"));
    return null;
  }

  const defaultTargetUuid = options.targetActor?.uuid ?? targetActors[0]?.uuid ?? "";
  const defaultResource = options.resource === "psyche" ? "psyche" : "health";
  const defaultAmount = nonNegativeNumber(options.amount);
  const defaultApplyArmor = Boolean(options.applyArmor ?? defaultResource === "health");
  const sourceLabel = options.sourceItem?.name || options.sourceActor?.name || options.reason || localize("PTG.Damage.SourceFallback");

  const content = `
    <div class="ptg-damage-apply-dialog">
      <div class="ptg-territory-summary">
        <strong>${escapeHTML(localize("PTG.Damage.Title"))}</strong>
        <span>${escapeHTML(sourceLabel)}</span>
      </div>
      <div class="form-group">
        <label>${escapeHTML(localize("PTG.Damage.TargetActor"))}</label>
        <select name="targetUuid">
          ${targetActors.map(actor => `<option value="${escapeHTML(actor.uuid)}" ${actor.uuid === defaultTargetUuid ? "selected" : ""}>${escapeHTML(actor.name)}</option>`).join("")}
        </select>
      </div>
      <section class="ptg-item-fields three">
        <label>
          <span>${escapeHTML(localize("PTG.Damage.Track"))}</span>
          <select name="resource">
            <option value="health" ${defaultResource === "health" ? "selected" : ""}>${escapeHTML(resourceLabel("health"))}</option>
            <option value="psyche" ${defaultResource === "psyche" ? "selected" : ""}>${escapeHTML(resourceLabel("psyche"))}</option>
          </select>
        </label>
        <label>
          <span>${escapeHTML(localize("PTG.Damage.Damage"))}</span>
          <input name="amount" type="number" value="${defaultAmount}" min="0">
        </label>
        <label>
          <span>${escapeHTML(localize("PTG.Damage.TagRange"))}</span>
          <input name="damageTag" type="text" value="${escapeHTML(options.damageTag ?? "")}" placeholder="${escapeHTML(localize("PTG.Damage.TagRangePlaceholder"))}">
        </label>
      </section>
      <label class="ptg-checkbox">
        <input type="checkbox" name="applyArmor" ${defaultApplyArmor ? "checked" : ""}>
        <span>${escapeHTML(localize("PTG.Damage.ApplyArmor"))}</span>
      </label>
      <label>
        <span>${escapeHTML(localize("PTG.Damage.Reason"))}</span>
        <input name="reason" type="text" value="${escapeHTML(options.reason ?? localize("PTG.Damage.SourceFallback"))}">
      </label>
    </div>
  `;

  const result = await DialogV2.prompt({
    window: {
      title: localize("PTG.Damage.DialogTitle"),
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
      label: localize("PTG.Damage.ApplyButton"),
      callback: (event, button) => ({
        targetUuid: button.form.elements.targetUuid?.value ?? "",
        resource: button.form.elements.resource?.value ?? defaultResource,
        amount: nonNegativeNumber(button.form.elements.amount?.value),
        damageTag: button.form.elements.damageTag?.value?.trim() ?? "",
        applyArmor: button.form.elements.applyArmor?.checked ?? false,
        reason: button.form.elements.reason?.value?.trim() ?? ""
      })
    }
  });

  if (!result) return null;

  const actor = result.targetUuid ? await actorFromUuid(result.targetUuid) : null;
  if (!actor) {
    ui.notifications.warn(localize("PTG.Damage.ChooseActor"));
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
    ui.notifications.warn(localize("PTG.Damage.NoPermission", {
      actorName: actor?.name ?? localize("PTG.Damage.TargetActor")
    }));
    return null;
  }

  const resource = options.resource === "psyche" ? "psyche" : "health";
  const resourceInfo = actorResource(actor, resource);
  if (!resourceInfo) {
    ui.notifications.warn(localize("PTG.Damage.MissingTrack", {
      actorName: actor.name,
      resource: resourceLabel(resource)
    }));
    return null;
  }

  const rawAmount = nonNegativeNumber(options.amount);
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
    damageTag: String(options.damageTag ?? "").trim(),
    reason: String(options.reason ?? "").trim() || localize("PTG.Damage.SourceFallback"),
    appliedAt: new Date().toISOString()
  };

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: options.sourceActor ?? actor }),
    content: damageChatCard(entry)
  });

  return entry;
}

function damageChatCard(entry) {
  const resource = resourceLabel(entry.resource);

  return `
    <div class="ptg-chat-card" data-ptg-chat-card="damage" data-actor-uuid="${escapeHTML(entry.actorUuid)}">
      <h3>${escapeHTML(localize("PTG.Damage.ChatTitle", { resource }))}</h3>
      <div><strong>${escapeHTML(localize("PTG.Damage.Target"))}:</strong> ${escapeHTML(entry.actorName)}</div>
      ${entry.sourceActorName ? `<div><strong>${escapeHTML(localize("PTG.Damage.Source"))}:</strong> ${escapeHTML(entry.sourceActorName)}</div>` : ""}
      ${entry.sourceItemName ? `<div><strong>${escapeHTML(localize("PTG.Damage.Item"))}:</strong> ${escapeHTML(entry.sourceItemName)}</div>` : ""}
      <div><strong>${escapeHTML(localize("PTG.Damage.Reason"))}:</strong> ${escapeHTML(entry.reason)}</div>
      ${entry.damageTag ? `<div><strong>${escapeHTML(localize("PTG.Damage.Tag"))}:</strong> ${escapeHTML(entry.damageTag)}</div>` : ""}
      <div><strong>${escapeHTML(localize("PTG.Damage.RawDamage"))}:</strong> ${entry.rawAmount}</div>
      ${entry.baseArmor ? `<div><strong>${escapeHTML(localize("PTG.Damage.Armor"))}:</strong> -${entry.baseArmor}</div>` : ""}
      ${entry.proofArmor ? `<div><strong>${escapeHTML(localize("PTG.Damage.TagArmor"))}:</strong> -${entry.proofArmor}</div>` : ""}
      <div><strong>${escapeHTML(localize("PTG.Damage.Applied"))}:</strong> ${entry.finalAmount}</div>
      <div><strong>${escapeHTML(resource)}:</strong> ${entry.before} -&gt; ${entry.after}</div>
      <div class="ptg-chat-actions">
        <button type="button" data-ptg-chat-action="open-actor">${escapeHTML(localize("PTG.Damage.OpenTarget"))}</button>
        <button type="button" data-ptg-chat-action="apply-condition">${escapeHTML(localize("PTG.Damage.ApplyCondition"))}</button>
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
  return Boolean(isActorDocument(actor) && (game.user?.isGM || actor.isOwner));
}

function actorResource(actor, resource) {
  const data = actor.system?.resources?.[resource];
  if (!data || typeof data !== "object") return null;
  const value = finiteNumber(data.value, 0);
  const max = finiteNumber(data.max, 0);

  return {
    path: `system.resources.${resource}.value`,
    value,
    max
  };
}

function actorArmor(actor) {
  const derived = nonNegativeNumber(actor.system?.derived?.armor);
  if (derived > 0) return derived;

  return Array.from(actor.items ?? [])
    .filter(item => item.type === "armor" && item.system.equipped)
    .reduce((total, item) => total + nonNegativeNumber(item.system.rating), 0);
}

function armorProofBonus(actor, damageTag = "") {
  const tag = slugify(damageTag);
  if (!tag) return 0;

  return Array.from(actor.items ?? [])
    .filter(item => item.type === "armor" && item.system.equipped)
    .flatMap(item => qualityEntries(item))
    .filter(quality => quality.key.endsWith("proof") && tagMatchesProof(tag, quality.key))
    .reduce((total, quality) => total + nonNegativeNumber(quality.value), 0);
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
    value: nonNegativeNumber(quality.value)
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
    value: nonNegativeNumber(match?.[2], 2)
  };
}

function tagMatchesProof(tag, proofKey) {
  const proofTag = proofKey.replace(/-?proof$/, "");
  return Boolean(proofTag && (tag.includes(proofTag) || proofTag.includes(tag)));
}

function resourceLabel(resource) {
  return {
    health: localize("PTG.Resources.Health"),
    psyche: localize("PTG.Resources.Psyche")
  }[resource] ?? resource;
}

async function actorFromUuid(uuid) {
  try {
    const document = await fromUuid(uuid);
    return isActorDocument(document) ? document : null;
  } catch (error) {
    console.warn("Part-Time Gods 2E | Unable to resolve damage target UUID.", uuid, error);
    return null;
  }
}

function nonNegativeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function isActorDocument(document) {
  return document?.documentName === "Actor" || document?.constructor?.documentName === "Actor";
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
