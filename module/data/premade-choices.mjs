const OCCUPATION_CAREERS = {
  "Academic": [
    career("Explorer", 3, 3, [attachment("individual", "My Personal Assistant", 2), attachment("group", "The Explorer's Guild", 2)], blessing("The Undiscovered", "Gain +1 Perception when searching or exploring somewhere new."), curse("On to the Next", "Gain 1 Pantheon Die when chasing a new venture leaves important projects behind.")),
    career("Professor", 2, 4, [attachment("group", "The Academic Community", 2), attachment("landmark", "My College", 2)], blessing("I Know Just the Book", "Gain +1 Speed when quickly researching a topic."), curse("A Slight Miscalculation", "Gain 1 Pantheon Die when a theory or plan proves disastrously wrong.")),
    career("Student", 4, 1, [attachment("group", "Fellow Students", 3), attachment("landmark", "My Campus", 3)], blessing("Omegas Rule!", "Gain +1 Influence when carousing or gathering information from peers."), curse("Pop Quiz", "Gain 1 Pantheon Die when pressure freezes the character and the group suffers."))
  ],
  "Blue Collar": [
    career("Business Owner", 2, 3, [attachment("landmark", "My Business", 3)], blessing("Solo Ingenuity", "Gain +1 Crafts to jury-rig something well enough on the fly."), curse("Didn't Hear the Knock", "Gain 1 Pantheon Die when sacrificing 2 Wealth reflects major missed business.")),
    career("Manual Labor", 3, 3, [attachment("landmark", "The Factory", 2), attachment("group", "Factory Workers", 2)], blessing("Keep My Head Down", "Gain +1 Discipline to ignore distractions and focus on the current job."), curse("Old Injuries", "Gain 1 Pantheon Die when an old injury causes failure at an important task.")),
    career("Minimum Wage", 4, 1, [attachment("individual", "The Boss", 3), attachment("group", "My Friends", 3)], blessing("Quick Leaner", "Gain +1 Tech when figuring out unfamiliar systems."), curse("Bored Now", "Gain 1 Pantheon Die when walking away leaves an important task undone."))
  ],
  "Creative": [
    career("Artist", 4, 1, [attachment("individual", "My Muse", 3), attachment("landmark", "My Studio", 3)], blessing("Pull an All-Nighter", "Gain +1 Fortitude for spending a long time on one activity."), curse("I Can't Even", "Gain 1 Pantheon Die when stress causes an outburst or unwanted tension.")),
    career("Homemaker", 3, 2, [attachment("individual", "My Child", 3), attachment("landmark", "My Home", 3)], blessing("Keen Eye", "Gain +1 Perception to notice when something is out of place."), curse("Patronizing", "Gain 1 Pantheon Die when a harsh or condescending tone causes trouble.")),
    career("Performer", 3, 3, [attachment("individual", "My Manager", 2), attachment("group", "My Troupe", 2)], blessing("Show Stopper", "Gain +1 Athletics when using physicality to improve a performance."), curse("Outtakes", "Gain 1 Pantheon Die when a poor performance damages reputation."))
  ],
  "Criminal": [
    career("Big Time", 2, 4, [attachment("individual", "Right Hand", 2), attachment("group", "The Family", 2)], blessing("The One on Top", "Gain +1 Discipline against fear."), curse("Making Enemies", "Gain 1 Pantheon Die when an old enemy interferes with progress.")),
    career("Sex Worker", 3, 4, [attachment("individual", "My Handler/Muscle", 1), attachment("group", "Other Workers", 1)], blessing("Spot the Creep", "Gain +1 Empathy to spot potentially dangerous intentions quickly."), curse("On the Brain", "Gain 1 Pantheon Die when flirtatious behavior creates social tension or conflict.")),
    career("Small Time", 4, 2, [attachment("group", "The Gang", 2), attachment("landmark", "Our Turf", 2)], blessing("The Muscle", "Gain +1 Might to break things."), curse("Klepto", "Gain 1 Pantheon Die when taking something wanted causes serious consequences."))
  ],
  "The Fringe": [
    career("Homeless", 5, 0, [attachment("group", "Homeless Community", 3), attachment("landmark", "The Fringes", 3)], blessing("Friends in Low Places", "Gain +1 Influence when negotiating with outcasts or pariahs."), curse("Like a Sore Thumb", "Gain 1 Pantheon Die when seeming out of place causes a scene.")),
    career("Religious", 4, 2, [attachment("group", "My Congregation", 2), attachment("landmark", "My Church", 2)], blessing("Higher Learning", "Gain +1 Knowledge for myth, doctrine, or historical facts."), curse("Held to a Code", "Gain 1 Pantheon Die when a code of behavior causes problems.")),
    career("Rural", 3, 3, [attachment("individual", "My Partner", 2), attachment("landmark", "My Land", 2)], blessing("Stand My Ground", "Gain +1 Marksman when defending land or territory."), curse("Missed the Cues", "Gain 1 Pantheon Die when blunt behavior hurts the group."))
  ],
  "Medical": [
    career("Professional", 1, 5, [attachment("group", "Medical Community", 2), attachment("landmark", "My Hospital", 2)], blessing("My Medical Opinion", "Gain +1 Knowledge to diagnose someone or recall treatment information."), curse("Call It", "Gain 1 Pantheon Die when someone under the character's care dies.")),
    career("Scientist", 2, 4, [attachment("individual", "My Assistant", 2), attachment("landmark", "My Lab", 2)], blessing("The Scientific Method", "Gain +1 Crafts to mix solutions and test theories."), curse("Don't Care What It Takes", "Gain 1 Pantheon Die when sacrificing something important for experimentation.")),
    career("Therapist", 2, 4, [attachment("group", "Therapist Community", 2), attachment("landmark", "My Office", 2)], blessing("This Isn't About Me", "Gain +1 Deception to keep emotions hidden."), curse("Not Exactly What I Said", "Gain 1 Pantheon Die when advice is misread and comes back to haunt the group."))
  ],
  "Peacekeepers": [
    career("Detective", 3, 3, [attachment("individual", "My Partner", 2), attachment("group", "The Precinct", 2)], blessing("Eye on the Perp", "Gain +1 Stealth to shadow someone."), curse("Haunted", "Gain 1 Pantheon Die when a case memory freezes the character.")),
    career("Emergency Services", 3, 3, [attachment("group", "Other Workers", 2), attachment("landmark", "The Station", 2)], blessing("Field Medicine", "Gain +1 Medicine to perform medical aid in the field."), curse("Can't Save Them All", "Gain 1 Pantheon Die when forced to save one person over another.")),
    career("Officer", 4, 2, [attachment("individual", "My Partner", 2), attachment("group", "Blue Brotherhood", 2)], blessing("Subdue the Perp", "Gain +1 Fighting to wrestle and pin someone."), curse("Always on the Job", "Gain 1 Pantheon Die in exchange for sacrificing 2 Free Time after an Occupation scene."))
  ],
  "Physical": [
    career("Athlete", 2, 4, [attachment("individual", "My Coach", 2), attachment("landmark", "My Training Facility", 2)], blessing("On Your Marks", "Gain +1 Speed when racing against time or another person."), curse("Dumb Jock", "Gain 1 Pantheon Die when prejudice damages social interaction.")),
    career("Fighter", 3, 3, [attachment("group", "Fighting Community", 2), attachment("landmark", "My Gym", 2)], blessing("You Look Strong", "Gain +1 Intuition to size up fighting styles and capabilities."), curse("Dark Past", "Gain 1 Pantheon Die when past work returns to cause trouble.")),
    career("Soldier", 2, 4, [attachment("individual", "My Commander", 2), attachment("group", "Fellow Soldier", 2)], blessing("Carry On", "Gain +1 Fortitude against pain."), curse("Yes, Sir!", "Gain 1 Pantheon Die when following an order without thinking causes harm."))
  ],
  "Public Life": [
    career("Celebrity", 2, 4, [attachment("individual", "My Agent", 2), attachment("group", "My Fans", 2)], blessing("Game Face", "Gain +1 Empathy to control emotions for a convincing performance."), curse("My Adoring Fans", "Gain 1 Pantheon Die when fame makes an important task harder.")),
    career("Media", 3, 3, [attachment("individual", "My Editor", 2), attachment("group", "Journalist Community", 2)], blessing("Anything for the Story", "Gain +1 Stealth when breaking into places for a story."), curse("Killed the Cat", "Gain 1 Pantheon Die when curiosity causes trouble.")),
    career("Politician", 2, 4, [attachment("group", "Political Circles", 2), attachment("landmark", "My Office", 2)], blessing("It's Who You Know", "Gain +1 Knowledge to recall useful facts about people."), curse("My Name", "Gain 1 Pantheon Die when protecting reputation interferes with an important task."))
  ],
  "Unemployed": [
    career("Kid", 5, 1, [attachment("individual", "Responsible Parent", 2), attachment("group", "Other Kids", 2)], blessing("Hide and Seek", "Gain +1 Stealth to hide away from others."), curse("Blush", "Gain 1 Pantheon Die when embarrassment drives the character from a scene.")),
    career("Privileged", 1, 5, [attachment("group", "Socialite Circles", 2), attachment("landmark", "My Mansion", 2)], blessing("This is My Town", "Gain +1 Survival when operating in urban environments."), curse("Can't Pass Up a Deal", "Gain 1 Pantheon Die when a deal goes sideways.")),
    career("Retired", 4, 2, [attachment("group", "Old Coworkers", 2), attachment("group", "My Family", 2)], blessing("My Old Life", "Gain +1 to a Skill of Choice tied to a former profession."), curse("Feeling My Age", "Gain 1 Pantheon Die when age-related weakness causes trouble."))
  ],
  "White Collar": [
    career("Computer Tech", 3, 3, [attachment("group", "Geek Squad", 2), attachment("landmark", "My Setup", 2)], blessing("Scanning for Glitches", "Gain +1 Intuition to diagnose machines or crack difficult code."), curse("Tech Jargon", "Gain 1 Pantheon Die when technical speech causes a communication breakdown.")),
    career("Executive", 2, 4, [attachment("group", "The Board of Directors", 2), attachment("landmark", "My Office", 2)], blessing("Brown Nose", "Gain +1 Empathy to read what someone wants to hear."), curse("Coming in on Saturday", "Gain 1 Pantheon Die when forced to do important work without anyone to delegate to.")),
    career("Lawyer", 1, 5, [attachment("individual", "My Partner", 2), attachment("landmark", "My Office", 2)], blessing("Closing Arguments", "Gain +1 Perform when orating to bring others to the character's side."), curse("Well, Actually", "Gain 1 Pantheon Die when needless debate creates conflict."))
  ]
};

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
    careerOptions: OCCUPATION_CAREERS[name] ?? [],
    grants: normalizeGrants({ skills: grants.skills ?? {} }),
    description: paragraph(`${name} is a mortal occupation choice used during character creation.`),
    notes: `${source(page)}<p><strong>Special Notes:</strong> Choose one career under this Occupation. That career supplies Free Time, Wealth, Attachment choice, Blessing, and Curse. Record Occupation Free Time and Wealth separately for Going to Work recovery.</p>`
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

function career(name, freeTime, wealth, attachments, blessing, curse) {
  return {
    name,
    resources: { freeTime, wealth },
    attachments,
    blessing,
    curse
  };
}

function attachment(kind, name, level) {
  return { kind, name, level };
}

function blessing(name, effect) {
  return {
    name,
    effect,
    usageKind: "passive"
  };
}

function curse(name, effect) {
  return {
    name,
    effect,
    pantheonDice: 1,
    usageKind: "triggered"
  };
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
