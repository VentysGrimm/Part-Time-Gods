const OCCUPATION_CAREERS = {
  "Academic": [
    career("Explorer", 3, 3, [attachment("individual", "My Personal Assistant", 2), attachment("group", "The Explorer's Guild", 2)], careerBlessing("The Undiscovered", "Encountering new locations is exciting, and Explorers know just how to take advantage of this opportunity. Gain +1 Perception when searching or exploring a place they've never been before."), careerCurse("On to the Next", "The rush of something new drives an Explorer to greatness but is also their worst enemy. Gain 1 Pantheon Die if they pursue a new venture, leaving other important projects to fester."), { sourcePage: 37 }),
    career("Professor", 2, 4, [attachment("group", "The Academic Community", 2), attachment("landmark", "My College", 2)], careerBlessing("I Know Just the Book", "Professors always know exactly where they've heard that quote before or the best references for specific information. Gain +1 Speed whenever they need to quickly research a topic."), careerCurse("A Slight Miscalculation", "They have lots of ideas, but not all of them are golden. Gain 1 Pantheon Die when one of their theories/plans proves to be completely and utterly wrong to the detriment of the group."), { sourcePage: 38 }),
    career("Student", 4, 1, [attachment("group", "Fellow Students", 3), attachment("landmark", "My Campus", 3)], careerBlessing("Omegas Rule!", "The real lessons from college are often how to operate during keggers or stay abreast of the latest gossip making its way through campus. Gain +1 Influence when carousing at parties and to gather information from your peers."), careerCurse("Pop Quiz", "Students often have problems making important decisions when put on the spot, freezing under the pressure. Gain 1 Pantheon Die if a decision ever leaves them stunned, and the group suffers due to their lack of adaptability."), { sourcePage: 38 })
  ],
  "Blue Collar": [
    career("Business Owner", 2, 3, [attachment("landmark", "My Business", 3)], careerBlessing("Solo Ingenuity", "Business owners know how to work with the materials they have, as they are often not able to afford expensive repairs. Gain +1 Crafts to jury-rig an item to work \"well-enough\" on the fly - a trick they've come to master having their own business."), careerCurse("Didn't Hear the Knock", "These characters tend to miss opportunities if they aren't 100% attached to their business at all times. Gain 1 Pantheon Die if the player sacrifices 2 Wealth, representing major income they've lost while pursuing other responsibilities."), { sourcePage: 39 }),
    career("Manual Labor", 3, 3, [attachment("landmark", "The Factory", 2), attachment("group", "Factory Workers", 2)], careerBlessing("Keep My Head Down", "They know how to focus entirely on the job at hand. Gain +1 Discipline to ignore distractions and just concentrate on their current duties."), careerCurse("Old Injuries", "Labor jobs put strain on the body and injuries occur often on poorly managed job sites. Gain 1 Pantheon Die when an old injury (i.e. bad knee, bum shoulder, etc.) causes the character to fail to complete an important task."), { sourcePage: 39 }),
    career("Minimum Wage", 4, 1, [attachment("individual", "The Boss", 3), attachment("group", "My Friends", 3)], careerBlessing("Quick Leaner", "They've run into their fair number of computer systems jumping from job to job. Gain +1 Tech when figuring out or operating systems they haven't seen before."), careerCurse("Bored Now", "These characters get bored easily and tend to give up on a job. Gain 1 Pantheon Die when they walk away from an important task and leave it undone to the detriment of the group."), { sourcePage: 39 })
  ],
  "Creative": [
    career("Artist", 4, 1, [attachment("individual", "My Muse", 3), attachment("landmark", "My Studio", 3)], careerBlessing("Pull an All-Nighter", "When an artist starts a job, they don't stop until it's done. Gain +1 Fortitude for spending a long time doing a single activity, learned from their long, caffeine-fueled nights creating."), careerCurse("I Can't Even", "Gain 1 Pantheon Die when something stressful causes the character to lash out at everyone around them. This either takes them out of the situation entirely or creates unwanted tension."), { sourcePage: 40 }),
    career("Homemaker", 3, 2, [attachment("individual", "My Child", 3), attachment("landmark", "My Home", 3)], careerBlessing("Keen Eye", "Homemakers believe in the saying \"A place for everything and everything in its place.\" Gain +1 Perception to tell if something is out of place in a room (or crime scene)."), careerCurse("Patronizing", "Sometimes, they just can't turn off their parental, often condescending, tone. Gain 1 Pantheon Die when they come off as harsh when talking to others, causing friction or trouble."), { sourcePage: 40 }),
    career("Performer", 3, 3, [attachment("individual", "My Manger", 2), attachment("group", "My Troupe", 2)], careerBlessing("Show Stopper", "Performers push themselves by jumping off speakers, twirling in a pirouette, or withstanding the stunt fall needed to really sell a scene. Gain +1 Athletics for using physicality to put on a better show."), careerCurse("Outtakes", "Gain 1 Pantheon Die when the character doesn't perform their best during a show, and it causes damage to their reputation. Can't win them all, right?"), { sourcePage: 41 })
  ],
  "Criminal": [
    career("Big Time", 2, 4, [attachment("individual", "Right Hand", 2), attachment("group", "The Family", 2)], careerBlessing("The One on Top", "They know they're on top, and everyone else wants to be where they are. Gain +1 Discipline against Fear, as there is little they haven't seen already."), careerCurse("Making Enemies", "The character has made certain enemies in the past. Gain 1 Pantheon Die when interference from an enemy impedes progress or makes their (or their pantheon's) jobs much harder."), { sourcePage: 41 }),
    career("Sex Worker", 3, 4, [attachment("individual", "My Handler/Muscle", 1), attachment("group", "Other workers", 1)], careerBlessing("Spot the Creep", "Gain +1 Empathy to tell if someone has potentially dangerous intentions within seconds of meeting them. This has saved the character's life (or career) more than once."), careerCurse("On the Brain", "Sometimes they just don't know when to reel in their flirtatious nature. Gain 1 Pantheon Die if/when the character acts overly sexual and causes tension or conflict in a social situation."), { sourcePage: 41 }),
    career("Small Time", 4, 2, [attachment("group", "The Gang", 2), attachment("landmark", "Our Turf", 2)], careerBlessing("The Muscle", "They often gain employment as a heavy for random destruction. Gain +1 Might to break things, such as smashing down doors, snapping bones, or shattering windows."), careerCurse("Klepto", "When they see something they want, they take it. Gain 1 Pantheon Die when this act causes horrible consequences for them (or their group)."), { sourcePage: 42 })
  ],
  "Fringe": [
    career("Homeless", 5, 0, [attachment("group", "Homeless Community", 3), attachment("landmark", "The Fringes", 3)], careerBlessing("Friends in Low Places", "They have a special rapport with people who are like them. Gain +1 Influence when negotiating with other outcasts or pariahs for supplies or protection."), careerCurse("Like a Sore Thumb", "The homeless find themselves welcome in very few places. Security may be called to remove them from private property, or they might draw the eye of nearby law enforcement for no reason. Gain 1 Pantheon Die if they cause a scene because they seem very out-of-place."), { sourcePage: 42 }),
    career("Religious", 4, 2, [attachment("group", "My Congregation", 2), attachment("landmark", "My Church", 2)], careerBlessing("Higher Learning", "They embolden their minds just as much as their spirit. Gain +1 Knowledge for reciting myth, religious doctrine, or historical facts, as they have a lot of time to read and study."), careerCurse("Held to a Code", "The scriptures state there are things they can and cannot do. Gain 1 Pantheon Die when the specific code of behavior the character adheres to causes issues for themselves or the group."), { sourcePage: 43 }),
    career("Rural", 3, 3, [attachment("individual", "My Partner", 2), attachment("landmark", "My land", 2)], careerBlessing("Stand My Ground", "They aren't in the habit of letting others take what's theirs. Gain +1 Marksman when defending their land or territory."), careerCurse("Missed the Cues", "They have a way of saying what they mean, and they miss (or ignore) a lot of the etiquette in a metropolitan setting. Gain 1 Pantheon Die when their curt or blunt behavior has a negative impact on the group."), { sourcePage: 43 })
  ],
  "Medical": [
    career("Professional", 1, 5, [attachment("group", "Medical Community", 2), attachment("landmark", "My Hospital", 2)], careerBlessing("My Medical Opinion", "They have a firm grasp on medical theory and jargon. Gain +1 Knowledge to properly diagnose someone or recall drug effects and treatment options."), careerCurse("Call It", "Regardless of effort, some patients just don't make it. Gain 1 Pantheon Die when someone under the character's care dies."), { sourcePage: 43 }),
    career("Scientist", 2, 4, [attachment("individual", "My Assistant", 2), attachment("landmark", "My lab", 2)], careerBlessing("The Scientific Method", "Performing experiments is a task that falls right into their wheelhouse. Gain +1 Crafts to mix solutions and test theories, creating interesting effects, if done right."), careerCurse("Don't Care What It Takes", "They'll risk it all to discover the truth! Gain 1 Pantheon Die if they sacrifice something important (to themselves or to the pantheon) in the name of experimentation!"), { sourcePage: 44 }),
    career("Therapist", 2, 4, [attachment("group", "Therapist Community", 2), attachment("landmark", "My Office", 2)], careerBlessing("This Isn't About Me", "It can be difficult to figure out the character. Gain +1 Deception to keep their own emotions hidden, since they know all the defense mechanisms."), careerCurse("Not Exactly What I Said", "Some clients only hear what they want to hear. Gain 1 Pantheon Die when counsel (or perceived counsel) the character gave to someone comes back to haunt them (or their group)."), { sourcePage: 44 })
  ],
  "Peacekeepers": [
    career("Detective", 3, 3, [attachment("individual", "My Partner", 2), attachment("group", "The Precinct", 2)], careerBlessing("Eye on the Perp", "Detectives know how to follow a person of interest. Gain +1 Stealth to shadow someone else, always staying right outside their view."), careerCurse("Haunted", "Gain 1 Pantheon Die when the current situation reminds the character of a terrible case they once worked, and they freeze up in contemplation instead of acting."), { sourcePage: 45 }),
    career("Emergency Services", 3, 3, [attachment("group", "Other Workers", 2), attachment("landmark", "The Station", 2)], careerBlessing("Field Medicine", "They arrive, assess the situation, and tend to the wounded without regard for any chaos in the area. Gain +1 Medicine to perform medical aid in the field."), careerCurse("Can't Save Them All", "If they could be everywhere at once, they would, but this just isn't a reality. Gain 1 Pantheon Die when the character must choose to save one person over another."), { sourcePage: 45 }),
    career("Officer", 4, 2, [attachment("individual", "My Partner", 2), attachment("group", "Blue Brotherhood", 2)], careerBlessing("Subdue the Perp", "Officers are trained how to handle tense encounters. Gain +1 Fighting to wrestle and pin someone to ground, something they must do almost every day."), careerCurse("Always on the Job", "An Officer's job is rarely done when they clock out. Gain 1 Pantheon Die in exchange for sacrificing 2 Free Time after leaving a scene involving the character's Occupation."), { sourcePage: 45 })
  ],
  "Physical": [
    career("Athlete", 2, 4, [attachment("individual", "My Coach", 2), attachment("landmark", "My Training Facility", 2)], careerBlessing("On Your Marks", "When it comes to beating the competition, the character competes to win. Gain +1 Speed when racing against the clock or another person."), careerCurse("Dumb Jock", "The assumption that athletes are not intelligent is aggravating to say the least. Gain 1 Pantheon Die when these prejudices play a part in breaking down social interactions with others."), { sourcePage: 46 }),
    career("Fighter", 3, 3, [attachment("group", "Fighting Community", 2), attachment("landmark", "My Gym", 2)], careerBlessing("You Look Strong", "They've faced many opponents, so it's easy to tell who's a threat and who is minced meat. Gain +1 Intuition to size up a person and predict their fighting styles and capabilities."), careerCurse("Dark Past", "Fighters sometimes take on side jobs or do things they are less than proud of to make ends meet. Gain 1 Pantheon Die when something the character was once hired to do comes back to plague them."), { sourcePage: 46 }),
    career("Soldier", 2, 4, [attachment("individual", "My Commander", 2), attachment("group", "Fellow Soldier", 2)], careerBlessing("Carry On", "They've pushed themselves beyond their limits. Gain +1 Fortitude vs. Pain."), careerCurse("Yes, Sir!", "Their impulse to carry out commands is instinctual at times. Gain 1 Pantheon Die when they follow an order without thinking and the result is bad for them (or the group)."), { sourcePage: 46 })
  ],
  "Public Life": [
    career("Celebrity", 2, 4, [attachment("individual", "My Agent", 2), attachment("group", "My Fans", 2)], careerBlessing("Game Face", "Gain +1 Empathy to manipulate their own emotions to give a convincing performance, even if only to a crowd of one."), careerCurse("My Adoring Fans", "Celebrities are sometimes put on a pedestal, and are expected to interact with fans in a certain way. Gain 1 Pantheon Die when their fame (even minor fame) makes it hard to perform tasks, or the celebrity reacts in a perfectly human (but not necessarily nice) manner."), { sourcePage: 47 }),
    career("Media", 3, 3, [attachment("individual", "My Editor", 2), attachment("group", "Journalist Community", 2)], careerBlessing("Anything for the Story", "They'll go to any lengths to get to the truth. Gain +1 Stealth when breaking into places they shouldn't be."), careerCurse("Killed the Cat", "They must follow a story if one presents itself, causing trouble for not only themselves but also for their pantheon. Gain 1 Pantheon Die when curiosity gets the better of them."), { sourcePage: 47 }),
    career("Politician", 2, 4, [attachment("group", "Political Circles", 2), attachment("landmark", "My Office", 2)], careerBlessing("It's Who You Know", "It's important for Politicians to know who people are. Gain +1 Knowledge to recall facts about who someone is, what they do, what their family is like, and other helpful information."), careerCurse("My Name", "A politician's name is their most valued asset. Gain 1 Pantheon Die when their need to protect their reputation gets in the way of an important task, and they (or their group) suffer for it."), { sourcePage: 48 })
  ],
  "Unemployed": [
    career("Kid", 5, 1, [attachment("individual", "Responsible Parent", 2), attachment("group", "Other Kids", 2)], careerBlessing("Hide and Seek", "It's easy to hide when you're smaller than everyone else. Gain +1 Stealth to hide away from others, usually finding places big folk never get to."), careerCurse("*Blush*", "Nothing is worse than being embarrassed. Gain 1 Pantheon Die whenever something happens that completely embarrasses the kid, leaving them mortified and fleeing from the scene."), { sourcePage: 48 }),
    career("Privileged", 1, 5, [attachment("group", "Socialite Circles", 2), attachment("landmark", "My Mansion", 2)], careerBlessing("This is My Town", "They know their way around everywhere, especially where to get to the best parties. Gain +1 Survival when operating in urban environments."), careerCurse("Can't Pass Up a Deal", "They often get off on gambling and initiating deals of all kinds, but sometimes things go south. Gain 1 Pantheon Die when the character makes a deal that goes sideways and causes trouble."), { sourcePage: 48 }),
    career("Retired", 4, 2, [attachment("group", "Old Coworkers", 2), attachment("group", "My Family", 2)], careerBlessing("My Old Life", "Gain a +1 bonus to a Skill of Choice to reflect the profession they once held. A retired pilot may gain +1 Travel (Planes), while a retired boxer may gain +1 Fighting (Punches)."), careerCurse("Feeling My Age", "Age does have its drawbacks. Gain 1 Pantheon Die when the character's absent-mindedness or physical weakness causes trouble for the group."), { sourcePage: 49 })
  ],
  "White Collar": [
    career("Computer Tech", 3, 3, [attachment("group", "Geek Squad", 2), attachment("landmark", "My Setup", 2)], careerBlessing("Scanning for Glitches", "Computer diagnostics is a hobby of theirs. Gain +1 Intuition to diagnose issues with a machine or crack a difficult code, hopefully solving the issue on the first try."), careerCurse("Tech Jargon", "Communications can break down when you don't speak plainly. Gain 1 Pantheon Die when their penchant for talking over people's heads occurs to their detriment."), { sourcePage: 50 }),
    career("Executive", 2, 4, [attachment("group", "The Board of Directors", 2), attachment("landmark", "My Office", 2)], careerBlessing("Brown Nose", "Executives are great talkers and con artists. Gain +1 Empathy to read someone and figure out what they want to hear."), careerCurse("Coming in on Saturday", "They are used to others doing the demanding work. Gain 1 Pantheon Die when no one is around to delegate to, and the character is forced to do a terrible job at an important task themselves."), { sourcePage: 50 }),
    career("Lawyer", 1, 5, [attachment("individual", "My Partner", 2), attachment("landmark", "My Office", 2)], careerBlessing("Closing Arguments", "It's difficult to resist a lawyer's logic. Gain +1 Perform when orating before a crowd, using their words to bring others to their side."), careerCurse("Well, Actually", "Lawyers can't pass up a good debate, even when they should. Gain 1 Pantheon Die when they insufferably debates the smallest situation, creating conflict and issues for the group."), { sourcePage: 51 })
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

function occupation(name, page, grants) {
  return choice("occupation", name, page, {
    category: name,
    career: "",
    careerOptions: normalizeOccupationCareers(name, page),
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
    attachmentOptions: (grants.attachments ?? []).map(option => ({ ...option, sourcePage: page })),
    blessingOptions: (grants.blessings ?? []).map(option => withAbilitySource(option, page, "blessing")),
    curseOptions: (grants.curses ?? []).map(option => withAbilitySource(option, page, "curse")),
    grants: normalizeGrants({
      skills: grants.skills ?? {},
      manifestations: grants.manifestations ?? {}
    }),
    description: paragraph(`Dominion category examples: ${examples}.`),
    notes: source(page)
  });
}

function theology(name, page, otherNames, stereotype, grants) {
  const blessingData = grants.blessing
    ? withAbilitySource(blessing(grants.blessing, grants.blessingSummary ?? ""), page, "blessing")
    : "";
  const curseData = grants.curse
    ? withAbilitySource(curse(grants.curse, grants.curseSummary ?? "", { pantheonDice: 0 }), page, "curse")
    : "";

  return choice("theology", name, page, {
    rules: {
      summary: `${name} grants Theology Skills, Manifestations, Free Time, Wealth, and its listed Blessing and Curse.`,
      fullText: paragraph(`${name}: ${grants.blessingSummary ?? ""} ${grants.curseSummary ?? ""}`.trim()),
      source: {
        book: "Part-Time Gods Second Edition",
        page,
        section: name,
        type: "theology"
      }
    },
    usage: {
      kind: "passive",
      trigger: "always",
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
    },
    automation: {
      enabled: false,
      action: "apply-theology-choice",
      bonus: null,
      penalty: null,
      roll: null,
      healing: null,
      damage: null,
      condition: null,
      resourceChange: null,
      chatCard: true
    },
    otherNames,
    stereotype,
    undecided: grants.undecided ?? false,
    skillPoints: grants.skillPoints ?? 0,
    manifestationPoints: grants.manifestationPoints ?? 0,
    blessingSummary: paragraph(grants.blessingSummary ?? ""),
    curseSummary: paragraph(grants.curseSummary ?? ""),
    blessingData,
    curseData,
    grants: normalizeGrants({
      ...grants,
      blessing: grants.blessing ?? "",
      curse: grants.curse ?? ""
    }),
    description: paragraph(`${name} is a Theology choice for newly awakened gods.`),
    notes: source(page)
  });
}

function choice(type, name, page, system) {
  const slug = slugify(name);

  return {
    name,
    type,
    img: defaultIcon(type),
    system,
    flags: {
      "part-time-gods": {
        premadeChoice: true,
        source: "Part-Time Gods Second Edition",
        page,
        slug,
        sourceId: `choice:${type}:${slug}`
      }
    }
  };
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function normalizeOccupationCareers(occupationName, page) {
  return Array.from(OCCUPATION_CAREERS[occupationName] ?? []).map(career => {
    const sourcePage = career.sourcePage ?? page;
    const summary = `${career.name} is a ${occupationName} career option that grants Free Time ${Number(career.resources?.freeTime ?? 0)}, Wealth ${Number(career.resources?.wealth ?? 0)}, one Attachment option, a Blessing, and a Curse.`;

    return {
      ...career,
      description: career.description ?? summary,
      sourcePage,
      rules: {
        summary,
        fullText: paragraph(summary),
        source: {
          book: "Part-Time Gods Second Edition",
          page: sourcePage,
          section: `${occupationName}: ${career.name}`,
          type: "occupation-career"
        }
      },
      attachments: Array.from(career.attachments ?? []).map(attachment => ({
        ...attachment,
        sourcePage: attachment.sourcePage ?? sourcePage
      })),
      blessing: career.blessing ? withAbilitySource(career.blessing, sourcePage, "blessing") : null,
      curse: career.curse ? withAbilitySource(career.curse, sourcePage, "curse") : null
    };
  });
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

function career(name, freeTime, wealth, attachments, blessing, curse, { sourcePage = null } = {}) {
  return {
    name,
    ...(sourcePage ? { sourcePage } : {}),
    resources: { freeTime, wealth },
    attachments,
    blessing,
    curse
  };
}

function attachment(kind, name, level) {
  return {
    kind,
    name,
    level,
    choiceKind: kind,
    choiceLabel: name,
    requiresDefinition: true
  };
}

function careerBlessing(name, effect) {
  return blessing(name, effect, { printed: true });
}

function careerCurse(name, effect) {
  return curse(name, effect, { printed: true });
}

function blessing(name, effect, { printed = false } = {}) {
  const automation = abilityAutomation("blessing", name, effect);
  const playerText = printed ? effect : abilityPlayerText("blessing", name, effect);
  return {
    name,
    effect: playerText,
    rulesText: playerText,
    usageKind: automation.usage.kind,
    rules: abilityRules(name, effect, "blessing", playerText),
    usage: automation.usage,
    automation: automation.automation,
    automationNotes: automation.notes
  };
}

function curse(name, effect, { pantheonDice = 1, printed = false } = {}) {
  const automation = abilityAutomation("curse", name, effect, { pantheonDice });
  const playerText = printed ? effect : abilityPlayerText("curse", name, effect, { pantheonDice });
  return {
    name,
    effect: playerText,
    rulesText: playerText,
    pantheonDice,
    usageKind: automation.usage.kind,
    rules: abilityRules(name, effect, "curse", playerText),
    usage: automation.usage,
    automation: automation.automation,
    automationNotes: automation.notes
  };
}

function abilityRules(name, effect, type, playerText = effect) {
  return {
    summary: effect,
    fullText: paragraph(playerText),
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

function abilityPlayerText(type, name, effect, { pantheonDice = 1 } = {}) {
  if (type === "curse") {
    if (pantheonDice <= 0) {
      return `${name}: ${effect} This Theology Curse applies its listed complication but does not generate Pantheon Dice by default.`;
    }

    return `${name}: ${effect} Treat this as a scene complication tied to the Choice. When it genuinely makes trouble or pushes the god's weakness into focus, gain 1 Pantheon Die and make the consequence visible in play.`;
  }

  return `${name}: ${effect} Use this Blessing when the fictional trigger fits the scene; it explains why this character's Choice gives them an edge, not only which dice or resource changes.`;
}

function abilityAutomation(type, name, effect, { pantheonDice = type === "curse" ? 1 : 0 } = {}) {
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
      fragments: lower.includes("spend 1 fragment") ? 1 : 0,
      health: lower.includes("take 1 damage") ? 1 : 0,
      psyche: 0,
      strain: 0
    }
  };
  const automation = {
    enabled: false,
    action: type === "curse" && pantheonDice > 0 ? "gain-pantheon-die" : "",
    bonus: bonusAutomation(effect),
    penalty: penaltyAutomation(effect),
    roll: rollAutomation(effect),
    healing: healingAutomation(effect),
    damage: null,
    condition: conditionAutomation(effect),
    resourceChange: type === "curse" && pantheonDice > 0
      ? {
        resource: "pantheonDice",
        amount: pantheonDice,
        target: "pantheonPool"
      }
      : type === "curse"
        ? null
        : resourceChangeAutomation(effect),
    chatCard: true
  };
  const notes = type === "curse"
    ? pantheonDice > 0
      ? "Triggered Curse: post a chat card and add Pantheon Dice to the shared pool when the table confirms the trigger."
      : "Theology Curse: post a chat card for the penalty; it does not add Pantheon Dice by default."
    : "Archetype Blessing metadata is source-backed; effects requiring judgment remain chat-card guided unless a structured automation field is present.";

  return { usage, automation, notes };
}

function resourceChangeAutomation(effect) {
  const health = effect.match(/(?:begin with|gain) \+(\d+) Health/i);
  if (health) return { resource: "health", amount: Number(health[1]), target: "self" };

  const psyche = effect.match(/(?:begin with|gain) \+(\d+) Psyche/i);
  if (psyche) return { resource: "psyche", amount: Number(psyche[1]), target: "self" };

  const pantheon = effect.match(/add \+?(\d+) Pantheon Die/i);
  if (pantheon) return { resource: "pantheonDice", amount: Number(pantheon[1]), target: "pantheonPool" };

  return null;
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
