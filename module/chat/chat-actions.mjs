import { openApplyConditionDialog } from "../conditions/condition-workflow.mjs";
import { openApplyDamageDialog } from "../workflows/damage-workflow.mjs";

export function registerPTGChatCardActions() {
  Hooks.on("renderChatMessageHTML", bindChatCardActions);
  Hooks.on("renderChatMessage", bindChatCardActions);
}

function bindChatCardActions(message, html) {
  const root = htmlElement(html);
  if (!root || root.dataset.ptgChatActionsBound === "true") return;

  root.dataset.ptgChatActionsBound = "true";
  root.addEventListener("click", event => {
    const button = event.target.closest?.("[data-ptg-chat-action]");
    if (!button) return;

    event.preventDefault();
    void handleChatAction(button, message);
  });
}

async function handleChatAction(button, message) {
  const card = button.closest("[data-ptg-chat-card]");
  if (!card) return;

  const action = button.dataset.ptgChatAction;
  const actor = await documentFromUuid(card.dataset.actorUuid);
  const item = await documentFromUuid(card.dataset.itemUuid);

  if (action === "open-actor") {
    return actor?.sheet?.render({ force: true });
  }

  if (action === "open-item") {
    return item?.sheet?.render({ force: true });
  }

  if (action === "apply-condition") {
    return openApplyConditionDialog({
      targetActor: preferredTargetActor() ?? actor,
      sourceActor: actor,
      sourceItem: item,
      reason: button.dataset.reason || card.dataset.reason || "Chat card action",
      severity: Math.max(1, Number(button.dataset.severity ?? card.dataset.margin ?? 1)),
      effect: button.dataset.effect ?? ""
    });
  }

  if (action === "apply-damage") {
    return openApplyDamageDialog({
      targetActor: preferredTargetActor() ?? actor,
      sourceActor: actor,
      sourceItem: item,
      resource: button.dataset.resource ?? "health",
      amount: Number(button.dataset.amount ?? card.dataset.margin ?? 0),
      applyArmor: button.dataset.applyArmor !== "false",
      damageTag: button.dataset.damageTag ?? "",
      reason: button.dataset.reason || card.dataset.reason || "Chat card action"
    });
  }

  if (action === "condition-reduce") {
    if (!actor || !item) return ui.notifications.warn("This Condition could not be resolved from the chat card.");
    return actor.reduceCondition?.(item);
  }

  if (action === "condition-recover") {
    if (!actor || !item) return ui.notifications.warn("This Condition could not be resolved from the chat card.");
    return actor.recoverCondition?.(item);
  }

  ui.notifications.warn(`Unsupported Part-Time Gods chat action: ${action}`);
  return null;
}

function htmlElement(html) {
  if (html instanceof HTMLElement) return html;
  if (html?.[0] instanceof HTMLElement) return html[0];
  return null;
}

async function documentFromUuid(uuid) {
  if (!uuid) return null;

  try {
    return await fromUuid(uuid);
  } catch (error) {
    console.warn("Part-Time Gods 2E | Unable to resolve chat action UUID.", uuid, error);
    return null;
  }
}

function preferredTargetActor() {
  for (const token of Array.from(game.user?.targets ?? [])) {
    if (token.actor && canModifyActor(token.actor)) return token.actor;
  }

  for (const token of Array.from(canvas?.tokens?.controlled ?? [])) {
    if (token.actor && canModifyActor(token.actor)) return token.actor;
  }

  return null;
}

function canModifyActor(actor) {
  return Boolean(actor && (game.user?.isGM || actor.isOwner));
}
