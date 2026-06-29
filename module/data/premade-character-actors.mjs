const SYSTEM_ID = "part-time-gods";
const SOURCE_BOOK = "Part-Time Gods Second Edition";
const PREGEN_CATEGORY = "Backers' Pregens";

const SKILL_KEYS = [
  "athletics",
  "crafts",
  "deception",
  "discipline",
  "empathy",
  "fighting",
  "fortitude",
  "influence",
  "intuition",
  "knowledge",
  "marksman",
  "medicine",
  "might",
  "perception",
  "perform",
  "speed",
  "stealth",
  "survival",
  "tech",
  "travel"
];

const MANIFESTATION_KEYS = [
  "aegis",
  "beckon",
  "journey",
  "minion",
  "oracle",
  "puppetry",
  "ruin",
  "shaping",
  "soul"
];

const ITEM_ICONS = {
  blessing: "icons/magic/holy/prayer-hands-glowing-yellow.webp",
  bond: "icons/sundries/documents/document-sealed-red.webp",
  curse: "icons/magic/unholy/silhouette-robe-evil-power.webp",
  relic: "icons/commodities/treasure/token-runed-os-grey.webp",
  truth: "icons/magic/symbols/rune-sigil-black-pink.webp",
  vassal: "icons/creatures/magical/spirit-undead-winged-blue.webp",
  worshipper: "icons/environment/people/group.webp"
};

export const PTG_PREMADE_CHARACTER_ACTORS = [
  pregen({
    name: "James Fordham",
    title: "God of Darkness",
    sourcePages: [290, 291],
    identity: {
      occupation: "Private Detective (Peacekeepers)",
      archetype: "Wanderer",
      dominion: "Darkness",
      dominionPortfolio: "Darkness",
      dominionSpecificity: "tangible",
      theology: "Ascendants"
    },
    resources: { initiative: 4, strength: 5, movement: 10, freeTime: 5, wealth: 4, spark: 1 },
    skills: { athletics: 3, empathy: 1, fighting: 3, fortitude: 1, influence: 1, intuition: 2, knowledge: 1, marksman: 3, might: 2, perception: 3, speed: 2, stealth: 3, survival: 3, travel: 2 },
    manifestations: { minion: 1, ruin: 3, shaping: 5 },
    specialties: ["Shadowing", "Shadow Form"],
    biography: [
      "James Fordham works as a private detective and carries the hard edges of a life spent hunting other people's secrets. His Dominion manifests as living darkness, shadow-haunting movement, and frightening predatory shape.",
      "His sheet frames him around the Ascendants, his apprentice Shawn Gunn, Centerpoint Station, and followers who help him recover, investigate, and keep a foothold in mortal life."
    ],
    truths: [
      {
        name: "The God's eyes pierce all Darkness",
        statement: "ignores sight-based impairment and blindness penalties when darkness is involved.",
        effect: "James ignores the Impaired Condition when it applies to sight and takes no penalties from blindness."
      },
      {
        name: "The God of Darkness recovers overnight",
        statement: "recovers quickly when night and rest give him space to heal.",
        effect: "Between scenes or after rest, James automatically heals 1 Health and 1 Psyche."
      },
      {
        name: "James haunts the shadows",
        statement: "can become a terrifying shadow-form presence.",
        effect: "Spend 1 Fragment. Mortals who look at James in this form automatically take Afraid 1 each minute; creatures with Spark receive a Simple (1) resistance check.",
        fragmentCost: 1
      },
      {
        name: "The God of Darkness reveals his claws in the night",
        statement: "can bring out predatory claws without effort.",
        effect: "James reflexively brings out claws for free; he is considered armed and the claws have Brutal 2."
      }
    ],
    relics: [
      {
        name: "Blackened Ring",
        level: 2,
        bonus: "+2 Ruin",
        effect: "The ring grants James increased manipulation of shadows and a +2 bonus to Ruin."
      }
    ],
    bonds: [
      { name: "Shawn Gunn - Apprentice", kind: "individual", level: 2, territoryGrid: "7-3", description: "James' apprentice and a personal tie into his investigative life." },
      { name: "Centerpoint Station", kind: "landmark", level: 3, territoryGrid: "6-5", description: "A station tied to James' territory and cases." }
    ],
    worshippers: [
      { name: "Faithful", level: 2, territoryGrid: "2-5", benefit: "Cause 1 Strain to receive Level/2 Fragments." },
      { name: "Confidants", level: 1, territoryGrid: "2-3", benefit: "Cause 1 Strain to heal all of one damage type and lower all Conditions by Level/2, rounded up." }
    ],
    blessings: [
      { name: "Eye on the Perp", effect: "James has an investigator's eye for pursuit and evidence. Apply the source bonus when tracking a suspect or reading a crime scene." },
      { name: "This is My Town", effect: "Gain +1 Survival when operating in familiar urban environments." },
      { name: "Destructive Nature", effect: "James' Darkness Dominion is especially suited to harming or tearing down obstacles." },
      { name: "Inhuman Visage", effect: "James can lean into a terrifying divine appearance when intimidation or fear is the point of the scene." }
    ],
    curses: [
      { name: "Haunted", effect: "James' past and the dead around him complicate investigations or relationships." },
      { name: "Holes in My Pockets", effect: "James gains 1 Pantheon Die when money problems create real trouble." },
      { name: "Connected to the Land", effect: "James' territory can pull him into problems and responsibilities." },
      { name: "Blood Thirsty", effect: "This Failing tempts James toward violent answers when restraint would be safer." }
    ]
  }),

  pregen({
    name: "Curtis Jasper \"CJ\" Lis",
    title: "God of Laughter",
    sourcePages: [292, 293],
    identity: {
      occupation: "Artist (Creative)",
      archetype: "Fool",
      dominion: "Laughter",
      dominionPortfolio: "Laughter",
      dominionSpecificity: "conceptual",
      theology: "Undecided"
    },
    resources: { initiative: 6, strength: 2, movement: 11, freeTime: 7, wealth: 1, spark: 1 },
    skills: { athletics: 2, crafts: 2, deception: 2, discipline: 2, empathy: 3, fighting: 1, fortitude: 2, influence: 2, intuition: 2, knowledge: 2, marksman: 2, medicine: 1, perform: 4, speed: 4, survival: 1, tech: 1 },
    manifestations: { beckon: 2, minion: 2, oracle: 1, ruin: 2, soul: 1 },
    specialties: ["Telling Jokes", "Die Laughing"],
    biography: [
      "CJ is a comedian whose divine life is tangled with performance, grief, and the people who keep him creating. His sheet places laughter as medicine, distraction, and supernatural pressure.",
      "His attachments focus on Silvia, other comedians, the Laugh Shack, and preachers who treat his gift as something worth following."
    ],
    truths: [
      {
        name: "Laughter is the best medicine",
        statement: "can turn comedy into healing and emotional release.",
        effect: "Once per session for free, CJ may make a Simple (1) Perform + Medicine check to heal Health or Psyche or lower Conditions by 1 per success. Later uses cost 1 Fragment; using it on himself is Tough (3).",
        fragmentCost: 1
      }
    ],
    relics: [
      {
        name: "Obscuring Cigar",
        level: 1,
        bonus: "Smoke obscures sight once per day",
        effect: "Once per day, the cigar's smoke gives others Impaired Sight 2. CJ is immune to this obscuring smoke."
      }
    ],
    bonds: [
      { name: "Silvia - My Muse/Ghost", kind: "individual", level: 3, territoryGrid: "4-10", description: "CJ's muse and ghostly emotional anchor." },
      { name: "Other Comedians", kind: "group", level: 3, territoryGrid: "3-1", description: "A community of performers around CJ." },
      { name: "The Laugh Shack", kind: "landmark", level: 3, territoryGrid: "9-5", description: "A comedy venue that anchors CJ's mortal and divine life." }
    ],
    worshippers: [
      { name: "Preachers", level: 1, territoryGrid: "9-7", benefit: "Cause 1 Strain to lower the cost of obtaining a Worshipper level by 1." }
    ],
    blessings: [
      { name: "Pull An All-Nighter", effect: "Gain +1 Fortitude when spending a long time on a single activity." },
      { name: "For You", effect: "CJ can draw strength from performing for someone important to him." },
      { name: "Beacon", effect: "CJ's presence and laughter make him easy for others to rally around." }
    ],
    curses: [
      { name: "I Can't Even", effect: "Gain 1 Pantheon Die when stress causes CJ to lash out or leave a situation." },
      { name: "Big Mouth", effect: "Gain 1 Pantheon Die when saying too much creates trouble." },
      { name: "Bizarro-God", effect: "CJ's divine nature can twist situations into absurd or inverted outcomes." }
    ]
  }),

  pregen({
    name: "Todd Ebert",
    title: "God of Runners",
    sourcePages: [294, 295],
    identity: {
      occupation: "Manual Labor (Blue Collar)",
      archetype: "Innocent",
      dominion: "Runners",
      dominionPortfolio: "Runners",
      dominionSpecificity: "patron",
      theology: "Puck-Eater"
    },
    resources: { initiative: 3, strength: 3, movement: 9, freeTime: 5, wealth: 4, spark: 1 },
    skills: { athletics: 2, crafts: 2, deception: 1, discipline: 1, empathy: 1, fighting: 3, fortitude: 4, influence: 1, intuition: 1, marksman: 2, might: 1, perception: 1, perform: 2, speed: 2, survival: 1, tech: 2, travel: 3 },
    manifestations: { aegis: 3, journey: 2, minion: 2, ruin: 2, shaping: 1 },
    specialties: ["Knife Fighting", "Protecting Runners from Harm"],
    biography: [
      "Todd is a blue-collar god whose Dominion protects runners and keeps him moving through trouble. His character sheet emphasizes endurance, knife fighting, and the strange appetite of the Puck-Eater path.",
      "His mortal ties include work, roads, his mother, and a group of PFDs who pull him back into ordinary care and consequence."
    ],
    truths: [
      {
        name: "Todd can eat things that would kill anyone else",
        statement: "is protected against poison by his strange divine appetite.",
        effect: "Todd is immune to poisons."
      }
    ],
    relics: [
      {
        name: "Running Shoes of Rapid Movement",
        level: 2,
        bonus: "+6 Movement when worn",
        effect: "Todd's Movement is 15 while he wears these shoes."
      }
    ],
    bonds: [
      { name: "Truck-Lite", kind: "landmark", level: 2, territoryGrid: "1-7", description: "Todd's workplace and one of the landmarks of his life." },
      { name: "Buck Rd.", kind: "landmark", level: 1, territoryGrid: "3-5", description: "A road that matters to Todd's Dominion and routes." },
      { name: "Mom - Wise", kind: "individual", level: 3, territoryGrid: "10-5", description: "Todd's mother and a source of grounded wisdom." },
      { name: "PFDs - Fun", kind: "group", level: 2, territoryGrid: "Various", description: "A group attachment tied to Todd's sense of fun and belonging." }
    ],
    worshippers: [
      { name: "Faithful", level: 2, territoryGrid: "10-4", benefit: "Cause 1 Strain to receive Level/2 Fragments." }
    ],
    blessings: [
      { name: "Keep My Head Down", effect: "Todd can benefit when he stays practical, quiet, and focused on work." },
      { name: "Stroke of Genius", effect: "Todd can pull out a practical insight when the table needs a simple answer." },
      { name: "Loved & Worshipped", effect: "Todd's followers can sustain him when faith and affection matter." },
      { name: "Cannibal Behavior", effect: "Todd can draw power from the Puck-Eater's strange appetite and predatory habits." }
    ],
    curses: [
      { name: "Old Injuries", effect: "Gain 1 Pantheon Die when past injuries slow Todd or make the scene harder." },
      { name: "Daydreaming", effect: "Gain 1 Pantheon Die when distraction pulls Todd away from the immediate problem." },
      { name: "Fox in the Hen House", effect: "Todd's Puck-Eater nature can make him dangerous around vulnerable targets." },
      { name: "Unceasing Appetite", effect: "Todd's appetite creates problems when restraint would be safer." }
    ]
  }),

  pregen({
    name: "Tessara Romanov",
    title: "Goddess of Passion",
    sourcePages: [296, 297],
    identity: {
      occupation: "Medical (Professional)",
      archetype: "Dreamer",
      dominion: "Passion",
      dominionPortfolio: "Passion",
      dominionSpecificity: "emotional",
      theology: "Phoenix Society"
    },
    resources: { initiative: 4, strength: 2, movement: 7, freeTime: 3, wealth: 6, spark: 1 },
    skills: { athletics: 1, crafts: 1, deception: 1, discipline: 3, empathy: 4, fighting: 1, fortitude: 3, influence: 1, intuition: 3, knowledge: 1, marksman: 1, medicine: 2, might: 1, perception: 2, perform: 2, speed: 1, stealth: 3, tech: 3 },
    manifestations: { aegis: 2, beckon: 1, minion: 2, oracle: 1, puppetry: 1, ruin: 1, shaping: 1, soul: 1 },
    specialties: ["Sending feelings", "Fuel Passion - Bestow"],
    biography: [
      "Tessara was raised in rural Wisconsin, ran from an unwelcoming family after her divine nature appeared, and later found support through the Phoenix Society.",
      "She works in forensics, draws strength from passion and human connection, and keeps her divine life hidden from Luna because she still fears rejection."
    ],
    truths: [
      {
        name: "The goddess of passion is bound by no single language",
        statement: "can speak all languages.",
        effect: "Tessara can speak all languages."
      }
    ],
    relics: [
      {
        name: "Eternal Coffin",
        level: 1,
        bonus: "Stops aging for whatever sleeps inside",
        effect: "While sleeping within this Phoenix Society Relic, Tessara's body and soul cease to age. Anything else placed inside the coffin also stops aging.",
        notes: "The source sheet does not print a numeric Relic level, so the compendium seed stores it as Level 1."
      }
    ],
    bonds: [
      { name: "Forensic Community", kind: "group", level: 4, territoryGrid: "", description: "The professional community around Tessara's forensic work." },
      { name: "Luna Romanov", kind: "individual", level: 3, territoryGrid: "6-6", description: "Tessara's newest lover and an important mortal connection." },
      { name: "Stardust - Local LGBT Performance Bar", kind: "landmark", level: 2, territoryGrid: "4-7", description: "A local performance bar tied to Tessara's community and identity." }
    ],
    blessings: [
      { name: "My Medical Opinion", effect: "Gain +1 Knowledge to diagnose someone or recall treatment options." },
      { name: "Keep on Creating", effect: "Gain +2 Crafts to create something that stands the test of time." },
      { name: "Fuel My Fire", effect: "Gain +1 to rolls made in the heat of Tessara's Passion Dominion." },
      { name: "Linked to Humanity", effect: "All Bonds and Worshippers act as if they are +1 Level higher than normal." }
    ],
    curses: [
      { name: "Call It", effect: "Gain 1 Pantheon Die when someone under Tessara's care dies." },
      { name: "Perfectionist", effect: "Gain 1 Pantheon Die when Tessara cannot deny the urge to repeat the same task until she suffers or succeeds." },
      { name: "Overcome with Emotion", effect: "Gain 1 Pantheon Die when Passion surges through someone else in the scene and causes trouble." },
      { name: "Intimacy Addiction", effect: "Without personal interaction, Tessara takes Psyche damage and Deprived; reconnecting reduces the Condition over time." }
    ]
  }),

  pregen({
    name: "Tadhg (Tod) Devanson",
    title: "God of Paracosms",
    sourcePages: [298, 299],
    identity: {
      occupation: "Fiction Writer (Creative)",
      archetype: "Lover",
      dominion: "Paracosms",
      dominionPortfolio: "Paracosms",
      dominionSpecificity: "conceptual",
      theology: "Phoenix Society"
    },
    resources: { initiative: 3, strength: 1, movement: 8, freeTime: 6, wealth: 2, spark: 1 },
    skills: { athletics: 1, crafts: 3, deception: 1, discipline: 3, empathy: 4, knowledge: 5, marksman: 2, perform: 3, speed: 2, stealth: 2, tech: 2 },
    manifestations: { aegis: 2, beckon: 2, oracle: 2, ruin: 1, soul: 3 },
    specialties: ["Literature", "Figments"],
    biography: [
      "Tadhg, usually called Tod, is a Scottish immigrant and fiction writer who grew up getting lost in imagined worlds. His Dominion gives Source to detailed imaginary worlds and the people who create them.",
      "He works out of a small apartment, a favorite cafe/bookstore, a writers' group, and his relationship with Lauren, who serves as both muse and critic."
    ],
    truths: [
      {
        name: "The god of paracosms can always find the right details",
        statement: "knows how to find meaningful details in imagined and written worlds.",
        effect: "Tod gains +1 Knowledge when searching for details, and any failure or critical failure on these rolls is treated as 1 Success instead."
      },
      {
        name: "The god of paracosms can't be fooled by illusions",
        statement: "sees through masks, make-believe, and unreal faces.",
        effect: "Spend 1 Fragment to sense Source, see ghosts, and see the true faces of Outsiders who take other guises. If Tod resists illusion, he gains +2 to see through the charade.",
        fragmentCost: 1
      }
    ],
    bonds: [
      { name: "Lauren Lutch - Muse and girlfriend", kind: "individual", level: 5, territoryGrid: "5-7", description: "Tod's girlfriend, muse, and critic." },
      { name: "Studio Apartment - Home", kind: "landmark", level: 3, territoryGrid: "8-1", description: "Tod's home and primary creative space." },
      { name: "Cafe Staff - Nurturing", kind: "group", level: 2, territoryGrid: "", description: "Cafe staff who provide a nurturing social tie." },
      { name: "\"Wanderers' Rest\" Cafe and Bookstore - Social", kind: "landmark", level: 2, territoryGrid: "3-5", description: "Tod's favorite cafe/bookstore and social landmark." },
      { name: "World-Builders' Writer Group - Approval-Seeking", kind: "group", level: 3, territoryGrid: "", description: "A writer group whose approval matters to Tod." }
    ],
    blessings: [
      { name: "Pull An All-Nighter", effect: "Gain +1 Fortitude when spending a long time on a single activity." },
      { name: "Inviting Nature", effect: "After at least two scenes with a target, Tod gains +1 Influence to seduce another or +2 Influence after two scenes." },
      { name: "Mental Guard", effect: "Tod ignores Level 1 Mental Conditions until they reach Level 2, at which point he feels the full penalties." },
      { name: "Linked To Humanity", effect: "All Bonds and Worshippers act as if they are +1 Level higher than normal." }
    ],
    curses: [
      { name: "I Can't Even", effect: "Gain 1 Pantheon Die when stress causes Tod to lash out or remove himself from the scene." },
      { name: "You Don't Like It?", effect: "Gain 1 Pantheon Die when a spurned passion or rejected gesture sends Tod into depression." },
      { name: "Led By My Power", effect: "Gain 1 Pantheon Die when Tod succumbs to his Dominion and lets it dictate action." },
      { name: "Intimacy Addiction", effect: "Without personal interaction, Tod takes Psyche damage and Deprived; reconnecting reduces the Condition over time." }
    ]
  }),

  pregen({
    name: "Nathan Veris",
    title: "God of Avarice",
    sourcePages: [300, 301],
    identity: {
      occupation: "Privileged (Unemployed)",
      archetype: "Sage",
      dominion: "Avarice",
      dominionPortfolio: "Avarice",
      dominionSpecificity: "emotional",
      theology: "Warlock's Fate"
    },
    resources: { initiative: 1, strength: 0, movement: 5, freeTime: 2, wealth: 7, spark: 1 },
    skills: { crafts: 2, deception: 3, discipline: 1, empathy: 4, fighting: 1, influence: 3, intuition: 1, knowledge: 3, marksman: 2, medicine: 2, perception: 3, tech: 4, travel: 1 },
    manifestations: { beckon: 1, journey: 1, minion: 3, oracle: 2, puppetry: 3 },
    specialties: ["Negotiation", "Programming", "Enchant"],
    biography: [
      "Nathan joined the Navy to pay for his education, broke rules in a high-stakes augmented-reality scavenger hunt, and came out with the Spark of the god of avarice.",
      "His sheet centers his calculating mind, his sister Nicole, a mansion, an online gaming guild, and the Mall of America as a landmark of want and opportunity."
    ],
    truths: [
      {
        name: "His Divine Nature is intoxicating",
        statement: "draws mortal attention and obedience through avarice.",
        effect: "Spend 1 Fragment. Mortals who look at Nathan automatically take Convinced 1 each minute; creatures with Spark receive a Moderate (2) resistance check.",
        fragmentCost: 1
      },
      {
        name: "Nathan speaks to the greed in the hearts of all people",
        statement: "can speak any language automatically.",
        effect: "Nathan can speak any language automatically."
      }
    ],
    bonds: [
      { name: "My Mansion", kind: "landmark", level: 2, territoryGrid: "5-4", description: "Nathan's mansion and primary sign of wealth." },
      { name: "Nicole - Sister and favorite person in the world", kind: "individual", level: 3, territoryGrid: "8-10", description: "Nathan's sister and favorite person." },
      { name: "Verity - Online Gaming Guild", kind: "group", level: 2, territoryGrid: "", description: "Nathan's online gaming guild." },
      { name: "Mall of America", kind: "landmark", level: 2, territoryGrid: "9-7", description: "A landmark of consumption, greed, and opportunity." }
    ],
    worshippers: [
      { name: "Faithful", level: 1, territoryGrid: "2-5", benefit: "Cause 1 Strain to receive Level/2 Fragments." }
    ],
    blessings: [
      { name: "This is My Town", effect: "Gain +1 Survival when operating in familiar urban environments." },
      { name: "All Planned Out", effect: "Once per session, gain +1 bonus to planning rolls when sending Bonds out for Lead Follow-up or Portal travel." },
      { name: "Fuel My Fire", effect: "Gain +1 to rolls made in the heat of Nathan's Avarice Dominion." },
      { name: "See Connections", effect: "Spend 1 Fragment to learn how two things are connected; sacrifice 1 Pantheon Die for each additional connection in the same scene." }
    ],
    curses: [
      { name: "Can't Pass Up a Deal", effect: "Gain 1 Pantheon Die when Nathan makes a deal that goes sideways and causes trouble." },
      { name: "All This Knowledge, For What?", effect: "Gain 1 Pantheon Die when Nathan is left feeling useless and insecure, creating tension and conflict." },
      { name: "Overcome With Emotion", effect: "Gain 1 Pantheon Die when Avarice surges through someone else in the scene and causes trouble." },
      { name: "Manipulators", effect: "When Nathan asks an Attachment for help, roll 1d10. On 1 or 2, cause +1 Strain; when devoting a scene to a Strained Attachment, roll again and heal no Strain on 1 or 2." }
    ]
  }),

  pregen({
    name: "Eden Harrington",
    title: "Goddess of Secrets",
    sourcePages: [302, 303],
    identity: {
      occupation: "Sex Worker (Criminal)",
      archetype: "Tyrant",
      dominion: "Secrets",
      dominionPortfolio: "Secrets",
      dominionSpecificity: "conceptual",
      theology: "Cult of the Saints"
    },
    resources: { initiative: 5, strength: 3, movement: 10, freeTime: 5, wealth: 4, spark: 1 },
    skills: { athletics: 2, deception: 3, discipline: 2, empathy: 2, fortitude: 2, influence: 3, intuition: 2, knowledge: 2, marksman: 2, might: 1, perception: 2, perform: 2, speed: 3, stealth: 1, survival: 1 },
    manifestations: { beckon: 1, minion: 2, puppetry: 3, ruin: 2, soul: 2 },
    specialties: ["Seduction", "Mum's the Word"],
    biography: [
      "Eden is a goddess of secrets whose life mixes sex work, secrecy, command, and supernatural leverage. Her sheet frames secrets as seduction, control, and the power to become an owl.",
      "Her support network includes Ekaterina, a brothel that doubles as a temple, several worshipper groups, and Lilith, a succubus Vassal."
    ],
    truths: [
      {
        name: "Goddess of Secrets draws others in with ease",
        statement: "can make attention and confidence dangerously compelling.",
        effect: "Spend 1 Fragment. Mortals who look at Eden automatically take Convinced 1 each minute; creatures with Spark receive a Moderate (2) resistance check.",
        fragmentCost: 1
      },
      {
        name: "Owls reflect secrets",
        statement: "can assume an owl form that supports hidden observation.",
        effect: "Spend 1 Fragment to take owl form. Eden gains +1 Perception, +2 Speed, and +1 Stealth.",
        fragmentCost: 1
      }
    ],
    bonds: [
      { name: "Ekaterina Zhukov - Muscle", kind: "individual", level: 2, territoryGrid: "2-7", description: "Eden's muscle and personal protector." },
      { name: "Brothel - Doubles as temple", kind: "landmark", level: 1, territoryGrid: "1-8", description: "A brothel that also functions as Eden's temple." }
    ],
    worshippers: [
      { name: "Confidants - Monica Addison", level: 1, territoryGrid: "7-8", benefit: "Cause 1 Strain to heal all of one damage type and lower all Conditions by Level/2, rounded up." },
      { name: "Givers", level: 1, territoryGrid: "2-10", benefit: "Cause 1 Strain to receive Wealth support from worshippers." },
      { name: "Temple Keepers", level: 1, territoryGrid: "10-8", benefit: "Cause 1 Strain to receive a Manifestation check bonus equal to Level x2." }
    ],
    vassals: [
      { name: "Lilith", level: 4, concept: "Succubus", benefit: "Lilith grants +2 seduction. She recovers 1 damage per close-combat damage dealt or reduces a Condition by 1 per 2 damage." }
    ],
    blessings: [
      { name: "Spot the Creep", effect: "Eden can use Criminal instincts to notice predatory or dangerous behavior." },
      { name: "Mental Guard", effect: "Eden ignores Level 1 Mental Conditions until they reach Level 2, at which point she feels the full penalties." },
      { name: "Divine Words", effect: "Eden's words can carry divine weight when secrets and command matter." },
      { name: "Guide My Sword", effect: "Eden can lean on her theology to direct violence or protection when the Cult's purpose is clear." }
    ],
    curses: [
      { name: "On the Brain", effect: "Gain 1 Pantheon Die when Eden's work, desire, or obsession overwhelms better judgment." },
      { name: "Home to Roost", effect: "Eden's secrets come back to trouble her or people close to her." },
      { name: "Bizarro-God", effect: "Eden's divine nature can twist situations into inverted or unsettling forms." },
      { name: "Follow the Voices", effect: "Eden is pushed by voices, saints, or secret commands when resisting would be safer." }
    ]
  }),

  pregen({
    name: "Luke Edwards",
    title: "God of Nightmares",
    sourcePages: [304, 305],
    identity: {
      occupation: "Kid (Unemployed)",
      archetype: "Hero",
      dominion: "Nightmares",
      dominionPortfolio: "Nightmares",
      dominionSpecificity: "crossover",
      theology: "Phoenix Society"
    },
    resources: { initiative: 2, strength: 3, movement: 8, freeTime: 7, wealth: 2, spark: 1 },
    skills: { athletics: 2, crafts: 1, deception: 2, discipline: 2, empathy: 2, fighting: 2, fortitude: 2, influence: 1, intuition: 1, knowledge: 1, marksman: 1, medicine: 1, might: 1, perception: 1, perform: 2, speed: 1, stealth: 2, survival: 2, tech: 2, travel: 1 },
    manifestations: { aegis: 3, oracle: 3, puppetry: 1, ruin: 1, soul: 2 },
    specialties: ["I'm Just a Kid", "Transfer Nightmares"],
    biography: [
      "Luke is a twelve-year-old whose nightmares became a divine battlefield. When two rival gods died in his dream, their Dominions fused into Nightmares and he drew their Sparks into himself.",
      "His sheet frames him as a brave, over-enthusiastic protector tied to school, a best friend, a cinema, other young rescuers, and Phoenix Society support."
    ],
    truths: [
      {
        name: "Luke only sleeps when he wants to",
        statement: "does not require sleep.",
        effect: "Luke requires no sleep and never suffers the Deprived Condition from lack of sleep."
      }
    ],
    relics: [
      {
        name: "Luke's Security Blanket",
        level: 3,
        bonus: "Invisible to sight for 1 Fragment",
        effect: "Spend 1 Fragment to make Luke completely invisible to the eye. This does not stop sound, smell, or other senses from detecting him.",
        fragmentCost: 1
      }
    ],
    bonds: [
      { name: "The Central High School Year 7 Cohort", kind: "group", level: 2, territoryGrid: "", description: "Luke's school cohort." },
      { name: "Neil Keller, Best Friend For Life", kind: "individual", level: 3, territoryGrid: "10-9", description: "Luke's best friend." },
      { name: "Wise Pennies Cinema, Home of the Midnight Scare-a-thon", kind: "landmark", level: 3, territoryGrid: "8-2", description: "A cinema tied to Luke's nightmares and social life." },
      { name: "The Rescuers - A group of wannabe teen heroes", kind: "group", level: 3, territoryGrid: "", description: "Luke's group of teen would-be heroes." }
    ],
    worshippers: [
      { name: "Faithful", level: 1, territoryGrid: "8-9", benefit: "Cause 1 Strain to receive Level/2 Fragments." },
      { name: "Confidants", level: 1, territoryGrid: "7-4", benefit: "Cause 1 Strain to heal all of one damage type and lower all Conditions by Level/2, rounded up." }
    ],
    blessings: [
      { name: "Hide and Seek", effect: "Gain +1 Stealth to hide from others, usually finding places big folk never get to." },
      { name: "I'm Your Opponent Now", effect: "Gain +1 Fighting when taking on a battle to protect someone else; this rises to +2 when protecting perfect strangers." },
      { name: "Frenzy", effect: "Once per battle, sacrifice 1 Pantheon Die to add a bonus to Luke's next attack equal to the total damage he currently has recorded, excluding Conditions." },
      { name: "Linked to Humanity", effect: "All Bonds and Worshippers act as if they are +1 Level higher than normal." }
    ],
    curses: [
      { name: "*Blush*", effect: "Gain 1 Pantheon Die when embarrassment makes Luke mortified and drives him from the scene." },
      { name: "Overconfident", effect: "Gain 1 Pantheon Die when Luke walks into danger without a second thought." },
      { name: "Prideful", effect: "Gain 1 Pantheon Die when pride or arrogance creates conflict or friction." },
      { name: "Intimacy Addiction", effect: "Without personal interaction, Luke takes Psyche damage and Deprived; reconnecting reduces the Condition over time." }
    ]
  }),

  pregen({
    name: "Danielle Cassidy",
    title: "Goddess of Winter",
    sourcePages: [306, 307],
    identity: {
      occupation: "Officer (Peacekeepers)",
      archetype: "Wanderer",
      dominion: "Winter",
      dominionPortfolio: "Winter",
      dominionSpecificity: "crossover",
      theology: "Masks of Jana"
    },
    resources: { initiative: 6, strength: 4, movement: 10, freeTime: 6, wealth: 4, spark: 1 },
    skills: { athletics: 2, deception: 1, discipline: 2, fighting: 3, fortitude: 2, influence: 1, intuition: 1, knowledge: 3, marksman: 3, might: 2, perception: 1, speed: 3, stealth: 2, survival: 3, travel: 1 },
    manifestations: { aegis: 2, beckon: 2, ruin: 2, shaping: 2, soul: 2 },
    specialties: ["Tracking", "Numbing Cold"],
    biography: [
      "Danielle grew up at home in nature and became a park ranger. Her Dominion awakened during a winter rescue, letting her track a missing friend and defeat the Outsider that threatened her.",
      "Her sheet ties her to Brittany, the ranger service, the state park, and the Masks of Jana, framing her as a wilderness specialist for mortals, gods, and Outsiders alike."
    ],
    truths: [
      {
        name: "Danielle isn't fooled by tricks",
        statement: "can sense supernatural truth through masks and disguises.",
        effect: "Spend 1 Fragment to sense divine power in the area, see ghosts or spirits, and see the true faces of Outsiders who take other guises.",
        fragmentCost: 1
      },
      {
        name: "The Goddess of Winter never feels her own chill",
        statement: "is immune to her own cold.",
        effect: "Danielle is immune to any damage or negative effects from cold."
      }
    ],
    relics: [
      {
        name: "Winter's Kiss",
        level: 2,
        bonus: "Summons snow and cold by kissing the statue",
        effect: "Danielle can sacrifice Pantheon Dice for additional storm effects such as hail or sleet that makes travel dangerous. By spending 2 Fragments, she can summon violent blizzards or avalanches.",
        fragmentCost: 2
      }
    ],
    bonds: [
      { name: "Brittany Adamas - Best Friend", kind: "individual", level: 3, territoryGrid: "5-4", description: "Danielle's best friend." },
      { name: "Ranger Service", kind: "group", level: 2, territoryGrid: "", description: "The ranger service that anchors Danielle's work." },
      { name: "State Park", kind: "landmark", level: 2, territoryGrid: "7-8", description: "The park tied to Danielle's mortal vocation and divine winter." }
    ],
    blessings: [
      { name: "Subdue the Perp", effect: "Gain +1 Fighting to wrestle or pin someone to the ground." },
      { name: "I Know a Shortcut", effect: "When traveling, Danielle only needs to spend Free Time in increments of 5." },
      { name: "Forgotten", effect: "Spend 1 Fragment to remain unnoticed by mortals; if she comes into contact with them, the effect drops until they let go. Players can sacrifice 2 Pantheon Dice to make the target forget afterward." },
      { name: "Hide in Plain Sight", effect: "In pantheon Territory, spend 1 Fragment to hide divine magic and creatures from mortal sight." }
    ],
    curses: [
      { name: "Always on the Job", effect: "Gain 1 Pantheon Die if sacrificing 2 Free Time after going to work." },
      { name: "Nomadic Tendencies", effect: "Gain 1 Pantheon Die if Danielle's need to move puts her or her group in danger." },
      { name: "Unpredictable", effect: "Gain 1 Pantheon Die when Danielle's nature feeds into others' perception of her." },
      { name: "Disconnection", effect: "Danielle's secretive nature makes it hard to get close; her Bonds and Worshippers always count as -1 Level when determining dice pools or effects." }
    ]
  })
];

function pregen(data) {
  const slug = slugify(data.name);
  const sourcePage = last(data.sourcePages);
  const spark = Number(data.resources.spark ?? 1);
  const healthMax = Number(data.skills.fortitude ?? 0) + spark + 5;
  const psycheMax = Number(data.skills.discipline ?? 0) + spark + 5;
  const context = {
    name: data.name,
    title: data.title,
    slug,
    sourcePages: data.sourcePages
  };
  const items = ownedItems(context, data);

  return {
    name: data.name,
    type: "character",
    img: "icons/svg/mystery-man.svg",
    system: {
      identity: {
        concept: data.title,
        ageEthnicity: "",
        occupation: data.identity.occupation,
        archetype: data.identity.archetype,
        dominion: data.identity.dominion,
        dominionTitle: data.title,
        dominionPortfolio: data.identity.dominionPortfolio,
        dominionSpecificity: data.identity.dominionSpecificity,
        dominionLimitations: "",
        dominionLandmarkBondUuid: "",
        dominionLandmarkBondName: "",
        theology: data.identity.theology
      },
      resources: {
        health: resource(healthMax),
        psyche: resource(psycheMax),
        fragments: resource(0),
        pantheon: resource(0),
        spark,
        permanentFragmentLoss: 0,
        freeTime: Number(data.resources.freeTime ?? 0),
        freeTimeMax: Number(data.resources.freeTime ?? 0),
        wealth: Number(data.resources.wealth ?? 0),
        wealthMax: Number(data.resources.wealth ?? 0),
        occupationFreeTime: Number(data.resources.freeTime ?? 0),
        occupationWealth: Number(data.resources.wealth ?? 0),
        legendaryActs: "",
        xpGained: 0,
        xpSpent: 0,
        xpPurchases: [],
        resourceLog: []
      },
      mortality: {
        state: "alive",
        timer: "",
        notes: "",
        lastTransitionAt: "",
        reconstitutionDue: "",
        devouredByUuid: "",
        devouredByName: "",
        log: []
      },
      derived: {
        initiative: Number(data.resources.initiative ?? 0),
        strength: Number(data.resources.strength ?? 0),
        movement: Number(data.resources.movement ?? 0),
        armor: 0,
        carriedWeight: 0,
        conditionWarnings: []
      },
      skills: ratings(SKILL_KEYS, data.skills),
      manifestations: ratings(MANIFESTATION_KEYS, data.manifestations),
      attachments: attachmentSummary(data),
      conditions: "",
      specialties: stringList(data.specialties),
      notes: paragraphs(
        `Optional Backers' Pregens actor from ${SOURCE_BOOK}, PDF pp. ${data.sourcePages.join("-")}.`,
        `${data.title}. Occupation: ${data.identity.occupation}. Archetype: ${data.identity.archetype}. Theology: ${data.identity.theology}.`,
        ...data.biography
      )
    },
    items,
    flags: {
      [SYSTEM_ID]: {
        premade: true,
        kind: "backers-pregen",
        category: PREGEN_CATEGORY,
        slug,
        sourceId: `actor:backers-pregen:${slug}`,
        sourceBook: SOURCE_BOOK,
        source: {
          book: SOURCE_BOOK,
          section: "Backers' Pregens",
          pages: data.sourcePages.join("-"),
          pdfPages: data.sourcePages
        }
      }
    }
  };
}

function ownedItems(actor, data) {
  let index = 0;
  const next = () => index++;

  return [
    ...(data.truths ?? []).map(entry => truthItem(actor, entry, next())),
    ...(data.relics ?? []).map(entry => relicItem(actor, entry, next())),
    ...(data.bonds ?? []).map(entry => bondItem(actor, entry, next())),
    ...(data.worshippers ?? []).map(entry => worshipperItem(actor, entry, next())),
    ...(data.vassals ?? []).map(entry => vassalItem(actor, entry, next())),
    ...(data.blessings ?? []).map(entry => blessingItem(actor, entry, next())),
    ...(data.curses ?? []).map(entry => curseItem(actor, entry, next()))
  ];
}

function truthItem(actor, entry, index) {
  const page = entry.page ?? last(actor.sourcePages);
  const fragmentCost = Number(entry.fragmentCost ?? (String(entry.effect ?? "").includes("Spend 1 Fragment") ? 1 : 0));
  const fullText = paragraphs(
    `${entry.name} is one of ${actor.name}'s source pregen Truths.`,
    entry.effect,
    entry.notes
  );

  return baseOwnedItem(actor, "truth", entry.name, page, index, {
    summary: entry.effect,
    statement: entry.statement ?? entry.name,
    rank: Number(entry.rank ?? 1),
    cost: 0,
    fragmentCost,
    activation: fragmentCost ? "active" : "passive",
    benefit: fullText,
    effect: fullText,
    description: fullText,
    sourcePage: page,
    notes: sourceNote(page, entry.notes),
    ...itemRules("truth", entry.name, page, entry.effect, {
      fullText,
      kind: fragmentCost ? "active" : "passive",
      trigger: fragmentCost ? "spend Fragment" : "always",
      target: "self",
      cost: { fragments: fragmentCost },
      action: fragmentCost ? "spend-fragment" : ""
    })
  });
}

function relicItem(actor, entry, index) {
  const page = entry.page ?? last(actor.sourcePages);
  const fullText = paragraphs(
    `${entry.name} is a Level ${Number(entry.level ?? 1)} Relic from ${actor.name}'s source pregen sheet.`,
    `Core benefit: ${entry.bonus}. ${entry.effect}`,
    entry.notes
  );

  return baseOwnedItem(actor, "relic", entry.name, page, index, {
    summary: `${entry.bonus}. ${entry.effect}`,
    level: Number(entry.level ?? 1),
    cost: Number(entry.level ?? 1),
    bonus: entry.bonus,
    fragmentCost: Number(entry.fragmentCost ?? 0),
    benefit: fullText,
    effect: fullText,
    description: fullText,
    relatedBonus: paragraph(`Core benefit: ${entry.bonus}`),
    sourcePage: page,
    notes: sourceNote(page, entry.notes),
    ...itemRules("relic", entry.name, page, `${entry.bonus}. ${entry.effect}`, {
      fullText,
      kind: Number(entry.fragmentCost ?? 0) ? "active" : "passive",
      trigger: Number(entry.fragmentCost ?? 0) ? "use" : "always",
      target: "self",
      cost: { fragments: Number(entry.fragmentCost ?? 0) },
      action: Number(entry.fragmentCost ?? 0) ? "spend-fragment" : ""
    })
  });
}

function bondItem(actor, entry, index) {
  const page = entry.page ?? last(actor.sourcePages);
  const summary = `${entry.name} is a ${entry.kind} Bond for ${actor.name}${entry.territoryGrid ? ` at Territory Grid ${entry.territoryGrid}` : ""}.`;
  const fullText = paragraphs(summary, entry.description);

  return baseOwnedItem(actor, "bond", entry.name, page, index, {
    summary,
    kind: entry.kind,
    location: entry.territoryGrid ?? "",
    linkedDominionUuid: "",
    level: Number(entry.level ?? 1),
    strain: { value: 0, max: Number(entry.level ?? 1) },
    description: fullText,
    sourcePage: page,
    notes: sourceNote(page),
    ...itemRules("bond", entry.name, page, summary, {
      fullText,
      kind: "active",
      trigger: "favor or neglect",
      target: "attachment",
      cost: { strain: 1 },
      action: "request-favor"
    })
  });
}

function worshipperItem(actor, entry, index) {
  const page = entry.page ?? last(actor.sourcePages);
  const summary = `${entry.name} are Worshippers for ${actor.name}${entry.territoryGrid ? ` at Territory Grid ${entry.territoryGrid}` : ""}.`;
  const fullText = paragraphs(summary, entry.benefit);

  return baseOwnedItem(actor, "worshipper", entry.name, page, index, {
    summary,
    level: Number(entry.level ?? 1),
    cost: Number(entry.level ?? 1),
    strain: { value: 0, max: Number(entry.level ?? 1) },
    group: entry.name,
    size: "",
    requestType: "",
    currentRisk: "",
    riskNotes: "",
    requestLog: [],
    benefit: fullText,
    description: fullText,
    sourcePage: page,
    notes: sourceNote(page),
    ...itemRules("worshipper", entry.name, page, `${summary} ${entry.benefit}`, {
      fullText,
      kind: "active",
      trigger: "favor",
      target: "self",
      cost: { strain: 1 },
      action: "request-favor"
    })
  });
}

function vassalItem(actor, entry, index) {
  const page = entry.page ?? last(actor.sourcePages);
  const summary = `${entry.name} is a Level ${Number(entry.level ?? 1)} Vassal for ${actor.name}.`;
  const fullText = paragraphs(summary, entry.benefit);

  return baseOwnedItem(actor, "vassal", entry.name, page, index, {
    summary,
    level: Number(entry.level ?? 1),
    cost: Number(entry.level ?? 1),
    strain: { value: 0, max: Number(entry.level ?? 1) },
    concept: entry.concept ?? "",
    loyalty: Number(entry.loyalty ?? 0),
    sourceActorName: "",
    sourceActorCategory: "",
    actorTemplate: {},
    powerHooks: [],
    currentTask: "",
    currentRisk: "",
    riskNotes: "",
    requestLog: [],
    benefit: fullText,
    description: fullText,
    sourcePage: page,
    notes: sourceNote(page),
    ...itemRules("vassal", entry.name, page, `${summary} ${entry.benefit}`, {
      fullText,
      kind: "active",
      trigger: "favor",
      target: "ally",
      cost: { strain: 1 },
      action: "request-favor"
    })
  });
}

function blessingItem(actor, entry, index) {
  const page = entry.page ?? last(actor.sourcePages);
  const fullText = paragraphs(
    `${entry.name} is a Blessing on ${actor.name}'s source pregen sheet.`,
    entry.effect
  );

  return baseOwnedItem(actor, "blessing", entry.name, page, index, {
    source: actor.title,
    trigger: entry.trigger ?? "When the fictional trigger and table situation match the effect.",
    bonus: entry.bonus ?? bonusText(entry.effect),
    effect: fullText,
    notes: sourceNote(page, entry.notes),
    ...itemRules("blessing", entry.name, page, entry.effect, {
      fullText,
      kind: "triggered",
      trigger: "gm",
      target: "self",
      action: "apply-bonus"
    })
  });
}

function curseItem(actor, entry, index) {
  const page = entry.page ?? last(actor.sourcePages);
  const pantheonDice = Number(entry.pantheonDice ?? 1);
  const fullText = paragraphs(
    `${entry.name} is a Curse or Failing on ${actor.name}'s source pregen sheet.`,
    entry.effect,
    pantheonDice > 0 ? `When it creates a real complication, ${actor.name} gains ${pantheonDice} Pantheon ${pantheonDice === 1 ? "Die" : "Dice"}.` : ""
  );

  return baseOwnedItem(actor, "curse", entry.name, page, index, {
    source: actor.title,
    trigger: entry.trigger ?? "When this weakness, obligation, or flaw complicates the scene.",
    pantheonDice,
    effect: fullText,
    notes: sourceNote(page, entry.notes),
    ...itemRules("curse", entry.name, page, entry.effect, {
      fullText,
      kind: "triggered",
      trigger: "gm",
      target: "self",
      action: "gain-pantheon-dice",
      resourceChange: { resource: "pantheon", amount: pantheonDice },
      enabled: pantheonDice > 0
    })
  });
}

function baseOwnedItem(actor, type, name, page, index, system) {
  const slug = slugify(name);

  return {
    _id: stableId(`${actor.slug}:${type}:${slug}`),
    name,
    type,
    img: ITEM_ICONS[type] ?? "icons/svg/item-bag.svg",
    sort: (index + 1) * 100000,
    system,
    flags: {
      [SYSTEM_ID]: {
        canonicalEmbeddedItem: true,
        canonicalId: `backers-pregen:${actor.slug}:${type}:${slug}`,
        canonicalSource: "backers-pregen",
        canonicalSourceType: type,
        canonicalSourceName: actor.name,
        canonicalRole: type,
        premade: true,
        kind: "backers-pregen-item",
        actorSlug: actor.slug,
        actorName: actor.name,
        sourceId: `actor:backers-pregen:${actor.slug}:item:${type}:${slug}`,
        sourceBook: SOURCE_BOOK,
        source: {
          book: SOURCE_BOOK,
          section: "Backers' Pregens",
          page,
          pdfPage: page
        }
      }
    }
  };
}

function itemRules(type, name, page, summary, { fullText = "", kind = "narrative", trigger = "", target = "self", cost = {}, action = "", enabled = false, resourceChange = null } = {}) {
  return {
    rules: {
      summary: String(summary ?? ""),
      fullText: fullText || paragraph(summary),
      source: {
        book: SOURCE_BOOK,
        page,
        section: "Backers' Pregens",
        type
      }
    },
    usage: {
      kind,
      trigger,
      target,
      cost: {
        freeTime: 0,
        wealth: 0,
        pantheonDice: 0,
        fragments: 0,
        health: 0,
        psyche: 0,
        strain: 0,
        ...cost
      }
    },
    automation: {
      enabled,
      action,
      bonus: null,
      penalty: null,
      roll: null,
      healing: null,
      damage: null,
      condition: null,
      resourceChange,
      chatCard: true
    }
  };
}

function resource(value, max = value) {
  return {
    value: Number(value ?? 0),
    max: Number(max ?? value ?? 0)
  };
}

function ratings(keys, values = {}) {
  return Object.fromEntries(keys.map(key => [key, Number(values[key] ?? 0)]));
}

function attachmentSummary(data) {
  return {
    bonds: stringList((data.bonds ?? []).map(entry => entry.name)),
    failings: "",
    relics: stringList((data.relics ?? []).map(entry => entry.name)),
    truths: stringList((data.truths ?? []).map(entry => entry.name)),
    vassals: stringList((data.vassals ?? []).map(entry => entry.name)),
    worshippers: stringList((data.worshippers ?? []).map(entry => entry.name)),
    blessings: stringList((data.blessings ?? []).map(entry => entry.name)),
    curses: stringList((data.curses ?? []).map(entry => entry.name))
  };
}

function sourceNote(page, extra = "") {
  return paragraphs(`Source: ${SOURCE_BOOK}, Backers' Pregens, PDF p. ${page}.`, extra);
}

function paragraphs(...texts) {
  return texts
    .flat()
    .filter(text => String(text ?? "").trim())
    .map(text => paragraph(text))
    .join("");
}

function paragraph(text) {
  return `<p>${escapeHTML(text)}</p>`;
}

function bonusText(effect) {
  const match = String(effect ?? "").match(/(?:Gain|Add) \+?\d+[^.]+/i);
  return match?.[0] ?? "";
}

function stringList(values = []) {
  return values.filter(value => String(value ?? "").trim()).join("; ");
}

function last(values = []) {
  return values[values.length - 1] ?? null;
}

function stableId(seed) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let hash = 2166136261;
  for (const char of String(seed)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  let value = BigInt(hash || 1);
  let id = "";
  for (let index = 0; index < 16; index += 1) {
    value = (value * 1103515245n + 12345n + BigInt(index)) & 0xffffffffn;
    id += alphabet[Number(value % 62n)];
  }
  return id;
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
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
