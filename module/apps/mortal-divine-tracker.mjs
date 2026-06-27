import { getDragEventData } from "../util/drop-data.mjs";

const SYSTEM_ID = "part-time-gods";
const FLAG_KEY = "mortalDivineBalance";
const MIN_BALANCE = -10;
const MAX_BALANCE = 10;

const { ApplicationV2, DialogV2, HandlebarsApplicationMixin } = foundry.applications.api;

const MORTAL_BUTTONS = [
  { key: "helped-bond", label: "Helped a Bond", amount: 1 },
  { key: "went-to-work", label: "Went to Work", amount: 1 },
  { key: "protected-mortal-life", label: "Protected Mortal Life", amount: 1 },
  { key: "human-obligations", label: "Spent Free Time on Human Obligations", amount: 1 },
  { key: "repaired-strain", label: "Repaired Strain or Relationship Harm", amount: 1 },
  { key: "mortal-consequences", label: "Chose Mortal Consequences", amount: 1 }
];

const DIVINE_BUTTONS = [
  { key: "answered-worshippers", label: "Answered Worshippers", amount: 1 },
  { key: "public-manifestation", label: "Used Manifestation Publicly", amount: 1 },
  { key: "ritual", label: "Performed a Ritual", amount: 1 },
  { key: "territory-influence", label: "Claimed Territory Influence", amount: 1 },
  { key: "ignored-mortal-life", label: "Ignored Work, Family, or Bonds", amount: 1 },
  { key: "divine-asset", label: "Gained Truth, Relic, Vassal, or Worshippers", amount: 1 },
  { key: "spark-dominion", label: "Advanced Spark or Leaned Into Dominion", amount: 1 }
];

let trackerApp = null;

export function registerMortalDivineTrackerSettings() {
  game.settings.register(SYSTEM_ID, "mortalDivineTrackerChatMode", {
    name: "Mortal-Divine Balance chat output",
    hint: "Controls whether Mortal-Divine Balance adjustments post chat cards.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      none: "No chat card",
      gm: "Whisper to GMs",
      public: "Public chat card"
    },
    default: "none"
  });
}

export function openMortalDivineBalanceTracker(actor = null) {
  if (!game.user?.isGM) {
    ui.notifications.warn("Only a GM can open the Mortal-Divine Balance tracker.");
    return null;
  }

  if (!trackerApp) trackerApp = new MortalDivineBalanceTracker();
  if (actor) trackerApp.setActor(actor);
  trackerApp.render({ force: true });
  return trackerApp;
}

class MortalDivineBalanceTracker extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ["part-time-gods", "ptg-balance-tracker-window"],
    position: {
      width: 560,
      height: 680
    },
    window: {
      title: "Mortal-Divine Balance",
      resizable: true
    },
    tag: "form"
  };

  static PARTS = {
    form: {
      template: "systems/part-time-gods/templates/apps/mortal-divine-tracker.hbs"
    }
  };

  #actorUuid = "";

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = await this.#trackedActor();
    const state = actor ? balanceState(actor) : defaultBalanceState();
    const value = clampBalance(state.value);

    return {
      ...context,
      isGM: Boolean(game.user?.isGM),
      actor: actor ? {
        uuid: actor.uuid,
        name: actor.name,
        img: actor.img,
        value,
        label: balanceLabel(value),
        percent: ((value - MIN_BALANCE) / (MAX_BALANCE - MIN_BALANCE)) * 100,
        state
      } : null,
      mortalButtons: MORTAL_BUTTONS,
      divineButtons: DIVINE_BUTTONS,
      log: Array.from(state.log ?? []).slice(-20).reverse(),
      min: MIN_BALANCE,
      max: MAX_BALANCE
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);

    const root = this.element;
    root.addEventListener("dragover", event => event.preventDefault());
    root.addEventListener("drop", event => this.#onDrop(event));

    for (const button of root.querySelectorAll("[data-balance-action]")) {
      button.addEventListener("click", event => this.#onPreset(event.currentTarget));
    }

    root.querySelector("[data-balance-custom]")?.addEventListener("click", event => this.#onCustom(event.currentTarget));
    root.querySelector("[data-balance-clear]")?.addEventListener("click", () => this.#clearLog());
  }

  setActor(actor) {
    if (actor?.type !== "character") {
      ui.notifications.warn("Track a character actor for Mortal-Divine Balance.");
      return;
    }

    this.#actorUuid = actor.uuid;
  }

  async #onDrop(event) {
    event.preventDefault();
    if (!game.user?.isGM) return ui.notifications.warn("Only a GM can edit the Mortal-Divine Balance tracker.");

    const data = getDragEventData(event);
    const actor = await actorFromDropData(data);
    if (!actor || actor.type !== "character") {
      ui.notifications.warn("Drop a character actor onto the Mortal-Divine Balance tracker.");
      return;
    }

    this.setActor(actor);
    this.render({ force: true });
  }

  async #onPreset(button) {
    const actor = await this.#requireActor();
    if (!actor) return;

    await adjustBalance(actor, {
      direction: button.dataset.balanceDirection,
      amount: Number(button.dataset.balanceAmount ?? 1),
      reason: button.dataset.balanceReason ?? button.textContent?.trim() ?? "Balance adjustment",
      note: ""
    });
    this.render({ force: true });
  }

  async #onCustom(button) {
    const actor = await this.#requireActor();
    if (!actor) return;

    const form = button.form;
    await adjustBalance(actor, {
      direction: form.elements.balanceDirection?.value ?? "mortal",
      amount: Number(form.elements.balanceAmount?.value ?? 1),
      reason: "Custom adjustment",
      note: form.elements.balanceNote?.value?.trim() ?? ""
    });

    form.elements.balanceNote.value = "";
    this.render({ force: true });
  }

  async #clearLog() {
    const actor = await this.#requireActor();
    if (!actor) return;

    const confirmed = await DialogV2.confirm({
      window: { title: "Clear Balance Log" },
      content: `<p>Clear the Mortal-Divine Balance log for <strong>${escapeHTML(actor.name)}</strong>?</p>`,
      modal: true
    });
    if (!confirmed) return;

    const state = balanceState(actor);
    await actor.setFlag(SYSTEM_ID, FLAG_KEY, {
      ...state,
      log: []
    });
    this.render({ force: true });
  }

  async #requireActor() {
    if (!game.user?.isGM) {
      ui.notifications.warn("Only a GM can edit the Mortal-Divine Balance tracker.");
      return null;
    }

    const actor = await this.#trackedActor();
    if (!actor) ui.notifications.warn("Drop a character actor onto the tracker first.");
    return actor;
  }

  async #trackedActor() {
    if (!this.#actorUuid) return null;
    return fromUuid(this.#actorUuid);
  }
}

async function actorFromDropData(data) {
  if (data?.uuid) return fromUuid(data.uuid);
  if (data?.type === "Actor" && data.id) return game.actors.get(data.id);
  return null;
}

async function adjustBalance(actor, { direction, amount, reason, note }) {
  if (!game.user?.isGM) return false;

  const state = balanceState(actor);
  const cleanAmount = Math.max(1, Math.abs(Number(amount) || 1));
  const normalizedDirection = direction === "divine" ? "Divine" : "Mortal";
  const delta = normalizedDirection === "Divine" ? cleanAmount : -cleanAmount;
  const before = clampBalance(state.value);
  const after = clampBalance(before + delta);
  const log = Array.from(state.log ?? []);
  const entry = {
    order: log.length + 1,
    actorUuid: actor.uuid,
    actorName: actor.name,
    direction: normalizedDirection,
    amount: cleanAmount,
    reason,
    note,
    before,
    after,
    createdAt: new Date().toISOString()
  };

  await actor.setFlag(SYSTEM_ID, FLAG_KEY, {
    value: after,
    updatedAt: entry.createdAt,
    log: [...log, entry].slice(-100)
  });

  await postBalanceChat(actor, entry);
  return true;
}

function balanceState(actor) {
  return {
    ...defaultBalanceState(),
    ...(actor.getFlag(SYSTEM_ID, FLAG_KEY) ?? {})
  };
}

function defaultBalanceState() {
  return {
    value: 0,
    updatedAt: "",
    log: []
  };
}

function clampBalance(value) {
  return Math.max(MIN_BALANCE, Math.min(MAX_BALANCE, Number(value) || 0));
}

function balanceLabel(value) {
  if (value <= -7) return "Strongly Mortal";
  if (value <= -3) return "Mortal Leaning";
  if (value >= 7) return "Strongly Divine";
  if (value >= 3) return "Divine Leaning";
  return "Balanced";
}

async function postBalanceChat(actor, entry) {
  const mode = game.settings.get(SYSTEM_ID, "mortalDivineTrackerChatMode");
  if (mode === "none") return;

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    whisper: mode === "gm" ? ChatMessage.getWhisperRecipients("GM").map(user => user.id) : [],
    content: `
      <div class="ptg-chat-card">
        <h3>Mortal-Divine Balance</h3>
        <div><strong>Actor:</strong> ${escapeHTML(actor.name)}</div>
        <div><strong>Direction:</strong> ${escapeHTML(entry.direction)}</div>
        <div><strong>Reason:</strong> ${escapeHTML(entry.reason)}</div>
        <div><strong>Meter:</strong> ${entry.before} -> ${entry.after}</div>
        ${entry.note ? `<div><strong>Note:</strong> ${escapeHTML(entry.note)}</div>` : ""}
      </div>
    `
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
