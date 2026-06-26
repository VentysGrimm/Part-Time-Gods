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
  "Fringe": [
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
    skills: { crafts: 1, discipline: 1, knowledge: 1, perception: 1, stealth: 1 }
  }),
  occupation("Blue Collar", 38, {
    skills: { fighting: 1, fortitude: 1, might: 1, survival: 1, travel: 1 }
  }),
  occupation("Creative", 40, {
    skills: { crafts: 1, empathy: 1, marksman: 1, perform: 1, speed: 1 }
  }),
  occupation("Criminal", 41, {
    skills: { deception: 1, influence: 1, marksman: 1, speed: 1, stealth: 1 }
  }),
  occupation("Fringe", 42, {
    skills: { athletics: 1, empathy: 1, fortitude: 1, stealth: 1, survival: 1 }
  }),
  occupation("Medical", 43, {
    skills: { discipline: 1, empathy: 1, intuition: 1, medicine: 1, might: 1 }
  }),
  occupation("Peacekeepers", 45, {
    skills: { athletics: 1, influence: 1, intuition: 1, perception: 1, speed: 1 }
  }),
  occupation("Physical", 46, {
    skills: { athletics: 1, discipline: 1, fighting: 1, might: 1, perform: 1 }
  }),
  occupation("Public Life", 47, {
    skills: { deception: 1, fortitude: 1, influence: 1, perform: 1, tech: 1 }
  }),
  occupation("Unemployed", 48, {
    skills: { fighting: 1, medicine: 1, perception: 1, tech: 1, travel: 1 }
  }),
  occupation("White Collar", 49, {
    skills: { deception: 1, knowledge: 1, marksman: 1, medicine: 1, tech: 1 }
  }),

  archetype("The Caregiver", "Generosity", 51, {
    skills: { empathy: 1, fighting: 1, medicine: 1, perception: 1, travel: 1 },
    attachments: [attachment("individual", "Individual Bond", 2), attachment("landmark", "Landmark Bond", 2)],
    blessings: [
      blessing("Adrenaline Kicks In", "Gain +2 Strength when needing to protect or help someone else."),
      blessing("Gift for the Team", "When adding dice to the Pantheon Pool from a Boost, add +1 Pantheon Die as well."),
      blessing("First-Aid", "Gain +1 Medicine when making a healing roll.")
    ],
    curses: [
      curse("I Know Best", "Gain 1 Pantheon Die when seeming to know best leads to conflict and tension."),
      curse("Mess with Them and You Mess with Me", "Gain 1 Pantheon Die when an Individual Bond is dealt Strain by an outside source.")
    ]
  }),
  archetype("The Companion", "Empathy", 52, {
    skills: { empathy: 1, influence: 1, medicine: 1, might: 1, speed: 1 },
    attachments: [attachment("individual", "Individual Bond", 2), attachment("worshipper", "Worshipper Entitlement", 2)],
    blessings: [
      blessing("Community Leader", "Get the first Lead Follow-up per Session from a Group Bond for free."),
      blessing("Fairness", "Gain +1 Influence when arguing against inequality or injustice, or fighting for fairness."),
      blessing("Making Friends", "Reduce XP costs for purchasing Individual or Group Bonds by 1.")
    ],
    curses: [
      curse("Identity Crisis", "Gain 1 Pantheon Die when dangerous peer pressure or crowd identity causes trouble."),
      curse("Loyal to a Fault", "Gain 1 Pantheon Die when choosing between loyalties costs something.")
    ]
  }),
  archetype("The Dreamer", "Imagination", 52, {
    skills: { crafts: 1, discipline: 1, perception: 1, perform: 1, tech: 1 },
    attachments: [attachment("landmark", "Landmark Bond", 2), attachment("relic", "Relic Entitlement", 2)],
    blessings: [
      blessing("Freedom in All Things", "Gain +1 to any roll made to resist losing freedom."),
      blessing("Keep on Creating", "Gain +2 Crafts to create something that stands the test of time."),
      blessing("Stroke of Genius", "Once per Session, Pantheon Dice taken for a roll count double, then take a Level 3 Dazed Condition.")
    ],
    curses: [
      curse("Daydreaming", "Gain 1 Pantheon Die by sacrificing 1 Free Time when distraction stretches a task."),
      curse("Perfectionist", "Gain 1 Pantheon Die when repeating a task until utter defeat or a Style Boost.")
    ]
  }),
  archetype("The Fool", "Joy", 53, {
    skills: { fortitude: 1, intuition: 1, marksman: 1, speed: 1, survival: 1 },
    attachments: [attachment("individual", "Individual Bond", 2), attachment("group", "Group Bond", 2)],
    blessings: [
      blessing("For You", "Gain +1 to any check made to bring a smile to someone's face."),
      blessing("Life O' the Party", "Throw a party and roll Influence + Perform to heal Psyche or reduce mental Conditions."),
      blessing("Road Trip!", "Roll 1d10 when spending Free Time to pass scenes; on a success, spend 1 less Free Time.")
    ],
    curses: [
      curse("Big Mouth", "Gain 1 Pantheon Die when loose lips cause trouble."),
      curse("Like a Grasshopper, Not an Ant", "Gain 1 Pantheon Die when missing a key item or tool would have helped.")
    ]
  }),
  archetype("The Hero", "Courage", 54, {
    skills: { athletics: 1, crafts: 1, fighting: 1, perform: 1, survival: 1 },
    attachments: [attachment("individual", "Individual Bond", 2), attachment("landmark", "Landmark Bond", 2)],
    blessings: [
      blessing("I'm Your Opponent Now", "Gain +1 Fighting when protecting someone else, or +2 Fighting to protect strangers."),
      blessing("Made of Sturdy Stuff", "Once per Battle, roll Fortitude reflexively to negate physical damage successes."),
      blessing("Final Blow", "After a successful physical attack, take Broken 3 to sacrifice Pantheon Dice for +1 damage each.")
    ],
    curses: [
      curse("A Hero's Plight", "Gain 2 Pantheon Dice when choosing between further Straining a Bond or leaving the current Scene."),
      curse("Overconfident", "Gain 1 Pantheon Die when walking into overwhelming danger without a second thought.")
    ]
  }),
  archetype("The Innocent", "Optimism", 54, {
    skills: { crafts: 1, intuition: 1, knowledge: 1, perform: 1, stealth: 1 },
    attachments: [attachment("group", "Group Bond", 2), attachment("landmark", "Landmark Bond", 2)],
    blessings: [
      blessing("Average Joe", "Gain +1 Stealth when mixing in with large groups of people."),
      blessing("Martyrdom", "Add 1 Pantheon Die when taking 3 or more damage from a single attack."),
      blessing("Trying New Things", "Gain +1 to a Skill when performing something for the first time.")
    ],
    curses: [
      curse("Out of My Depth", "Gain 1 Pantheon Die by taking Confused 2 after encountering the strange or wondrous."),
      curse("Trust First", "Gain 1 Pantheon Die when believing something untrue leads the group into danger.")
    ]
  }),
  archetype("The Lover", "Passion", 55, {
    skills: { deception: 1, influence: 1, marksman: 1, stealth: 1, tech: 1 },
    attachments: [attachment("individual", "Individual Bond", 2), attachment("group", "Group Bond", 2)],
    blessings: [
      blessing("As You Wish", "Once per Session, ask one Individual Bond for one Favor or Lead Follow-up without Strain."),
      blessing("Beyond Pleasurable", "After intimacy, roll Empathy + Fortitude to heal Health/Psyche or reduce Conditions."),
      blessing("Inviting Nature", "Gain +1 Influence to seduce, or +2 after spending at least two scenes around the target.")
    ],
    curses: [
      curse("I Want What You Have", "Gain 1 Pantheon Die when obsession, jealousy, or envy creates danger."),
      curse("You Don't Like It?", "Gain 1 Pantheon Die when an unnoticed or spurned gesture sends the character into depression.")
    ]
  }),
  archetype("The Rebel", "Radical Freedom", 56, {
    skills: { fortitude: 1, influence: 1, marksman: 1, might: 1, stealth: 1 },
    attachments: [attachment("group", "Group Bond", 2), attachment("vassal", "Vassal Entitlement", 2)],
    blessings: [
      blessing("Disrupt the System", "Sacrifice Pantheon Dice to give a target -1 penalty per die sacrificed."),
      blessing("Hoarder", "Store Pantheon Dice in a personal Hoard up to Intuition + 1."),
      blessing("Revolutionary", "Gain +1 to rolls that aid the battle against an obviously greater target or cause.")
    ],
    curses: [
      curse("Chaotic", "Gain 1 Pantheon Die when a random act of chaos disrupts the group and causes trouble."),
      curse("Loner", "Gain 1 Pantheon Die when running off alone creates danger.")
    ]
  }),
  archetype("The Sage", "Wisdom", 57, {
    skills: { crafts: 1, empathy: 1, intuition: 1, knowledge: 1, perception: 1 },
    attachments: [attachment("group", "Group Bond", 2), attachment("worshipper", "Worshipper Entitlement", 2)],
    blessings: [
      blessing("All Planned Out", "Gain +1 to planning rolls for Bond Lead Follow-up or the Portal stage when traveling to other worlds."),
      blessing("Genius", "Reduce XP costs for standard Skills by 1."),
      blessing("Outthink the Enemy", "Once per Battle, roll Discipline reflexively to negate mental damage successes.")
    ],
    curses: [
      curse("All This Knowledge, For What?", "Gain 1 Pantheon Die when being stumped leaves the character useless and insecure."),
      curse("Contemplative", "Gain 1 Pantheon Die when spending +1 Free Time to travel between Scenes due to over-planning.")
    ]
  }),
  archetype("The Tyrant", "Control", 57, {
    skills: { athletics: 1, deception: 1, discipline: 1, might: 1, speed: 1 },
    attachments: [attachment("group", "Group Bond", 2), attachment("vassal", "Vassal Entitlement", 2)],
    blessings: [
      blessing("Authoritarian", "Gain +1 Influence to give orders, or +2 when holding actual authority over the target."),
      blessing("Entitled", "Raise any Relic, Vassal, or Worshipper by +2 levels."),
      blessing("Fate's Compliance", "On any roll, take 1 damage to reroll a die showing 1.")
    ],
    curses: [
      curse("Home to Roost", "Gain 1 Pantheon Die when someone manipulated in the past returns for revenge."),
      curse("Sand Through My Fingers", "Gain 1 Pantheon Die when losing control of a situation causes a breakdown.")
    ]
  }),
  archetype("The Visionary", "Solutions", 58, {
    skills: { discipline: 1, fortitude: 1, intuition: 1, tech: 1, travel: 1 },
    attachments: [attachment("individual", "Individual Bond", 2), attachment("worshipper", "Worshipper Entitlement", 2)],
    blessings: [
      blessing("Make Things Happen", "Gain +1 to execution rolls for Bond Lead Follow-up or the Crossroads stage when traveling to other worlds."),
      blessing("Opportunity Knocks", "Sacrifice 1 Pantheon Die during a contested check to reroll dice showing 1 up to the opponent's number of 1s."),
      blessing("Scope Out", "Gain +1 to rolls made to assess a situation or read a room.")
    ],
    curses: [
      curse("Not a Mind Reader", "Gain 1 Pantheon Die after devoting a scene to a Bond that does not heal Strain."),
      curse("Remember Me?", "Gain 1 Pantheon Die when a manipulative choice comes back to haunt the character.")
    ]
  }),
  archetype("The Wanderer", "Autonomy", 59, {
    skills: { athletics: 1, fighting: 1, knowledge: 1, survival: 1, travel: 1 },
    attachments: [attachment("group", "Group Bond", 2), attachment("relic", "Relic Entitlement", 2)],
    blessings: [
      blessing("I Know a Shortcut", "When traveling around the city, spend Free Time in increments of 5 instead of 4."),
      blessing("This is My Town", "Gain +1 to any check made to operate in the character's town."),
      blessing("Testing Limits", "After failing a roll, sacrifice 1 Pantheon Die to add the failed roll's number of 1s as a bonus to the next roll.")
    ],
    curses: [
      curse("Holes in My Pockets", "Gain 1 Pantheon Die by sacrificing 1 Wealth when traveling between scenes."),
      curse("Nomadic Tendencies", "Gain 1 Pantheon Die when the need to keep moving leads the group into danger.")
    ]
  }),

  domainChoice("Bestial", "bestial", 61, "Cats, dogs, horses, elephants, monkeys, bulls, ravens", {
    skills: { athletics: 1, fortitude: 1, stealth: 1, survival: 1, travel: 1 },
    manifestations: { journey: 1, ruin: 1 },
    attachments: [attachment("vassal", "Vassal Entitlement", 2), attachment("landmark", "Landmark Bond", 1)],
    blessings: [
      blessing("Beast Tongue", "Receive the Beast Tongue Truth as a natural gift."),
      blessing("Ferocity", "Gain +1 Influence to intimidate people, or +2 Influence when used on animals."),
      blessing("Frenzy", "Once per Battle, sacrifice 1 Pantheon Die to add current damage as a bonus to the next attack.")
    ],
    curses: [
      curse("Animal Mind", "Gain 1 Pantheon Die when reverting to a semi-animal mentality causes trouble."),
      curse("Not My Kind", "Gain 1 Pantheon Die when other animals drawn to the god cause problems.")
    ]
  }),
  domainChoice("Conceptual", "conceptual", 62, "Beauty, vengeance, justice, truth, names, secrets, celebration", {
    skills: { deception: 1, intuition: 1, knowledge: 1, perform: 1, speed: 1 },
    manifestations: { oracle: 1, soul: 1 },
    attachments: [attachment("group", "Group Bond", 1), attachment("landmark", "Landmark Bond", 2)],
    blessings: [
      blessing("Beacon", "Take a Level 2 Dazed Condition to ask the GM where the next point of interest containing the concept is."),
      blessing("Mental Guard", "Treat all Mental Conditions as 1 level lower, except for duration."),
      blessing("Tongues", "Receive the Tongues Truth.")
    ],
    curses: [
      curse("Bizarro-God", "Gain 1 Pantheon Die when becoming the opposite of the Dominion harms the group."),
      curse("Led By My Power", "Gain 1 Pantheon Die when succumbing to the Dominion causes trouble.")
    ]
  }),
  domainChoice("Elemental", "elemental", 63, "Fire, forests, sky, sun, shadow, ocean, mountains, wind, storms", {
    skills: { fighting: 1, intuition: 1, might: 1, perception: 1, travel: 1 },
    manifestations: { ruin: 1, shaping: 1 },
    attachments: [attachment("landmark", "Landmark Bond", 3)],
    blessings: [
      blessing("Destructive Nature", "Gain +1 success toward the Damage Measure when using the element to cause harm."),
      blessing("Elemental Strength", "Gain +2 Strength around a large amount of the element, or +4 when interacting directly with it."),
      blessing("In My Element", "Gain +1 Crafts and +1 Survival when interacting with the element.")
    ],
    curses: [
      curse("Connected to the Land", "Gain 1 Pantheon Die if a Landmark Bond takes Strain from an outside source."),
      curse("Tech Allergy", "Gain 1 Pantheon Die when the god's presence interferes with important machines or tech.")
    ]
  }),
  domainChoice("Emotional", "emotional", 63, "Fear, ecstasy, love, anger, courage, cruelty, sorrow", {
    skills: { discipline: 1, empathy: 1, influence: 1, medicine: 1, tech: 1 },
    manifestations: { minion: 1, puppetry: 1 },
    attachments: [attachment("individual", "Individual Bond", 1), attachment("landmark", "Landmark Bond", 2)],
    blessings: [
      blessing("Fuel My Fire", "Gain +1 to any roll made in the heat of the chosen emotion."),
      blessing("Siphon", "Once per target per scene, lessen a target's associated emotion to add +1 Pantheon Die, to a maximum of +4."),
      blessing("Soothing Aura", "Receive the Soothing Aura Truth for free.")
    ],
    curses: [
      curse("Apathetic", "Gain 1 Pantheon Die when becoming hardened and unemotional causes trouble."),
      curse("Overcome with Emotion", "Gain 1 Pantheon Die when the emotional Dominion surges through someone else and causes issues.")
    ]
  }),
  domainChoice("Patrons", "patron", 65, "Cooks, scribes, fencing, travelers, artists, blacksmiths, dancers", {
    skills: { crafts: 1, fighting: 1, marksman: 1, perform: 1, travel: 1 },
    manifestations: { aegis: 1, minion: 1 },
    attachments: [attachment("worshipper", "Worshippers Entitlement", 2), attachment("landmark", "Landmark Bond", 1)],
    blessings: [
      blessing("Divinely Skilled", "Receive the Divinely Skilled Truth connected to the Dominion."),
      blessing("Loved and Worshipped", "When devoting a Scene to Worshippers, heal +1 Strain to the Bond once per Session."),
      blessing("Patron's Blessing", "Grant +2 to a related Skill for targets within Near Range, up to Spark level targets.")
    ],
    curses: [
      curse("Fox in the Henhouse", "Gain 1 Pantheon Die if Worshippers are Strained by an outside source."),
      curse("Let's See What You Got", "Gain 1 Pantheon Die when a challenge to the god's mantle leads into danger.")
    ]
  }),
  domainChoice("Tangible", "tangible", 65, "Filth, androgyny, computers, paper, fertility, murder, healing", {
    skills: { crafts: 1, medicine: 1, might: 1, stealth: 1, tech: 1 },
    manifestations: { beckon: 1, puppetry: 1 },
    attachments: [attachment("relic", "Relic Entitlement", 2), attachment("landmark", "Landmark Bond", 1)],
    blessings: [
      blessing("Call Me Master", "Gain +2 to all checks when interacting with the Dominion."),
      blessing("Finders Keepers", "Sacrifice 1 Pantheon Die to declare that something related to the Dominion is present in the scene."),
      blessing("Immunity", "Receive the Immunity Truth tied directly to the Dominion.")
    ],
    curses: [
      curse("Everything's a Nail", "Gain 1 Pantheon Die when use of Manifestations makes things worse during a scene."),
      curse("Utterly Alone", "Gain 1 Pantheon Die when nothing connected to the Dominion is in the scene during a crucial moment.")
    ]
  }),
  domainChoice("Crossovers", "crossover", 66, "Death, war, music, trickery, seasons, the hunt, dreams", {
    skills: { discipline: 1, knowledge: 1, marksman: 1, speed: 1, survival: 1 },
    manifestations: { aegis: 1, soul: 1 },
    attachments: [attachment("choice", "Attachment of choice", 1), attachment("landmark", "Landmark Bond", 2)],
    blessings: [
      blessing("Adaptable", "Sacrifice Pantheon Dice to switch one Skill in a check combo; cost increases by 1 per use in the Scene."),
      blessing("Learning from Others", "Choose one unique Blessing from another Dominion type, except Blessings that only grant a Truth."),
      blessing("Reactive", "Gain a +2 Initiative bonus.")
    ],
    curses: [
      curse("Prideful", "Gain 1 Pantheon Die when pride or arrogance causes conflict or friction."),
      curse("Unpredictable", "Gain 1 Pantheon Die when others' uncertainty about trusting the character causes trouble.")
    ]
  }),

  theology("Ascendants", 68, "Exaltants, True Gods, Inhumans", "Holier-than-thou, Snobbish, Deluded", {
    skills: { athletics: 1, fighting: 1, fortitude: 1, might: 1, survival: 1 },
    manifestations: { minion: 1, ruin: 1, shaping: 2 },
    resources: { freeTime: 2, wealth: 1 },
    blessing: "Inhuman Visage",
    blessingSummary: "Receive Aura of Influence, one other Truth of choice, and activate body-altering Truths without spending Fragments.",
    curse: "Cut Off from the World",
    curseSummary: "Maximum Bonds are reduced to 5 - Spark, and the god begins play with a Level 2 Failing of choice."
  }),
  theology("Cult of the Saints", 72, "Saints, Nutjobs, Messengers", "Zealous, Spiritual, Protective", {
    skills: { discipline: 1, empathy: 1, intuition: 1, perception: 1, survival: 1 },
    manifestations: { beckon: 1, oracle: 2, soul: 1 },
    resources: { freeTime: 2, wealth: 1 },
    blessing: "Divine Words",
    blessingSummary: "Spend 1 Fragment to ask the GM one truthful divine question, with extra questions costing Pantheon Dice; in Battle, spend 1 Fragment and a Quick Action for +5 to the next attack.",
    curse: "Follow the Voices",
    curseSummary: "Once per Session the GM may command an act in the higher power's name; resisting requires Discipline + Intuition."
  }),
  theology("Drifting Kingdoms", 76, "Wanderers, Missionaries, Flip-Floppers", "Nomadic, Wayward, Infuriating", {
    skills: { crafts: 1, fortitude: 1, marksman: 1, medicine: 1, travel: 1 },
    manifestations: { aegis: 1, journey: 2, shaping: 1 },
    resources: { freeTime: 3, wealth: 0 },
    blessing: "Instant Domain",
    blessingSummary: "Use a Standard Action and 1 Fragment to make the current point of interest a temporary Landmark Bond for the Scene; Drifters can also move diagonally on the Territory Grid.",
    curse: "Wanderlust",
    curseSummary: "Starting a Scene in the same location as the previous Scene deals 1 Psyche damage and adds a Level 1 Confused Condition."
  }),
  theology("Kunitsukami", 80, "Kami, Traditionalists", "Respectful, Spiritual, Hierarchical", {
    skills: { discipline: 1, intuition: 1, medicine: 1, perception: 1, speed: 1 },
    manifestations: { puppetry: 1, oracle: 1, soul: 2 },
    resources: { freeTime: 2, wealth: 1 },
    blessing: "Eight Million Spirits",
    blessingSummary: "Spend 1 Fragment to sense and speak with active spirits, animals, and objects; sacrifice Pantheon Dice to compel answers or favors from spirits.",
    curse: "In the Middle",
    curseSummary: "Receive a Level 3 Spirit Community Group Bond instead of spending 5 Attachment points; its Strain inflicts Broken (Influence) consequences."
  }),
  theology("Masks of Jana", 84, "Masks, Veils, The Obscure", "Mysterious, Secretive, Cowards", {
    skills: { deception: 1, knowledge: 1, speed: 1, stealth: 1, survival: 1 },
    manifestations: { aegis: 1, beckon: 2, shaping: 1 },
    resources: { freeTime: 1, wealth: 2 },
    blessing: "Forgotten",
    blessingSummary: "Spend 1 Fragment to go unnoticed by mortals for the Scene, with options to hide memories or obscure divine traces in Territory.",
    curse: "Disconnection",
    curseSummary: "Bonds and Worshippers count as 1 level lower for dice pools and effects due to the Mask's enforced secrecy."
  }),
  theology("Order of Meskhenet", 88, "Blue Bloods, Suits, Inheritors", "Loyal, Well-connected, Built on Nepotism", {
    skills: { deception: 1, influence: 1, knowledge: 1, perform: 1, tech: 1 },
    manifestations: { minion: 2, puppetry: 1, soul: 1 },
    resources: { freeTime: 0, wealth: 4 },
    blessing: "Divine Inheritance",
    blessingSummary: "Begin with a free Level 2 Relic and Level 2 Worshippers Entitlement; use Worshipper special ability without Strain Spark times per Session.",
    curse: "Family Loyalty",
    curseSummary: "Receive a Level 3 Watcher Individual Bond instead of spending 5 Bond points; the Watcher monitors service to the Order."
  }),
  theology("Phoenix Society", 92, "Phoenixes, Birdies, Mortal Lovers", "Partiers, Protective, Cunning", {
    skills: { athletics: 1, empathy: 1, perform: 1, stealth: 1, tech: 1 },
    manifestations: { aegis: 2, oracle: 1, ruin: 1 },
    resources: { freeTime: 2, wealth: 1 },
    blessing: "Linked to Humanity",
    blessingSummary: "Maximum Bonds are raised to 7 - Spark, receive a free Level 2 Group Bond, and Bonds/Worshippers act as 1 level higher.",
    curse: "Intimacy Addiction",
    curseSummary: "After a Scene without personal interaction with humanity, take 1 Psyche damage and a Level 1 Deprived Condition."
  }),
  theology("Puck-Eaters", 96, "Hunters, Cannibals, Predators", "Savage, Pragmatic, Dangerous", {
    skills: { athletics: 1, deception: 1, fighting: 1, influence: 1, travel: 1 },
    manifestations: { journey: 1, minion: 1, ruin: 2 },
    resources: { freeTime: 2, wealth: 1 },
    blessing: "Cannibal Behavior",
    blessingSummary: "Eat mortals, Outsiders, or greater gods to gain temporary abilities; begin with +2 Health and immunity to raw-meat sickness.",
    curse: "Unceasing Appetite",
    curseSummary: "When offered something never eaten before, resist the urge with Fortitude + Discipline; repeated resistance raises Difficulty."
  }),
  theology("Warlock's Fate", 100, "Warlocks, Wizards, Conjurers", "Analytical, Obsessed, Know-it-alls", {
    skills: { crafts: 1, empathy: 1, influence: 1, knowledge: 1, perception: 1 },
    manifestations: { beckon: 1, journey: 1, puppetry: 2 },
    resources: { freeTime: 1, wealth: 2 },
    blessing: "See Connections",
    blessingSummary: "Spend 1 Fragment to learn how things are connected; view one connection for free and extra connections by sacrificing Pantheon Dice. Begin with +2 Psyche.",
    curse: "Manipulators",
    curseSummary: "When asking Attachments for help or devoting scenes to Bonds, a 1d10 result of 1-2 adds Strain or prevents Strain healing."
  }),
  theology("Undecided", 67, "No Theology, Independent", "Unaligned, Mortal-grounded, Untrained", {
    undecided: true,
    skillPoints: 8,
    manifestationPoints: 2,
    skills: {},
    manifestations: {},
    resources: { freeTime: 3 },
    blessing: "",
    blessingSummary: "Undecided gods receive no Theology Blessing.",
    curse: "",
    curseSummary: "Undecided gods receive no Theology Curse."
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

function archetype(name, definingTrait, page, options) {
  return choice("archetype", name, page, {
    definingTrait,
    attachmentOptions: (options.attachments ?? []).map(option => ({ ...option, sourcePage: page })),
    blessingOptions: (options.blessings ?? []).map(option => withAbilitySource(option, page, "blessing")),
    curseOptions: (options.curses ?? []).map(option => withAbilitySource(option, page, "curse")),
    grants: normalizeGrants({ skills: options.skills ?? {} }),
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
    attachmentOptions: grants.attachments ?? [],
    blessingOptions: grants.blessings ?? [],
    curseOptions: grants.curses ?? [],
    grants: normalizeGrants({
      skills: grants.skills ?? {},
      manifestations: grants.manifestations ?? {}
    }),
    description: paragraph(`Dominion category examples: ${examples}.`),
    notes: source(page)
  });
}

function theology(name, page, otherNames, stereotype, grants) {
  return choice("theology", name, page, {
    otherNames,
    stereotype,
    undecided: grants.undecided ?? false,
    skillPoints: grants.skillPoints ?? 0,
    manifestationPoints: grants.manifestationPoints ?? 0,
    blessingSummary: paragraph(grants.blessingSummary ?? ""),
    curseSummary: paragraph(grants.curseSummary ?? ""),
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
  const automation = abilityAutomation("blessing", name, effect);
  return {
    name,
    effect,
    usageKind: automation.usage.kind,
    rules: abilityRules(name, effect, "blessing"),
    usage: automation.usage,
    automation: automation.automation,
    automationNotes: automation.notes
  };
}

function curse(name, effect) {
  const automation = abilityAutomation("curse", name, effect);
  return {
    name,
    effect,
    pantheonDice: 1,
    usageKind: automation.usage.kind,
    rules: abilityRules(name, effect, "curse"),
    usage: automation.usage,
    automation: automation.automation,
    automationNotes: automation.notes
  };
}

function abilityRules(name, effect, type) {
  return {
    summary: effect,
    fullText: paragraph(effect),
    source: {
      book: "Part-Time Gods Second Edition",
      page: null,
      section: name,
      type
    }
  };
}

function withAbilitySource(option, page, type) {
  return {
    ...option,
    sourcePage: page,
    rules: {
      ...(option.rules ?? {}),
      source: {
        ...(option.rules?.source ?? {}),
        book: "Part-Time Gods Second Edition",
        page,
        section: option.name,
        type
      }
    }
  };
}

function abilityAutomation(type, name, effect) {
  const lower = `${name} ${effect}`.toLowerCase();
  const usageKind = type === "curse"
    ? "triggered"
    : lower.includes("once per") || lower.includes("roll ") || lower.includes("sacrifice") || lower.includes("spend ")
      ? "active"
      : "passive";
  const trigger = type === "curse"
    ? "gm"
    : usageKind === "passive"
      ? "always"
      : "use";
  const usage = {
    kind: usageKind,
    trigger,
    target: lower.includes("target") ? "targeted" : "self",
    cost: {
      freeTime: lower.includes("sacrifices 1 free time") || lower.includes("sacrificing 1 free time") ? 1 : 0,
      wealth: lower.includes("sacrificing 1 wealth") ? 1 : 0,
      pantheonDice: 0,
      fragments: 0,
      health: lower.includes("take 1 damage") ? 1 : 0,
      psyche: 0,
      strain: 0
    }
  };
  const automation = {
    enabled: false,
    action: type === "curse" ? "gain-pantheon-die" : "",
    bonus: bonusAutomation(effect),
    penalty: penaltyAutomation(effect),
    roll: rollAutomation(effect),
    healing: healingAutomation(effect),
    damage: null,
    condition: conditionAutomation(effect),
    resourceChange: type === "curse" ? {
      resource: "pantheonDice",
      amount: 1,
      target: "pantheonPool"
    } : null,
    chatCard: true
  };
  const notes = type === "curse"
    ? "Triggered Curse: post a chat card and add 1 Pantheon Die to the shared pool when the table confirms the trigger."
    : "Archetype Blessing metadata is source-backed; effects requiring judgment remain chat-card guided unless a structured automation field is present.";

  return { usage, automation, notes };
}

function bonusAutomation(effect) {
  const match = effect.match(/Gain \+(\d+) ([A-Za-z]+)(?: when| to|$)/i) ?? effect.match(/\+(\d+) bonus to (?:any )?(?:roll|check)/i);
  if (!match) return null;
  return {
    amount: Number(match[1]),
    appliesTo: match[2] ? labelKey(match[2]) : "roll",
    timing: "conditional",
    source: "archetype"
  };
}

function penaltyAutomation(effect) {
  const match = effect.match(/-(\d+) penalty/i);
  if (!match) return null;
  return {
    amount: Number(match[1]),
    target: "targeted",
    timing: "use"
  };
}

function rollAutomation(effect) {
  const match = effect.match(/roll ([A-Za-z]+) \+ ([A-Za-z]+)/i);
  if (!match) return null;
  return {
    primary: labelKey(match[1]),
    secondary: labelKey(match[2]),
    difficulty: effect.match(/Simple \(1\)/i) ? 1 : null
  };
}

function healingAutomation(effect) {
  if (!/heal|reduce a Condition|lower a mental Condition/i.test(effect)) return null;
  return {
    target: /partner|people in attendance/i.test(effect) ? "targeted" : "self",
    resource: /Psyche/i.test(effect) && !/Health/i.test(effect) ? "psyche" : "healthOrPsyche",
    amount: "successes",
    conditionReduction: /Condition/i.test(effect)
  };
}

function conditionAutomation(effect) {
  const match = effect.match(/(?:Level )?(\d+) ([A-Za-z]+) Condition/i) ?? effect.match(/([A-Za-z]+) (\d+) Condition/i);
  if (!match) return null;
  const severity = Number(match[1]) || Number(match[2]) || 1;
  const name = Number(match[1]) ? match[2] : match[1];
  return {
    name,
    severity,
    target: "self",
    effect: `${name} ${severity} from Archetype ability.`
  };
}

function labelKey(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, "");
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
