const { DialogV2 } = foundry.applications.api;

const SYSTEM_ID = "part-time-gods";
const DEFAULT_POOL_MAX = 10;

export async function openPantheonPoolDialog({ pantheon = null, actingActor = null } = {}) {
  const pantheons = pantheonPoolOptions(actingActor);
  const selectedPantheon = pantheon ?? pantheons[0]?.actor ?? null;
  const selectedUuid = selectedPantheon?.uuid ?? "";
  const actorOptions = characterActorOptions(actingActor);

  if (!pantheons.length) {
    ui.notifications.warn("Create a Pantheon actor before using the shared Pantheon Pool workflow.");
    return null;
  }

  const content = `
    <div class="ptg-roll-dialog ptg-pantheon-pool-dialog">
      <div class="form-group">
        <label>Pantheon</label>
        <select name="pantheonUuid" required>
          ${pantheons.map(option => `<option value="${escapeHTML(option.uuid)}" ${option.uuid === selectedUuid ? "selected" : ""}>${escapeHTML(option.label)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Acting Character</label>
        <select name="actorUuid">
          <option value="">No specific character</option>
          ${actorOptions.map(option => `<option value="${escapeHTML(option.uuid)}" ${option.uuid === actingActor?.uuid ? "selected" : ""}>${escapeHTML(option.name)}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Pool Action</label>
        <select name="mode">
          <option value="add">Add Dice</option>
          <option value="spend">Spend or Sacrifice Dice</option>
          <option value="session-start">New Session Starting Pool</option>
          <option value="set">Set Pool Value</option>
        </select>
      </div>
      <div class="form-group">
        <label>Dice</label>
        <input type="number" name="amount" value="1" min="0">
      </div>
      <div class="form-group">
        <label>Reason</label>
        <select name="reason">
          <option value="Boost traded for Pantheon Dice">Boost traded for Pantheon Dice</option>
          <option value="Curse invoked">Curse invoked</option>
          <option value="Critical Failure consequence">Critical Failure consequence</option>
          <option value="Excess Manifestation successes">Excess Manifestation successes</option>
          <option value="Blessing or special rule">Blessing or special rule</option>
          <option value="Bonus dice for a check">Bonus dice for a check</option>
          <option value="Divine Edit">Divine Edit</option>
          <option value="Extra Support">Extra Support</option>
          <option value="Miracle">Miracle</option>
          <option value="Our Territory">Our Territory</option>
          <option value="Session start">Session start</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Custom Reason</label>
        <input type="text" name="customReason" value="" placeholder="Optional custom reason">
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea name="notes" placeholder="Group permission, scene declaration, Curse trigger, Boost trade, or GM ruling"></textarea>
      </div>
      <label class="ptg-checkbox">
        <input type="checkbox" name="permissionConfirmed">
        <span>Group permission confirmed for spending or sacrificing dice</span>
      </label>
      <label class="ptg-checkbox">
        <input type="checkbox" name="linkActor" ${actingActor ? "" : "disabled"}>
        <span>Link acting character to this Pantheon</span>
      </label>
      <p class="ptg-sheet-note">Source: Part-Time Gods Second Edition, book p. 187. The Pantheon Pool is shared, caps at 10 dice by default, and spending should be agreed by the group.</p>
    </div>
  `;

  const selection = await DialogV2.prompt({
    window: { title: "Pantheon Pool", resizable: true },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Apply",
      callback: (event, button) => {
        const form = button.form;
        const mode = form.elements.mode?.value ?? "add";
        const reason = form.elements.customReason?.value?.trim()
          || form.elements.reason?.value
          || "Pantheon Pool adjustment";

        return {
          pantheonUuid: form.elements.pantheonUuid?.value ?? "",
          actorUuid: form.elements.actorUuid?.value ?? "",
          mode,
          amount: Math.max(0, Number(form.elements.amount?.value ?? 0)),
          reason,
          notes: form.elements.notes?.value?.trim() ?? "",
          permissionConfirmed: Boolean(form.elements.permissionConfirmed?.checked),
          linkActor: Boolean(form.elements.linkActor?.checked)
        };
      }
    }
  });

  if (!selection) return null;

  const targetPantheon = await fromUuid(selection.pantheonUuid);
  const participantActor = selection.actorUuid ? await fromUuid(selection.actorUuid) : null;
  if (selection.linkActor && targetPantheon && participantActor) await linkActorToPantheon(targetPantheon, participantActor);

  return adjustPantheonPool(targetPantheon, {
    mode: selection.mode,
    amount: selection.amount,
    reason: selection.reason,
    notes: selection.notes,
    participantActor,
    permissionConfirmed: selection.permissionConfirmed,
    post: true
  });
}

export async function spendPantheonDiceForActor(actor, amount, options = {}) {
  const dice = Math.max(0, Number(amount ?? 0));
  if (dice <= 0) return true;

  const pantheon = await resolvePantheonForActor(actor, options.pantheonUuid);
  if (pantheon) {
    return adjustPantheonPool(pantheon, {
      mode: "spend",
      amount: dice,
      reason: options.reason ?? "Pantheon Dice spent on a roll",
      notes: options.notes ?? "Group permission should be confirmed before using shared Pantheon Dice.",
      participantActor: actor,
      permissionConfirmed: Boolean(options.permissionConfirmed),
      post: options.post !== false
    });
  }

  if (options.fallbackToActorResource === false) {
    ui.notifications.warn("No linked Pantheon Pool is available for this character.");
    return false;
  }

  const spent = await actor.spendResource?.("pantheon", dice);
  if (spent && options.post !== false) {
    await postPantheonPoolCard({
      pantheon: null,
      participantActor: actor,
      mode: "spend",
      amount: dice,
      before: Number(actor.system.resources?.pantheon?.value ?? 0) + dice,
      after: Number(actor.system.resources?.pantheon?.value ?? 0),
      max: Number(actor.system.resources?.pantheon?.max ?? 0),
      reason: options.reason ?? "Character Pantheon Dice spent on a roll",
      notes: "No linked shared Pantheon actor was available, so the character-local Pantheon Dice track was used."
    });
  }

  return Boolean(spent);
}

export async function adjustPantheonPool(pantheon, {
  mode = "add",
  amount = 1,
  reason = "Pantheon Pool adjustment",
  notes = "",
  participantActor = null,
  permissionConfirmed = false,
  post = true
} = {}) {
  if (!pantheon || pantheon.type !== "pantheon") {
    ui.notifications.warn("Choose a Pantheon actor before adjusting the Pantheon Pool.");
    return false;
  }

  if (!canUpdateActor(pantheon)) {
    ui.notifications.warn(`You need owner permission for ${pantheon.name} to adjust its Pantheon Pool.`);
    return false;
  }

  const dice = Math.max(0, Number(amount ?? 0));
  const before = Number(pantheon.system.pantheonPool?.value ?? 0);
  const max = pantheonPoolMax(pantheon);
  let after = before;
  let actionLabel = "adjusted";

  if (mode === "add") {
    after = Math.min(max, before + dice);
    actionLabel = "added";
  } else if (mode === "spend") {
    if (!permissionConfirmed) {
      console.info("Part-Time Gods 2E | Pantheon Dice spend recorded without an explicit permission checkbox.", { pantheon: pantheon.name, amount: dice, reason });
    }
    if (before < dice) {
      ui.notifications.warn(`${pantheon.name} does not have ${dice} Pantheon Dice available.`);
      return false;
    }
    after = before - dice;
    actionLabel = "spent";
  } else if (mode === "session-start") {
    after = Math.min(max, dice || pantheonMemberCount(pantheon) || 1);
    actionLabel = "reset";
  } else if (mode === "set") {
    after = Math.min(max, dice);
    actionLabel = "set";
  }

  const update = { "system.pantheonPool.value": after };
  if (Number(pantheon.system.pantheonPool?.max ?? 0) <= 0) update["system.pantheonPool.max"] = max;
  await pantheon.update(update);

  if (post) {
    await postPantheonPoolCard({
      pantheon,
      participantActor,
      mode,
      actionLabel,
      amount: Math.abs(after - before) || dice,
      before,
      after,
      max,
      reason,
      notes
    });
  }

  return true;
}

export function pantheonPoolOptions(actor = null) {
  const linked = actor ? linkedPantheonsForActor(actor) : [];
  const all = game.actors
    .filter(candidate => candidate.type === "pantheon" && candidate.visible !== false)
    .filter(candidate => !linked.some(pantheon => pantheon.uuid === candidate.uuid));

  return [...linked, ...all].map(pantheon => ({
    actor: pantheon,
    uuid: pantheon.uuid,
    name: pantheon.name,
    linked: actor ? isActorLinkedToPantheon(pantheon, actor) : false,
    value: Number(pantheon.system.pantheonPool?.value ?? 0),
    max: pantheonPoolMax(pantheon),
    label: `${pantheon.name} (${Number(pantheon.system.pantheonPool?.value ?? 0)} / ${pantheonPoolMax(pantheon)})`
  }));
}

export function linkedPantheonsForActor(actor) {
  if (!actor) return [];

  return game.actors
    .filter(candidate => candidate.type === "pantheon" && candidate.visible !== false)
    .filter(pantheon => isActorLinkedToPantheon(pantheon, actor));
}

export function pantheonPoolMax(pantheon) {
  return Math.max(DEFAULT_POOL_MAX, Number(pantheon?.system?.pantheonPool?.max ?? 0));
}

async function resolvePantheonForActor(actor, pantheonUuid = "") {
  if (pantheonUuid) {
    const pantheon = await fromUuid(pantheonUuid);
    if (pantheon?.type === "pantheon") return pantheon;
  }

  const linked = linkedPantheonsForActor(actor);
  if (linked.length) return linked[0];

  return null;
}

async function linkActorToPantheon(pantheon, actor) {
  if (!pantheon || !actor || actor.type !== "character") return false;
  if (!canUpdateActor(pantheon)) {
    ui.notifications.warn(`You need owner permission for ${pantheon.name} to link members.`);
    return false;
  }
  if (isActorLinkedToPantheon(pantheon, actor)) return true;

  const members = Array.from(pantheon.system.members ?? []);
  members.push({ uuid: actor.uuid, name: actor.name });
  await pantheon.update({ "system.members": members });
  return true;
}

function isActorLinkedToPantheon(pantheon, actor) {
  if (!pantheon || !actor) return false;
  return Array.from(pantheon.system.members ?? []).some(member => member.uuid === actor.uuid);
}

function characterActorOptions(preferred = null) {
  const actors = game.actors
    .filter(actor => actor.type === "character" && actor.visible !== false)
    .sort((a, b) => a.name.localeCompare(b.name));
  if (preferred && !actors.some(actor => actor.uuid === preferred.uuid)) actors.unshift(preferred);
  return actors.map(actor => ({ uuid: actor.uuid, name: actor.name }));
}

function pantheonMemberCount(pantheon) {
  return Array.from(pantheon?.system?.members ?? []).length;
}

function canUpdateActor(actor) {
  return Boolean(actor && (game.user?.isGM || actor.isOwner));
}

async function postPantheonPoolCard({
  pantheon,
  participantActor,
  mode,
  actionLabel = "",
  amount,
  before,
  after,
  max,
  reason,
  notes
}) {
  const pantheonName = pantheon?.name ?? "Character-local Pantheon Dice";
  const actorData = pantheon?.uuid ? ` data-actor-uuid="${escapeHTML(pantheon.uuid)}"` : "";
  const pantheonData = pantheon?.uuid ? ` data-pantheon-uuid="${escapeHTML(pantheon.uuid)}"` : "";
  const participant = participantActor ? `<div>Character: ${escapeHTML(participantActor.name)}</div>` : "";
  const spendButton = pantheon ? `<button type="button" data-ptg-chat-action="pantheon-pool-adjust" data-mode="spend" data-amount="1" data-reason="Quick Pantheon Pool spend">Spend 1</button>` : "";
  const addButton = pantheon ? `<button type="button" data-ptg-chat-action="pantheon-pool-adjust" data-mode="add" data-amount="1" data-reason="Quick Pantheon Pool add">Add 1</button>` : "";

  const content = `
    <div class="ptg-chat-card" data-ptg-chat-card="pantheon-pool"${actorData}${pantheonData} data-reason="${escapeHTML(reason)}">
      <h3>Pantheon Pool</h3>
      <div>Pantheon: ${escapeHTML(pantheonName)}</div>
      ${participant}
      <div>Action: ${escapeHTML(actionLabel || mode)} ${Number(amount ?? 0)} dice</div>
      <div>Pool: ${Number(before ?? 0)} -> ${Number(after ?? 0)} / ${Number(max ?? 0)}</div>
      <div>Reason: ${escapeHTML(reason)}</div>
      ${notes ? `<p>${escapeHTML(notes)}</p>` : ""}
      <p>Shared dice should be added from source-backed triggers such as Boost trades, Curses, Critical Failure consequences, Blessings, and excess Manifestation successes. Spending or sacrificing dice should be agreed by the group.</p>
      <div class="ptg-chat-actions">
        ${pantheon ? `<button type="button" data-ptg-chat-action="open-actor">Open Pantheon</button>` : ""}
        ${addButton}
        ${spendButton}
      </div>
    </div>
  `;

  await ChatMessage.create({
    speaker: participantActor
      ? ChatMessage.getSpeaker({ actor: participantActor })
      : pantheon
        ? ChatMessage.getSpeaker({ actor: pantheon })
        : ChatMessage.getSpeaker(),
    content
  });
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
