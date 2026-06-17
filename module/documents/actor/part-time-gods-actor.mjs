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

    const careerSelection = item.type === "occupation" ? await selectOccupationCareer(item) : null;
    if (careerSelection === false) return false;

    const grants = choiceGrants(item.system.grants ?? {}, careerSelection);
    const updates = {};
    const identityPath = {
      occupation: "system.identity.occupation",
      archetype: "system.identity.archetype",
      domain: "system.identity.dominion",
      theology: "system.identity.theology"
    }[item.type];

    updates[identityPath] = careerSelection?.career ? `${careerSelection.career.name} (${item.name})` : item.name;

    if (careerSelection?.career) {
      updates["system.resources.occupationFreeTime"] = Number(careerSelection.career.resources?.freeTime ?? 0);
      updates["system.resources.occupationWealth"] = Number(careerSelection.career.resources?.wealth ?? 0);
    }

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

    if (careerSelection?.career && item.parent?.uuid === this.uuid) {
      await item.update({ "system.career": careerSelection.career.name });
    }

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
      content: `<p><strong>${this.name}</strong> applied <strong>${careerSelection?.career ? `${careerSelection.career.name} (${item.name})` : item.name}</strong>.</p>`
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

async function selectOccupationCareer(item) {
  const careers = Array.from(item.system.careerOptions ?? []);
  if (!careers.length) return null;

  const options = careerAttachmentOptions(careers);
  if (options.length === 1) {
    const option = options[0];
    return {
      career: careers[option.careerIndex],
      attachment: careers[option.careerIndex].attachments?.[option.attachmentIndex] ?? null
    };
  }

  return new Promise(resolve => {
    let resolved = false;
    const content = `
      <form class="ptg-career-dialog">
        <div class="form-group">
          <label>Career and Attachment</label>
          <select name="careerOption">
            ${options.map((option, index) => `<option value="${index}">${escapeHTML(option.label)}</option>`).join("")}
          </select>
        </div>
      </form>
    `;

    new Dialog({
      title: `Choose ${item.name} Career`,
      content,
      buttons: {
        apply: {
          label: "Apply",
          callback: html => {
            resolved = true;
            const index = Number(getDialogValue(html, "careerOption") ?? 0);
            const option = options[index] ?? options[0];
            resolve({
              career: careers[option.careerIndex],
              attachment: careers[option.careerIndex].attachments?.[option.attachmentIndex] ?? null
            });
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => {
            resolved = true;
            resolve(false);
          }
        }
      },
      default: "apply",
      close: () => {
        if (!resolved) resolve(false);
      }
    }).render(true);
  });
}

function careerAttachmentOptions(careers) {
  return careers.flatMap((career, careerIndex) => {
    const attachments = Array.isArray(career.attachments) && career.attachments.length ? career.attachments : [null];
    return attachments.map((attachment, attachmentIndex) => ({
      careerIndex,
      attachmentIndex,
      label: `${career.name} - ${attachment ? attachmentLabel(attachment) : "No Attachment"}`
    }));
  });
}

function attachmentLabel(attachment) {
  return `Level ${attachment.level ?? 1} ${attachment.name} (${kindCode(attachment.kind)})`;
}

function getDialogValue(html, name) {
  const selector = `[name="${name}"]`;
  return html?.find?.(selector)?.[0]?.value
    ?? html?.[0]?.querySelector?.(selector)?.value
    ?? html?.querySelector?.(selector)?.value;
}

function choiceGrants(baseGrants, careerSelection) {
  const grants = {
    skills: { ...(baseGrants.skills ?? {}) },
    manifestations: { ...(baseGrants.manifestations ?? {}) },
    resources: { ...(baseGrants.resources ?? {}) },
    attachments: baseGrants.attachments ?? {},
    blessing: baseGrants.blessing ?? "",
    curse: baseGrants.curse ?? ""
  };

  if (!careerSelection?.career) return grants;

  grants.resources = {
    ...grants.resources,
    ...(careerSelection.career.resources ?? {})
  };
  grants.attachments = careerSelection.attachment ? [careerSelection.attachment] : [];
  grants.blessing = careerSelection.career.blessing ?? "";
  grants.curse = careerSelection.career.curse ?? "";

  return grants;
}

function clamp(value, min, max) {
  return Math.min(Math.max(Number(value ?? max), min), max);
}

function embeddedAttachmentItems(attachments, sourceItem) {
  const items = [];

  for (const attachment of normalizeAttachmentGrants(attachments)) {
    const level = Math.max(1, Number(attachment.level ?? 1));
    const name = attachment.name;
    const label = attachment.label ?? `${kindLabel(attachment.kind)} Bond`;
    const sourceName = sourceItem.name;

    items.push({
      name,
      type: "bond",
      img: "icons/sundries/documents/document-sealed-red.webp",
      system: {
        kind: attachment.kind,
        level,
        strain: {
          value: 0,
          max: level
        },
        description: `<p>${escapeHTML(sourceName)} grants this ${escapeHTML(label.toLowerCase())}.</p>`,
        notes: sourceNotes(sourceItem),
        rules: sourceRules(`${sourceName} grants ${label.toLowerCase()} ${level}.`, sourceItem, "bond"),
        usage: narrativeUsage(),
        automation: defaultAutomation()
      }
    });
  }

  return items;
}

function normalizeAttachmentGrants(attachments) {
  if (Array.isArray(attachments)) {
    return attachments.map(attachment => ({
      kind: attachment.kind,
      name: attachment.name,
      level: attachment.level ?? 1,
      label: `${kindLabel(attachment.kind)} Bond`
    })).filter(attachment => attachment.name && attachment.kind);
  }

  return Object.entries(attachments ?? {}).flatMap(([key, value]) => {
    const config = ATTACHMENT_GRANTS[key];
    if (!config) return [];

    return {
      kind: config.kind,
      name: typeof value === "string" && value.trim() ? value : config.name,
      level: Math.max(1, isNumeric(value) ? Number(value) : config.defaultLevel),
      label: config.label
    };
  });
}

function simpleEmbeddedItem(type, grant, sourceItem) {
  const detail = typeof grant === "object" && grant !== null ? grant : { name: grant };
  const sourceName = sourceItem.name;
  const label = typeLabel(type);
  const name = detail.name;
  const effect = detail.effect ?? `${label} granted by ${sourceName}.`;
  const system = {
    source: sourceName,
    trigger: "",
    effect: paragraph(effect),
    notes: sourceNotes(sourceItem),
    rules: sourceRules(effect, sourceItem, type, paragraph(effect)),
    usage: narrativeUsage(detail.usageKind ?? (type === "curse" ? "triggered" : "passive")),
    automation: defaultAutomation()
  };

  if (type === "blessing") system.bonus = detail.bonus ?? "";
  if (type === "curse") system.pantheonDice = detail.pantheonDice ?? 1;

  return {
    name,
    type,
    img: type === "blessing"
      ? "icons/magic/holy/prayer-hands-glowing-yellow.webp"
      : "icons/magic/unholy/silhouette-robe-evil-power.webp",
    system
  };
}

function sourceRules(summary, sourceItem, type, fullText = "") {
  const source = sourceReference(sourceItem);

  return {
    summary,
    fullText: fullText || sourceItem.system.description || paragraph(summary),
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

function paragraph(text) {
  return `<p>${escapeHTML(text)}</p>`;
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

function kindLabel(kind) {
  return {
    individual: "Individual",
    group: "Group",
    landmark: "Landmark"
  }[kind] ?? "Group";
}

function kindCode(kind) {
  return {
    individual: "I",
    group: "G",
    landmark: "L"
  }[kind] ?? "G";
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
