import { PTGDiceEngine } from "../../dice/ptg-dice-engine.mjs";

export class PartTimeGodsActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();

    if (this.type !== "character") return;

    const system = this.system;
    const skills = system.skills;
    const spark = Number(system.resources.spark ?? 1);

    const healthMax = Math.max(1, Number(skills.fortitude ?? 0) + spark + 5);
    const psycheMax = Math.max(1, Number(skills.discipline ?? 0) + spark + 5);

    system.resources.health.max = healthMax;
    system.resources.psyche.max = psycheMax;
    system.resources.health.value = clamp(system.resources.health.value, 0, healthMax);
    system.resources.psyche.value = clamp(system.resources.psyche.value, 0, psycheMax);

    system.derived.initiative = Number(skills.perception ?? 0) + Number(skills.speed ?? 0);
    system.derived.strength = Math.max(1, Number(skills.might ?? 0));
    system.derived.movement = Math.max(1, Number(skills.speed ?? 0));
    system.derived.armor = this.items
      .filter(item => item.type === "armor" && item.system.equipped)
      .reduce((total, item) => total + Number(item.system.rating ?? 0), 0);
    system.derived.carriedWeight = this.items
      .filter(item => ["weapon", "armor"].includes(item.type) && (item.system.held !== false || item.system.equipped))
      .reduce((total, item) => total + Number(item.system.weight ?? 0) * Number(item.system.amount ?? 1), 0);
  }

  async rollSkillCombo(primary, secondary, options = {}) {
    return PTGDiceEngine.rollSkillCombo(this, primary, secondary, options);
  }

  async rollManifestation(manifestation, skill, options = {}) {
    return PTGDiceEngine.rollManifestation(this, manifestation, skill, options);
  }

  async spendResource(resource, amount = 1) {
    const path = `system.resources.${resource}`;
    const data = foundry.utils.getProperty(this, path);

    if (typeof data === "number") {
      if (data < amount) {
        ui.notifications.warn(`Not enough ${resource}.`);
        return false;
      }

      await this.update({ [path]: data - amount });
      return true;
    }

    const current = Number(data?.value ?? 0);

    if (current < amount) {
      ui.notifications.warn(`Not enough ${resource}.`);
      return false;
    }

    await this.update({ [`${path}.value`]: current - amount });
    return true;
  }

  async applyChoice(item) {
    if (!["occupation", "archetype", "domain", "theology"].includes(item.type)) return false;

    const applied = this.getFlag("part-time-gods", "appliedChoices") ?? {};
    const key = `${item.type}:${item.name}`;

    if (applied[key]) {
      ui.notifications.warn(`${item.name} has already been applied to ${this.name}.`);
      return false;
    }

    const grants = item.system.grants ?? {};
    const updates = {};
    const identityPath = {
      occupation: "system.identity.occupation",
      archetype: "system.identity.archetype",
      domain: "system.identity.dominion",
      theology: "system.identity.theology"
    }[item.type];

    updates[identityPath] = item.name;

    for (const [skill, bonus] of Object.entries(grants.skills ?? {})) {
      updates[`system.skills.${skill}`] = Number(this.system.skills?.[skill] ?? 0) + Number(bonus);
    }

    for (const [manifestation, bonus] of Object.entries(grants.manifestations ?? {})) {
      updates[`system.manifestations.${manifestation}`] =
        Number(this.system.manifestations?.[manifestation] ?? 0) + Number(bonus);
    }

    for (const [resource, bonus] of Object.entries(grants.resources ?? {})) {
      const path = `system.resources.${resource}`;
      const current = foundry.utils.getProperty(this, path);

      if (typeof current === "number") updates[path] = current + Number(bonus);
      else updates[`${path}.value`] = Number(current?.value ?? 0) + Number(bonus);
    }

    await this.update(updates);

    const embedded = [
      ...embeddedAttachmentItems(grants.attachments, item)
    ];
    if (grants.blessing) embedded.push(simpleEmbeddedItem("blessing", grants.blessing, item));
    if (grants.curse) embedded.push(simpleEmbeddedItem("curse", grants.curse, item));

    if (embedded.length) await this.createEmbeddedDocuments("Item", embedded);

    await this.setFlag("part-time-gods", "appliedChoices", {
      ...applied,
      [key]: true
    });

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `<p><strong>${this.name}</strong> applied <strong>${item.name}</strong>.</p>`
    });

    return true;
  }

  async useOwnedItem(item) {
    if (!item) return false;

    if (item.type === "power" && Number(item.system.cost ?? 0) > 0) {
      const spent = await this.spendResource("fragments", Number(item.system.cost));
      if (!spent) return false;
    }

    if (["truth", "relic"].includes(item.type) && Number(item.system.fragmentCost ?? 0) > 0) {
      const spent = await this.spendResource("fragments", Number(item.system.fragmentCost));
      if (!spent) return false;
    }

    if (item.type === "weapon") {
      const difficulty = 1;
      await this.rollSkillCombo("fighting", "might", {
        difficulty,
        flavor: `${this.name}: ${item.name}`
      });
      return true;
    }

    const rulesSummary = item.system.rules?.summary;
    const effect = item.system.effect ?? item.system.benefit ?? item.system.description ?? "";
    const content = `
      <div class="ptg-chat-card">
        <h3>${item.name}</h3>
        <div>${typeLabel(item.type)}</div>
        ${rulesSummary ? `<p>${escapeHTML(rulesSummary)}</p>` : effect}
      </div>
    `;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content
    });

    return true;
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(Number(value ?? max), min), max);
}

function embeddedAttachmentItems(attachments, sourceItem) {
  const items = [];

  for (const [key, value] of Object.entries(attachments ?? {})) {
    const config = ATTACHMENT_GRANTS[key];
    if (!config) continue;

    const level = Math.max(1, isNumeric(value) ? Number(value) : config.defaultLevel);
    const name = typeof value === "string" && value.trim() ? value : config.name;
    const sourceName = sourceItem.name;

    items.push({
      name,
      type: "bond",
      img: "icons/sundries/documents/document-sealed-red.webp",
      system: {
        kind: config.kind,
        level,
        strain: {
          value: 0,
          max: level
        },
        description: `<p>${escapeHTML(sourceName)} grants this ${escapeHTML(config.label.toLowerCase())}.</p>`,
        notes: sourceNotes(sourceItem),
        rules: sourceRules(`${sourceName} grants ${config.label.toLowerCase()} ${level}.`, sourceItem, "bond"),
        usage: narrativeUsage(),
        automation: defaultAutomation()
      }
    });
  }

  return items;
}

function simpleEmbeddedItem(type, name, sourceItem) {
  const sourceName = sourceItem.name;
  const label = typeLabel(type);
  const system = {
    source: sourceName,
    trigger: "",
    effect: `<p>${escapeHTML(label)} granted by ${escapeHTML(sourceName)}.</p>`,
    notes: sourceNotes(sourceItem),
    rules: sourceRules(`${label} granted by ${sourceName}.`, sourceItem, type),
    usage: narrativeUsage("triggered"),
    automation: defaultAutomation()
  };

  if (type === "blessing") system.bonus = "";
  if (type === "curse") system.pantheonDice = 1;

  return {
    name,
    type,
    img: type === "blessing"
      ? "icons/magic/holy/prayer-hands-glowing-yellow.webp"
      : "icons/magic/unholy/silhouette-robe-evil-power.webp",
    system
  };
}

function sourceRules(summary, sourceItem, type) {
  const source = sourceReference(sourceItem);

  return {
    summary,
    fullText: sourceItem.system.description ?? "",
    source: {
      ...source,
      type
    }
  };
}

function sourceReference(item) {
  return {
    book: "Part-Time Gods Second Edition",
    page: Number(item.getFlag?.("part-time-gods", "page") ?? item.flags?.["part-time-gods"]?.page ?? 0) || null,
    section: item.name,
    type: item.type
  };
}

function sourceNotes(item) {
  const source = sourceReference(item);
  return `<p>Source: ${escapeHTML(source.book)}${source.page ? `, p. ${source.page}` : ""}; ${escapeHTML(source.section)}.</p>`;
}

function narrativeUsage(kind = "narrative") {
  return {
    kind,
    trigger: "",
    target: "self",
    cost: {
      freeTime: 0,
      wealth: 0,
      pantheonDice: 0,
      fragments: 0,
      health: 0,
      psyche: 0,
      strain: 0
    }
  };
}

function defaultAutomation() {
  return {
    enabled: false,
    action: "",
    bonus: null,
    penalty: null,
    roll: null,
    healing: null,
    damage: null,
    condition: null,
    resourceChange: null,
    chatCard: true
  };
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

function isNumeric(value) {
  return value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value));
}

function typeLabel(type) {
  return game.i18n.localize(`TYPES.Item.${type}`) || type;
}

const ATTACHMENT_GRANTS = {
  individualBond: {
    label: "Individual Bond",
    kind: "individual",
    name: "Individual Bond",
    defaultLevel: 2
  },
  groupBond: {
    label: "Group Bond",
    kind: "group",
    name: "Group Bond",
    defaultLevel: 2
  },
  landmarkBond: {
    label: "Landmark Bond",
    kind: "landmark",
    name: "Landmark Bond",
    defaultLevel: 2
  }
};
