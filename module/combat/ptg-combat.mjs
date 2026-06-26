const SYSTEM_ID = "part-time-gods";
const { DialogV2 } = foundry.applications.api;

const ACTION_LABELS = {
  round: "Round and Turn Sequence",
  quickAction: "Quick Action",
  standardAction: "Standard Action",
  quickDefense: "Quick Defense",
  standardDefense: "Standard Defense",
  reset: "Reset Combatant Actions",
  initiative: "Roll PTG Initiative"
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

  const content = `
    <div class="ptg-combat-dialog">
      <div class="ptg-territory-summary">
        <strong>${escapeHTML(combat.name ?? "Combat Encounter")}</strong>
        <span>Tracks PTG2E turn prompts and action use. Attack, defense, damage, armor, and Condition resolution are later slices.</span>
      </div>
      <div class="form-group">
        <label>Combatant</label>
        <select name="combatantId">
          <option value="">Encounter helper only</option>
          ${combatantOptions}
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
          <option value="reset">Reset Selected Combatant Actions</option>
        </select>
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
          action: form.elements.action?.value ?? "round",
          notes: form.elements.notes?.value ?? ""
        };
      }
    }
  });
}

function actorInitiative(actor) {
  if (!actor) return 0;
  if (actor.type === "character") return Number(actor.system.derived?.initiative ?? 0);
  return Number(actor.system.initiative ?? actor.system.derived?.initiative ?? 0);
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

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}
