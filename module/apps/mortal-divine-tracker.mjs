import { getDragEventData } from "../util/drop-data.mjs";
import { PTG_IMAGE_FALLBACK, imageSource, wireImageFallbacks } from "../util/image-fallback.mjs";
import { SYSTEM_ID, localize, localizeFallback } from "../util/localization.mjs";

const FLAG_KEY = "mortalDivineBalance";
const TRACKED_CHARACTERS_SETTING = "mortalDivineTrackedCharacters";
const BALANCE_SOCKET_SHOW_PLAYER_BAR = "mortalDivineBalance.showPlayerBar";
const MIN_BALANCE = -10;
const MAX_BALANCE = 10;

const { ApplicationV2, DialogV2, HandlebarsApplicationMixin } = foundry.applications.api;

const MORTAL_BUTTONS = [
  { key: "helped-bond", labelKey: "PTG.Balance.Buttons.HelpedBond", fallback: "Helped a Bond", amount: 1 },
  { key: "went-to-work", labelKey: "PTG.Balance.Buttons.WentToWork", fallback: "Went to Work", amount: 1 },
  { key: "protected-mortal-life", labelKey: "PTG.Balance.Buttons.ProtectedMortalLife", fallback: "Protected Mortal Life", amount: 1 },
  { key: "human-obligations", labelKey: "PTG.Balance.Buttons.HumanObligations", fallback: "Spent Free Time on Human Obligations", amount: 1 },
  { key: "repaired-strain", labelKey: "PTG.Balance.Buttons.RepairedStrain", fallback: "Repaired Strain or Relationship Harm", amount: 1 },
  { key: "mortal-consequences", labelKey: "PTG.Balance.Buttons.MortalConsequences", fallback: "Chose Mortal Consequences", amount: 1 }
];

const DIVINE_BUTTONS = [
  { key: "answered-worshippers", labelKey: "PTG.Balance.Buttons.AnsweredWorshippers", fallback: "Answered Worshippers", amount: 1 },
  { key: "public-manifestation", labelKey: "PTG.Balance.Buttons.PublicManifestation", fallback: "Used Manifestation Publicly", amount: 1 },
  { key: "ritual", labelKey: "PTG.Balance.Buttons.Ritual", fallback: "Performed a Ritual", amount: 1 },
  { key: "territory-influence", labelKey: "PTG.Balance.Buttons.TerritoryInfluence", fallback: "Claimed Territory Influence", amount: 1 },
  { key: "ignored-mortal-life", labelKey: "PTG.Balance.Buttons.IgnoredMortalLife", fallback: "Ignored Work, Family, or Bonds", amount: 1 },
  { key: "divine-asset", labelKey: "PTG.Balance.Buttons.DivineAsset", fallback: "Gained Truth, Relic, Vassal, or Worshippers", amount: 1 },
  { key: "spark-dominion", labelKey: "PTG.Balance.Buttons.SparkDominion", fallback: "Advanced Spark or Leaned Into Dominion", amount: 1 }
];

let trackerApp = null;
let playerBarApp = null;
let socketRegistered = false;
const shownPlayerBarRecipients = new Map();

export function registerMortalDivineTrackerSettings() {
  game.settings.register(SYSTEM_ID, "mortalDivineTrackerChatMode", {
    name: localize("PTG.Settings.BalanceChatMode.Name"),
    hint: localize("PTG.Settings.BalanceChatMode.Hint"),
    scope: "world",
    config: true,
    type: String,
    choices: {
      none: localize("PTG.Settings.BalanceChatMode.Choices.None"),
      gm: localize("PTG.Settings.BalanceChatMode.Choices.Gm"),
      public: localize("PTG.Settings.BalanceChatMode.Choices.Public")
    },
    default: "none"
  });
  game.settings.register(SYSTEM_ID, "autoOpenMortalDivineTracker", {
    name: localize("PTG.Settings.AutoOpenBalanceTracker.Name"),
    hint: localize("PTG.Settings.AutoOpenBalanceTracker.Hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(SYSTEM_ID, TRACKED_CHARACTERS_SETTING, {
    name: localize("PTG.Settings.BalanceTrackedCharacters.Name"),
    scope: "world",
    config: false,
    type: Array,
    default: []
  });
}

export function registerMortalDivineTrackerSocket() {
  if (socketRegistered || !game.socket?.on) return false;
  game.socket.on(`system.${SYSTEM_ID}`, message => void handleBalanceSocketMessage(message));
  socketRegistered = true;
  return true;
}

export async function maybeOpenMortalDivineBalanceTrackerOnReady() {
  if (!game.settings.get(SYSTEM_ID, "autoOpenMortalDivineTracker")) return false;
  if (!game.user?.isGM && !balanceTrackerCharacters().length) return false;

  openMortalDivineBalanceTracker();
  return true;
}

export function openMortalDivineBalanceTracker(actor = null) {
  if (!trackerApp) trackerApp = new MortalDivineBalanceTracker();
  if (actor) trackerApp.setActor(actor);
  trackerApp.render({ force: true });
  return trackerApp;
}

export function openMortalDivineBalancePlayerBar(actor = null) {
  if (!playerBarApp) playerBarApp = new MortalDivineBalancePlayerBar();
  if (actor) playerBarApp.setActor(actor);
  playerBarApp.render({ force: true });
  return playerBarApp;
}

class MortalDivineBalanceTracker extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ["part-time-gods", "ptg-balance-tracker-window"],
    position: {
      width: 820,
      height: 680
    },
    window: {
      title: "PTG.Balance.Title",
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
    const actor = await this.#selectedOrDefaultActor();
    const isGM = Boolean(game.user?.isGM);
    const actorOptions = characterActorOptions(actor, { includeAll: isGM });
    const trackedActors = balanceTrackerCharacters(actor);
    const state = actor ? balanceState(actor) : defaultBalanceState();

    return {
      ...context,
      isGM,
      isPlayerView: !isGM,
      isPlayerBar: false,
      actorOptions: actorOptions.map(option => actorOptionContext(option, actor)),
      partyCharacters: trackedActors.map(option => partyCharacterContext(option, actor)),
      actor: actor ? balanceActorContext(actor, state) : null,
      mortalButtons: localizedButtons(MORTAL_BUTTONS),
      divineButtons: localizedButtons(DIVINE_BUTTONS),
      log: Array.from(state.log ?? []).slice(-20).reverse().map(entry => ({
        ...entry,
        directionLabel: directionLabel(entry.direction)
      })),
      min: MIN_BALANCE,
      max: MAX_BALANCE
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);

    const root = this.element;
    wireImageFallbacks(root, PTG_IMAGE_FALLBACK);
    root.addEventListener("dragover", event => this.#onDragOver(event), true);
    root.addEventListener("drop", event => this.#onDrop(event), true);

    root.querySelector("[data-balance-actor-select]")?.addEventListener("change", event => this.#onActorSelect(event.currentTarget));
    root.querySelector("[data-balance-add]")?.addEventListener("click", event => this.#addSelectedActor(event.currentTarget));

    root.addEventListener("click", event => this.#onClick(event));
  }

  setActor(actor) {
    if (actor?.type !== "character") {
      ui.notifications.warn(localize("PTG.Balance.TrackCharacter"));
      return;
    }
    if (!game.user?.isGM && !canViewBalanceActor(actor)) {
      ui.notifications.warn(localize("PTG.Balance.NoOwnedCharacters"));
      return;
    }

    this.#actorUuid = actor.uuid;
    if (game.user?.isGM) void addTrackedCharacter(actor);
  }

  #onActorSelect(select) {
    this.#actorUuid = select.value ?? "";
    this.render({ force: true });
  }

  #onTrack(button) {
    this.#actorUuid = button.dataset.balanceTrack ?? "";
    this.render({ force: true });
  }

  #onClick(event) {
    const button = event.target?.closest?.("button");
    if (!button || !this.element?.contains(button)) return;

    const action = Object.hasOwn(button.dataset, "balanceAction");
    const track = button.dataset.balanceTrack;
    const remove = button.dataset.balanceRemove;
    const showPlayer = button.dataset.balanceShowPlayer;
    const add = Object.hasOwn(button.dataset, "balanceAdd");
    const custom = Object.hasOwn(button.dataset, "balanceCustom");
    const clear = Object.hasOwn(button.dataset, "balanceClear");
    if (!action && !track && !remove && !showPlayer && !add && !custom && !clear) return;

    event.preventDefault();
    if (track) return this.#onTrack(button);
    if (remove) return void this.#removeTrackedActor(button);
    if (showPlayer) return void this.#showPlayerBar(button);
    if (action) return void this.#onPreset(button);
    if (add) return void this.#addSelectedActor(button);
    if (custom) return void this.#onCustom(button);
    if (clear) return void this.#clearLog();
  }

  async #addSelectedActor(button) {
    if (!game.user?.isGM) return ui.notifications.warn(localize("PTG.Balance.OnlyGMEdit"));

    const uuid = button.form?.elements.balanceActorUuid?.value ?? "";
    const actor = await actorFromUuid(uuid);
    if (!actor || actor.type !== "character") {
      ui.notifications.warn(localize("PTG.Balance.TrackCharacter"));
      return null;
    }

    await addTrackedCharacter(actor);
    this.#actorUuid = actor.uuid;
    this.render({ force: true });
    return actor;
  }

  async #removeTrackedActor(button) {
    if (!game.user?.isGM) return ui.notifications.warn(localize("PTG.Balance.OnlyGMEdit"));

    const uuid = button.dataset.balanceRemove ?? "";
    await removeTrackedCharacterUuid(uuid);
    if (this.#actorUuid === uuid) this.#actorUuid = "";
    this.render({ force: true });
    return uuid;
  }

  async #showPlayerBar(button) {
    if (!game.user?.isGM) return ui.notifications.warn(localize("PTG.Balance.OnlyGMEdit"));

    const actor = await actorFromUuid(button.dataset.balanceShowPlayer ?? "");
    if (!actor || actor.type !== "character") {
      ui.notifications.warn(localize("PTG.Balance.TrackCharacter"));
      return [];
    }

    return showMortalDivineBalanceBarToOwners(actor);
  }

  async #onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!game.user?.isGM) return ui.notifications.warn(localize("PTG.Balance.OnlyGMEdit"));

    const data = getDragEventData(event);
    const actor = await balanceActorFromDropData(data);
    if (!actor || actor.type !== "character") {
      ui.notifications.warn(localize("PTG.Balance.DropCharacter"));
      return;
    }

    await addTrackedCharacter(actor);
    this.setActor(actor);
    this.render({ force: true });
  }

  #onDragOver(event) {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  }

  async #onPreset(button) {
    const actor = await this.#requireActor();
    if (!actor) return;

    await adjustBalance(actor, {
      direction: button.dataset.balanceDirection,
      amount: Number(button.dataset.balanceAmount ?? 1),
      reason: button.dataset.balanceReason ?? button.textContent?.trim() ?? localize("PTG.Balance.BalanceAdjustment"),
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
      reason: localize("PTG.Balance.CustomReason"),
      note: form.elements.balanceNote?.value?.trim() ?? ""
    });

    form.elements.balanceNote.value = "";
    this.render({ force: true });
  }

  async #clearLog() {
    const actor = await this.#requireActor();
    if (!actor) return;

    const confirmed = await DialogV2.confirm({
      window: { title: localize("PTG.Balance.ClearLogTitle") },
      content: `<p>${localize("PTG.Balance.ClearLogContent", { actorName: escapeHTML(actor.name) })}</p>`,
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
      ui.notifications.warn(localize("PTG.Balance.OnlyGMEdit"));
      return null;
    }

    const actor = await this.#trackedActor();
    if (!actor) ui.notifications.warn(localize("PTG.Balance.DropFirst"));
    return actor;
  }

  async #selectedOrDefaultActor() {
    const tracked = await this.#trackedActor();
    if (tracked) return tracked;

    const fallback = balanceTrackerCharacters()[0] ?? defaultSelectedCharacterActor();
    if (fallback) {
      this.#actorUuid = fallback.uuid;
      return fallback;
    }

    this.#actorUuid = "";
    return null;
  }

  async #trackedActor() {
    if (!this.#actorUuid) return null;
    try {
      const actor = actorDocumentFromResolved(await fromUuid(this.#actorUuid));
      return actor?.type === "character" && (game.user?.isGM || canViewBalanceActor(actor)) ? actor : null;
    } catch (error) {
      console.warn("Part-Time Gods 2E | Unable to resolve Mortal-Divine Balance actor.", this.#actorUuid, error);
      return null;
    }
  }
}

class MortalDivineBalancePlayerBar extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ["part-time-gods", "ptg-balance-player-bar-window"],
    position: {
      width: 460,
      height: 260
    },
    window: {
      title: "PTG.Balance.PlayerBarTitle",
      resizable: true
    },
    tag: "section"
  };

  static PARTS = {
    form: {
      template: "systems/part-time-gods/templates/apps/mortal-divine-tracker.hbs"
    }
  };

  #actorUuid = "";

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = await actorFromUuid(this.#actorUuid);
    const visibleActor = actor?.type === "character" && canViewBalanceActor(actor) ? actor : null;

    return {
      ...context,
      isGM: false,
      isPlayerView: true,
      isPlayerBar: true,
      actor: visibleActor ? balanceActorContext(visibleActor) : null,
      min: MIN_BALANCE,
      max: MAX_BALANCE
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    wireImageFallbacks(this.element, PTG_IMAGE_FALLBACK);
  }

  setActor(actor) {
    if (actor?.type !== "character" || !canViewBalanceActor(actor)) {
      ui.notifications.warn(localize("PTG.Balance.NoOwnedCharacters"));
      return;
    }

    this.#actorUuid = actor.uuid;
  }
}

async function handleBalanceSocketMessage(message) {
  if (message?.type !== BALANCE_SOCKET_SHOW_PLAYER_BAR) return;
  if (!Array.isArray(message.userIds) || !message.userIds.includes(game.user?.id)) return;

  const actor = await actorFromUuid(message.actorUuid);
  if (!actor || actor.type !== "character" || !canViewBalanceActor(actor)) return;

  openMortalDivineBalancePlayerBar(actor);
}

export async function showMortalDivineBalanceBarToOwners(actor) {
  if (!game.user?.isGM) {
    ui.notifications.warn(localize("PTG.Balance.OnlyGMEdit"));
    return [];
  }
  if (!actor || actor.type !== "character") {
    ui.notifications.warn(localize("PTG.Balance.TrackCharacter"));
    return [];
  }

  const owners = balanceBarOwnerUsers(actor);
  const userIds = owners.map(user => user.id).filter(Boolean);
  if (!userIds.length) {
    ui.notifications.warn(localize("PTG.Balance.NoOwningPlayer", { actorName: actor.name }));
    return [];
  }

  shownPlayerBarRecipients.set(actor.uuid, new Set(userIds));
  emitBalanceBarSocket(actor, userIds);
  ui.notifications.info(localize("PTG.Balance.PlayerBarSent", {
    actorName: actor.name,
    users: owners.map(user => user.name ?? user.id).join(", ")
  }));
  return userIds;
}

function emitBalanceBarSocket(actor, userIds) {
  if (!game.socket?.emit || !actor?.uuid) return false;
  const targetUserIds = Array.from(new Set(userIds.map(id => String(id ?? "").trim()).filter(Boolean)));
  if (!targetUserIds.length) return false;

  game.socket.emit(`system.${SYSTEM_ID}`, {
    type: BALANCE_SOCKET_SHOW_PLAYER_BAR,
    actorUuid: actor.uuid,
    userIds: targetUserIds,
    senderId: game.user?.id ?? ""
  });
  return true;
}

export async function balanceActorFromDropData(data) {
  try {
    const document = data?.uuid
      ? await fromUuid(data.uuid)
      : data?.type === "Actor" && data.id
        ? game.actors.get(data.id)
        : null;
    return actorDocumentFromResolved(document);
  } catch (error) {
    console.warn("Part-Time Gods 2E | Unable to resolve Mortal-Divine Balance drop data.", data, error);
  }

  return null;
}

async function actorFromUuid(uuid) {
  if (!uuid) return null;
  try {
    return actorDocumentFromResolved(await fromUuid(uuid));
  } catch (error) {
    console.warn("Part-Time Gods 2E | Unable to resolve Mortal-Divine Balance actor.", uuid, error);
    return null;
  }
}

function actorDocumentFromResolved(document) {
  if (document?.documentName === "Actor" || document?.constructor?.documentName === "Actor") return document;
  if (document?.actor?.documentName === "Actor" || document?.actor?.constructor?.documentName === "Actor") return document.actor;
  return null;
}

function defaultSelectedCharacterActor() {
  for (const token of Array.from(globalThis.canvas?.tokens?.controlled ?? [])) {
    if (token.actor?.type === "character") return token.actor;
  }

  return game.user?.character?.type === "character" ? game.user.character : null;
}

function characterActorOptions(selectedActor = null, { includeAll = Boolean(game.user?.isGM) } = {}) {
  const actors = new Map();
  addCharacterActor(actors, selectedActor);

  for (const token of Array.from(globalThis.canvas?.tokens?.controlled ?? [])) {
    addCharacterActor(actors, token.actor);
  }

  addCharacterActor(actors, game.user?.character);

  if (includeAll) for (const actor of game.actors ?? []) addCharacterActor(actors, actor);

  return Array.from(actors.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function balanceTrackerCharacters(selectedActor = null) {
  return visibleBalanceTrackerActors(characterActorOptions(selectedActor, { includeAll: true }), {
    trackedUuids: trackedCharacterUuids(),
    user: game.user,
    isGM: Boolean(game.user?.isGM)
  });
}

export function visibleBalanceTrackerActors(actors = [], { trackedUuids = [], user = game.user, isGM = Boolean(user?.isGM) } = {}) {
  const tracked = normalizeTrackedCharacterUuids(trackedUuids);
  const ordered = new Map();

  for (const uuid of tracked) {
    const actor = actors.find(candidate => candidate?.uuid === uuid);
    if (actor?.type === "character" && (isGM || canViewBalanceActor(actor, user))) ordered.set(actor.uuid, actor);
  }

  if (!tracked.length && !isGM) {
    for (const actor of actors) {
      if (actor?.type === "character" && canViewBalanceActor(actor, user)) ordered.set(actor.uuid, actor);
    }
  }

  return Array.from(ordered.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function balanceBarOwnerUsers(actor, users = game.users ?? []) {
  return Array.from(users ?? [])
    .filter(user => user && !user.isGM && canViewBalanceActor(actor, user));
}

export function normalizeTrackedCharacterUuids(value) {
  const source = Array.isArray(value) ? value : [];
  return Array.from(new Set(source.map(uuid => String(uuid ?? "").trim()).filter(Boolean)));
}

function trackedCharacterUuids() {
  return normalizeTrackedCharacterUuids(game.settings.get(SYSTEM_ID, TRACKED_CHARACTERS_SETTING));
}

async function addTrackedCharacter(actor) {
  if (!game.user?.isGM || actor?.type !== "character") return trackedCharacterUuids();

  const uuids = normalizeTrackedCharacterUuids([...trackedCharacterUuids(), actor.uuid]);
  await game.settings.set(SYSTEM_ID, TRACKED_CHARACTERS_SETTING, uuids);
  return uuids;
}

async function removeTrackedCharacterUuid(uuid) {
  if (!game.user?.isGM || !uuid) return trackedCharacterUuids();

  const uuids = trackedCharacterUuids().filter(candidate => candidate !== uuid);
  await game.settings.set(SYSTEM_ID, TRACKED_CHARACTERS_SETTING, uuids);
  return uuids;
}

export function canViewBalanceActor(actor, user = game.user) {
  if (!actor || actor.type !== "character") return false;
  if (user?.isGM) return true;
  if (!user) return false;
  if (user?.id && user.id === game.user?.id && actor.isOwner) return true;
  if (typeof actor.testUserPermission === "function") return actor.testUserPermission(user, "OWNER");

  const ownerLevel = globalThis.CONST?.DOCUMENT_OWNERSHIP_LEVELS?.OWNER ?? 3;
  const permission = actor.ownership?.[user?.id] ?? actor.permission?.[user?.id] ?? actor.ownership?.default ?? 0;
  return Number(permission) >= ownerLevel;
}

function balanceActorContext(actor, state = balanceState(actor)) {
  const value = clampBalance(state.value);
  return {
    uuid: actor.uuid,
    name: actor.name,
    img: imageSource(actor.img, PTG_IMAGE_FALLBACK),
    imageFallback: PTG_IMAGE_FALLBACK,
    value,
    label: balanceLabel(value),
    percent: ((value - MIN_BALANCE) / (MAX_BALANCE - MIN_BALANCE)) * 100,
    state
  };
}

function addCharacterActor(actors, actor) {
  if (actor?.type === "character") actors.set(actor.uuid, actor);
}

function actorOptionContext(actor, selectedActor) {
  const value = clampBalance(balanceState(actor).value);
  return {
    uuid: actor.uuid,
    label: `${actor.name} - ${balanceLabel(value)} (${value})`,
    selected: actor.uuid === selectedActor?.uuid
  };
}

function partyCharacterContext(actor, selectedActor) {
  const state = balanceState(actor);
  const value = clampBalance(state.value);
  const log = Array.from(state.log ?? []);
  const lastEntry = log.at(-1) ?? null;

  return {
    uuid: actor.uuid,
    name: actor.name,
    img: imageSource(actor.img, PTG_IMAGE_FALLBACK),
    imageFallback: PTG_IMAGE_FALLBACK,
    value,
    label: balanceLabel(value),
    percent: ((value - MIN_BALANCE) / (MAX_BALANCE - MIN_BALANCE)) * 100,
    selected: actor.uuid === selectedActor?.uuid,
    logCount: log.length,
    lastMovement: lastEntry ? `${directionLabel(lastEntry.direction)} ${lastEntry.amount}: ${lastEntry.reason}` : ""
  };
}

async function adjustBalance(actor, { direction, amount, reason, note }) {
  if (!game.user?.isGM) return false;

  const state = balanceState(actor);
  const cleanAmount = clampAdjustmentAmount(amount);
  const normalizedDirection = normalizeDirection(direction);
  const delta = normalizedDirection === "divine" ? cleanAmount : -cleanAmount;
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
  await refreshShownBalanceBar(actor);
  return true;
}

async function refreshShownBalanceBar(actor) {
  const shownUserIds = shownPlayerBarRecipients.get(actor.uuid);
  if (!shownUserIds?.size) return [];

  const userIds = balanceBarOwnerUsers(actor)
    .map(user => user.id)
    .filter(id => shownUserIds.has(id));
  if (!userIds.length) return [];

  emitBalanceBarSocket(actor, userIds);
  return userIds;
}

function balanceState(actor) {
  const saved = actor.getFlag(SYSTEM_ID, FLAG_KEY) ?? {};

  return {
    ...defaultBalanceState(),
    ...(saved && typeof saved === "object" ? saved : {}),
    value: clampBalance(saved?.value),
    log: sanitizeLog(saved?.log)
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
  const number = Number(value);
  return Math.max(MIN_BALANCE, Math.min(MAX_BALANCE, Number.isFinite(number) ? number : 0));
}

function balanceLabel(value) {
  if (value <= -7) return localize("PTG.Balance.States.StronglyMortal");
  if (value <= -3) return localize("PTG.Balance.States.MortalLeaning");
  if (value >= 7) return localize("PTG.Balance.States.StronglyDivine");
  if (value >= 3) return localize("PTG.Balance.States.DivineLeaning");
  return localize("PTG.Balance.States.Balanced");
}

async function postBalanceChat(actor, entry) {
  const mode = game.settings.get(SYSTEM_ID, "mortalDivineTrackerChatMode");
  if (mode === "none") return;

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    whisper: mode === "gm" ? ChatMessage.getWhisperRecipients("GM").map(user => user.id) : [],
    content: `
      <div class="ptg-chat-card">
        <h3>${escapeHTML(localize("PTG.Balance.ChatTitle"))}</h3>
        <div><strong>${escapeHTML(localize("PTG.Balance.Actor"))}:</strong> ${escapeHTML(actor.name)}</div>
        <div><strong>${escapeHTML(localize("PTG.Balance.DirectionLabel"))}:</strong> ${escapeHTML(directionLabel(entry.direction))}</div>
        <div><strong>${escapeHTML(localize("PTG.Balance.Reason"))}:</strong> ${escapeHTML(entry.reason)}</div>
        <div><strong>${escapeHTML(localize("PTG.Balance.Meter"))}:</strong> ${entry.before} -&gt; ${entry.after}</div>
        ${entry.note ? `<div><strong>${escapeHTML(localize("PTG.Balance.Note"))}:</strong> ${escapeHTML(entry.note)}</div>` : ""}
      </div>
    `
  });
}

function localizedButtons(buttons) {
  return buttons.map(button => ({
    ...button,
    label: localizeFallback(button.labelKey, button.fallback)
  }));
}

function sanitizeLog(log) {
  return Array.isArray(log)
    ? log.filter(entry => entry && typeof entry === "object").slice(-100)
    : [];
}

function clampAdjustmentAmount(value) {
  const number = Math.abs(Number(value));
  return Math.max(1, Math.min(MAX_BALANCE, Number.isFinite(number) ? number : 1));
}

function normalizeDirection(direction) {
  return String(direction ?? "").toLowerCase() === "divine" ? "divine" : "mortal";
}

function directionLabel(direction) {
  const normalized = normalizeDirection(direction);
  return normalized === "divine"
    ? localize("PTG.Balance.Directions.Divine")
    : localize("PTG.Balance.Directions.Mortal");
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
