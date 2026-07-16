import { getDragEventData } from "../util/drop-data.mjs";
import { openAntagonistBuilder } from "../data/premade-actors.mjs";
import { importGodTerritoryScene } from "../data/premade-scenes.mjs";
import { openTerritoryInterface } from "../apps/territory-grid-app.mjs";
import { openPTGCombatControls } from "../combat/ptg-combat.mjs";
import { openMortalDivineBalanceTracker } from "../apps/mortal-divine-tracker.mjs";
import { openPantheonPoolDialog } from "../workflows/pantheon-pool-workflow.mjs";
import { openPTGStoryWorkflow } from "../workflows/story-workflow.mjs";
import { PTG_IMAGE_FALLBACK, imageSource, wireImageFallbacks } from "../util/image-fallback.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class PTGPantheonSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["part-time-gods", "sheet", "pantheon"],
    position: {
      width: 720,
      height: 620
    },
    window: {
      title: "PTG.Sheet.PantheonSheet",
      resizable: true
    },
    dragDrop: [{ dropSelector: ".ptg-sheet" }],
    form: {
      closeOnSubmit: false,
      submitOnChange: true,
      handler: PTGPantheonSheet._onSubmit
    }
  };

  static PARTS = {
    form: {
      template: "systems/part-time-gods/templates/actor/pantheon-sheet.hbs"
    }
  };

  static async _onSubmit(event, form, formData) {
    const data = formData?.object ?? {};
    return this.actor.update(data);
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.actor = this.actor;
    context.system = this.actor.system;
    context.actorImg = imageSource(this.actor?.img, PTG_IMAGE_FALLBACK);
    context.imageFallback = PTG_IMAGE_FALLBACK;
    context.members = await this.#prepareMembers();
    context.canManageMembers = canManagePantheonMembers(this.actor);
    context.memberOptions = context.canManageMembers ? pantheonMemberAddOptions({
      actors: game.actors,
      currentMembers: this.actor.system.members
    }) : [];
    context.canUseWorldTools = canUsePantheonWorldTools(this.actor);
    context.canUseSetupTools = game.user?.isGM;

    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    wireImageFallbacks(this.element, PTG_IMAGE_FALLBACK);

    for (const button of this.element.querySelectorAll("[data-member-action]")) {
      button.addEventListener("click", event => this.#onMemberAction(event.currentTarget));
    }

    this.element.querySelector("[data-member-add]")?.addEventListener("click", () => this.#addSelectedMember());
    this.element.querySelector("[data-pantheon-pool-workflow]")?.addEventListener("click", () => openPantheonPoolDialog({ pantheon: this.actor }));

    for (const button of this.element.querySelectorAll("[data-pantheon-tool]")) {
      button.addEventListener("click", event => this.#onPantheonTool(event.currentTarget.dataset.pantheonTool));
    }
  }

  async _onDrop(event) {
    if (!canManagePantheonMembers(this.actor)) {
      ui.notifications.warn("You need owner permission to add Pantheon members.");
      return false;
    }

    const data = getDragEventData(event);
    if (data?.type !== "Actor") return false;

    const actor = await actorFromDropData(data);
    if (!actor || actor.type !== "character") {
      ui.notifications.warn("Drop a Part-Time Gods character actor to add a Pantheon member.");
      return false;
    }

    await this.#addMember(actor);
    return false;
  }

  async #prepareMembers() {
    const members = Array.from(this.actor.system.members ?? []);
    return Promise.all(members.map(async member => {
      const actor = await fromUuid(member.uuid);
      if (!actor) {
        return {
          ...member,
          missing: true,
          img: imageSource(member.img, PTG_IMAGE_FALLBACK),
          imageFallback: PTG_IMAGE_FALLBACK,
          name: member.name || member.uuid,
          summary: "Linked actor could not be found."
        };
      }

      return preparePantheonMemberContext(actor, {
        canManageMembers: canManagePantheonMembers(this.actor)
      });
    }));
  }

  async #addMember(actor) {
    const members = Array.from(this.actor.system.members ?? []);
    if (members.some(member => member.uuid === actor.uuid)) {
      ui.notifications.info(`${actor.name} is already linked to this Pantheon.`);
      return;
    }

    members.push({ uuid: actor.uuid, name: actor.name });
    await this.actor.update({ "system.members": members });
  }

  async #addSelectedMember() {
    if (!canManagePantheonMembers(this.actor)) {
      ui.notifications.warn("You need owner permission to add Pantheon members.");
      return;
    }

    const select = this.element.querySelector("[data-member-add-select]");
    const uuid = select?.value;
    if (!uuid) {
      ui.notifications.warn("Choose a character to add to this Pantheon.");
      return;
    }

    const actor = await fromUuid(uuid);
    if (!actor || actor.type !== "character") {
      ui.notifications.warn("Choose a Part-Time Gods character actor.");
      return;
    }

    await this.#addMember(actor);
  }

  async #onMemberAction(button) {
    const row = button.closest("[data-member-uuid]");
    const uuid = row?.dataset.memberUuid;
    if (!uuid) return;

    if (["remove", "up", "down"].includes(button.dataset.memberAction)) {
      if (!canManagePantheonMembers(this.actor)) {
        ui.notifications.warn("You need owner permission to manage Pantheon members.");
        return;
      }
    }

    if (button.dataset.memberAction === "remove") {
      const members = Array.from(this.actor.system.members ?? []).filter(member => member.uuid !== uuid);
      await this.actor.update({ "system.members": members });
      return;
    }

    if (button.dataset.memberAction === "up" || button.dataset.memberAction === "down") {
      const members = Array.from(this.actor.system.members ?? []);
      const index = members.findIndex(member => member.uuid === uuid);
      const offset = button.dataset.memberAction === "up" ? -1 : 1;
      const target = index + offset;
      if (index < 0 || target < 0 || target >= members.length) return;
      [members[index], members[target]] = [members[target], members[index]];
      await this.actor.update({ "system.members": members });
      return;
    }

    if (button.dataset.memberAction === "open") {
      const actor = await fromUuid(uuid);
      if (canViewPantheonMemberActor(actor)) actor?.sheet?.render(true);
      else ui.notifications.warn("You do not have permission to open that character sheet.");
    }

    if (button.dataset.memberAction === "balance") {
      const actor = await fromUuid(uuid);
      if (actor?.type === "character") openMortalDivineBalanceTracker(actor);
    }
  }

  async #onPantheonTool(tool) {
    if (!tool) return;

    if (["create-territory-scene", "antagonist-builder"].includes(tool) && !game.user?.isGM) {
      ui.notifications.warn("Only a GM can use setup tools.");
      return;
    }

    if (tool === "antagonist-builder") return openAntagonistBuilder();
    if (tool === "combat") return openPTGCombatControls();
    if (tool === "balance") return openMortalDivineBalanceTracker();
    if (tool === "pantheon-pool") return openPantheonPoolDialog({ pantheon: this.actor });
    if (tool === "story-workflow") return openPTGStoryWorkflow({ pantheon: this.actor });

    if (tool === "create-territory-scene") {
      const scene = await importGodTerritoryScene({ activate: false });
      if (scene && canManagePantheonMembers(this.actor)) await this.actor.update({ "system.territorySceneUuid": scene.uuid });
      return scene;
    }

    if (tool === "territory-controls") {
      const scene = await this.#territoryScene();
      return scene ? openTerritoryInterface({ scene }) : openTerritoryInterface();
    }

    ui.notifications.warn(`Unsupported Pantheon tool: ${tool}`);
    return null;
  }

  async #territoryScene() {
    const uuid = this.actor.system.territorySceneUuid;
    if (!uuid) return null;

    try {
      const scene = await fromUuid(uuid);
      return scene?.documentName === "Scene" ? scene : null;
    } catch (error) {
      console.warn("Part-Time Gods 2E | Unable to resolve Pantheon territory scene.", uuid, error);
      return null;
    }
  }
}

async function actorFromDropData(data) {
  if (data.uuid) return fromUuid(data.uuid);
  if (data.id) return game.actors.get(data.id);
  return null;
}

export function preparePantheonMemberContext(actor, { user = game.user, canManageMembers = false } = {}) {
  const canViewDetails = canViewPantheonMemberActor(actor, user);
  const canOpen = canViewDetails;
  const base = {
    uuid: actor.uuid,
    name: actor.name,
    img: imageSource(actor.img, PTG_IMAGE_FALLBACK),
    imageFallback: PTG_IMAGE_FALLBACK,
    canOpen,
    limited: !canViewDetails,
    summary: "You do not have permission to view this character's private resources."
  };

  if (!canViewDetails) return base;

  const resources = actor.system.resources ?? {};
  const identity = actor.system.identity ?? {};
  const attachments = actor.items?.filter?.(item => ["bond", "worshipper", "vassal"].includes(item.type)) ?? [];
  const strained = attachments.filter(item => Number(item.system.strain?.value ?? 0) > 0);
  const ownerNames = canManageMembers ? Object.entries(actor.ownership ?? {})
    .filter(([userId, level]) => userId !== "default" && ownershipLevelValue(level) >= ownershipLevelValue(ownerPermissionLevel()))
    .map(([userId]) => game.users?.get?.(userId)?.name)
    .filter(Boolean) : [];

  return {
    ...base,
    limited: false,
    dominion: identity.dominion || "No Dominion",
    theology: identity.theology || "No Theology",
    spark: Number(resources.spark ?? 1),
    health: `${Number(resources.health?.value ?? 0)} / ${Number(resources.health?.max ?? 0)}`,
    psyche: `${Number(resources.psyche?.value ?? 0)} / ${Number(resources.psyche?.max ?? 0)}`,
    fragments: `${Number(resources.fragments?.value ?? 0)} / ${Number(resources.fragments?.max ?? 0)}`,
    attachments: attachments.length,
    warnings: strained.map(item => `${item.name} Strain ${Number(item.system.strain?.value ?? 0)} / ${Number(item.system.strain?.max ?? item.system.level ?? 0)}`),
    owners: ownerNames.join(", ")
  };
}

export function pantheonMemberAddOptions({ actors = game.actors, currentMembers = [], user = game.user } = {}) {
  const currentUuids = new Set(Array.from(currentMembers ?? []).map(member => member.uuid).filter(Boolean));
  return actorCollectionValues(actors)
    .filter(actor => actor?.type === "character")
    .filter(actor => actor.uuid && !currentUuids.has(actor.uuid))
    .filter(actor => canViewPantheonMemberActor(actor, user))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)))
    .map(actor => ({
      uuid: actor.uuid,
      name: actor.name
    }));
}

export function canManagePantheonMembers(pantheon, user = game.user) {
  if (!pantheon) return false;
  if (user?.isGM || pantheon.isOwner) return true;
  return hasDocumentPermission(pantheon, user, ownerPermissionLevel());
}

export function canUsePantheonWorldTools(pantheon, user = game.user) {
  return Boolean(user?.isGM || canManagePantheonMembers(pantheon, user));
}

export function canViewPantheonMemberActor(actor, user = game.user) {
  if (!actor) return false;
  if (user?.isGM || actor.isOwner) return true;
  return hasDocumentPermission(actor, user, observerPermissionLevel())
    || hasDocumentPermission(actor, user, ownerPermissionLevel());
}

function hasDocumentPermission(document, user, level) {
  if (!document || !user || typeof document.testUserPermission !== "function") return false;
  try {
    return Boolean(document.testUserPermission(user, level));
  } catch (error) {
    return false;
  }
}

function actorCollectionValues(actors) {
  if (!actors) return [];
  if (typeof actors.filter === "function" && typeof actors.map === "function") return actors.filter(() => true);
  if (typeof actors.values === "function") return Array.from(actors.values());
  return Array.from(actors).map(entry => Array.isArray(entry) ? entry[1] : entry);
}

function ownerPermissionLevel() {
  return "OWNER";
}

function observerPermissionLevel() {
  return "OBSERVER";
}

function ownershipLevelValue(level) {
  if (typeof level === "number") return level;
  const key = String(level).toUpperCase();
  const fallback = {
    NONE: 0,
    LIMITED: 1,
    OBSERVER: 2,
    OWNER: 3
  };
  return Number(globalThis.CONST?.DOCUMENT_OWNERSHIP_LEVELS?.[key] ?? fallback[key] ?? 0);
}
