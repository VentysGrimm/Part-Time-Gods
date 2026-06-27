import { getDragEventData } from "../util/drop-data.mjs";

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
    context.members = await this.#prepareMembers();

    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);

    for (const button of this.element.querySelectorAll("[data-member-action]")) {
      button.addEventListener("click", event => this.#onMemberAction(event.currentTarget));
    }
  }

  async _onDrop(event) {
    if (!this.actor.isOwner) {
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
          name: member.name || member.uuid,
          summary: "Linked actor could not be found."
        };
      }

      const resources = actor.system.resources ?? {};
      const identity = actor.system.identity ?? {};
      const attachments = actor.items?.filter?.(item => ["bond", "worshipper", "vassal"].includes(item.type)) ?? [];
      const strained = attachments.filter(item => Number(item.system.strain?.value ?? 0) > 0);
      const ownerNames = Object.entries(actor.ownership ?? {})
        .filter(([userId, level]) => userId !== "default" && Number(level) >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
        .map(([userId]) => game.users.get(userId)?.name)
        .filter(Boolean);

      return {
        uuid: actor.uuid,
        name: actor.name,
        img: actor.img,
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

  async #onMemberAction(button) {
    const row = button.closest("[data-member-uuid]");
    const uuid = row?.dataset.memberUuid;
    if (!uuid) return;

    if (["remove", "up", "down"].includes(button.dataset.memberAction) && !this.actor.isOwner) {
      ui.notifications.warn("You need owner permission to manage Pantheon members.");
      return;
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
      actor?.sheet?.render(true);
    }
  }
}

async function actorFromDropData(data) {
  if (data.uuid) return fromUuid(data.uuid);
  if (data.id) return game.actors.get(data.id);
  return null;
}
