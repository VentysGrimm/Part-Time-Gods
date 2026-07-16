import {
  CRITICAL_FAILURE_EFFECT_DEFINITIONS,
  MANIFESTATION_APPLICATION_DEFINITIONS,
  QUALITY_DEFINITIONS
} from "./premade-items.mjs";

const SYSTEM_ID = "part-time-gods";
const RULES_KIND = "rules-reference";
const RULES_DATA_PATH = "systems/part-time-gods/module/data/complete-rules.json";

export async function getPremadeJournals() {
  const journals = appendGeneratedRulesPages(await loadRulesJournals());
  return journals.map(normalizeRulesJournal).filter(Boolean);
}

async function loadRulesJournals() {
  const route = globalThis.foundry?.utils?.getRoute?.(RULES_DATA_PATH) ?? RULES_DATA_PATH;

  try {
    const response = await fetch(route, { cache: "no-cache" });
    if (!response.ok) return [];

    const journals = await response.json();
    return Array.isArray(journals) ? journals : [];
  } catch (error) {
    console.warn("Part-Time Gods 2E | Unable to load source-backed rules journals.", error);
    return [];
  }
}

function appendGeneratedRulesPages(journals) {
  const pagesByJournal = new Map([
    ["04. Divine Expressions", manifestationApplicationPages()],
    ["05. Dice, Skills, and Resources", criticalFailurePages()],
    ["06. Divine Battles", gearQualityPages()]
  ]);

  return journals.map(journal => {
    const generatedPages = pagesByJournal.get(journal.name) ?? [];
    if (!generatedPages.length) return journal;

    const existingNames = new Set((journal.pages ?? []).map(page => page.name));
    return {
      ...journal,
      pages: [
        ...(journal.pages ?? []),
        ...generatedPages.filter(page => !existingNames.has(page.name))
      ].sort((a, b) => Number(a.sort ?? 0) - Number(b.sort ?? 0))
    };
  });
}

function manifestationApplicationPages() {
  const groups = [
    {
      name: "Manifestation Applications: Aegis, Beckon, Journey, Minion, and Oracle",
      manifestations: ["aegis", "beckon", "journey", "minion", "oracle"],
      sort: 310000,
      sourcePages: [147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157]
    },
    {
      name: "Manifestation Applications: Puppetry, Ruin, Shaping, and Soul",
      manifestations: ["puppetry", "ruin", "shaping", "soul"],
      sort: 410000,
      sourcePages: [158, 159, 160, 161, 162, 163, 164, 165]
    }
  ];

  return groups.map(group => {
    const groupLabel = group.manifestations.map(titleCase).join(", ");
    const entries = MANIFESTATION_APPLICATION_DEFINITIONS
      .filter(definition => group.manifestations.includes(definition.manifestation))
      .map(definition => {
        const manifestationName = titleCase(definition.manifestation);
        const skills = definition.skills.map(skill => `${manifestationName} + ${titleCase(skill)}`).join(" or ");
        const measures = definition.commonMeasures.map(measureLabel).join(", ");
        return `<li><strong>${escapeHTML(manifestationName)}: ${escapeHTML(definition.name)}:</strong> ${escapeHTML(definition.summary)} Suggested Skill: ${escapeHTML(skills)}. Common Measures: ${escapeHTML(measures)}. Source p. ${definition.page}.</li>`;
      })
      .join("");

    return generatedRulesPage({
      name: group.name,
      sort: group.sort,
      sourcePages: group.sourcePages,
      safeSummary: `${group.name} source-backed reference for suggested Skills and common Measures; these are journal rules entries, not premade Item entities.`,
      content: [
        `<h1>${escapeHTML(group.name)}</h1>`,
        `<p>This page covers the ${escapeHTML(groupLabel)} applications as rules-reference examples for applying a base Manifestation through a Dominion. They guide Skill choice, Measures, scope, resistance, and GM adjudication, but they are not separate draggable powers in the premade Items compendium.</p>`,
        `<p>Characters keep the base Manifestation entries for ${escapeHTML(groupLabel)}. When one of these applications matters, use this journal page with the Manifestation roll dialog and adjust the final Skill, Difficulty, and Measures to match the character's Dominion and the scene stakes. Base Measures still include Damage, Range, Targets, Duration, Scale, and Effect Detail.</p>`,
        `<ul>${entries}</ul>`,
        "<p><strong>Foundry support:</strong> module/apps/skill-combo-dialog.mjs; module/dice/ptg-dice-engine.mjs; base Manifestation power Items; rules-reference journals.</p>"
      ].join("")
    });
  });
}

function criticalFailurePages() {
  const entries = CRITICAL_FAILURE_EFFECT_DEFINITIONS
    .map(definition => `<li><strong>${escapeHTML(definition.name)}:</strong> ${escapeHTML(definition.effect)} Source p. ${definition.page}.</li>`)
    .join("");

  return [
    generatedRulesPage({
      name: "Critical Failure Effects",
      sort: 150000,
      sourcePages: [176, 177],
      safeSummary: "Source-backed Critical Failure consequence reference; these are journal rules entries and roll-table results, not standalone premade Condition Items.",
      content: [
        "<h1>Critical Failure Effects</h1>",
        "<p>A Critical Failure happens when a check has no successes and at least one 1-result. The consequences below are table-facing fallout options. They may cause harm, consume resources, add Strain, create a temporary penalty, or open the door for an enemy, but the rules reference itself is not a Condition Item.</p>",
        "<p>Use the Possible Critical Failure Effects roll table when random fallout is helpful, or choose a consequence that fits the player's stated worry and the current scene. If the result creates lasting harm, track it with a normal Condition, resource change, attachment Strain, or chat workflow.</p>",
        `<ul>${entries}</ul>`,
        "<p><strong>Foundry support:</strong> module/apps/skill-combo-dialog.mjs; module/data/premade-roll-tables.mjs; combat/resource workflows; rules-reference journals.</p>"
      ].join("")
    })
  ];
}

function gearQualityPages() {
  const entriesByGroup = new Map([
    ["armor", []],
    ["weapon", []],
    ["gear", []]
  ]);

  for (const [key, definition] of Object.entries(QUALITY_DEFINITIONS)) {
    const appliesTo = gearQualityAppliesTo(key, definition);
    entriesByGroup.get(appliesTo)?.push({ key, definition });
  }

  const armorAndGeneralEntries = [...entriesByGroup.get("armor"), ...entriesByGroup.get("gear")]
    .sort(qualitySort)
    .map(gearQualityEntryHTML)
    .join("");
  const weaponEntries = entriesByGroup.get("weapon")
    .sort(qualitySort)
    .map(gearQualityEntryHTML)
    .join("");

  return [
    generatedRulesPage({
      name: "Gear Qualities: Armor and General",
      sort: 410000,
      sourcePages: [209, 210, 211, 212],
      safeSummary: "Source-backed armor and general Gear Quality reference; quality text is journal guidance while actual Armor Items keep their structured quality fields.",
      content: [
        "<h1>Gear Qualities: Armor and General</h1>",
        "<p>Gear Qualities are rules tags attached to weapons, armor, and special equipment. They explain permissions, drawbacks, costs, and situational modifiers. The quality definitions belong in the rules journal; actual Armor and Weapon Items keep structured quality fields for play.</p>",
        "<p>Use these entries to interpret armor or general equipment tags during damage, protection, mobility, visibility, cost, and environmental rulings. Automation metadata is still available to gear cards where the effect has a reliable numeric hook.</p>",
        `<ul>${armorAndGeneralEntries}</ul>`,
        "<p><strong>Foundry support:</strong> Armor and Weapon Items; module/combat/ptg-combat.mjs; templates/item/item-sheet.hbs; rules-reference journals.</p>"
      ].join("")
    }),
    generatedRulesPage({
      name: "Gear Qualities: Weapon",
      sort: 420000,
      sourcePages: [210, 211, 212],
      safeSummary: "Source-backed weapon Gear Quality reference; quality text is journal guidance while actual Weapon Items keep their structured quality fields.",
      content: [
        "<h1>Gear Qualities: Weapon</h1>",
        "<p>Weapon Qualities describe how a weapon changes attack, defense, range, damage, initiative, or the fiction around a Battle of Fists. They are not separate premade Items; they are reference tags stored on actual Weapon Items and explained here for table use.</p>",
        "<p>Use this page when a weapon tag affects a roll or a Boost. Supported numeric effects can feed combat cards, while narrative qualities remain GM-facing reminders for fictional positioning, cost, attention, reliability, and consequences.</p>",
        `<ul>${weaponEntries}</ul>`,
        "<p><strong>Foundry support:</strong> Weapon Items; module/combat/ptg-combat.mjs; templates/item/item-sheet.hbs; rules-reference journals.</p>"
      ].join("")
    })
  ];
}

function generatedRulesPage({ name, sort, sourcePages, safeSummary, content }) {
  const slug = slugify(name);
  return {
    name,
    type: "text",
    sort,
    title: { show: true, level: 2 },
    text: { format: htmlFormat(), content },
    flags: {
      [SYSTEM_ID]: {
        ruleTopic: slug,
        slug,
        sourcePages,
        safeSummary
      }
    }
  };
}

function normalizeRulesJournal(entry, index) {
  if (!entry?.name || !Array.isArray(entry.pages) || !entry.pages.length) return null;

  const pages = entry.pages.map(normalizeRulesPage).filter(Boolean);
  if (!pages.length) return null;

  const systemFlags = entry.flags?.[SYSTEM_ID] ?? {};
  const slug = systemFlags.slug ?? slugify(entry.name);
  const sourcePages = pages.flatMap(page => page.flags?.[SYSTEM_ID]?.sourcePages ?? []);
  const sourcePageStart = sourcePages.length ? Math.min(...sourcePages) : null;
  const sourcePageEnd = sourcePages.length ? Math.max(...sourcePages) : null;

  return {
    name: entry.name,
    sort: entry.sort ?? (index + 1) * 100000,
    pages,
    flags: {
      ...entry.flags,
      [SYSTEM_ID]: {
        ...systemFlags,
        premade: true,
        kind: RULES_KIND,
        category: systemFlags.category ?? entry.category ?? "rules",
        slug,
        sourceId: systemFlags.sourceId ?? `journal:${RULES_KIND}:${slug}`,
        sourceBook: systemFlags.sourceBook ?? "Part-Time Gods Second Edition",
        sourcePageStart,
        sourcePageEnd,
        safeSummary: systemFlags.safeSummary ?? safeRulesSummary(entry, sourcePageStart, sourcePageEnd)
      }
    }
  };
}

function normalizeRulesPage(entry, index) {
  if (!entry?.name || !entry.text?.content) return null;

  const systemFlags = entry.flags?.[SYSTEM_ID] ?? {};
  const sourcePages = normalizeSourcePages(systemFlags.sourcePages).length
    ? normalizeSourcePages(systemFlags.sourcePages)
    : extractBookPages(entry.text.content);
  const ruleTopic = systemFlags.ruleTopic ?? slugify(entry.name);
  const slug = systemFlags.slug ?? ruleTopic;

  return {
    name: entry.name,
    type: "text",
    sort: entry.sort ?? (index + 1) * 100000,
    title: {
      show: entry.title?.show ?? true,
      level: entry.title?.level ?? 2
    },
    text: {
      format: entry.text?.format ?? htmlFormat(),
      content: normalizeRulesContent(entry.text.content, {
        title: entry.name,
        ruleTopic,
        sourcePages
      })
    },
    flags: {
      ...entry.flags,
      [SYSTEM_ID]: {
        ...systemFlags,
        premade: true,
        kind: RULES_KIND,
        slug,
        sourceId: systemFlags.sourceId ?? `journal-page:${RULES_KIND}:${slug}`,
        ruleTopic,
        sourceBook: systemFlags.sourceBook ?? "Part-Time Gods Second Edition",
        sourcePages,
        sourcePageStart: sourcePages.length ? Math.min(...sourcePages) : null,
        sourcePageEnd: sourcePages.length ? Math.max(...sourcePages) : null,
        safeSummary: systemFlags.safeSummary ?? `${entry.name} rules reference page.`
      }
    }
  };
}

function safeRulesSummary(entry, sourcePageStart, sourcePageEnd) {
  const pageNames = Array.from(entry.pages ?? [])
    .map(page => page?.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
  const pageLabel = sourcePageStart && sourcePageEnd
    ? sourcePageStart === sourcePageEnd ? `book p. ${sourcePageStart}` : `book pp. ${sourcePageStart}-${sourcePageEnd}`
    : "the source book";
  const topics = pageNames ? ` Topics include ${pageNames}.` : "";

  return `${entry.name} rules reference from ${pageLabel}.${topics}`;
}

function htmlFormat() {
  return globalThis.CONST?.JOURNAL_ENTRY_PAGE_FORMATS?.HTML ?? 1;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function titleCase(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, char => char.toUpperCase());
}

function measureLabel(key) {
  return {
    area: "Area Affected",
    damage: "Damage",
    detail: "Effect Detail",
    duration: "Duration",
    magnitude: "Magnitude",
    modifier: "Modifier",
    range: "Range",
    scale: "Scale",
    targets: "Targets",
    trigger: "Trigger"
  }[key] ?? titleCase(key);
}

function gearQualityEntryHTML({ key, definition }) {
  const name = titleCase(key);
  const appliesTo = titleCase(gearQualityAppliesTo(key, definition));
  const supportText = definition.supported === true ? " Supported automation." : " Table-facing reminder.";
  const notes = definition.notes ? ` ${definition.notes}` : "";
  return `<li><strong>${escapeHTML(name)}:</strong> ${escapeHTML(appliesTo)} quality. ${escapeHTML(definition.effect)}${escapeHTML(supportText)}${escapeHTML(notes)}</li>`;
}

function gearQualityAppliesTo(key, definition = {}) {
  const automation = definition.automation ?? {};
  if (automation.armorTag || automation.armorReliability || automation.armorWarning) return "armor";
  if (automation.range || automation.rangeStep || automation.damageMinimum || automation.boostDamage || automation.conditionPrompt || automation.armorBypassNote || automation.multiTargetNote || automation.weaponCheckBonus || automation.armorPiercing || automation.selectedSkillBonus || automation.dodgePenalty || automation.boostEffect || automation.blockPenalty) return "weapon";
  if (["bulky", "cumbersome", "fireproof", "cold-proof", "radiation-proof", "shield", "subtle", "weak", "resistant", "heavy", "light"].includes(key)) return "armor";
  if (["autofire", "blunt", "brutal", "concealable", "crushing", "defending", "disarming", "explosive", "loud", "master-crafted", "messy", "piercing", "quick", "ranged", "reach", "recoil", "reload", "restraining", "sharp", "skilled", "slow", "unbreakable", "unpredictable", "unwieldy"].includes(key)) return "weapon";
  return "gear";
}

function qualitySort(left, right) {
  return titleCase(left.key).localeCompare(titleCase(right.key));
}

function normalizeRulesContent(content, { title, ruleTopic, sourcePages } = {}) {
  let html = String(content ?? "").trim();
  if (!html) return "";

  html = removeExtractorArtifacts(html);
  html = removeInlineSourceSummary(html);
  html = normalizeSourcePageSections(html);
  html = normalizeRulesStatHeadings(html);
  html = normalizeHeadingLevels(html);

  const sourceLabel = formatSourceRange(sourcePages);
  const metadata = sourceLabel
    ? `<aside class="ptg-rules-source"><strong>Source:</strong> Part-Time Gods Second Edition, book pp. ${escapeHTML(sourceLabel)}.</aside>`
    : "";

  return `<article class="ptg-rules-journal" data-rule-topic="${escapeHTML(ruleTopic ?? slugify(title ?? "rules"))}">${metadata}${html}</article>`;
}

function removeExtractorArtifacts(content) {
  return content
    .replace(/<h[1-6]>\s*(?:DescTeHnEding\s+OPSPtOoSrITmION|DeCsrceeantidnigng\s+NeSwtoMrymths)\s*<\/h[1-6]>/gi, "")
    .replace(/<p>\s*(?:DescTeHnEding\s+OPSPtOoSrITmION|DeCsrceeantidnigng\s+NeSwtoMrymths)\s*<\/p>/gi, "");
}

function removeInlineSourceSummary(content) {
  return content.replace(/<p><strong>Source:<\/strong>\s*Part-Time Gods Second Edition, book pp\.\s*[^<]+<\/p>/i, "");
}

function normalizeSourcePageSections(content) {
  return content
    .replace(/<section class="ptg-source-page" data-book-page="(\d+)">/g, '<section class="ptg-source-page" data-book-page="$1" aria-label="Book page $1">')
    .replace(/<p class="ptg-source-page-label"><strong>Book p\. (\d+)<\/strong><\/p>/g, '<p class="ptg-source-page-label"><strong>Book p. $1</strong></p>');
}

function normalizeRulesStatHeadings(content) {
  return content.replace(/<h2>(\s*(?:Rank|Threshold|Armor|Spark|Fragments|Attack|Defense|Initiative|Damage|Skills)\b[^<]*)<\/h2>/gi, (match, text) => {
    const cleaned = text.trim();
    const [label, ...rest] = cleaned.split(":");
    const value = rest.join(":").trim();
    if (!value) return `<p class="ptg-rules-stat"><strong>${escapeHTML(cleaned)}</strong></p>`;
    return `<p class="ptg-rules-stat"><strong>${escapeHTML(label.trim())}:</strong> ${escapeHTML(value)}</p>`;
  });
}

function normalizeHeadingLevels(content) {
  return content
    .replace(/<h1>(.*?)<\/h1>/gi, "<h2>$1</h2>")
    .replace(/<h2>(Powers|Power|Payoff|Pay-Offs?)<\/h2>/gi, "<h3>$1</h3>");
}

function extractBookPages(content) {
  return Array.from(new Set(
    [...String(content ?? "").matchAll(/data-book-page="(\d+)"/g)].map(match => Number(match[1]))
  )).sort((a, b) => a - b);
}

function normalizeSourcePages(pages) {
  return Array.from(new Set(
    (Array.isArray(pages) ? pages : []).map(page => Number(page)).filter(page => Number.isInteger(page) && page > 0)
  )).sort((a, b) => a - b);
}

function formatSourceRange(pages) {
  if (!Array.isArray(pages) || !pages.length) return "";

  const ranges = [];
  let start = pages[0];
  let previous = pages[0];

  for (const page of pages.slice(1)) {
    if (page === previous + 1) {
      previous = page;
      continue;
    }

    ranges.push(start === previous ? `${start}` : `${start}-${previous}`);
    start = page;
    previous = page;
  }

  ranges.push(start === previous ? `${start}` : `${start}-${previous}`);
  return ranges.join(", ");
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
