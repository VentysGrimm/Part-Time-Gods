export const PTG_PREMADE_CHOICES = [
  occupation("Academic", 37, {
    skills: { knowledge: 1, perception: 1, tech: 1 },
    resources: { freeTime: 2, wealth: 1 },
    attachments: { groupBond: "Academic Community" },
    blessing: "Book Learning",
    curse: "Analysis Paralysis"
  }),
  occupation("Blue Collar", 38, {
    skills: { crafts: 1, fortitude: 1, might: 1 },
    resources: { freeTime: 1, wealth: 2 },
    attachments: { groupBond: "Work Crew" },
    blessing: "Practical Know-How",
    curse: "Overworked"
  }),
  occupation("Creative", 40, {
    skills: { crafts: 1, empathy: 1, perform: 1 },
    resources: { freeTime: 2, wealth: 1 },
    attachments: { groupBond: "Creative Community" },
    blessing: "Creative Spark",
    curse: "Temperamental"
  }),
  occupation("Criminal", 41, {
    skills: { deception: 1, marksman: 1, stealth: 1 },
    resources: { freeTime: 2, wealth: 1 },
    attachments: { groupBond: "Underworld Contacts" },
    blessing: "Streetwise",
    curse: "Known by the Wrong People"
  }),
  occupation("The Fringe", 42, {
    skills: { intuition: 1, stealth: 1, survival: 1 },
    resources: { freeTime: 3, wealth: 0 },
    attachments: { landmarkBond: "The Fringes" },
    blessing: "Off the Grid",
    curse: "Outside the System"
  }),
  occupation("Medical", 43, {
    skills: { discipline: 1, knowledge: 1, medicine: 1 },
    resources: { freeTime: 1, wealth: 2 },
    attachments: { groupBond: "Medical Community" },
    blessing: "My Medical Opinion",
    curse: "Call It"
  }),
  occupation("Peacekeepers", 45, {
    skills: { fighting: 1, influence: 1, perception: 1 },
    resources: { freeTime: 1, wealth: 2 },
    attachments: { groupBond: "Peacekeepers" },
    blessing: "Authority Figure",
    curse: "By the Book"
  }),
  occupation("Physical", 46, {
    skills: { athletics: 1, fortitude: 1, might: 1 },
    resources: { freeTime: 2, wealth: 1 },
    attachments: { groupBond: "Physical Community" },
    blessing: "Built for This",
    curse: "No Pain, No Gain"
  }),
  occupation("Public Life", 47, {
    skills: { empathy: 1, influence: 1, perform: 1 },
    resources: { freeTime: 1, wealth: 2 },
    attachments: { groupBond: "Public Following" },
    blessing: "Recognized",
    curse: "Public Scrutiny"
  }),
  occupation("Unemployed", 48, {
    skills: { intuition: 1, survival: 1, travel: 1 },
    resources: { freeTime: 4, wealth: 0 },
    attachments: { individualBond: "Personal Support" },
    blessing: "Flexible Schedule",
    curse: "Broke"
  }),
  occupation("White Collar", 49, {
    skills: { influence: 1, knowledge: 1, tech: 1 },
    resources: { freeTime: 1, wealth: 3 },
    attachments: { groupBond: "Professional Network" },
    blessing: "Corporate Fluency",
    curse: "Work Comes First"
  }),

  archetype("The Caregiver", "Generosity", 51, "First-Aid", "Mess with Them and You Mess with Me"),
  archetype("The Companion", "Empathy", 52, "Making Friends", "Identity Crisis"),
  archetype("The Dreamer", "Imagination", 52, "Keep on Creating", "Daydreaming"),
  archetype("The Fool", "Joy", 53, "For You", "Like a Grasshopper, Not an Ant"),
  archetype("The Hero", "Courage", 54, "I'm Your Opponent Now", "A Hero's Plight"),
  archetype("The Innocent", "Optimism", 54, "Average Joe", "Trust First"),
  archetype("The Lover", "Passion", 55, "As You Wish", "I Want What You Have"),
  archetype("The Rebel", "Defiance", 56, "Against the Grain", "Loner"),
  archetype("The Sage", "Wisdom", 57, "All Planned Out", "Contemplative"),
  archetype("The Tyrant", "Control", 57, "Entitled", "Sand Through My Fingers"),
  archetype("The Visionary", "Ambition", 58, "Opportunity Knocks", "Remember Me?"),
  archetype("The Wanderer", "Autonomy", 59, "This is My Town", "Nomadic Tendencies"),

  domainChoice("Bestial", "bestial", 61, "Cats, dogs, horses, elephants, monkeys, bulls, ravens", {
    skills: { athletics: 1, fighting: 1, fortitude: 1, might: 1, survival: 1 },
    manifestations: { minion: 1, ruin: 1 },
    blessing: "Ferocity",
    curse: "Not My Kind"
  }),
  domainChoice("Conceptual", "conceptual", 62, "Beauty, vengeance, justice, truth, names, secrets, celebration", {
    skills: { discipline: 1, intuition: 1, knowledge: 1, perception: 1, perform: 1 },
    manifestations: { oracle: 1, soul: 1 },
    blessing: "Mental Guard",
    curse: "Abstracted"
  }),
  domainChoice("Elemental", "elemental", 63, "Fire, forests, sky, sun, shadow, ocean, mountains, wind, storms", {
    skills: { crafts: 1, fortitude: 1, marksman: 1, survival: 1, travel: 1 },
    manifestations: { aegis: 1, ruin: 1 },
    blessing: "Elemental Strength",
    curse: "Tech Allergy"
  }),
  domainChoice("Emotional", "emotional", 63, "Fear, ecstasy, love, anger, courage, cruelty, sorrow", {
    skills: { deception: 1, discipline: 1, empathy: 1, influence: 1, perform: 1 },
    manifestations: { puppetry: 1, soul: 1 },
    blessing: "Fuel My Fire",
    curse: "Overcome with Emotion"
  }),
  domainChoice("Patrons", "patron", 65, "Cooks, scribes, fencing, travelers, artists, blacksmiths, dancers", {
    skills: { crafts: 1, influence: 1, knowledge: 1, perform: 1, travel: 1 },
    manifestations: { minion: 1, shaping: 1 },
    blessing: "Patron's Gift",
    curse: "Demanding Portfolio"
  }),
  domainChoice("Tangible", "tangible", 65, "Filth, androgyny, computers, paper, fertility, murder, healing", {
    skills: { crafts: 1, medicine: 1, perception: 1, tech: 1, travel: 1 },
    manifestations: { aegis: 1, shaping: 1 },
    blessing: "Object Affinity",
    curse: "Material Focus"
  }),
  domainChoice("Crossovers", "crossover", 66, "Death, war, music, trickery, seasons, the hunt, dreams", {
    skills: { discipline: 1, knowledge: 1, marksman: 1, speed: 1, survival: 1 },
    manifestations: { aegis: 1, soul: 1 },
    attachments: { anyAttachment: 1, landmarkBond: 2 },
    blessing: "Adaptable",
    curse: "Unpredictable"
  }),

  theology("Ascendants", 68, "Exaltants, True Gods, Inhumans", "Holier-than-thou, Snobbish, Deluded", {
    skills: { athletics: 1, fighting: 1, fortitude: 1, might: 1, survival: 1 },
    manifestations: { minion: 1, ruin: 1, shaping: 2 },
    resources: { freeTime: 2, wealth: 1 },
    blessing: "Inhuman Visage",
    curse: "Cut Off from the World"
  }),
  theology("Cult of the Saints", 72, "Saints, Nutjobs, Messengers", "Zealous, Spiritual, Protective", {
    skills: { discipline: 1, empathy: 1, intuition: 1, perception: 1, survival: 1 },
    manifestations: { beckon: 1, oracle: 2, soul: 1 },
    resources: { freeTime: 2, wealth: 1 },
    blessing: "Divine Guidance",
    curse: "Voice of God"
  }),
  theology("Drifting Kingdoms", 76, "Wanderers, Missionaries, Flip-Floppers", "Nomadic, Wayward, Infuriating", {
    skills: { crafts: 1, fortitude: 1, marksman: 1, medicine: 1, travel: 1 },
    manifestations: { aegis: 1, journey: 2, shaping: 1 },
    resources: { freeTime: 3, wealth: 0 },
    blessing: "Instant Domain",
    curse: "Never Stay Long"
  }),
  theology("Kunitsukami", 80, "Kami, Traditionalists", "Respectful, Spiritual, Hierarchical", {
    skills: { discipline: 1, intuition: 1, knowledge: 1, perception: 1, travel: 1 },
    manifestations: { beckon: 1, oracle: 1, soul: 2 },
    resources: { freeTime: 2, wealth: 1 },
    blessing: "Hierarchy of Spirits",
    curse: "Bound by Tradition"
  }),
  theology("Masks of Jana", 84, "Masks, Veils, The Obscure", "Mysterious, Secretive, Cowards", {
    skills: { deception: 1, knowledge: 1, speed: 1, stealth: 1, survival: 1 },
    manifestations: { aegis: 1, beckon: 2, shaping: 1 },
    resources: { freeTime: 1, wealth: 2 },
    blessing: "Hidden Among Mortals",
    curse: "Keeper of Secrets"
  }),
  theology("Order of Meskhenet", 88, "Keepers, Bloodlines, Traditionalists", "Proud, Traditional, Judgmental", {
    skills: { discipline: 1, empathy: 1, fortitude: 1, knowledge: 1, medicine: 1 },
    manifestations: { oracle: 1, shaping: 1, soul: 2 },
    resources: { freeTime: 1, wealth: 2 },
    blessing: "Pure Spark",
    curse: "Lineage Bound"
  }),
  theology("Phoenix Society", 92, "Phoenixes, Birdies, Mortal Lovers", "Partiers, Protective, Cunning", {
    skills: { athletics: 1, empathy: 1, perform: 1, stealth: 1, tech: 1 },
    manifestations: { aegis: 2, oracle: 1, ruin: 1 },
    resources: { freeTime: 2, wealth: 1 },
    blessing: "Linked to Humanity",
    curse: "Intimacy Addiction"
  }),
  theology("Puck-Eaters", 96, "Hunters, Cannibals, Predators", "Savage, Pragmatic, Dangerous", {
    skills: { athletics: 1, deception: 1, fighting: 1, influence: 1, travel: 1 },
    manifestations: { journey: 1, minion: 1, ruin: 2 },
    resources: { freeTime: 2, wealth: 1 },
    blessing: "Cannibal Behavior",
    curse: "Unceasing Appetite"
  }),
  theology("Warlock's Fate", 100, "Warlocks, Wizards, Conjurers", "Analytical, Obsessed, Know-it-alls", {
    skills: { crafts: 1, empathy: 1, influence: 1, knowledge: 1, perception: 1 },
    manifestations: { beckon: 1, journey: 1, puppetry: 2 },
    resources: { freeTime: 1, wealth: 2 },
    blessing: "Web of Connections",
    curse: "Compulsive Meddling"
  })
];

export async function importPremadeChoices({ notify = true } = {}) {
  const existing = new Set(
    game.items
      .filter(item => item.getFlag("part-time-gods", "premadeChoice"))
      .map(item => `${item.type}:${item.name}`)
  );
  const items = PTG_PREMADE_CHOICES.filter(item => !existing.has(`${item.type}:${item.name}`));

  if (!items.length) {
    if (notify) ui.notifications.info("Part-Time Gods character creation choices are already imported.");
    return [];
  }

  const folders = await createChoiceFolders(items);
  const created = await Item.createDocuments(items.map(item => ({
    ...item,
    folder: folders[item.type]?.id
  })));

  if (notify) ui.notifications.info(`Imported ${created.length} Part-Time Gods character creation choices.`);

  return created;
}

function occupation(name, page, grants) {
  return choice("occupation", name, page, {
    category: name,
    career: "",
    grants: normalizeGrants(grants),
    description: paragraph(`${name} is a mortal occupation choice used during character creation.`),
    notes: source(page)
  });
}

function archetype(name, definingTrait, page, blessing, curseName) {
  return choice("archetype", name, page, {
    definingTrait,
    grants: normalizeGrants({ blessing, curse: curseName }),
    description: paragraph(`${name} is an archetype choice defined by ${definingTrait.toLowerCase()}.`),
    notes: source(page)
  });
}

function domainChoice(name, category, page, examples, grants) {
  return choice("domain", name, page, {
    category,
    rank: 0,
    portfolio: examples,
    sphere: "",
    manifestations: Object.entries(grants.manifestations ?? {}).map(([key, value]) => `${label(key)} +${value}`).join(", "),
    grants: normalizeGrants(grants),
    description: paragraph(`Dominion category examples: ${examples}.`),
    notes: source(page)
  });
}

function theology(name, page, otherNames, stereotype, grants) {
  return choice("theology", name, page, {
    otherNames,
    stereotype,
    grants: normalizeGrants(grants),
    description: paragraph(`${name} is a Theology choice for newly awakened gods.`),
    notes: source(page)
  });
}

function choice(type, name, page, system) {
  return {
    name,
    type,
    img: defaultIcon(type),
    system,
    flags: {
      "part-time-gods": {
        premadeChoice: true,
        source: "Part-Time Gods Second Edition",
        page
      }
    }
  };
}

function normalizeGrants(grants) {
  return {
    skills: grants.skills ?? {},
    manifestations: grants.manifestations ?? {},
    resources: grants.resources ?? {},
    attachments: grants.attachments ?? {},
    blessing: grants.blessing ?? "",
    curse: grants.curse ?? ""
  };
}

async function createChoiceFolders(items) {
  const folders = {};
  const labels = {
    archetype: "Archetypes",
    domain: "Dominions",
    occupation: "Occupations",
    theology: "Theologies"
  };

  for (const type of Array.from(new Set(items.map(item => item.type)))) {
    const name = `PTG Character Creation ${labels[type]}`;
    let folder = game.folders.find(existing => existing.type === "Item" && existing.name === name);

    if (!folder) folder = await Folder.create({ name, type: "Item", sorting: "a" });

    folders[type] = folder;
  }

  return folders;
}

function paragraph(text) {
  return `<p>${escapeHTML(text)}</p>`;
}

function source(page) {
  return `<p>Source: Part-Time Gods Second Edition, p. ${page}.</p>`;
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

function label(key) {
  const labels = {
    aegis: "Aegis",
    beckon: "Beckon",
    journey: "Journey",
    minion: "Minion",
    oracle: "Oracle",
    puppetry: "Puppetry",
    ruin: "Ruin",
    shaping: "Shaping",
    soul: "Soul"
  };

  return labels[key] ?? key;
}

function defaultIcon(type) {
  const icons = {
    archetype: "icons/sundries/documents/document-symbol-circle-brown.webp",
    domain: "icons/magic/symbols/runes-star-pentagon-blue.webp",
    occupation: "icons/sundries/documents/document-sealed-signatures-red.webp",
    theology: "icons/sundries/books/book-symbol-triangle-silver-blue.webp"
  };

  return icons[type] ?? "icons/svg/item-bag.svg";
}
