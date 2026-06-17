const SYSTEM_ID = "part-time-gods";
const RULES_KIND = "rules-reference";

const RULE_JOURNALS = [
  journal("00. Rules Index", "Rules Index", [
    page("How to Use This Rules Reference", "Use these pages to record the complete table-facing rules for Part-Time Gods 2E without storing unlicensed book text in the system. Fill in the source pages, exact rule text you are allowed to use at your table, examples, and local rulings.", [
      "Record source book and page references before adding details.",
      "Keep exact rule text in the Full Rule Text section only when you have permission to store it.",
      "Use Table Notes for local interpretations, examples, links, and edge cases.",
      "Link related Actors, Items, Scenes, and other Journal pages as they are created."
    ]),
    page("Source Map", "Track where every rule lives in your physical or digital rulebook.", [
      "Book or file name",
      "Chapter",
      "Page range",
      "Rule topic",
      "Linked journal page"
    ]),
    page("Change Log", "Record system, campaign, and table-ruling changes that affect how these rules are used.", [
      "Date",
      "Changed rule",
      "Reason",
      "Approved by",
      "Affected characters or sessions"
    ])
  ]),

  journal("01. Characters", "Character Rules", [
    page("Character Creation Checklist", "Record the complete character creation procedure.", [
      "Concept, name, and mortal identity",
      "Occupation, Archetype, Dominion, and Theology selection",
      "Starting skills, manifestations, resources, and attachments",
      "Starting equipment, relics, worshippers, and vassals",
      "Final review steps"
    ]),
    page("Occupations", "Record how Occupations work and what they grant.", [
      "Selection rules",
      "Granted skills or resources",
      "Restrictions",
      "Examples",
      "Source pages"
    ]),
    page("Archetypes", "Record Archetype rules and benefits.", [
      "Selection rules",
      "Defining traits",
      "Granted benefits",
      "Examples",
      "Source pages"
    ]),
    page("Dominions", "Record Dominion rules, categories, and how they connect to powers.", [
      "Categories",
      "Ranks or ratings",
      "Portfolios and spheres",
      "Manifestation access",
      "Source pages"
    ]),
    page("Theologies", "Record Theology rules and social assumptions.", [
      "Selection rules",
      "Other names",
      "Stereotypes",
      "Granted benefits",
      "Source pages"
    ]),
    page("Spark and Advancement", "Record Spark, experience, and advancement rules.", [
      "Earning experience",
      "Spending experience",
      "Increasing Spark",
      "Session rewards",
      "Source pages"
    ]),
    page("Resources", "Record Health, Psyche, Fragments, Pantheon Dice, Wealth, and Free Time rules.", [
      "Starting values",
      "Recovery",
      "Spending and refreshing",
      "Maximum values",
      "Source pages"
    ])
  ]),

  journal("02. Dice and Actions", "Dice and Action Rules", [
    page("Dice Pools", "Record how dice pools are built and rolled.", [
      "Relevant traits",
      "Skill use",
      "Modifiers",
      "Success counting",
      "Source pages"
    ]),
    page("Difficulty", "Record difficulty levels and when each applies.", [
      "Simple",
      "Moderate",
      "Tough",
      "Challenging",
      "Legendary",
      "Source pages"
    ]),
    page("Boosts and Costs", "Record rules for extra effects, complications, costs, and tradeoffs.", [
      "When a Boost is available",
      "What a Boost can do",
      "Costs and consequences",
      "Limits",
      "Source pages"
    ]),
    page("Opposed Checks", "Record rules for contests, resistance, and active opposition.", [
      "Who rolls",
      "Tie results",
      "NPC resistance",
      "Player-facing examples",
      "Source pages"
    ]),
    page("Teamwork and Assistance", "Record how characters help each other.", [
      "Who can assist",
      "Limits on assistance",
      "Risk to helpers",
      "Examples",
      "Source pages"
    ])
  ]),

  journal("03. Skills and Manifestations", "Skills and Manifestation Rules", [
    page("Skills Reference", "Record the complete skill list, specialties, and common uses.", [
      "Skill name",
      "Typical actions",
      "Specialties",
      "Common difficulties",
      "Source pages"
    ]),
    page("Manifestations Reference", "Record the complete manifestation list and what each one covers.", [
      "Aegis",
      "Beckon",
      "Journey",
      "Minion",
      "Oracle",
      "Puppetry",
      "Ruin",
      "Shaping",
      "Soul"
    ]),
    page("Powers", "Record how powers are built, activated, paid for, and resolved.", [
      "Domain and manifestation",
      "Rank and cost",
      "Activation",
      "Duration, range, and targets",
      "Roll requirements and difficulty"
    ]),
    page("Rituals and Legendary Acts", "Record long-form supernatural actions and high-impact divine acts.", [
      "Prerequisites",
      "Time required",
      "Costs",
      "Risks",
      "Source pages"
    ])
  ]),

  journal("04. Harm and Conflict", "Conflict Rules", [
    page("Initiative and Turns", "Record turn order, action economy, and scene pacing rules.", [
      "Starting combat",
      "Initiative checks",
      "Turns and reactions",
      "Delays or interrupts",
      "Source pages"
    ]),
    page("Attacks and Defense", "Record attack, defense, range, cover, and targeting rules.", [
      "Melee attacks",
      "Ranged attacks",
      "Supernatural attacks",
      "Defense calculations",
      "Source pages"
    ]),
    page("Damage", "Record damage calculation, armor interaction, and harm application.", [
      "Base damage",
      "Bonus damage",
      "Armor and resistance",
      "Special weapon qualities",
      "Source pages"
    ]),
    page("Health and Psyche", "Record physical and mental harm tracks.", [
      "Taking damage",
      "Recovery",
      "Consequences at zero",
      "Healing effects",
      "Source pages"
    ]),
    page("Conditions", "Record condition rules, creation, duration, and removal.", [
      "Condition severity",
      "Mechanical effects",
      "Stacking",
      "Removal",
      "Source pages"
    ]),
    page("Weapons and Armor", "Record weapon and armor rules and qualities.", [
      "Damage",
      "Range",
      "Cost",
      "Qualities",
      "Source pages"
    ])
  ]),

  journal("05. Attachments", "Attachment Rules", [
    page("Bonds", "Record rules for individual, group, and landmark Bonds.", [
      "Creating Bonds",
      "Bond level",
      "Strain",
      "Recovering or losing Bonds",
      "Source pages"
    ]),
    page("Failings and Curses", "Record weaknesses, divine flaws, and curse procedures.", [
      "Triggers",
      "Pantheon Dice",
      "Mechanical effects",
      "Resolution",
      "Source pages"
    ]),
    page("Relics", "Record relic levels, costs, effects, and ownership rules.", [
      "Relic level",
      "Activation",
      "Loss or destruction",
      "Examples",
      "Source pages"
    ]),
    page("Truths", "Record Truth rules and exact effects.", [
      "Statements",
      "Rank",
      "Cost",
      "Fragment use",
      "Source pages"
    ]),
    page("Worshippers", "Record worshipper types, benefits, growth, and loss.", [
      "Group size",
      "Benefits",
      "Duties",
      "Risks",
      "Source pages"
    ]),
    page("Vassals", "Record vassal creation, loyalty, benefits, and risks.", [
      "Concept",
      "Level",
      "Loyalty",
      "Benefits",
      "Source pages"
    ]),
    page("Blessings", "Record blessing sources, triggers, and effects.", [
      "Source",
      "Trigger",
      "Bonus",
      "Duration",
      "Source pages"
    ])
  ]),

  journal("06. Pantheons and Territory", "Pantheon and Territory Rules", [
    page("Pantheon Pool", "Record how the Pantheon Pool is created, spent, and refreshed.", [
      "Starting pool",
      "Maximum pool",
      "Spending rules",
      "Refresh rules",
      "Source pages"
    ]),
    page("Territory", "Record territory size, influence, and control rules.", [
      "Naming territory",
      "Claiming ground",
      "Influence rating",
      "Contested areas",
      "Source pages"
    ]),
    page("God Territory Map", "Record how to use the bundled God Territory Grid Scene.", [
      "Which zones are tracked",
      "How often the map changes",
      "What tokens, drawings, or notes mean",
      "How territory state affects play",
      "Source pages"
    ]),
    page("Rivals and Institutions", "Record rules for other gods, mortal groups, and organized pressure.", [
      "Rival claims",
      "Mortal institutions",
      "Escalation",
      "Resolution",
      "Source pages"
    ])
  ]),

  journal("07. Downtime and Campaign Procedures", "Downtime and Campaign Rules", [
    page("Free Time", "Record Free Time rules and common uses.", [
      "Earning Free Time",
      "Spending Free Time",
      "Downtime actions",
      "Limits",
      "Source pages"
    ]),
    page("Wealth and Assets", "Record money, assets, cost, and acquisition rules.", [
      "Wealth value",
      "Buying gear",
      "Temporary assets",
      "Lifestyle costs",
      "Source pages"
    ]),
    page("Session Structure", "Record repeatable session procedures.", [
      "Opening questions",
      "Scene framing",
      "End-of-session rewards",
      "Between-session updates",
      "Source pages"
    ]),
    page("Experience Rewards", "Record how rewards are assigned and spent.", [
      "Milestones",
      "Personal rewards",
      "Group rewards",
      "Spending timing",
      "Source pages"
    ])
  ]),

  journal("08. Storyguide Reference", "Storyguide Rules", [
    page("NPCs and Antagonists", "Record antagonist creation, threat values, and play procedures.", [
      "Threat",
      "Health and Psyche",
      "Damage",
      "Special traits",
      "Source pages"
    ]),
    page("Difficulty by Situation", "Record table-specific guidance for setting difficulties.", [
      "Everyday actions",
      "Dangerous actions",
      "Divine actions",
      "Opposition",
      "Source pages"
    ]),
    page("Complications and Consequences", "Record how to apply fallout without stopping play.", [
      "Soft consequences",
      "Hard consequences",
      "Resource pressure",
      "Narrative fallout",
      "Source pages"
    ]),
    page("Quick Reference", "Record the table's final condensed rules reference.", [
      "Core roll procedure",
      "Combat round",
      "Common spends",
      "Recovery",
      "End-of-session checklist"
    ])
  ])
];

export async function getPremadeJournals() {
  return loadCompleteRulesJournals();
}

export async function importRulesJournals({ notify = true } = {}) {
  if (!game.user?.isGM) {
    if (notify) ui.notifications.warn("Only a GM can import the Part-Time Gods rules journals.");
    return [];
  }

  const existing = new Set(
    game.journal
      .filter(entry => entry.getFlag(SYSTEM_ID, "kind") === RULES_KIND)
      .map(entry => entry.name)
  );

  const missing = (await getPremadeJournals()).filter(entry => !existing.has(entry.name));

  if (!missing.length) {
    if (notify) ui.notifications.info("Part-Time Gods rules journals are already imported.");
    return [];
  }

  const folder = await ensureWorldRulesFolder();
  const created = await JournalEntry.createDocuments(missing.map(entry => ({
    ...entry,
    folder: folder.id
  })));

  if (notify) ui.notifications.info(`Imported ${created.length} Part-Time Gods rules journals.`);

  return created;
}

function ruleJournalData(entry) {
  return {
    name: entry.name,
    pages: entry.pages.map((journalPage, index) => rulePageData(journalPage, entry.category, index)),
    flags: {
      [SYSTEM_ID]: {
        premade: true,
        kind: RULES_KIND,
        category: entry.category
      }
    }
  };
}

function rulePageData(entry, category, index) {
  return {
    name: entry.name,
    type: "text",
    sort: (index + 1) * 100000,
    title: {
      show: true,
      level: 2
    },
    text: {
      format: htmlFormat(),
      content: rulePageContent(entry)
    },
    category,
    flags: {
      [SYSTEM_ID]: {
        premade: true,
        kind: RULES_KIND,
        ruleTopic: slugify(entry.name)
      }
    }
  };
}

function rulePageContent(entry) {
  return [
    `<h1>${escapeHTML(entry.name)}</h1>`,
    `<p>${escapeHTML(entry.summary)}</p>`,
    "<h2>Source</h2>",
    "<ul><li><strong>Book:</strong> Part-Time Gods Second Edition</li><li><strong>Page(s):</strong> </li><li><strong>Last checked:</strong> </li></ul>",
    "<h2>Full Rule Text</h2>",
    "<p><em>Record permitted rule text or your table's paraphrase here.</em></p>",
    "<h2>Procedure</h2>",
    entry.prompts.length ? `<ul>${entry.prompts.map(prompt => `<li>${escapeHTML(prompt)}</li>`).join("")}</ul>` : "<p></p>",
    "<h2>Examples</h2>",
    "<p></p>",
    "<h2>Table Notes</h2>",
    "<p></p>",
    "<h2>Related Links</h2>",
    "<p></p>"
  ].join("");
}

async function ensureWorldRulesFolder() {
  let folder = game.folders.find(existing =>
    existing.type === "JournalEntry" && existing.name === "PTG Rules Reference"
  );

  if (!folder) {
    folder = await Folder.create({
      name: "PTG Rules Reference",
      type: "JournalEntry",
      sorting: "a"
    });
  }

  return folder;
}

function journal(name, category, pages) {
  return { name, category, pages };
}

function page(name, summary, prompts = []) {
  return { name, summary, prompts };
}

async function loadCompleteRulesJournals() {
  const fallback = RULE_JOURNALS.map(ruleJournalData);
  const path = "systems/part-time-gods/module/data/complete-rules.json";
  const route = globalThis.foundry?.utils?.getRoute?.(path) ?? path;

  try {
    const response = await fetch(route, { cache: "no-cache" });
    if (!response.ok) return fallback;

    const journals = await response.json();
    return Array.isArray(journals) && journals.length ? [...fallback, ...journals] : fallback;
  } catch (error) {
    console.warn("Part-Time Gods 2E | Unable to load complete rules journals.", error);
    return fallback;
  }
}

function htmlFormat() {
  return globalThis.CONST?.JOURNAL_ENTRY_PAGE_FORMATS?.HTML ?? 1;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHTML(text) {
  return text.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}
