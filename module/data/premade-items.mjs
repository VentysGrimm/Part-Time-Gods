import { PTG_PREMADE_CHOICES } from "./premade-choices.mjs";
import { PTG_PREMADE_ACTORS } from "./premade-actors.mjs";
import { PTG_PREMADE_ROLL_TABLES } from "./premade-roll-tables.mjs";

const QUALITY_DEFINITIONS = {
  aquatic: {
    effect: "Works underwater or as aquatic gear; no numeric combat modifier is applied automatically.",
    notes: "Use when the scene involves water, swimming, or submerged fighting."
  },
  autofire: {
    supported: true,
    effect: "Requires the Reload drawback and adds +1 damage on a Boost.",
    notes: "Use for automatic firearms or similar rapid-fire weapons.",
    automation: { boostDamage: 1, requiresQuality: "reload" }
  },
  bargain: {
    effect: "Cheap and easy to obtain; no combat modifier."
  },
  brutal: {
    supported: true,
    effect: "Adds this quality value to weapon damage.",
    automation: { damageMinimum: true }
  },
  bulky: {
    effect: "Hard to carry or maneuver; apply situational penalties when space, stealth, or speed matters."
  },
  bulletproof: {
    supported: true,
    effect: "Adds this value as extra Armor against bullet or firearm damage tags.",
    automation: { armorTag: "bullet" }
  },
  "cold-proof": {
    supported: true,
    effect: "Adds this value as extra Armor against cold or freezing damage tags.",
    automation: { armorTag: "cold" }
  },
  concealable: {
    effect: "Easy to hide; no direct combat modifier."
  },
  blunt: {
    supported: true,
    effect: "May inflict Pain 1 on a Boost.",
    automation: { conditionPrompt: "Pain 1" }
  },
  crushing: {
    supported: true,
    effect: "May inflict Pain 1 on a Boost; preserved for the Police Baton example, where the source uses Crushing instead of Blunt.",
    automation: { conditionPrompt: "Pain 1" }
  },
  cumbersome: {
    effect: "Heavy and restrictive; apply situational movement or stealth penalties when relevant."
  },
  defending: {
    supported: true,
    effect: "Grants +1 free Defense check before applying penalties.",
    automation: { defenseBonus: 1 }
  },
  disarming: {
    supported: true,
    effect: "May disarm an opponent's weapon on a Boost.",
    automation: { boostEffect: "disarm" }
  },
  expensive: {
    effect: "Costs more or attracts attention; no combat modifier."
  },
  explosive: {
    supported: true,
    effect: "On a Boost, deals +2 additional damage; on a Critical Failure, the wielder suffers 2 damage.",
    automation: { boostDamage: 2 }
  },
  "fireproof": {
    supported: true,
    effect: "Adds this value as extra Armor against fire damage tags.",
    automation: { armorTag: "fire" }
  },
  fragile: {
    supported: true,
    effect: "For armor, a Boost against the wearer can break it. For weapons, damage is reduced by 1.",
    automation: { fragile: true }
  },
  heavy: {
    supported: true,
    effect: "For armor, increases Armor by +2 and raises armor penalties by 1. For weapons, targets take -1 to Block or Parry.",
    automation: { armorIncrease: 2, armorPenalty: 1, blockPenalty: 1 }
  },
  light: {
    supported: true,
    effect: "Easy to move in; combat cards list it as a reminder for mobility-friendly rulings.",
    automation: { mobilityNote: true }
  },
  loud: {
    effect: "After use, applies a -2 Stealth penalty because the attack is obvious or noisy."
  },
  "master-crafted": {
    supported: true,
    effect: "Adds +1 to checks made with the weapon.",
    automation: { weaponCheckBonus: 1 }
  },
  messy: {
    effect: "After use, it is obvious this weapon was used."
  },
  magical: {
    effect: "Supernatural or mythic gear; may affect fictional permissions but has no automatic numeric modifier."
  },
  piercing: {
    supported: true,
    effect: "Ignores this quality value in Armor.",
    automation: { armorPiercing: true }
  },
  practical: {
    effect: "Well-suited to use; no direct combat modifier."
  },
  quick: {
    supported: true,
    effect: "Easy to bring to bear; combat cards list it as an initiative/fast-draw reminder.",
    automation: { initiativeBonus: 1 }
  },
  "radiation-proof": {
    supported: true,
    effect: "Adds this value as extra Armor against radiation damage tags.",
    automation: { armorTag: "radiation" }
  },
  ranged: {
    supported: true,
    effect: "Can attack at Far or Distant range, but suffers -1 at Close range.",
    automation: { range: true, closePenalty: 1 }
  },
  reach: {
    supported: true,
    effect: "Can attack targets at Near range.",
    automation: { rangeStep: 1 }
  },
  recoil: {
    effect: "Applies -1 to Defense rolls after attacking."
  },
  reload: {
    effect: "On a Critical Failure, the wielder runs out of ammunition and must use a Quick Action or Defense to reload."
  },
  resistant: {
    supported: true,
    effect: "Reliable protection; combat cards list the resistance reminder and armor remains included while equipped.",
    automation: { armorReliability: true }
  },
  restraining: {
    supported: true,
    effect: "On a Boost, the attacker may initiate a Grab automatically.",
    automation: { conditionPrompt: "Grab" }
  },
  sharp: {
    supported: true,
    effect: "May inflict Bleeding 1 on a Boost.",
    automation: { conditionPrompt: "Bleeding 1" }
  },
  shield: {
    supported: true,
    effect: "Adds +2 to Block or Parry attempts and raises armor penalties by 1.",
    automation: { defenseBonus: 2, armorPenalty: 1 }
  },
  skilled: {
    supported: true,
    effect: "Adds this quality value to one listed Skill while wielded.",
    automation: { selectedSkillBonus: true }
  },
  slow: {
    effect: "Applies -2 Initiative while wielded."
  },
  subtle: {
    effect: "Does not look like armor or a weapon; no combat modifier."
  },
  unbreakable: {
    supported: true,
    effect: "Cannot be broken or disarmed.",
    automation: { unbreakable: true }
  },
  unpredictable: {
    supported: true,
    effect: "Targets suffer -1 to Dodge against this weapon.",
    automation: { dodgePenalty: 1 }
  },
  unwieldy: {
    effect: "Attacks with this weapon suffer a -1 penalty."
  },
  weak: {
    supported: true,
    effect: "Weak protection; combat cards list this as a warning when armor is applied.",
    automation: { armorWarning: true }
  }
};

const CONDITION_RULE_METADATA = {
  Bleeding: conditionRule("physical", "health", "scene-or-treated", "Stop the bleeding with care, healing, or enough rest.", "Ongoing harm; use severity as the bleeding level.", { target: "health", mode: "ongoing-damage", amount: "severity" }),
  "Burned/Frozen": conditionRule("physical", "health", "scene-or-treated", "Recover with appropriate treatment, shelter, healing, or rest.", "Temperature harm; severity indicates how serious the exposure is.", { target: "physical-rolls", mode: "situational-penalty", amount: "severity" }),
  Deprived: conditionRule("physical", "health", "until-need-met", "Meet the missing need, rest, food, safety, care, or other fiction-specific requirement.", "Lack or deprivation; severity measures pressure from the unmet need.", { target: "physical-rolls", mode: "situational-penalty", amount: "severity" }),
  Impaired: conditionRule("physical", "fictional", "until-impairment-fixed", "Restore the impaired sense, limb, tool, or capability through treatment or fiction.", "Tracks a compromised capability; define the specific impairment in notes.", { target: "affected-capability", mode: "situational-penalty", amount: "severity" }),
  Injured: conditionRule("physical", "health", "until-healed", "Heal naturally, receive care, or use a suitable power or item.", "Lasting bodily injury; severity is the injury level.", { target: "physical-rolls", mode: "situational-penalty", amount: "severity" }),
  Sickened: conditionRule("physical", "health", "until-cured", "Remove the illness, poison, or cause, then recover with care or rest.", "Illness or poison; severity measures how hard it is to act through it.", { target: "physical-rolls", mode: "situational-penalty", amount: "severity" }),
  Unconscious: conditionRule("physical", "health", "until-revived", "Wake through recovery, aid, healing, or when the fictional cause ends.", "Unable to act while present; severity can record how hard revival is.", { target: "actions", mode: "blocks-action", amount: "all" }),

  Afraid: conditionRule("mental", "psyche", "scene-or-resolved", "Face, escape, or resolve the fear; GM may reduce after safety or reassurance.", "Fear pressure; severity indicates how strongly choices are constrained.", { target: "fear-related-rolls", mode: "situational-penalty", amount: "severity" }),
  Confused: conditionRule("mental", "psyche", "scene-or-clarified", "Remove confusion through explanation, orientation, rest, or suitable magic.", "Muddled perception or uncertainty; severity affects clear action.", { target: "clarity-rolls", mode: "situational-penalty", amount: "severity" }),
  Convinced: conditionRule("mental", "psyche", "until-belief-breaks", "Break the persuasion with proof, contradiction, recovery, or a successful resistance.", "Tracks persuasion or belief; severity is how strongly it has taken hold.", { target: "opposed-social-rolls", mode: "situational-penalty", amount: "severity" }),
  Dazed: conditionRule("mental", "psyche", "scene-or-recovered", "Recover after a moment, aid, rest, or the stunning source ending.", "Shock or disorientation; severity affects response and judgment.", { target: "initiative-or-reaction", mode: "situational-penalty", amount: "severity" }),
  Embarrassed: conditionRule("mental", "psyche", "scene-or-social-repair", "Recover by leaving the pressure, receiving reassurance, or repairing the social harm.", "Shame or social pressure; severity affects confident action.", { target: "social-rolls", mode: "situational-penalty", amount: "severity" }),
  Hopeless: conditionRule("mental", "psyche", "scene-or-renewed-hope", "Restore hope through support, victory, rest, or a meaningful change in stakes.", "Despair; severity affects sustained effort.", { target: "persistence-rolls", mode: "situational-penalty", amount: "severity" }),
  Overwhelmed: conditionRule("mental", "psyche", "scene-or-pressure-reduced", "Reduce stimulus, receive help, rest, or remove the source of pressure.", "Too much pressure or stimulus; severity affects clean action.", { target: "focus-rolls", mode: "situational-penalty", amount: "severity" }),

  Broken: conditionRule("crossover", "both", "until-repaired", "Recover through significant care, healing, story resolution, or the relevant recovery workflow.", "Severe compromise; define whether the break is physical, mental, social, or divine.", { target: "broad-actions", mode: "situational-penalty", amount: "severity" }),
  Drunk: conditionRule("crossover", "both", "until-sober", "Recover with time, care, magic, or removing the intoxication source.", "Intoxication; severity affects control, judgment, and action.", { target: "coordination-or-judgment", mode: "situational-penalty", amount: "severity" }),
  "Ignored Limits": conditionRule("crossover", "both", "until-consequence-paid", "Resolve the fallout from pushing past a limit; GM decides recovery from the fiction.", "Tracks overextension after ignoring safe limits.", { target: "overextended-actions", mode: "situational-penalty", amount: "severity" }),
  "On the Altar": conditionRule("crossover", "fictional", "ritual-state", "Ends when the ritual exposure, sacrifice, or vulnerability is interrupted or resolved.", "Ritual vulnerability; severity measures exposure or danger.", { target: "ritual-defense", mode: "fictional-vulnerability", amount: "severity" }),
  Pain: conditionRule("crossover", "both", "scene-or-treated", "Treat the pain, heal the injury, rest, or remove the source.", "Distracting pain; severity affects focus and physical control.", { target: "physical-or-focus-rolls", mode: "situational-penalty", amount: "severity" }),
  Scarred: conditionRule("crossover", "both", "long-term", "Usually requires downtime, significant healing, or story resolution.", "Lingering mark, wound, or trauma; severity records lasting weight.", { target: "scar-related-rolls", mode: "fictional-or-situational", amount: "severity" })
};

const CHAPTER_FOUR_RULE_DEFINITIONS = [
  chapterFourRuleDefinition("Blessings", 175, "Blessings are positive character traits, mortal advantages, or divine gifts. Most are passive or triggered edges, and some interact with Skills, damage, Attachments, or the Pantheon Pool.", "blessing-reference", { target: "character creation and triggered advantages" }),
  chapterFourRuleDefinition("Curses", 176, "Curses are player-facing trouble hooks that make a Scene worse, usually by creating conflict, damage, loss, Strain, tension, or a special Theology drawback.", "curse-reference", { target: "scene complication and Pantheon Pool gain" }),
  chapterFourRuleDefinition("Skill-Combo Checks", 176, "Skill checks combine two Skills, roll a number of d10s equal to their total levels, and compare successes against Difficulty or opposition.", "skill-combo-roll", { roll: { type: "skill-combo", difficulty: 1 } }),
  chapterFourRuleDefinition("Rolling Dice", 183, "Each d10 result of 7-9 is one success and each 10 is two successes. A roll with no successes and at least one 1 is a Critical Failure.", "dice-reference", { roll: { successFaces: [7, 8, 9], doubleSuccessFace: 10, criticalFailure: "no-successes-and-one" } }),
  chapterFourRuleDefinition("Difficulties and Modifiers", 183, "Difficulty ranges from Easy 0 through Legendary 5. Bonuses add dice, penalties remove dice, and the player may suggest a different Skill Combo if the method changes.", "difficulty-reference", { roll: { difficulties: { easy: 0, simple: 1, moderate: 2, tough: 3, challenging: 4, legendary: 5 } } }),
  chapterFourRuleDefinition("Fate Die", 183, "When a final pool is 0 or lower, roll one Fate Die. Only a 10 succeeds, and it still counts as two successes; a 1 can still create a Critical Failure.", "fate-die", { roll: { fateDie: true, successFace: 10, successesOnSuccess: 2 } }),
  chapterFourRuleDefinition("Opposed Checks", 183, "Opposed Checks compare two active rolls. The acting character must exceed the defender or opposition; ties favor the defender by default.", "opposed-check", { roll: { type: "opposed", tie: "defender" } }),
  chapterFourRuleDefinition("Extended Checks", 184, "Extended Checks track a larger goal across multiple rolls, usually needing at least five total successes. A Critical Failure ends the attempt with the worst-case stakes.", "extended-check", { roll: { type: "extended", minimumTarget: 5 } }),
  chapterFourRuleDefinition("Rounding", 184, "When a value must be divided or rounded, round to a whole number and round up unless another rule says otherwise.", "rounding-reference"),
  chapterFourRuleDefinition("Support", 184, "Support lets multiple characters divide a task across distinct Skills. Extra helpers beyond the initial support can join by sacrificing Pantheon Dice and contributing a unique Skill.", "support-reference", { roll: { modifier: "support", pantheonCost: 1 } }),
  chapterFourRuleDefinition("Boosts", 184, "For every three successes above Difficulty, the player earns one immediate Boost that can improve the result, add damage, help Bonds, add Pantheon Dice, save time, or create other table-approved benefits.", "boost-reference", { roll: { boostThreshold: 3 } }),
  chapterFourRuleDefinition("Critical Failure", 185, "A Critical Failure occurs when a roll has no successes and at least one 1. Each consequence can add a Pantheon Die and may create harm, Conditions, Strain, time loss, or enemy openings.", "critical-failure-reference", { roll: { criticalFailure: true, pantheonDicePerConsequence: 1 } }),
  chapterFourRuleDefinition("Specialties", 185, "A Specialty is focused expertise inside a Skill. When it applies, it grants +1 die, and each Skill can have up to two Specialties.", "specialty-reference", { roll: { specialtyBonus: 1, specialtyLimit: 2 } }),
  chapterFourRuleDefinition("Tools and High-Quality Tools", 186, "Tools grant situational bonuses from +1 to +3. High-quality purchases can add up to +3 more, costing 1 Wealth per additional bonus.", "tool-reference", { cost: { wealth: 1 }, roll: { toolBonusMin: 1, toolBonusMax: 3, highQualityMax: 3 } }),
  chapterFourRuleDefinition("Repetitive Skill Usage", 186, "The third repeated use of the same Skill Combo or obvious pattern applies a cumulative -1 penalty until the character changes approach. Extended Checks ignore this penalty.", "repetition-reference", { roll: { thirdUsePenalty: -1, excludes: "extended-checks" } }),
  chapterFourRuleDefinition("Pantheon Pool", 187, "The Pantheon Pool is a shared pool capped at 10 dice by default. It starts each session with one die per player and changes through Blessings, Boosts, Curses, Critical Failures, excess Manifestation successes, and group-approved spends.", "pantheon-pool-reference", { target: "shared pantheon dice", resourceChange: { resource: "pantheon", amount: 1 } }),
  chapterFourRuleDefinition("Strength and Encumbrance", 188, "Strength covers lifting, carrying, pushing, and breaking. Encumbrance is derived from Strength, and exceeding limits can create Ignored Limits or escalating Strength checks.", "strength-reference", { roll: { type: "strength", skillCombo: ["athletics", "might"] } }),
  chapterFourRuleDefinition("Free Time", 190, "Free Time is the character's countdown resource for scenes, travel, duties, and taking extra care. Spending 1 Free Time can buy extra travel or a +2 bonus when time helps.", "free-time-reference", { cost: { freeTime: 1 }, roll: { takingTimeBonus: 2 } }),
  chapterFourRuleDefinition("Wealth", 191, "Wealth is abstract spending power for goods, travel, favors, delays, bribes, and lifestyle leverage. Costs usually range from 1 to 6.", "wealth-reference", { cost: { wealth: 1 } }),
  chapterFourRuleDefinition("Going to Work", 192, "Going to Work removes the god from the next Scene or moves them into a work Scene, restores full occupation Wealth, and restores half occupation Free Time rounded down.", "going-to-work", { resourceChange: { resource: "freeTimeAndWealth", mode: "work" } }),
  chapterFourRuleDefinition("Interacting with Attachments", 193, "When Free Time runs out, an Attachment enters the next Scene. Devoted Scenes, Split Attention, Delay Tactics, and Ignore choices trade Free Time recovery, Strain, Wealth, and story pressure.", "attachment-interaction", { target: "bonds, worshippers, and vassals" }),
  chapterFourRuleDefinition("Interacting with Territory", 195, "Territory grants Manifestation advantages around points of interest and controls grid movement. Characters move four squares between Scenes for free and can extend travel with Free Time or Wealth.", "territory-interaction", { target: "territory grid and manifestation positioning" })
];

const CRITICAL_FAILURE_EFFECT_DEFINITIONS = [
  criticalFailureEffectDefinition("Critical Failure: Harm", 176, "The failed action causes direct physical or mental harm; use damage workflow or an appropriate Condition if the harm lingers.", { resource: "health-or-psyche", amount: 1 }),
  criticalFailureEffectDefinition("Critical Failure: New Condition", 176, "Apply a new Level 1 Condition or increase a fitting existing Condition by 1.", { conditionLevel: 1 }),
  criticalFailureEffectDefinition("Critical Failure: Skill Penalty", 176, "The failed Skill suffers a -1 situational penalty for the rest of the Scene.", { penalty: -1, duration: "scene" }),
  criticalFailureEffectDefinition("Critical Failure: Skill Locked", 176, "The failed Skill becomes unavailable for the rest of the Scene unless the GM offers a recovery path.", { blocksSkill: true, duration: "scene" }),
  criticalFailureEffectDefinition("Critical Failure: Lost Materials", 177, "Supplies, money, or bought materials for the attempt are consumed and must be replaced before retrying.", { resource: "wealth-or-materials" }),
  criticalFailureEffectDefinition("Critical Failure: Fragile Item", 177, "An item used in the failed action gains the Fragile quality and is at risk of breaking on another bad turn.", { itemQuality: "fragile" }),
  criticalFailureEffectDefinition("Critical Failure: False Read", 177, "The character misreads an emotion, fact, or evaluation and does not immediately know the interpretation is wrong.", { information: "false-read" }),
  criticalFailureEffectDefinition("Critical Failure: Attachment Strain", 177, "One of the god's Attachments suffers 1 Strain from the fallout.", { resource: "attachment-strain", amount: 1 }),
  criticalFailureEffectDefinition("Critical Failure: Lost Free Time", 177, "The failed task becomes a time sink and costs the character 1 Free Time.", { resource: "freeTime", amount: -1 }),
  criticalFailureEffectDefinition("Critical Failure: Enemy Opening", 177, "An enemy gains an immediate opening, such as an instant attack or equivalent pressure.", { enemyOpening: true }),
  criticalFailureEffectDefinition("Critical Failure: Unique Consequence", 177, "The GM creates a fitting non-mechanical or story-specific consequence tied to the player's stated worry.", { custom: true })
];

const CHAPTER_FIVE_RULE_DEFINITIONS = [
  chapterFiveRuleDefinition("Divine Battles", 197, "Divine Battles cover physical Battles of Fists and mental or social Battles of Wits. Both use the same action economy but usually threaten different resource tracks.", "battle-reference"),
  chapterFiveRuleDefinition("Battle Timing", 198, "Chapter 5 frames time as days, Scenes, Battles, Turns, and Rounds. A Battle begins with Initiative and ends when one side retreats, forfeits, or is defeated.", "battle-timing"),
  chapterFiveRuleDefinition("Determining Initiative", 198, "Initiative is normally 1d10 plus Intuition and Speed, rerolled each Round unless the table chooses a fixed order.", "initiative", { roll: { type: "initiative", formula: "1d10 + initiative" } }),
  chapterFiveRuleDefinition("Alternative Initiative", 198, "The GM may swap the Initiative Skill basis when the scene demands it, such as chases, unusual terrain, or social-only conflicts.", "initiative-alternative"),
  chapterFiveRuleDefinition("Turn Sequence", 199, "Each Turn moves through choosing Actions, choosing Defenses, then rolling and resolving effects. Ties favor the defender.", "turn-sequence"),
  chapterFiveRuleDefinition("Actions and Defenses", 199, "Each Round usually grants one Standard Action, one Quick Action, one Standard Defense, and one Quick Defense. Standard slots can cover Quick tasks with a +2 bonus.", "action-economy"),
  chapterFiveRuleDefinition("Taking Damage", 204, "Physical harm usually reduces Health and mental or social harm usually reduces Psyche, though either damage type can appear in either Battle mode.", "damage-reference", { roll: { damageTracks: ["health", "psyche"] } }),
  chapterFiveRuleDefinition("Anatomy of Damage", 205, "Damage can come from success margin, flat damage, Manifestation Damage Measures, weapon damage, and Boost damage, then armor may reduce physical damage.", "damage-anatomy", { roll: { components: ["margin", "flat", "measure", "weapon", "boost", "armor"] } }),
  chapterFiveRuleDefinition("Conditions in Battle", 205, "Incoming damage can become Condition levels within table limits, and battle Conditions carry severity, recovery, and roll metadata.", "battle-conditions", { roll: { conditionLimit: 4, conditionLevelLimit: 10 } }),
  chapterFiveRuleDefinition("Healing", 207, "Healing can come from powers, care, rest, medical treatment, or recovery periods, and can reduce damage or Conditions depending on the method.", "healing-reference"),
  chapterFiveRuleDefinition("Natural Healing", 207, "Natural healing between major Scenes or days recovers limited Health or Psyche based on Fortitude or Discipline, with the table choosing the appropriate track.", "natural-healing", { roll: { healing: "natural" } }),
  chapterFiveRuleDefinition("Medical Treatment", 208, "Medical treatment uses Medicine plus a fitting Secondary Skill, with limits based on Medicine, tools, trauma level, and whether the healer treats themself.", "medical-treatment", { roll: { type: "healing", primary: "medicine" } }),
  chapterFiveRuleDefinition("Armor", 209, "Armor reduces physical damage, carries penalties and qualities, usually ranges from 1 to 4, and can stack with divine armor from abilities.", "armor-reference"),
  chapterFiveRuleDefinition("Weapons", 210, "Weapons usually add damage and qualities to Battle of Fists attacks. Firearms have their own default quality assumptions and costs.", "weapon-reference"),
  chapterFiveRuleDefinition("Range", 212, "Battle range covers Grappling, Point Blank, Close, Near, Far, and Distant positioning, with weapon qualities and penalties changing what attacks are viable.", "range-reference"),
  chapterFiveRuleDefinition("Battle Examples", 212, "The Chapter 5 examples demonstrate Initiative, Quick and Standard Actions, Defenses, damage, armor, Manifestations, and Battle of Wits exchanges.", "battle-example-reference")
];

const BATTLE_ACTION_DEFINITIONS = [
  battleActionDefinition("fists", "quick-action", "Feint", 200, [["fighting", "deception"]], "Throw the opponent off balance. Success creates a +2 bonus to the next attack; failure helps the target defend."),
  battleActionDefinition("fists", "quick-action", "Move", 200, [], "Move up to the character's Movement as a Quick Action."),
  battleActionDefinition("fists", "quick-action", "Prepare", 200, [], "Reload, draw a weapon, stand up, or otherwise set up the next Battle step."),
  battleActionDefinition("fists", "quick-action", "Pulling Punches", 200, [["fighting", "medicine"]], "Reduce the damage dealt by the next Standard Action to send a message without full harm."),
  battleActionDefinition("fists", "quick-action", "Resist Condition", 200, [["varies", "varies"]], "Use the Quick Action to resist a Condition whose recovery or resistance calls for a check."),
  battleActionDefinition("fists", "quick-action", "Touch", 200, [["fighting", "speed"]], "Touch a target without making an attack, often to deliver another effect such as a Manifestation.", { bonus: 1, range: "Grappling or Close" }),

  battleActionDefinition("fists", "standard-action", "Ambush", 200, [["stealth", "varies"]], "Attack from hiding, using a Secondary Skill that fits the weapon or method."),
  battleActionDefinition("fists", "standard-action", "Close Combat Attack", 200, [["fighting", "speed"]], "Attack unarmed or with a melee weapon."),
  battleActionDefinition("fists", "standard-action", "Disarm", 200, [["fighting", "perception"]], "Knock away or strip a target's wielded weapon and its benefits."),
  battleActionDefinition("fists", "standard-action", "Grab or Break Grab", 200, [["might", "speed"]], "Start or escape a grapple. Grabbed targets take physical penalties, and combatants in the grab are easier for each other to attack."),
  battleActionDefinition("fists", "standard-action", "Protect", 201, [["fighting", "fortitude"]], "Step in front of an attack meant for someone else, taking the hit while reducing damage by the Protect result.", { usesDefense: true }),
  battleActionDefinition("fists", "standard-action", "Ranged Attack", 201, [["marksman", "perception"]], "Shoot or fire a ranged weapon at a target using range and weapon quality rules."),
  battleActionDefinition("fists", "standard-action", "Sprint", 201, [], "Move at triple Movement. It can create a first-attack or retreat bonus, but disengaging from close combat costs Health."),
  battleActionDefinition("fists", "standard-action", "Tackle", 201, [["might", "speed"]], "Bring the target down and deal normal damage, with the attacker taking half unless a Boost changes the result."),
  battleActionDefinition("fists", "standard-action", "Throwing Attack", 201, [["marksman", "athletics"]], "Throw a weapon at a target using Range rules."),
  battleActionDefinition("fists", "standard-action", "Divine Powers", 201, [["varies", "varies"]], "Use a Manifestation, Truth, or other divine ability that fits a Battle of Fists."),

  battleActionDefinition("fists", "quick-defense", "Brace", 201, [], "Brace to improve Protect damage reduction or punish a Sprinting attacker if the defense exceeds the attack."),
  battleActionDefinition("fists", "quick-defense", "Catch", 201, [["athletics", "speed"]], "Catch a falling target or incoming object; sharp targets can impose a penalty."),
  battleActionDefinition("fists", "quick-defense", "Prepare", 201, [], "Draw, ready, pick up, or otherwise prepare a defensive tool or position."),
  battleActionDefinition("fists", "standard-defense", "Block", 202, [["fighting", "speed"]], "Block an incoming attack with body, weapon, or shield. Blocking a weapon unarmed is harder."),
  battleActionDefinition("fists", "standard-defense", "Dodge", 202, [["athletics", "speed"]], "Move out of the way of a close or physical attack."),
  battleActionDefinition("fists", "standard-defense", "Run for Cover", 202, [["intuition", "speed"]], "Find and reach cover; the cover may absorb or reduce the attack if it makes sense."),
  battleActionDefinition("fists", "standard-defense", "Divine Powers", 202, [["varies", "varies"]], "Use a suitable defensive Manifestation or divine ability, such as Aegis or Soul."),

  battleActionDefinition("wits", "quick-action", "Mislead", 202, [["influence", "deception"]], "Twist words to distract the target. Success penalizes their next defense against the character's mental attack; failure can backfire."),
  battleActionDefinition("wits", "quick-action", "Present Evidence", 202, [], "Reveal evidence as a mental weapon for a limited number of turns."),
  battleActionDefinition("wits", "quick-action", "Read the Room", 202, [["empathy", "survival"]], "Assess dispositions and openings. Success helps a later Escalate or Frighten check; failure costs Initiative."),
  battleActionDefinition("wits", "quick-action", "Resist Condition", 202, [["varies", "varies"]], "Use the Quick Action to resist a mental or social Condition."),
  battleActionDefinition("wits", "quick-action", "Shout Out", 202, [], "Give an order, warning, or suggestion to an ally without fully withdrawing from the exchange."),
  battleActionDefinition("wits", "quick-action", "Taunt", 202, [["deception", "discipline"]], "Insult or provoke the target to set up Fast Talk; failure can grant the target Initiative and escalate the scene."),

  battleActionDefinition("wits", "standard-action", "Compose", 202, [["discipline", "empathy"]], "Steady the mind and ignore incoming mental damage from the next attack. Uses both Standard Action and Standard Defense.", { usesDefense: true }),
  battleActionDefinition("wits", "standard-action", "Encourage", 202, [["intuition", "perception"]], "Help an ally ignore part of a Condition for the moment."),
  battleActionDefinition("wits", "standard-action", "Escalate", 203, [["intuition", "empathy"]], "Push a situation or existing Condition over the edge."),
  battleActionDefinition("wits", "standard-action", "Fast Talk", 203, [["varies", "speed"]], "Talk around, over-explain, or redirect an issue with a Skill that fits the tactic."),
  battleActionDefinition("wits", "standard-action", "Frighten", 203, [["influence", "discipline"]], "Intimidate the target and potentially cause damage or Afraid."),
  battleActionDefinition("wits", "standard-action", "Provoke", 203, [["influence", "empathy"]], "Push the target into doing something. Failure can deal mental damage to the actor."),
  battleActionDefinition("wits", "standard-action", "Retreat", 203, [["deception", "perform"]], "Leave the Battle of Wits gracefully; failure causes mental fallout and Embarrassed."),
  battleActionDefinition("wits", "standard-action", "Take Something", 203, [["deception", "empathy"]], "Steal trust, confidence, momentum, or emotional footing; Hopeless is a common rider."),
  battleActionDefinition("wits", "standard-action", "Uncomfortable Silence", 203, [["discipline", "empathy"]], "Make the exchange awkward and assign Initiative penalties with successes."),
  battleActionDefinition("wits", "standard-action", "Divine Powers", 203, [["varies", "varies"]], "Use a Manifestation, Truth, or other divine ability that fits a Battle of Wits."),

  battleActionDefinition("wits", "quick-defense", "Big Reveal", 203, [["influence", "deception"]], "Reveal evidence or a secret to throw off Fast Talk or Take Something; extra defense can become damage."),
  battleActionDefinition("wits", "quick-defense", "Give the Signal", 203, [["deception", "stealth"]], "Send a hidden message or cue; can improve Composure's damage reduction if used together."),
  battleActionDefinition("wits", "quick-defense", "Um Actually", 203, [], "Use superior information to set up the next Defense check with a Knowledge-based bonus."),
  battleActionDefinition("wits", "standard-defense", "Laugh It Off", 203, [["discipline", "deception"]], "Laugh off a volatile or cutting attack as if it cannot touch the defender."),
  battleActionDefinition("wits", "standard-defense", "Stand My Ground", 203, [["empathy", "discipline"]], "Meet the attack's intensity and hold firm."),
  battleActionDefinition("wits", "standard-defense", "Turn It Around", 203, [["varies", "intuition"]], "Find a way to reverse the attack. Success can improve later damage or next-round Initiative."),
  battleActionDefinition("wits", "standard-defense", "Divine Powers", 203, [["varies", "varies"]], "Use a defensive Manifestation or divine ability that fits the social or mental exchange.")
];

const MANIFESTATION_POWER_DEFINITIONS = [
  manifestationPowerDefinition("Aegis", "aegis", 148, "Protection, wards, cleansing, and warning effects.", ["Protection Field", "Purge", "Warning"], "Use Aegis when the god shields a person or place, cleanses harmful divine influence, or senses danger before it lands."),
  manifestationPowerDefinition("Beckon", "beckon", 149, "Summoning, multiplication, and banishment.", ["Banish", "Multiply", "Summon"], "Use Beckon when the god calls something tied to their Dominion, multiplies it, or sends it away from the scene."),
  manifestationPowerDefinition("Journey", "journey", 152, "Movement, teleportation, and phasing.", ["Blink", "Phasing", "Swift"], "Use Journey when the god moves with impossible speed, passes through barriers, or crosses distance through divine force."),
  manifestationPowerDefinition("Minion", "minion", 153, "Empowering followers, enchantments, and creating servants.", ["Bestow", "Enchant", "Instill Life"], "Use Minion when the god empowers another being, enchants a subject, or gives life and purpose to a servant of their Dominion."),
  manifestationPowerDefinition("Oracle", "oracle", 155, "Divination, perception, and foresight.", ["Area Sense", "Read Minds", "Temporal View"], "Use Oracle when the god reads hidden information, searches through divine senses, or looks across time."),
  manifestationPowerDefinition("Puppetry", "puppetry", 158, "Control, manipulation, and possession.", ["Manipulation", "Marionette", "Transfer"], "Use Puppetry when the god seizes control, guides another body or object, or transfers influence through their Dominion."),
  manifestationPowerDefinition("Ruin", "ruin", 160, "Destruction, curses, and divine warfare.", ["Blast", "Geas", "Warrior"], "Use Ruin when the god harms, breaks, curses, or turns divine power directly into battle force."),
  manifestationPowerDefinition("Shaping", "shaping", 162, "Transformation and environmental alteration.", ["Ambience", "Transmutation", "Vessel"], "Use Shaping when the god transforms a target, alters the environment, or makes a vessel for their Dominion."),
  manifestationPowerDefinition("Soul", "soul", 163, "Spirits, memories, and identity.", ["Call Spirit", "Figments", "Redefine"], "Use Soul when the god touches spirits, memories, identity, or the meaning of a being.")
];

const MANIFESTATION_APPLICATION_DEFINITIONS = [
  manifestationApplicationDefinition("aegis", "Protection Field", 147, ["empathy"], ["damage", "duration", "modifier"], "Creates protection around a target, place, or relationship tied to the god's Dominion. Successes can become armor-like protection, defensive difficulty, duration, or backlash against attackers."),
  manifestationApplicationDefinition("aegis", "Purge", 148, ["medicine"], ["damage", "duration", "targets"], "Removes an unwanted substance, condition, influence, damage source, or impurity when that removal fits the god's Dominion and the scene's stakes."),
  manifestationApplicationDefinition("aegis", "Warning", 149, ["intuition"], ["duration", "targets", "trigger"], "Places a Dominion-shaped warning on a target or situation so danger, intrusion, or a defined trigger alerts the god or protected subject."),

  manifestationApplicationDefinition("beckon", "Banish", 150, ["influence"], ["area", "targets", "duration", "trigger"], "Pushes away a Dominion-linked person, object, creature, element, or concept from a defined center for as long as the effect holds."),
  manifestationApplicationDefinition("beckon", "Multiply", 150, ["crafts"], ["duration", "magnitude", "targets"], "Duplicates something already present in the scene and tied to the Dominion, scaling the amount, targets, or duration with spent Measures."),
  manifestationApplicationDefinition("beckon", "Summon", 151, ["knowledge"], ["duration", "targets"], "Draws a Dominion-linked person, object, creature, element, or concept toward a center or target, with duration defining how long it remains available."),

  manifestationApplicationDefinition("journey", "Blink", 152, ["speed"], ["area", "range", "targets"], "Moves the user or another target instantly through a Dominion connection, using range and target Measures to define the jump."),
  manifestationApplicationDefinition("journey", "Phasing", 152, ["travel"], ["targets", "magnitude", "duration"], "Moves a target through people, objects, walls, or other physical obstacles when the path or obstacle fits the Dominion."),
  manifestationApplicationDefinition("journey", "Swift", 153, ["athletics", "crafts"], ["targets", "modifier", "duration"], "Improves movement, speed, travel, pursuit, or escape through the Dominion, often as a bonus to movement or movement-related checks."),

  manifestationApplicationDefinition("minion", "Bestow", 153, ["empathy"], ["duration", "modifier", "targets"], "Gifts a living target with an aspect of the Dominion as a temporary blessing, burden, permission, or situational modifier."),
  manifestationApplicationDefinition("minion", "Enchant", 154, ["deception"], ["damage", "duration", "targets"], "Overrides impulse, emotion, or behavior in line with the Dominion; damage can represent self-harm or psychic conflict from acting against nature."),
  manifestationApplicationDefinition("minion", "Instill Life", 154, ["medicine"], ["duration", "magnitude", "range"], "Gives life, agency, or intelligent animation to a Dominion subject, with Magnitude carrying much of the effect's scope."),

  manifestationApplicationDefinition("oracle", "Area Sense", 155, ["intuition"], ["area", "modifier", "trigger"], "Senses, tracks, or notices the Dominion across an area, including scene conditions, traces, or triggers the god defines."),
  manifestationApplicationDefinition("oracle", "Read Minds", 156, ["discipline"], ["duration", "magnitude", "range"], "Reads or locates Dominion-relevant information in a mind, memory, feeling, or thought pattern within the effect's range."),
  manifestationApplicationDefinition("oracle", "Temporal View", 157, ["perception"], ["duration", "magnitude", "targets"], "Views or experiences the Dominion through time, usually to inspect past or possible context tied to a person, place, object, or event."),

  manifestationApplicationDefinition("puppetry", "Manipulation", 158, ["fighting"], ["damage", "magnitude", "range", "targets"], "Moves, redirects, or controls Dominion-linked targets with force of will; damage covers impacts or dangerous movement."),
  manifestationApplicationDefinition("puppetry", "Marionette", 158, ["perform"], ["duration", "range", "modifier", "targets"], "Temporarily controls a target connected to the Dominion, with Measures setting how long, how far, and how precisely the control works."),
  manifestationApplicationDefinition("puppetry", "Transfer", 159, ["tech"], ["duration", "magnitude", "range", "targets"], "Moves an aspect, quality, condition, knowledge, sensation, or burden of the Dominion from one target to another."),

  manifestationApplicationDefinition("ruin", "Blast", 160, ["marksman"], ["damage", "range", "targets"], "Inflicts distance harm through the Dominion. At least one success should normally be spent on Range when the target is not in immediate reach."),
  manifestationApplicationDefinition("ruin", "Geas", 160, ["knowledge"], ["damage", "magnitude", "duration", "trigger"], "Places a Dominion-shaped curse, prohibition, or consequence on a target, with the punishment described through Damage or Magnitude."),
  manifestationApplicationDefinition("ruin", "Warrior", 161, ["might"], ["damage", "duration", "modifier"], "Turns the Dominion into battle readiness, personal force, or destructive prowess, usually improving damage or combat-facing checks."),

  manifestationApplicationDefinition("shaping", "Ambience", 162, ["survival"], ["area", "duration", "magnitude", "modifier"], "Floods the environment with the Dominion, changing scene atmosphere, hazards, comfort, or broad situational modifiers."),
  manifestationApplicationDefinition("shaping", "Transmutation", 162, ["crafts"], ["duration", "magnitude", "targets"], "Changes a target's form, material, condition, or presentation according to the Dominion and the scale of the invested Measures."),
  manifestationApplicationDefinition("shaping", "Vessel", 163, ["fortitude"], ["duration", "magnitude", "modifier"], "Changes the god's own body or presence to express the Dominion; it follows Transmutation logic but does not use Targets for other subjects."),

  manifestationApplicationDefinition("soul", "Call Spirit", 163, ["influence"], ["duration", "modifier", "range", "targets"], "Calls a spirit, ghost, incorporeal entity, or Dominion-relevant presence to the god or another defined point."),
  manifestationApplicationDefinition("soul", "Figments", 164, ["stealth"], ["area", "targets", "duration", "magnitude", "modifier"], "Creates sensory illusions or false impressions tied to the Dominion. It should not deal direct damage, but it can mislead, distract, or impose modifiers."),
  manifestationApplicationDefinition("soul", "Redefine", 164, ["discipline"], ["targets", "duration", "range"], "Changes a basic truth or meaning about the Dominion or a target associated with it, bounded by duration, range, and target scope.")
];

const RITUAL_POWER_DEFINITIONS = [
  ritualPowerDefinition("Admittance", "territory", 166, "Travel", "Puppetry", 1, { freeTime: 1, fragments: 1 }, "Dampens the god's Spark for one full day so entering another god's Territory does not challenge or disrupt it."),
  ritualPowerDefinition("Bolster", "territory", 167, "Fortitude", "Aegis", 1, { freeTime: 2, fragments: 1 }, "Protects a Territory for one full day, warns when anyone with a Spark enters, and raises Challenge ritual Difficulty by +2."),
  ritualPowerDefinition("Challenge", "territory", 167, "Might", "Ruin", 1, { freeTime: 2, fragments: 2 }, "Starts a formal Territory challenge for one week or until the Territory converts, is defended, or is ceded."),
  ritualPowerDefinition("Detection", "spark", 167, "Perception", "Minion", 1, { freeTime: 2, fragments: 1 }, "For one day, reveals whether a sensed Spark belongs to a god and what Dominion category that god holds."),
  ritualPowerDefinition("Dowsing", "spark", 167, "Perception", "Beckon", 1, { freeTime: 1, fragments: 1 }, "For one day, searches the god's Territory for Sparks no older than one month that still carry the Source's new-Spark trace."),
  ritualPowerDefinition("Temporary Convergence", "spark", 168, "Empathy", "Soul", 1, { freeTime: 1, fragments: 1 }, "Creates a temporary pantheon bond; each Free Time spent in preparation gives the convergence one day of duration."),
  ritualPowerDefinition("Binding", "otherworldly", 168, "Influence", "Minion", 1, { freeTime: 3, fragments: 1 }, "Binds an attuned Relic so future attunement attempts are harder and the god knows where the Relic is unless it is on another plane."),
  ritualPowerDefinition("Divination", "otherworldly", 168, "Intuition", "Oracle", 1, { freeTime: 1, fragments: 1 }, "Reads the immediate fate of a target within the god's Territory or tied to one of their Bonds, usually within the next day."),
  ritualPowerDefinition("Pocket Realm", "otherworldly", 168, "Crafts", "Shaping", 1, { freeTime: 10, fragments: 5 }, "Creates a small divine realm no larger than a single-family home, with a portal tied to the god's Territory."),
  ritualPowerDefinition("Portal", "otherworldly", 169, "Travel", "Journey", 1, { freeTime: 3, fragments: 1 }, "Opens a one-day portal to a specified location, the Ways, or a realm; extra investment can widen access or make realm portals permanent.")
];

const OTHERWORLD_STAGE_DEFINITIONS = [
  otherworldStageDefinition("Ways Stage: Portal", 171, "Knowledge", "Influence", "The planning and decision-making phase that starts the trek into the Ways.", "Success grants one reroll for another stage; failure raises the Difficulty of another stage by 1."),
  otherworldStageDefinition("Ways Stage: Path", 171, "Travel", "Intuition", "Navigation and staying on track through twisting routes.", "Success lowers the Realm check Difficulty by 1; failure raises it by 1."),
  otherworldStageDefinition("Ways Stage: Crossroads", 171, "Survival", "Travel", "Intervening realms, hazards, and discoveries between destinations.", "Success finds a useful item or ally; failure inflicts Injury 1 or costs important gear."),
  otherworldStageDefinition("Ways Stage: Outsiders", 171, "Stealth", "Perception", "Enemies, confrontations, and divine travelers encountered in the Ways.", "Success avoids or deflects the encounter; failure leads to a Battle."),
  otherworldStageDefinition("Ways Stage: Realm", 171, "Discipline", "Tech", "Arrival at the intended realm or an interesting intervening stop.", "Success reaches the realm; failure creates a GM-chosen complication or wrong destination.")
];

export const PTG_PREMADE_ITEMS = [
  ...BATTLE_ACTION_DEFINITIONS.map(battleActionPower),
  ...MANIFESTATION_POWER_DEFINITIONS.map(manifestationPower),
  ...MANIFESTATION_APPLICATION_DEFINITIONS.map(manifestationApplicationPower),
  ...RITUAL_POWER_DEFINITIONS.map(ritualPower),
  ...OTHERWORLD_STAGE_DEFINITIONS.map(otherworldStagePower),
  ...gearQualityItems(),
  ...occupationCareerItems(),
  ...specificDominionItems(),

  truth("Aquatic", 117, "is one with the sea.", "Breathe underwater and gain a bonus while acting in a body of water."),
  truth("Armored", 117, "is tougher than they appear.", "Choose a damage source. Gain scaling armor against that source."),
  truth("Aura of Influence", 117, "is truly stunning or terrifying to behold.", "Spend a Fragment to project awe or fear over mortals in the scene."),
  truth("Bane", 117, "is the bane of all...", "Gain bonuses against a chosen creature or foe type."),
  truth("Beast Form", 117, "can turn into a...", "Spend a Fragment to take a chosen animal form for a scene."),
  truth("Beast Tongue", 118, "can talk to animals.", "Speak with one chosen animal type, with Fragment use expanding this for a scene."),
  truth("Colossal Size", 118, "can become as big as a giant.", "Spend a Fragment to grow larger, gaining durability, strength, and damage."),
  truth("Divinely Skilled", 118, "never fails at...", "Choose a specialty that gains a bonus and treats failures as one success."),
  truth("Extra Appendages", 118, "has been gifted with additional...", "Spend a Fragment to grow extra arms, a head, or legs for scene benefits."),
  truth("First Move", 119, "is always a step ahead.", "Gain initiative and spend a Fragment to act before others for several rounds."),
  truth("Flight", 119, "can fly among the clouds.", "Spend a Fragment to fly at increased movement."),
  truth("Healing Hands", 119, "can heal with a touch.", "Use divine healing to restore Health, Psyche, or reduce Conditions."),
  truth("Immunity", 119, "can't be harmed by...", "Choose one effect the god is completely immune to."),
  truth("Lash", 119, "can harm you with a stare.", "Spend a Fragment to attack at sight range with divine force."),
  truth("Natural Weapons", 119, "is never unarmed.", "Manifest claws, horns, or similar weapons with the Brutal quality."),
  truth("Otherworldly Sight", 119, "cannot be fooled by illusions.", "Spend a Fragment to sense supernatural presence and pierce disguises or illusions."),
  truth("Regeneration", 120, "recovers quickly when scarred.", "Improve natural healing and spend a Fragment for immediate recovery."),
  truth("Soothing Aura", 120, "is a calming influence on others.", "Reduce aggression and initiative around the god."),
  truth("Telepathy", 120, "can speak with others with their mind.", "Communicate mentally with visible targets, or spend a Fragment for greater reach."),
  truth("Tongues", 120, "is not limited by language.", "Understand unfamiliar languages after exposure, or spend a Fragment to skip the delay."),
  truth("Unobscured Eyes", 120, "cannot be blinded.", "Ignore sight impairment from darkness, smoke, injury, and similar effects."),
  truth("Visions", 120, "is visited by prophecy in the night.", "Receive prophetic dreams that may require interpretation."),

  relic("Chalice of Attraction", 1, 111, "+2 Influence", "Produces divine wine that improves social presence for a day."),
  relic("Obscuring Cigar", 1, 111, "Impaired Sight 2", "Creates concealing smoke while sparing its owner from the sight penalty."),
  relic("Skeleton Key", 1, 111, "Unlocks mundane locks", "Opens doors, padlocks, and similar mechanical locks, but not modern electronic systems."),
  relic("Your Story", 1, 111, "Spend 1 Free Time", "A living book that records the owner's life and may reveal context they missed."),
  relic("Blessed Whetstone", 2, 112, "+2 weapon damage", "Sharpens a blade for the scene, with Fragment use extending the effect to allies."),
  relic("Fortune's Favor", 2, 112, "Boost on 2 successes", "A lucky coin that lowers the successes needed for a Boost on the next roll."),
  relic("Mirrored Shield", 2, 112, "+1 physical Defense", "Can reflect a resisted supernatural effect back at its source."),
  relic("Storm Bowl", 2, 112, "Weather control", "Uses blood and water to call rain, storms, or stronger disasters with Fragment use."),
  relic("Cloak of Invisibility", 3, 112, "Invisible for 1 Fragment", "Turns the owner invisible until combat or obvious disturbance breaks the effect."),
  relic("Mercury's Boots", 3, 113, "+5 Movement while flying", "Winged footwear that grants flight but can require control checks for stunts."),
  relic("Scarab of Eternity", 3, 113, "Death ward", "Is destroyed to spare the god from permanent loss when they die."),
  relic("Whispering Rings", 3, 113, "Telepathic bond", "A matched pair of rings that links two wearers emotionally and mentally."),
  relic("Ancient Timepiece", 4, 113, "+2 Free Time each Session", "Makes time for the owner and can rewind failed dice with Fragment use."),
  relic("Metalwood Bat", 4, 113, "+4 Might, +2 damage", "A mythic club that hits hard and can deafen nearby foes with Fragment use."),
  relic("Tempest Trident", 4, 113, "+2 Beckon, +3 damage", "A sea-linked weapon that senses and amplifies nearby water."),
  relic("Eternal Coffin", 5, 114, "Suspends age", "Preserves those inside and can consume a victim's soul at terrible cost."),
  relic("The Ill Wind", 5, 114, "+2 Marksman, +4 damage", "A divine sniper rifle that can grant a perfect-shot Truth for a scene."),
  relic("Maelstrom Armor", 5, 114, "Armor 2, fear aura", "Summoned armor that protects body and mind and terrifies enemies."),

  worshipper("Chosen One", 1, 122, "A singular favored worshipper who can act as a vessel for the god's power."),
  worshipper("Confidants", 1, 123, "Followers who comfort and heal the god through devoted attention."),
  worshipper("The Faithful", 1, 123, "Core believers whose prayers can restore temporary Fragments."),
  worshipper("Givers", 1, 123, "Supporters who provide temporary Wealth through offerings and sacrifice."),
  worshipper("Preachers", 1, 123, "Evangelists who reduce the cost of gaining more Worshippers."),
  worshipper("Temple Keepers", 1, 124, "Caretakers of sacred sites who empower Manifestation checks there."),
  worshipper("Zealots", 1, 124, "Fanatical followers willing to do dangerous or terrible work."),

  bond("Individual Bond", "individual", 106, "A person who connects the god to mortal life."),
  bond("Group Bond", "group", 107, "A social circle, crew, community, or organization tied to the god."),
  bond("Landmark Bond", "landmark", 107, "A meaningful place that anchors the god and may affect territory."),

  curse("Apathy", "Failing", 108, 0, "Emotional numbness penalizes emotional checks but makes the god harder to read."),
  curse("Blood Thirsty", "Failing", 108, 0, "Violent fixation harms Defense but improves attacks against a chosen target."),
  curse("Cowardice", "Failing", 108, 0, "Fear weakens resolve but helps the god flee danger."),
  curse("Envy", "Failing", 108, 0, "Coveting what others have weakens Attachments but helps taking from others."),
  curse("Guilt", "Failing", 108, 0, "Past mistakes cloud choices but deepen empathy with pain."),
  curse("Hatred", "Failing", 109, 0, "Rage disrupts calm action but fuels close combat damage."),
  curse("Hoarder", "Failing", 109, 0, "An obsession is hard to resist but can justify unsanctioned Pantheon Dice use."),
  curse("Power", "Failing", 109, 0, "Control obsession drains resources but eases acquisition of assets."),
  curse("Self-Destruction", "Failing", 109, 0, "Danger becomes seductive, worsening incoming harm but stiffening against fear."),
  curse("Vengeance", "Failing", 110, 0, "Retaliation becomes difficult to resist but helps when pursuing payback."),

  ...CRITICAL_FAILURE_EFFECT_DEFINITIONS.map(criticalFailureEffectCondition),

  condition("Bleeding", "physical", 1, 205, "Ongoing physical harm from blood loss or open wounds."),
  condition("Burned/Frozen", "physical", 1, 205, "Temperature injury that makes continued action harder."),
  condition("Deprived", "physical", 1, 205, "Lack of a needed resource, rest, or care creates physical pressure."),
  condition("Impaired", "physical", 1, 206, "A sense, limb, tool, or other physical capability is compromised."),
  condition("Injured", "physical", 1, 206, "Lasting bodily harm that should be tracked until treated or recovered."),
  condition("Sickened", "physical", 1, 206, "Illness, poison, nausea, or similar physical distress."),
  condition("Unconscious", "physical", 1, 206, "Unable to act until the character recovers or is revived."),

  condition("Afraid", "mental", 1, 206, "Fear constrains choices and can push the character away from danger."),
  condition("Confused", "mental", 1, 206, "Uncertainty or muddled perception makes clear action difficult."),
  condition("Convinced", "mental", 1, 206, "Persuasion, belief, or influence has taken hold."),
  condition("Dazed", "mental", 1, 206, "Shock or disorientation slows response and judgment."),
  condition("Embarrassed", "mental", 1, 206, "Social pressure or shame interferes with confident action."),
  condition("Hopeless", "mental", 1, 206, "Despair makes continued effort difficult to sustain."),
  condition("Overwhelmed", "mental", 1, 206, "Too much pressure or stimulus blocks clean action."),

  condition("Broken", "crossover", 1, 207, "A severe compromised state that can affect body, mind, or both."),
  condition("Drunk", "crossover", 1, 207, "Intoxication affects control, judgment, and action."),
  condition("Ignored Limits", "crossover", 1, 207, "The character has pushed beyond a safe boundary and must track the fallout."),
  condition("On the Altar", "crossover", 1, 207, "Ritual vulnerability or sacrificial exposure puts the character at risk."),
  condition("Pain", "crossover", 1, 207, "Distracting pain interferes with focus and physical control."),
  condition("Scarred", "crossover", 1, 207, "A lingering mark, wound, or trauma remains after the immediate harm passes."),

  vassal("Custom Vassal", 1, 121, "A mythological creature, Outsider, or supernatural ally bound to the god."),
  ...outsiderVassals(),

  ...choiceAttachmentItems(),
  ...choiceAbilityItems(),

  armor("Armored Jumpsuit", 2, 4, "Resistant, Light", 210),
  armor("Asbestos Suit", 0, 2, "Fireproof 2, Weak", 210),
  armor("Breastplate", 2, 4, "Practical, Resistant", 210),
  armor("Buckler", 1, 4, "Light, Practical, Shield, Fragile", 210),
  armor("Bulletproof Vest", 1, 4, "Bulletproof 1, Light", 210),
  armor("Coral Shield", 1, 5, "Aquatic, Magical, Shield, Bulky", 210),
  armor("Enchanted Leather Jacket", 2, 5, "Fragile, Light, Resistant, Subtle", 210),
  armor("Full Plate", 4, 5, "Cumbersome, Heavy, Resistant", 210),
  armor("Golden Plate", 4, 5, "Magical, Heavy", 210),
  armor("Hazmat Suit", 0, 2, "Radiation-proof 2, Weak", 210),
  armor("Hockey Pads", 3, 2, "Bargain, Heavy", 210),
  armor("Riot Shield", 3, 4, "Shield, Heavy", 210),
  armor("Scuba Gear", 1, 3, "Aquatic, Cold-proof 2, Weak", 210),
  armor("Tactical Gear", 2, 7, "Bulletproof 2, Light, Resistant, Expensive", 210),

  weapon("Derringer", 1, "Far", 5, "Concealable, Loud, Quick, Ranged", 211),
  weapon("Handgun", 1, "Far", 5, "Brutal 2, Loud, Ranged", 211),
  weapon("Knife", 1, "Close", 4, "Concealable, Sharp", 211),
  weapon("Police Baton", 1, "Close", 2, "Crushing, Defending", 211),
  weapon("Rapier", 1, "Close", 4, "Piercing, Defending", 211),
  weapon("Shotgun", 1, "Far", 4, "Brutal 2, Loud, Ranged, Reload", 212),
  weapon("Submachine Gun", 1, "Far", 9, "Autofire, Brutal 3, Loud, Ranged, Reload", 212),
  weapon("Sword", 1, "Close", 4, "Brutal, Sharp", 212),
  weapon("Whip", 1, "Near", 4, "Restraining, Reach, Sharp, Fragile", 212)
];

function truth(name, page, statement, effect) {
  const fragmentCost = effect.includes("Spend a Fragment") ? 1 : 0;
  const activation = effect.includes("Spend") ? "action" : "passive";
  const fullText = truthPlayerText(name, statement, effect, fragmentCost);

  return baseItem("truth", name, page, {
    summary: effect,
    statement,
    rank: 1,
    cost: 2,
    fragmentCost,
    activation,
    benefit: fullText,
    effect: fullText,
    description: fullText,
    sourcePage: page,
    notes: source(page),
    ...itemRules("truth", name, page, effect, {
      fullText,
      kind: fragmentCost ? "active" : "passive",
      trigger: fragmentCost ? "use" : "always",
      target: "self",
      cost: { fragments: fragmentCost },
      action: fragmentCost ? "spend-fragment" : ""
    })
  });
}

function relic(name, level, page, bonus, effect) {
  const fragmentCost = effect.includes("Fragment") ? 1 : 0;
  const fullText = relicPlayerText(name, level, bonus, effect, fragmentCost);

  return baseItem("relic", name, page, {
    summary: `${bonus}. ${effect}`,
    level,
    cost: level,
    bonus,
    fragmentCost,
    benefit: fullText,
    effect: fullText,
    description: fullText,
    relatedBonus: paragraph(`Core benefit: ${bonus}`),
    sourcePage: page,
    notes: source(page),
    ...itemRules("relic", name, page, `${bonus}. ${effect}`, {
      fullText,
      kind: fragmentCost ? "active" : "passive",
      trigger: fragmentCost ? "use" : "always",
      target: "self",
      cost: { fragments: fragmentCost },
      action: fragmentCost ? "spend-fragment" : ""
    })
  });
}

function worshipper(name, level, page, benefit) {
  const fullText = attachmentPlayerText("worshipper", name, benefit);

  return baseItem("worshipper", name, page, {
    summary: benefit,
    level,
    cost: level,
    strain: {
      value: 0,
      max: level
    },
    group: name,
    size: "",
    benefit: fullText,
    description: fullText,
    sourcePage: page,
    notes: source(page),
    ...itemRules("worshipper", name, page, benefit, {
      fullText,
      kind: "active",
      trigger: "favor",
      target: "self",
      action: "request-favor"
    })
  });
}

function bond(name, kind, page, description) {
  const fullText = bondPlayerText(name, kind, description);

  return baseItem("bond", name, page, {
    summary: description,
    kind,
    level: 1,
    strain: {
      value: 0,
      max: 1
    },
    description: fullText,
    sourcePage: page,
    notes: source(page),
    ...itemRules("bond", name, page, description, {
      fullText,
      kind: "active",
      trigger: "favor",
      target: "attachment",
      cost: { strain: 1 },
      action: "request-favor"
    })
  });
}

function curse(name, sourceName, page, pantheonDice, effect, { flags = {}, originalName = name } = {}) {
  const fullText = abilityPlayerText("curse", name, sourceName, effect, { pantheonDice });
  const itemFlags = flags.kind ? { ...flags, originalName } : flags;

  return baseItem("curse", name, page, {
    source: sourceName,
    trigger: "When this weakness, obligation, or flaw complicates the scene.",
    pantheonDice,
    effect: fullText,
    notes: source(page),
    ...itemRules("curse", name, page, effect, {
      fullText,
      kind: "triggered",
      trigger: "gm",
      target: "self",
      action: "gain-pantheon-dice",
      resourceChange: { resource: "pantheon", amount: pantheonDice },
      enabled: pantheonDice > 0
    })
  }, itemFlags);
}

function vassal(name, level, page, benefit) {
  const fullText = attachmentPlayerText("vassal", name, benefit);

  return baseItem("vassal", name, page, {
    summary: benefit,
    level,
    cost: level,
    strain: {
      value: 0,
      max: level
    },
    concept: "",
    loyalty: 0,
    benefit: fullText,
    description: fullText,
    sourcePage: page,
    notes: source(page),
    ...itemRules("vassal", name, page, benefit, {
      fullText,
      kind: "active",
      trigger: "favor",
      target: "ally",
      action: "request-favor"
    })
  });
}

function outsiderVassals() {
  return PTG_PREMADE_ACTORS
    .filter(actor => actor.flags?.["part-time-gods"]?.category === "Outsiders")
    .map(actor => outsiderVassal(actor));
}

function outsiderVassal(actor) {
  const system = actor.system ?? {};
  const level = Math.max(1, Math.min(5, Number(system.threat ?? 1)));
  const page = Number(system.sourcePage ?? actor.flags?.["part-time-gods"]?.source?.page ?? 121);
  const summary = `${actor.name} is a Level ${level} Vassal Entitlement derived from the Opposition actor on book p. ${page}.`;
  const fullText = paragraphs(
    summary,
    stripHTML(system.description) || "Use this Vassal as a mythic ally, summoned helper, dangerous servant, or negotiated supernatural companion.",
    "When dragged to a Scene, the system can create an antagonist Actor using this Vassal's embedded actor template."
  );
  const actorTemplate = {
    name: actor.name,
    type: actor.type,
    img: actor.img,
    system: {
      antagonistType: system.antagonistType,
      rank: system.rank,
      threat: system.threat,
      threshold: system.threshold,
      health: system.health ?? system.threshold,
      psyche: system.psyche ?? system.threshold,
      armor: system.armor,
      spark: system.spark,
      fragments: system.fragments,
      attack: system.attack,
      defense: system.defense,
      initiative: system.initiative,
      damage: system.damage,
      skills: system.skills,
      powers: system.powers,
      conditionHandling: system.conditionHandling,
      sourcePage: system.sourcePage,
      description: system.description
    },
    prototypeToken: actor.prototypeToken ?? {}
  };

  return baseItem("vassal", `${actor.name} Vassal`, page, {
    summary,
    level,
    cost: level,
    strain: {
      value: 0,
      max: level
    },
    concept: `${actor.name} ally`,
    loyalty: 0,
    sourceActorName: actor.name,
    sourceActorCategory: "Outsiders",
    actorTemplate,
    powerHooks: actor.flags?.["part-time-gods"]?.powerHooks ?? [],
    currentTask: "",
    currentRisk: "",
    riskNotes: "",
    requestLog: [],
    benefit: fullText,
    description: fullText,
    relatedBonus: paragraphs(
      `Can be used as a Vassal ally with Threat ${Number(system.threat ?? level)}, ${system.rank || "custom rank"} opposition traits, and the listed power notes.`,
      stripHTML(system.powers)
    ),
    relatedDetriment: paragraphs(
      "Vassals are still independent supernatural beings. Requests, loyalty, risk, and fallout should be handled through Vassal scenes and Strain.",
      "Strong Vassals can draw attention from gods, Outsiders, and Theologies when used openly."
    ),
    automationNotes: paragraphs(
      `Source Actor: ${actor.name}.`,
      `Power hooks: ${(actor.flags?.["part-time-gods"]?.powerHooks ?? []).join(", ") || "none encoded yet"}.`
    ),
    sourcePage: page,
    notes: source(page),
    ...itemRules("vassal", `${actor.name} Vassal`, page, summary, {
      fullText,
      kind: "active",
      trigger: "favor",
      target: "ally",
      action: "request-favor"
    })
  }, {
    sourceActorName: actor.name,
    sourceActorCategory: "Outsiders",
    kind: "outsider-vassal"
  });
}

function condition(name, category, severity, page, effect) {
  const metadata = CONDITION_RULE_METADATA[name] ?? conditionRule(category, "fictional", "scene-or-fiction", "Recover when the GM determines the Condition's fictional cause has ended.", "Custom or uncatalogued Condition metadata.");
  const summary = `${effect} ${metadata.persistence}`;

  return baseItem("condition", name, page, {
    category,
    severity,
    severityMode: "level",
    appliesTo: metadata.appliesTo,
    duration: metadata.duration,
    recovery: metadata.recovery,
    removal: metadata.removal,
    sourcePage: page,
    sourceSection: metadata.sourceSection,
    rollModifier: metadata.rollModifier,
    effect: paragraph(effect),
    notes: `${source(page)}<p><strong>Recovery:</strong> ${escapeHTML(metadata.recovery)}</p><p><strong>Automation:</strong> ${escapeHTML(metadata.removal)}</p>`,
    ...itemRules("condition", name, page, summary, {
      kind: "passive",
      trigger: "applied",
      target: "self",
      action: "track-condition",
      enabled: true,
      condition: {
        name,
        category,
        severity,
        appliesTo: metadata.appliesTo,
        duration: metadata.duration,
        recovery: metadata.recovery,
        rollModifier: metadata.rollModifier
      }
    })
  });
}

function conditionRule(category, appliesTo, duration, recovery, removal, rollModifier = null) {
  return {
    category,
    appliesTo,
    duration,
    recovery,
    removal,
    persistence: `It applies to ${appliesTo} and persists as ${duration}.`,
    sourceSection: "Conditions",
    rollModifier
  };
}

function gearQualityItems() {
  return Object.entries(QUALITY_DEFINITIONS)
    .map(([key, definition]) => gearQuality(key, definition))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function gearQuality(key, definition) {
  const name = titleCase(key);
  const appliesTo = gearQualityAppliesTo(key, definition);
  const defaultValue = Number(qualityDefaultValue(key, appliesTo === "armor" ? "armor" : "weapon") ?? 0);
  const page = appliesTo === "armor" ? 210 : 211;
  const supported = definition.supported === true;
  const automationData = definition.automation ?? {};
  const summary = `${name} is a ${appliesToLabel(appliesTo)} quality. ${definition.effect}`;
  const fullText = paragraphs(
    summary,
    supported
      ? "The system has automation metadata for this quality; weapon and armor cards can use it for reminders or numeric effects."
      : "This quality is currently handled as a table-facing rules reminder rather than an automatic numeric modifier.",
    definition.notes ?? ""
  );

  return baseItem("gearQuality", name, page, {
    ...itemRules("gear-quality", name, page, summary, {
      kind: supported ? "passive" : "narrative",
      trigger: "gear-equipped-or-used",
      target: appliesTo,
      fullText,
      enabled: supported,
      action: supported ? "gear-quality" : "",
      bonus: gearQualityBonus(automationData),
      damage: automationData.damageMinimum || automationData.boostDamage ? automationData : null,
      condition: automationData.conditionPrompt ? { prompt: automationData.conditionPrompt } : null
    }),
    key,
    appliesTo,
    defaultValue,
    supported,
    automationData,
    effect: fullText,
    description: fullText,
    notes: source(page)
  });
}

function gearQualityAppliesTo(key, definition) {
  const automation = definition.automation ?? {};
  if (automation.armorTag || automation.armorReliability || automation.armorWarning) return "armor";
  if (automation.range || automation.rangeStep || automation.damageMinimum || automation.boostDamage || automation.conditionPrompt || automation.armorBypassNote || automation.multiTargetNote || automation.weaponCheckBonus || automation.armorPiercing || automation.selectedSkillBonus || automation.dodgePenalty || automation.boostEffect || automation.blockPenalty) return "weapon";
  if (["bulky", "cumbersome", "fireproof", "cold-proof", "radiation-proof", "shield", "subtle", "weak", "resistant", "heavy", "light"].includes(key)) return "armor";
  if (["autofire", "blunt", "brutal", "concealable", "crushing", "defending", "disarming", "explosive", "loud", "master-crafted", "messy", "piercing", "quick", "ranged", "reach", "recoil", "reload", "restraining", "sharp", "skilled", "slow", "unbreakable", "unpredictable", "unwieldy"].includes(key)) return "weapon";
  return "gear";
}

function appliesToLabel(appliesTo) {
  return {
    armor: "Armor",
    weapon: "Weapon",
    gear: "Gear"
  }[appliesTo] ?? "Gear";
}

function gearQualityBonus(automationData = {}) {
  const bonus = {};
  if (automationData.defenseBonus) bonus.defense = automationData.defenseBonus;
  if (automationData.initiativeBonus) bonus.initiative = automationData.initiativeBonus;
  if (automationData.rangeStep) bonus.rangeStep = automationData.rangeStep;
  if (automationData.armorTag) bonus.armorTag = automationData.armorTag;
  return Object.keys(bonus).length ? bonus : null;
}

function chapterFourRuleDefinition(name, page, summary, action, options = {}) {
  return { name, page, summary, action, ...options };
}

function chapterFourRulePower(definition) {
  const fullText = paragraphs(
    `${definition.name} is a Chapter 4 procedure reference.`,
    definition.summary,
    "Use this Item as a compact rules card for roll dialogs, resource workflows, chat cards, and table-facing reminders.",
    "The full source remains the rulebook; this system entry preserves only release-safe summary text and automation metadata."
  );
  const roll = definition.roll ?? null;
  const resourceChange = definition.resourceChange ?? null;

  return baseItem("power", definition.name, definition.page, {
    ...itemRules("power", definition.name, definition.page, definition.summary, {
      kind: "chapter-4-rule",
      trigger: "When resolving the matching Chapter 4 procedure.",
      target: definition.target ?? "table procedure",
      cost: definition.cost ?? {},
      fullText,
      enabled: Boolean(roll || resourceChange),
      action: definition.action,
      roll,
      resourceChange
    }),
    domain: "",
    manifestation: "",
    rank: 0,
    cost: 0,
    chapterCost: definition.cost ?? {},
    activation: "passive",
    duration: "By procedure",
    range: "Table",
    target: definition.target ?? "table procedure",
    requiresRoll: Boolean(roll),
    difficulty: Number(roll?.difficulty ?? 0),
    effect: fullText,
    limitations: paragraphs(
      "This is a system-facing summary, not replacement rulebook prose.",
      "The GM still confirms exact fictional stakes, eligibility, and edge cases."
    ),
    notes: paragraphs(`Source-backed Chapter 4 rule reference from book p. ${definition.page}.`)
  }, {
    folder: "chapter-4-rules",
    kind: "chapter-4-rule",
    sourceId: `ptg2e.chapter-4.rule.${slugify(definition.name)}`
  });
}

function criticalFailureEffectDefinition(name, page, effect, automation = {}) {
  return { name, page, effect, automation };
}

function criticalFailureEffectCondition(definition) {
  const fullText = paragraphs(
    `${definition.name} is a possible Critical Failure consequence.`,
    definition.effect,
    "Apply it when a roll has no successes and at least one 1-result. Multiple 1-results can justify multiple consequences if the player and GM compound the failure."
  );
  const rollModifier = definition.automation.penalty ? { target: "failed-skill", mode: "scene-penalty", amount: definition.automation.penalty } : null;

  return baseItem("condition", definition.name, definition.page, {
    category: "criticalFailure",
    severity: 1,
    severityMode: "level",
    appliesTo: definition.automation.resource ?? definition.automation.itemQuality ?? "scene",
    duration: definition.automation.duration ?? "immediate-or-scene",
    recovery: "Resolve through the fiction, resource workflow, Condition recovery, or GM ruling.",
    removal: "Clear after the consequence has been paid, recovered, or converted into a longer-term Condition.",
    sourcePage: definition.page,
    sourceSection: "Possible Critical Failure Effects",
    rollModifier,
    criticalFailure: definition.automation,
    effect: fullText,
    notes: paragraphs(
      `Source-backed Critical Failure consequence from book p. ${definition.page}.`,
      "Critical Failure consequences can also add Pantheon Dice through the Pantheon Pool workflow."
    ),
    ...itemRules("condition", definition.name, definition.page, definition.effect, {
      kind: "critical-failure-effect",
      trigger: "critical-failure",
      target: "failed check",
      fullText,
      enabled: true,
      action: "track-critical-failure",
      condition: {
        name: definition.name,
        category: "criticalFailure",
        severity: 1,
        appliesTo: definition.automation.resource ?? definition.automation.itemQuality ?? "scene",
        duration: definition.automation.duration ?? "immediate-or-scene",
        recovery: "Resolve through the fiction, resource workflow, Condition recovery, or GM ruling.",
        rollModifier
      }
    })
  }, {
    folder: "critical-failure-effects",
    kind: "critical-failure-effect",
    sourceId: `ptg2e.chapter-4.critical-failure.${slugify(definition.name)}`
  });
}

function chapterFiveRuleDefinition(name, page, summary, action, options = {}) {
  return { name, page, summary, action, ...options };
}

function chapterFiveRulePower(definition) {
  const fullText = paragraphs(
    `${definition.name} is a Chapter 5 battle reference.`,
    definition.summary,
    "Use this Item as a compact rules card for PTG combat controls, damage workflows, Conditions, gear, and table-facing battle reminders.",
    "The full source remains the rulebook; this system entry preserves only release-safe summary text and automation metadata."
  );
  const roll = definition.roll ?? null;

  return baseItem("power", definition.name, definition.page, {
    ...itemRules("power", definition.name, definition.page, definition.summary, {
      kind: "chapter-5-rule",
      trigger: "When resolving the matching Chapter 5 battle procedure.",
      target: definition.target ?? "battle procedure",
      fullText,
      enabled: Boolean(roll),
      action: definition.action,
      roll
    }),
    domain: "",
    manifestation: "",
    rank: 0,
    cost: 0,
    activation: "passive",
    duration: "By battle procedure",
    range: "Battle",
    target: definition.target ?? "battle procedure",
    requiresRoll: Boolean(roll),
    difficulty: Number(roll?.difficulty ?? 0),
    effect: fullText,
    limitations: paragraphs(
      "This is a system-facing summary, not replacement rulebook prose.",
      "The GM still confirms exact fictional stakes, action eligibility, range, cover, and edge cases."
    ),
    notes: paragraphs(`Source-backed Chapter 5 battle reference from book p. ${definition.page}.`)
  }, {
    folder: "chapter-5-rules",
    kind: "chapter-5-rule",
    sourceId: `ptg2e.chapter-5.rule.${slugify(definition.name)}`
  });
}

function battleActionDefinition(battle, actionType, name, page, skills, summary, options = {}) {
  return { battle, actionType, name, page, skills, summary, ...options };
}

function battleActionPower(definition) {
  const battleLabelText = battleLabel(definition.battle);
  const actionLabelText = battleActionTypeLabel(definition.actionType);
  const itemName = `${battleLabelText} ${actionLabelText}: ${definition.name}`;
  const skillText = battleSkillText(definition.skills);
  const fullText = paragraphs(
    `${definition.name} is a ${battleLabelText} ${actionLabelText}.`,
    definition.summary,
    `Suggested check: ${skillText}.`,
    "Use the PTG Combat Controls dialog to mark Quick/Standard action and defense use, resolve attack and defense successes, apply Health or Psyche damage, and create or recover Conditions."
  );
  const isDefense = definition.actionType.includes("defense");
  const isQuick = definition.actionType.startsWith("quick");
  const damageResource = definition.battle === "wits" ? "psyche" : "health";

  return baseItem("power", itemName, definition.page, {
    ...itemRules("power", itemName, definition.page, definition.summary, {
      kind: "battle-action",
      trigger: `${battleLabelText} ${actionLabelText}`,
      target: isDefense ? "incoming attack or pressure" : "opponent, ally, scene, or self",
      fullText,
      enabled: true,
      action: "battle-action",
      roll: {
        type: "battle-action",
        battle: definition.battle,
        actionType: definition.actionType,
        actionName: slugify(definition.name),
        skills: definition.skills,
        bonus: Number(definition.bonus ?? 0),
        usesDefense: Boolean(definition.usesDefense || isDefense),
        damageResource,
        range: definition.range ?? "",
        quick: isQuick,
        standard: definition.actionType.startsWith("standard")
      }
    }),
    domain: "",
    manifestation: "",
    rank: 0,
    cost: 0,
    activation: isQuick ? "quick" : "standard",
    duration: "Battle turn",
    range: definition.range ?? "By action and positioning",
    target: isDefense ? "incoming attack or pressure" : "battle target or scene",
    requiresRoll: definition.skills.length > 0,
    difficulty: 1,
    effect: fullText,
    limitations: paragraphs(
      "The action must fit the current fiction, range, equipment, and available Quick or Standard action slot.",
      "The GM confirms alternate Skill Combos, cover, range penalties, Condition riders, and whether damage targets Health, Psyche, or both."
    ),
    notes: paragraphs(`Source-backed ${battleLabelText} action reference from book p. ${definition.page}.`)
  }, {
    folder: `battle-${definition.battle}`,
    kind: "battle-action",
    battle: definition.battle,
    actionType: definition.actionType,
    sourceId: `ptg2e.chapter-5.${definition.battle}.${definition.actionType}.${slugify(definition.name)}`
  });
}

function manifestationPowerDefinition(name, manifestation, page, summary, specialties, useText) {
  return { name, manifestation, page, summary, specialties, useText };
}

function manifestationPower(definition) {
  const specialtyList = definition.specialties.join(", ");
  const fullText = paragraphs(
    `${definition.name} is a Manifestation: ${definition.summary}`,
    `Specialties: ${specialtyList}.`,
    definition.useText,
    "Roll the Manifestation with a fitting Skill Combo when the outcome is uncertain. Use successes as Measures for scale, range, duration, targets, damage, or other effect details as the scene requires."
  );

  return baseItem("power", definition.name, definition.page, {
    ...itemRules("power", definition.name, definition.page, definition.summary, {
      kind: "active",
      trigger: "The god uses divine power through their Dominion.",
      target: "Varies by Manifestation effect and selected Measures.",
      fullText,
      enabled: true,
      action: "manifestation-roll",
      roll: {
        type: "manifestation",
        manifestation: definition.manifestation,
        difficulty: 1,
        measures: ["damage", "range", "targets", "duration", "scale", "detail"]
      }
    }),
    domain: "",
    manifestation: definition.manifestation,
    rank: 0,
    cost: 0,
    activation: "action",
    duration: "By effect and Measures",
    range: "By effect and Measures",
    target: "By effect and Measures",
    requiresRoll: true,
    difficulty: 1,
    effect: fullText,
    limitations: paragraphs(
      "Manifestations must stay within the god's Dominion and the fictional limits of the chosen effect.",
      "Costs, resistance, Backlash, and exact Measures should be adjudicated from the rules reference when the effect is broad, contested, or risky."
    ),
    notes: paragraphs(`Source-backed Manifestation reference from book p. ${definition.page}.`)
  }, { folder: "manifestation" });
}

function manifestationApplicationDefinition(manifestation, name, page, skills, commonMeasures, summary) {
  return { manifestation, name, page, skills, commonMeasures, summary };
}

function manifestationApplicationPower(definition) {
  const manifestationName = titleCase(definition.manifestation);
  const itemName = `${manifestationName}: ${definition.name}`;
  const skillText = suggestedCheckText(definition);
  const measureText = definition.commonMeasures.map(measureLabel).join(", ");
  const fullText = paragraphs(
    `${definition.name} is a ${manifestationName} application.`,
    definition.summary,
    `Suggested check: ${skillText}.`,
    `Common Measures: ${measureText}.`,
    "Use the Manifestation dialog's Dominion Fit and Dominion Scope options to represent strongly aligned, broad, specific, weak, or unsupported Dominion use."
  );

  return baseItem("power", itemName, definition.page, {
    ...itemRules("power", itemName, definition.page, definition.summary, {
      kind: "manifestation-application",
      trigger: `The god applies ${manifestationName} through ${definition.name}.`,
      target: "By Dominion, target, and selected Measures.",
      fullText,
      enabled: true,
      action: "manifestation-roll",
      roll: {
        type: "manifestation",
        manifestation: definition.manifestation,
        application: slugify(definition.name),
        suggestedSkills: definition.skills,
        difficulty: 1,
        commonMeasures: definition.commonMeasures,
        measures: manifestationMeasureSet(definition.commonMeasures)
      }
    }),
    domain: "",
    manifestation: definition.manifestation,
    rank: 0,
    cost: 0,
    activation: "action",
    duration: definition.commonMeasures.includes("duration") ? "By Duration Measure" : "Usually instant or scene-defined",
    range: definition.commonMeasures.includes("range") ? "By Range Measure" : "By Dominion and target",
    target: definition.commonMeasures.includes("targets") ? "By Targets Measure" : "By application",
    requiresRoll: true,
    difficulty: 1,
    effect: fullText,
    limitations: paragraphs(
      "The effect must remain inside the god's Dominion and any table limits set for broad or specific Dominion scope.",
      "Costs, resistance, Backlash, exact Measure costs, and edge cases remain GM-facing rulings from the rules reference."
    ),
    notes: paragraphs(`Source-backed Manifestation application reference from book p. ${definition.page}.`)
  }, {
    folder: "manifestation-application",
    kind: "manifestation-application",
    manifestation: definition.manifestation,
    application: slugify(definition.name),
    sourceId: `ptg2e.chapter-3.manifestation.${definition.manifestation}.${slugify(definition.name)}`
  });
}

function ritualPowerDefinition(name, category, page, primary, secondary, difficulty, cost, effect) {
  return { name, category, page, primary, secondary, difficulty, cost, effect };
}

function ritualPower(definition) {
  const manifestation = labelKey(definition.secondary);
  const fullText = paragraphs(
    `${definition.name} is a ${titleCase(definition.category)} Ritual.`,
    `Check: ${definition.primary} + ${definition.secondary}. Standard Difficulty: ${difficultyLabel(definition.difficulty)} (${definition.difficulty}).`,
    `Cost: ${ritualCostText(definition.cost)}.`,
    definition.effect,
    "Ritual Free Time does not need to be spent all at once, but the god must devote scenes to ceremony, preparation, and the required focus."
  );

  return baseItem("power", definition.name, definition.page, {
    ...itemRules("power", definition.name, definition.page, definition.effect, {
      kind: "ritual",
      trigger: `The god performs the ${definition.name} ritual.`,
      target: ritualTarget(definition.category),
      cost: definition.cost,
      fullText,
      enabled: true,
      action: "ritual-roll",
      roll: {
        type: "ritual",
        ritualCategory: definition.category,
        primary: labelKey(definition.primary),
        secondary: manifestation,
        difficulty: definition.difficulty
      }
    }),
    domain: "",
    manifestation,
    rank: 0,
    cost: 0,
    activation: "ritual",
    duration: ritualDuration(definition.name),
    range: ritualRange(definition.category),
    target: ritualTarget(definition.category),
    requiresRoll: true,
    difficulty: definition.difficulty,
    effect: fullText,
    limitations: paragraphs(
      "Rituals are universal Spark workings rather than ordinary Dominion-limited Manifestations, but their ceremony is still flavored by the god and their divine nature.",
      "Interrupted rituals can usually resume later, but the GM decides when stored ritual focus has dissipated and must be rebuilt."
    ),
    notes: paragraphs(`Source-backed Ritual reference from book p. ${definition.page}.`)
  }, { folder: "ritual", kind: "ritual", ritualCategory: definition.category });
}

function otherworldStageDefinition(name, page, primary, secondary, summary, outcome) {
  return { name, page, primary, secondary, summary, outcome };
}

function otherworldStagePower(definition) {
  const fullText = paragraphs(
    `${definition.name} is a Ways travel stage.`,
    `Check: ${definition.primary} + ${definition.secondary}. The GM sets Difficulty based on the destination and route.`,
    definition.summary,
    definition.outcome,
    "Each stage normally costs 1 Free Time, and responsibility passes between gods until the travel sequence is complete."
  );

  return baseItem("power", definition.name, definition.page, {
    ...itemRules("power", definition.name, definition.page, definition.summary, {
      kind: "otherworld-travel",
      trigger: "The pantheon travels through the Ways toward a divine realm.",
      target: "The current Ways stage.",
      cost: { freeTime: 1 },
      fullText,
      enabled: true,
      action: "otherworld-stage-roll",
      roll: {
        type: "otherworld-stage",
        primary: labelKey(definition.primary),
        secondary: labelKey(definition.secondary)
      }
    }),
    domain: "",
    manifestation: "",
    rank: 0,
    cost: 0,
    activation: "ritual",
    duration: "One Ways travel stage",
    range: "The Ways",
    target: "Traveling pantheon or group",
    requiresRoll: true,
    difficulty: 1,
    effect: fullText,
    limitations: paragraphs(
      "The listed Difficulty is destination-dependent. Friendly, unknown, hostile, and custom realms can change each stage.",
      "Failure does not usually end the trip; it changes the remaining route, adds danger, or creates a complication."
    ),
    notes: paragraphs(`Source-backed Otherworld travel reference from book p. ${definition.page}.`)
  }, { folder: "otherworld", kind: "otherworld-travel" });
}

function armor(name, rating, cost, quality, page) {
  const qualities = parseGearQualities(quality, "armor");
  const details = armorExampleDetails(name, rating);
  const summary = `${name} provides Armor ${rating}. Cost ${cost}. Qualities: ${quality}. ${details.effectiveArmor ? `${details.effectiveArmor}. ` : ""}Armor penalty ${details.penalty}.`;
  const fullText = armorRulesExplanation(name, rating, cost, quality, qualities, details);

  return baseItem("armor", name, page, {
    amount: 1,
    weight: 0,
    held: true,
    equipped: false,
    rating,
    cost,
    quality,
    qualities,
    description: fullText,
    notes: paragraphs(
      `Source: Part-Time Gods Second Edition, p. ${page}.`,
      "Armor examples marked as magical in the source should be awarded through story, favors, or supernatural access rather than ordinary shopping."
    ),
    ...itemRules("armor", name, page, summary, {
      kind: "passive",
      trigger: "equipped",
      target: "self",
      fullText,
      action: "apply-armor",
      bonus: { armor: rating },
      penalty: { physicalActions: details.penalty }
    })
  });
}

function weapon(name, damage, range, cost, quality, page) {
  const qualities = parseGearQualities(quality, "weapon");
  const firearm = isFirearm(qualities);
  const summary = `${name} deals +${damage} damage at ${range} range. Cost ${cost}. Qualities: ${quality}.${firearm ? " Firearm." : ""}`;
  const fullText = weaponRulesExplanation(name, damage, range, cost, quality, qualities, firearm);

  return baseItem("weapon", name, page, {
    amount: 1,
    weight: 0,
    held: true,
    equipped: false,
    damage,
    range,
    rangeCategory: rangeCategory(range),
    cost,
    quality,
    qualities,
    description: fullText,
    notes: paragraphs(
      `Source: Part-Time Gods Second Edition, p. ${page}.`,
      firearm
        ? "Firearms carry the Ranged and Loud assumptions; use the listed qualities for the exact weapon."
        : "Weapon size and appearance remain fictional cues for concealment, legality, and social consequences."
    ),
    ...itemRules("weapon", name, page, summary, {
      kind: "active",
      trigger: "use",
      target: "targeted",
      fullText,
      action: "weapon-attack",
      enabled: true,
      roll: { primary: "fighting", secondary: "might", difficulty: 1 },
      damage: { amount: damage, type: "weapon" },
      bonus: gearAutomationBonus(qualities)
    })
  });
}

function armorExampleDetails(name, rating) {
  const details = {
    "Armored Jumpsuit": { penalty: 0 },
    "Asbestos Suit": { penalty: -2, effectiveArmor: "Armor 4 against fire" },
    Breastplate: { penalty: -1 },
    Buckler: { penalty: -1 },
    "Bulletproof Vest": { penalty: 0, effectiveArmor: "Armor 3 against bullets" },
    "Coral Shield": { penalty: -1, magical: true },
    "Enchanted Leather Jacket": { penalty: 0, magical: true },
    "Full Plate": { penalty: -3 },
    "Golden Plate": { penalty: -3, magical: true },
    "Hazmat Suit": { penalty: 0, effectiveArmor: "Armor 4 against radiation" },
    "Hockey Pads": { penalty: -3 },
    "Riot Shield": { penalty: -3 },
    "Scuba Gear": { penalty: 0, effectiveArmor: "Armor 5 against cold" },
    "Tactical Gear": { penalty: -1, effectiveArmor: "Armor 5 against bullets" }
  }[name] ?? { penalty: armorPenaltyFromRating(rating) };

  return {
    penalty: Number(details.penalty ?? armorPenaltyFromRating(rating)),
    effectiveArmor: details.effectiveArmor ?? "",
    magical: details.magical === true
  };
}

function armorRulesExplanation(name, rating, cost, quality, qualities, details) {
  return paragraphs(
    `${name} is armor with Armor ${rating}, Cost ${cost}, and the listed qualities: ${quality}.`,
    "When equipped, armor reduces incoming Health damage by its Armor rating after the attack's successes determine damage. A character normally wears only one suit of armor at a time, though divine Truths or other powers can add separate Armor values.",
    `This example's physical-action armor penalty is ${details.penalty}. Armor takes about one minute to put on or remove unless a quality such as Practical changes that timing.`,
    details.effectiveArmor ? `${details.effectiveArmor}; use that higher value only against the listed damage source.` : "",
    details.magical ? "This example is magical or supernatural; treat availability as a story reward, favor, Relic-like object, or Dominion-shaped creation rather than ordinary shopping." : "",
    "Armor Cost starts from a base and is adjusted by positive and negative qualities. Positive qualities add cost by level; negative qualities discount the armor by their level.",
    "Quality details: " + qualityDetailsText(qualities)
  );
}

function weaponRulesExplanation(name, damage, range, cost, quality, qualities, firearm) {
  return paragraphs(
    `${name} is a weapon with +${damage} damage, ${range} range, Cost ${cost}, and the listed qualities: ${quality}.`,
    "In a Battle of Fists, weapons add their damage to a successful attack and their qualities decide the special cases: Boost riders, armor interaction, reach, reload pressure, concealment, and noise.",
    range === "Close"
      ? "Close weapons are used within hand-to-hand reach."
      : range === "Near"
        ? "Near weapons can threaten targets beyond immediate hand-to-hand reach."
        : "Far weapons can attack at distance; Ranged weapons also carry a close-range penalty when used too near a target.",
    firearm ? "This weapon is a firearm, so its source assumptions include Ranged and Loud in addition to the listed custom qualities." : "",
    "Weapon Cost follows the same quality-based pattern as armor, with firearms adding extra cost. Custom weapons usually trade positive qualities against negative qualities or extra Wealth.",
    "Quality details: " + qualityDetailsText(qualities)
  );
}

function qualityDetailsText(qualities) {
  const details = qualities.map(quality => {
    const value = Number(quality.value ?? 0);
    const valueText = value ? ` ${value}` : "";
    return `${quality.name}${valueText}: ${quality.effect}`;
  });

  return details.length ? details.join(" ") : "No qualities are listed.";
}

function armorPenaltyFromRating(rating) {
  return rating > 1 ? -(rating - 1) : 0;
}

function isFirearm(qualities) {
  const keys = new Set(qualities.map(quality => quality.key));
  return keys.has("ranged") && keys.has("loud");
}

function rangeCategory(range) {
  const key = String(range ?? "").trim().toLowerCase();
  return {
    close: "close",
    near: "near",
    far: "far"
  }[key] ?? key;
}

function parseGearQualities(quality, itemType) {
  return String(quality ?? "")
    .split(",")
    .map(entry => structuredQuality(entry, itemType))
    .filter(Boolean);
}

function structuredQuality(entry, itemType) {
  const raw = String(entry ?? "").trim();
  if (!raw) return null;

  const match = raw.match(/^(.+?)(?:\s+(\d+))?$/);
  const name = titleCase(match?.[1] ?? raw);
  const key = slugify(name);
  const value = Number(match?.[2] ?? qualityDefaultValue(key, itemType) ?? 0);
  const definition = QUALITY_DEFINITIONS[key] ?? {};

  return {
    key,
    name,
    value,
    supported: definition.supported ?? false,
    effect: definition.effect ?? "No automated modifier is applied; use the quality text as a GM-facing reminder.",
    automation: definition.automation ?? {},
    notes: definition.notes ?? ""
  };
}

function qualityDefaultValue(key, itemType) {
  if (key === "brutal") return 1;
  if (key.endsWith("proof")) return 2;
  if (key === "defending" || key === "shield") return 1;
  if (["master-crafted", "skilled", "piercing"].includes(key)) return 1;
  if (key === "weak") return -1;
  if (key === "resistant") return 1;
  if (itemType === "weapon" && key === "explosive") return 2;
  return 0;
}

function gearAutomationBonus(qualities) {
  const bonus = {};

  for (const quality of qualities) {
    if (quality.key === "brutal") bonus.damage = Math.max(Number(bonus.damage ?? 0), Number(quality.value ?? 2));
    if (quality.key === "defending") bonus.defense = Math.max(Number(bonus.defense ?? 0), Number(quality.value ?? 1));
    if (quality.key === "quick") bonus.initiative = Math.max(Number(bonus.initiative ?? 0), Number(quality.value ?? 1));
  }

  return Object.keys(bonus).length ? bonus : null;
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, char => char.toUpperCase());
}

function labelKey(value) {
  return slugify(value).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function suggestedCheckText(definition) {
  const manifestationName = titleCase(definition.manifestation);
  const skills = definition.skills.map(skill => `${manifestationName} + ${titleCase(skill)}`);
  return skills.join(" or ");
}

function manifestationMeasureSet(commonMeasures = []) {
  return Array.from(new Set(["damage", "range", "targets", "duration", "scale", "detail", ...commonMeasures]));
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

function battleLabel(key) {
  return {
    fists: "Battle of Fists",
    wits: "Battle of Wits"
  }[key] ?? titleCase(key);
}

function battleActionTypeLabel(key) {
  return {
    "quick-action": "Quick Action",
    "standard-action": "Standard Action",
    "quick-defense": "Quick Defense",
    "standard-defense": "Standard Defense"
  }[key] ?? titleCase(key);
}

function battleSkillText(skills = []) {
  if (!skills.length) return "No roll by default";
  return skills
    .map(([primary, secondary]) => {
      if (primary === "varies" || secondary === "varies") return "Varies by fiction";
      return `${titleCase(primary)} + ${titleCase(secondary)}`;
    })
    .join(" or ");
}

function difficultyLabel(value) {
  return {
    1: "Simple",
    2: "Moderate",
    3: "Tough",
    4: "Challenging",
    5: "Legendary"
  }[Number(value)] ?? "Variable";
}

function ritualCostText(cost = {}) {
  const parts = [];
  if (cost.freeTime != null) parts.push(`${cost.freeTime} Free Time${cost.freeTime === 1 ? "" : "s"}`);
  if (cost.fragments) parts.push(`${cost.fragments} Fragment${cost.fragments === 1 ? "" : "s"}`);
  if (cost.wealth) parts.push(`${cost.wealth} Wealth`);
  if (cost.pantheonDice) parts.push(`${cost.pantheonDice} Pantheon ${cost.pantheonDice === 1 ? "Die" : "Dice"}`);
  return parts.length ? parts.join(", ") : "No fixed cost";
}

function ritualTarget(category) {
  return {
    territory: "Territory",
    spark: "Spark, god, Outsider, or pantheon",
    otherworldly: "Relic, fate, realm, portal, or divine travel"
  }[category] ?? "Ritual target";
}

function ritualRange(category) {
  return {
    territory: "Current or entered Territory",
    spark: "Spark sense, Territory, or participating gods",
    otherworldly: "Territory, Bond, Relic, portal, realm, or the Ways"
  }[category] ?? "By ritual";
}

function ritualDuration(name) {
  return {
    Admittance: "One full day",
    Bolster: "One full day, extendable by Fragments",
    Challenge: "One week or until resolved",
    Detection: "One day",
    Dowsing: "One full day",
    "Temporary Convergence": "One day per Free Time spent",
    Binding: "Until the Relic is rebound or the GM ends the bond",
    Divination: "Immediate fate, usually within one day",
    "Pocket Realm": "Permanent realm after completion",
    Portal: "One day, or permanent with major Fragment investment"
  }[name] ?? "By ritual";
}

function blessing(name, sourceName, page, effect, { flags = {}, originalName = name } = {}) {
  const fullText = abilityPlayerText("blessing", name, sourceName, effect);
  const itemFlags = flags.kind ? { ...flags, originalName } : flags;
  const bonus = abilityBonusMetadata(effect);

  return baseItem("blessing", name, page, {
    source: sourceName,
    trigger: "When the fictional trigger and table situation match the effect.",
    bonus: bonusText(effect),
    effect: fullText,
    notes: source(page),
    ...itemRules("blessing", name, page, effect, {
      fullText,
      kind: bonus ? "passive" : "triggered",
      trigger: bonus ? "combat-initiative" : "gm",
      target: "self",
      action: "apply-bonus",
      bonus,
      enabled: Boolean(bonus)
    })
  }, itemFlags);
}

function occupationCareerItems() {
  const items = [];

  for (const choice of PTG_PREMADE_CHOICES.filter(choice => choice.type === "occupation")) {
    const page = choice.flags?.["part-time-gods"]?.page ?? 0;

    for (const career of choice.system?.careerOptions ?? []) {
      const careerName = `${career.name} (${choice.name})`;
      const careerPage = career.sourcePage ?? page;
      const resources = career.resources ?? {};
      const attachments = career.attachments ?? [];
      const summary = `${career.name} is a ${choice.name} career option with Free Time ${resources.freeTime ?? 0} and Wealth ${resources.wealth ?? 0}.`;
      const fullText = paragraphs(
        summary,
        `Attachments: ${attachments.map(attachmentOptionText).join("; ") || "None"}.`,
        `Blessing: ${career.blessing?.name ?? "None"}. Curse: ${career.curse?.name ?? "None"}.`
      );

      items.push(baseItem("occupation", careerName, careerPage, {
        category: choice.name,
        career: career.name,
        careerOptions: [],
        grants: itemGrants({
          resources,
          attachments: { options: attachments },
          blessing: career.blessing?.name ?? "",
          curse: career.curse?.name ?? ""
        }),
        description: fullText,
        notes: source(careerPage),
        ...itemRules("occupation", careerName, careerPage, summary, {
          fullText,
          kind: "passive",
          trigger: "character creation",
          target: "self",
          action: "apply-occupation-career"
        })
      }, { kind: "occupation-career", parentOccupation: choice.name }));
    }
  }

  return items;
}

function specificDominionItems() {
  const entries = specificDominionEntries();
  const nameCounts = countNames(entries.map(entry => entry.portfolio));

  return entries.map(entry => {
    const name = nameCounts.get(entry.portfolio) > 1
      ? `${entry.portfolio} (${entry.categoryLabel})`
      : entry.portfolio;
    const summary = `${entry.portfolio} is a specific ${entry.categoryLabel} Dominion example from the random Dominion tables.`;
    const fullText = paragraphs(
      summary,
      "Use this Item as the chosen specific Dominion, then pair it with the matching Dominion category Choice for Skills, Manifestations, Blessings, Curses, and Attachments."
    );

    return baseItem("domain", name, entry.page, {
      category: entry.category,
      rank: 0,
      portfolio: entry.portfolio,
      customTitle: "",
      specificPortfolio: entry.portfolio,
      specificity: "specific",
      limitations: paragraph("Define any table-specific limitations, taboos, and narrative edges when this Dominion enters play."),
      gmNotes: paragraph(`Generated from ${entry.tableName}, roll ${entry.rangeText}.`),
      landmarkBondUuid: "",
      landmarkBondName: "",
      sphere: entry.categoryLabel,
      manifestations: "",
      attachmentOptions: [],
      blessingOptions: [],
      curseOptions: [],
      grants: itemGrants(),
      description: fullText,
      notes: source(entry.page),
      ...itemRules("domain", name, entry.page, summary, {
        fullText,
        kind: "passive",
        trigger: "character creation",
        target: "self",
        action: "choose-specific-dominion"
      })
    }, {
      kind: "specific-dominion",
      category: entry.category,
      portfolio: entry.portfolio,
      tableName: entry.tableName,
      tableRange: entry.rangeText
    });
  });
}

function specificDominionEntries() {
  return PTG_PREMADE_ROLL_TABLES
    .filter(table => /^Random Dominion - (Bestial|Conceptual|Elemental|Emotional|Patron|Tangible|Crossover)$/.test(table.name))
    .flatMap(table => {
      const categoryLabel = table.name.replace("Random Dominion - ", "");
      const category = dominionCategoryKey(categoryLabel);
      const page = table.flags?.["part-time-gods"]?.source?.page ?? 284;

      return table.results.map(result => ({
        category,
        categoryLabel,
        page,
        portfolio: result.text,
        rangeText: rollRangeText(result.range),
        tableName: table.name
      }));
    });
}

function itemGrants(overrides = {}) {
  return {
    skills: overrides.skills ?? {},
    manifestations: overrides.manifestations ?? {},
    resources: overrides.resources ?? {},
    attachments: overrides.attachments ?? {},
    blessing: overrides.blessing ?? "",
    curse: overrides.curse ?? ""
  };
}

function countNames(names) {
  return names.reduce((counts, name) => {
    counts.set(name, (counts.get(name) ?? 0) + 1);
    return counts;
  }, new Map());
}

function dominionCategoryKey(categoryLabel) {
  return {
    Bestial: "bestial",
    Conceptual: "conceptual",
    Elemental: "elemental",
    Emotional: "emotional",
    Patron: "patron",
    Tangible: "tangible",
    Crossover: "crossover"
  }[categoryLabel] ?? slugify(categoryLabel);
}

function rollRangeText(range) {
  if (!Array.isArray(range)) return String(range ?? "");
  return range[0] === range[1] ? String(range[0]) : `${range[0]}-${range[1]}`;
}

function attachmentOptionText(option) {
  const level = Number(option?.level ?? 1);
  return `${option?.name ?? attachmentKindLabel(option?.kind ?? "choice")} ${level}`;
}

function choiceAttachmentItems() {
  const items = [];
  const seen = new Set();

  for (const choice of PTG_PREMADE_CHOICES) {
    const page = choice.flags?.["part-time-gods"]?.page ?? 0;
    const choiceSource = `${choice.name} ${typeName(choice.type)}`;

    for (const option of choice.system?.attachmentOptions ?? []) {
      pushChoiceAttachmentItem(items, seen, option, choiceSource, page);
    }

    for (const career of choice.system?.careerOptions ?? []) {
      const careerSource = `${career.name} (${choice.name})`;

      for (const option of career.attachments ?? []) {
        pushChoiceAttachmentItem(items, seen, option, careerSource, career.sourcePage ?? page);
      }
    }
  }

  return items;
}

function pushChoiceAttachmentItem(items, seen, option, sourceName, page) {
  if (!option?.kind) return;

  const item = choiceAttachmentItem(option, sourceName, page);
  const key = `${item.type}:${item.name}`;
  if (seen.has(key)) return;

  seen.add(key);
  items.push(item);
}

function choiceAttachmentItem(option, sourceName, page) {
  const kind = option.kind ?? option.choiceKind ?? "choice";
  const type = choiceAttachmentItemType(kind);
  const level = Math.max(1, Number(option.level ?? 1));
  const sourcePage = option.sourcePage ?? page;
  const name = `${option.name || attachmentKindLabel(kind)} (${sourceName})`;
  const summary = choiceAttachmentSummary(option, kind, level, sourceName);
  const fullText = paragraphs(
    summary,
    "This is a source-backed selectable attachment grant. Drag it to a character when that Choice grants this attachment, then rename or define it if the table customizes the relationship."
  );
  const shared = {
    choiceSource: sourceName,
    choiceKind: kind,
    choiceLabel: option.choiceLabel ?? option.name ?? attachmentKindLabel(kind),
    definition: option.definition ?? "",
    summary,
    relatedBonus: paragraph(attachmentBenefitText(kind, level)),
    relatedDetriment: paragraph("Attachments can take Strain, demand attention, and create story obligations when neglected or endangered."),
    trigger: "Granted by character creation Choice",
    actionCost: "Character creation",
    sourcePage,
    automationNotes: paragraph("Generated from embedded Choice attachment data so this grant can exist as its own Item document.")
  };

  if (type === "bond") {
    return baseItem("bond", name, sourcePage, {
      ...shared,
      kind,
      location: kind === "landmark" ? option.name : "",
      linkedDominionUuid: "",
      level,
      strain: { value: 0, max: level },
      description: fullText,
      notes: source(sourcePage),
      ...itemRules("bond", name, sourcePage, summary, {
        fullText,
        kind: "active",
        trigger: "favor",
        target: "attachment",
        cost: { strain: 1 },
        action: "request-favor"
      })
    }, { kind: "choice-attachment", choiceSource: sourceName });
  }

  if (type === "relic") {
    return baseItem("relic", name, sourcePage, {
      ...shared,
      level,
      cost: level,
      bonus: "",
      benefit: fullText,
      effect: fullText,
      description: fullText,
      notes: source(sourcePage),
      ...itemRules("relic", name, sourcePage, summary, {
        fullText,
        kind: "active",
        trigger: "use",
        target: "self",
        action: "custom-relic"
      })
    }, { kind: "choice-attachment", choiceSource: sourceName });
  }

  if (type === "truth") {
    return baseItem("truth", name, sourcePage, {
      ...shared,
      statement: option.name ?? attachmentKindLabel(kind),
      rank: level,
      cost: level,
      fragmentCost: 0,
      activation: "passive",
      benefit: fullText,
      effect: fullText,
      description: fullText,
      notes: source(sourcePage),
      ...itemRules("truth", name, sourcePage, summary, {
        fullText,
        kind: "passive",
        trigger: "always",
        target: "self",
        action: "custom-truth"
      })
    }, { kind: "choice-attachment", choiceSource: sourceName });
  }

  if (type === "worshipper") {
    return baseItem("worshipper", name, sourcePage, {
      ...shared,
      level,
      cost: level,
      strain: { value: 0, max: level },
      group: option.name ?? attachmentKindLabel(kind),
      size: "",
      requestType: "",
      currentRisk: "",
      riskNotes: "",
      requestLog: [],
      benefit: fullText,
      description: fullText,
      notes: source(sourcePage),
      ...itemRules("worshipper", name, sourcePage, summary, {
        fullText,
        kind: "active",
        trigger: "favor",
        target: "self",
        action: "request-favor"
      })
    }, { kind: "choice-attachment", choiceSource: sourceName });
  }

  if (type === "vassal") {
    return baseItem("vassal", name, sourcePage, {
      ...shared,
      level,
      cost: level,
      strain: { value: 0, max: level },
      concept: option.name ?? attachmentKindLabel(kind),
      loyalty: 0,
      sourceActorName: "",
      sourceActorCategory: "",
      actorTemplate: {},
      powerHooks: [],
      benefit: fullText,
      description: fullText,
      notes: source(sourcePage),
      ...itemRules("vassal", name, sourcePage, summary, {
        fullText,
        kind: "active",
        trigger: "favor",
        target: "ally",
        action: "request-favor"
      })
    }, { kind: "choice-attachment", choiceSource: sourceName });
  }

  return baseItem("attachment", name, sourcePage, {
    ...shared,
    kind,
    level,
    cost: level,
    benefit: fullText,
    description: fullText,
    notes: source(sourcePage),
    ...itemRules("attachment", name, sourcePage, summary, {
      fullText,
      kind: "narrative",
      trigger: "choice",
      target: "self",
      action: "choose-attachment"
    })
  }, { kind: "choice-attachment", choiceSource: sourceName });
}

function choiceAttachmentItemType(kind) {
  if (["individual", "group", "landmark"].includes(kind)) return "bond";
  if (["relic", "truth", "vassal", "worshipper"].includes(kind)) return kind;
  return "attachment";
}

function choiceAttachmentSummary(option, kind, level, sourceName) {
  const label = option.name || attachmentKindLabel(kind);
  return `${sourceName} grants ${label} at Level ${level}.`;
}

function attachmentBenefitText(kind, level) {
  if (["individual", "group", "landmark"].includes(kind)) return `Create or raise a ${attachmentKindLabel(kind)} Bond by ${level} level${level === 1 ? "" : "s"}.`;
  if (kind === "relic") return `Create or raise a Relic Entitlement by ${level} level${level === 1 ? "" : "s"}.`;
  if (kind === "truth") return `Choose a Truth Entitlement; this grant counts as ${level} attachment point${level === 1 ? "" : "s"}.`;
  if (kind === "vassal") return `Create or raise a Vassal Entitlement by ${level} level${level === 1 ? "" : "s"}.`;
  if (kind === "worshipper") return `Create or raise a Worshipper Entitlement by ${level} level${level === 1 ? "" : "s"}.`;
  return `Choose any attachment worth ${level} level${level === 1 ? "" : "s"} or point${level === 1 ? "" : "s"}.`;
}

function attachmentKindLabel(kind) {
  return {
    choice: "Attachment of Choice",
    group: "Group",
    individual: "Individual",
    landmark: "Landmark",
    relic: "Relic",
    truth: "Truth",
    vassal: "Vassal",
    worshipper: "Worshipper"
  }[kind] ?? labelize(kind);
}

function choiceAbilityItems() {
  const items = [];
  const seen = new Set();
  const grants = PTG_PREMADE_CHOICES.flatMap(choice => choiceAbilityGrants(choice));
  const duplicateCounts = countGrantNames(grants);
  const duplicateSeen = new Map();

  for (const grant of grants) {
    const { type, name, sourceName, page, effect, pantheonDice } = grant;
    const duplicateKey = `${type}:${name}`;
    const occurrence = (duplicateSeen.get(duplicateKey) ?? 0) + 1;
    duplicateSeen.set(duplicateKey, occurrence);

    const itemName = duplicateCounts.get(duplicateKey) > 1 && occurrence > 1
      ? `${name} (${sourceName})`
      : name;
    const key = `${type}:${itemName}`;
    if (seen.has(key)) continue;
    seen.add(key);

    items.push(type === "blessing"
      ? blessing(itemName, sourceName, page, effect, { flags: { kind: "choice-ability", choiceSource: sourceName }, originalName: name })
      : curse(itemName, sourceName, page, pantheonDice ?? 1, effect, { flags: { kind: "choice-ability", choiceSource: sourceName }, originalName: name }));
  }

  return items;
}

function countGrantNames(grants) {
  return grants.reduce((counts, grant) => {
    const key = `${grant.type}:${grant.name}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    return counts;
  }, new Map());
}

function choiceAbilityGrants(choice) {
  const page = choice.flags?.["part-time-gods"]?.page ?? 0;
  const sourceName = `${choice.name} ${typeName(choice.type)}`;
  const grants = choice.system?.grants ?? {};
  const abilities = [];

  const blessingGrant = concreteAbilityGrant(grants.blessing);
  const curseGrant = concreteAbilityGrant(grants.curse);

  if (blessingGrant) {
    abilities.push(choiceAbilityData("blessing", blessingGrant, sourceName, page));
  }

  if (curseGrant) {
    abilities.push(choiceAbilityData("curse", curseGrant, sourceName, page));
  }

  for (const option of choice.system?.blessingOptions ?? []) {
    const blessingOption = concreteAbilityGrant(option);
    if (blessingOption) abilities.push(choiceAbilityData("blessing", blessingOption, sourceName, page));
  }

  for (const option of choice.system?.curseOptions ?? []) {
    const curseOption = concreteAbilityGrant(option);
    if (curseOption) abilities.push(choiceAbilityData("curse", curseOption, sourceName, page));
  }

  const theologyBlessing = concreteAbilityGrant(choice.system?.blessingData);
  if (theologyBlessing) {
    abilities.push(choiceAbilityData("blessing", theologyBlessing, sourceName, page));
  }

  const theologyCurse = concreteAbilityGrant(choice.system?.curseData);
  if (theologyCurse) {
    abilities.push(choiceAbilityData("curse", theologyCurse, sourceName, page, 0));
  }

  for (const career of choice.system?.careerOptions ?? []) {
    const careerSource = `${career.name} (${choice.name})`;

    const careerBlessing = concreteAbilityGrant(career.blessing);
    const careerCurse = concreteAbilityGrant(career.curse);

    if (careerBlessing) {
      abilities.push(choiceAbilityData("blessing", careerBlessing, careerSource, career.sourcePage ?? page));
    }

    if (careerCurse) {
      abilities.push(choiceAbilityData("curse", careerCurse, careerSource, career.sourcePage ?? page));
    }
  }

  return abilities;
}

function choiceAbilityData(type, grant, sourceName, page, defaultPantheonDice = 1) {
  return {
    type,
    name: grant.name,
    sourceName,
    page: grant.sourcePage ?? page,
    pantheonDice: type === "curse" ? grant.pantheonDice ?? defaultPantheonDice : undefined,
    effect: grant.rules?.summary ?? grant.rulesText ?? grant.effect
  };
}

function concreteAbilityGrant(grant) {
  if (!grant || typeof grant !== "object") return null;
  if (!grant.name || !grant.effect) return null;

  return grant;
}

function baseItem(type, name, page, system, flags = {}) {
  const slug = flags.slug ?? slugify(name);
  const sourceId = flags.sourceId ?? `item:${type}:${slug}`;

  return {
    name,
    type,
    img: defaultIcon(type),
    system: {
      slug,
      sourceId,
      ...system
    },
    flags: {
      "part-time-gods": {
        premade: true,
        source: "Part-Time Gods Second Edition",
        page,
        slug,
        sourceId,
        ...flags
      }
    }
  };
}

function itemRules(type, name, page, summary, options = {}) {
  const cost = {
    freeTime: 0,
    wealth: 0,
    pantheonDice: 0,
    fragments: 0,
    health: 0,
    psyche: 0,
    strain: 0,
    ...(options.cost ?? {})
  };

  return {
    rules: {
      summary,
      fullText: rulesFullText(type, name, page, summary, options, cost),
      source: {
        book: "Part-Time Gods Second Edition",
        page,
        section: name,
        type
      }
    },
    usage: {
      kind: options.kind ?? "narrative",
      trigger: options.trigger ?? "",
      target: options.target ?? "",
      cost
    },
    automation: {
      enabled: options.enabled ?? false,
      action: options.action ?? "",
      bonus: options.bonus ?? null,
      penalty: options.penalty ?? null,
      roll: options.roll ?? null,
      healing: options.healing ?? null,
      damage: options.damage ?? null,
      condition: options.condition ?? null,
      resourceChange: options.resourceChange ?? null,
      chatCard: true
    }
  };
}

function rulesFullText(type, name, page, summary, options, cost) {
  const baseText = options.fullText ?? paragraph(summary);
  const additions = [
    itemRoleText(type, name),
    usageText(options, cost),
    automationText(options),
    `Source reference: Part-Time Gods Second Edition, book p. ${page}, ${name}.`
  ];

  return `${baseText}${paragraphs(...additions)}`;
}

function itemRoleText(type, name) {
  return {
    armor: `${name} should be read as both protection and a bundle of qualities. Use the Armor value for damage reduction and the qualities for special-case penalties, benefits, and fictional positioning.`,
    attachment: `${name} represents a character-facing attachment grant. Define the relationship or object in the fiction before relying on it mechanically.`,
    blessing: `${name} is a positive choice trait. It applies when the fictional trigger is true, and it should be visible in the narration before the bonus is used.`,
    bond: `${name} is a mortal anchor. Use it for favors, Strain, scenes of obligation, and reminders that the god still has human ties.`,
    condition: `${name} is a tracked state. Use its severity, category, recovery text, and roll modifier metadata to make the Condition visible and reversible at the table.`,
    curse: `${name} is a trouble hook. It should create a real complication before awarding Pantheon Dice or applying its drawback.`,
    domain: `${name} is a specific Dominion example. Use it as a ready portfolio, but keep the god's exact wording, scope, and Landmark Bond clear during play.`,
    gearQuality: `${name} is a gear quality reference. Apply it through a weapon or armor item, then use this entry to interpret the quality's mechanical and fictional effects.`,
    occupation: `${name} is an occupation career package. It exists to make the career grant inspectable as an Item, including resources, attachments, Blessing, Curse, and source page.`,
    power: `${name} is a usable divine or ritual procedure. Check the activation, roll, cost, target, and limitations before resolving it.`,
    relic: `${name} is a divine object. Its level, attunement, bonus, and Fragment use matter as much as the physical object described in the fiction.`,
    truth: `${name} is a divine truth about the god. Treat it as permission for what is always true, plus any active Fragment-powered extension listed in the effect.`,
    vassal: `${name} is a supernatural ally or servant. Use it for favors, tasking, risk, loyalty, Strain, and scene consequences.`,
    weapon: `${name} should be read as damage plus qualities. Use damage for successful attacks and qualities for Boost riders, range, armor interaction, noise, concealment, and reload pressure.`,
    worshipper: `${name} is a mortal support entitlement. It can provide help, but repeated demands and exposed risks should create Strain and story fallout.`
  }[type] ?? `${name} is a source-backed Item. Use its summary, usage, automation metadata, and source page together rather than treating the name alone as the rule.`;
}

function usageText(options, cost) {
  const kind = options.kind ?? "narrative";
  const trigger = options.trigger ? ` Trigger: ${options.trigger}.` : "";
  const target = options.target ? ` Target: ${options.target}.` : "";
  const costText = costSummary(cost);

  return `Usage: ${kind}.${trigger}${target}${costText ? ` Cost: ${costText}.` : ""}`;
}

function automationText(options) {
  if (options.enabled) {
    const action = options.action ? ` Action: ${options.action}.` : "";
    const roll = options.roll ? " Roll metadata is encoded for system dialogs." : "";
    const damage = options.damage ? " Damage metadata is encoded for chat actions." : "";
    const condition = options.condition ? " Condition metadata is encoded for follow-up actions." : "";
    const bonus = options.bonus ? " Bonus metadata is encoded for automation or reminders." : "";
    return `Automation: supported.${action}${roll}${damage}${condition}${bonus}`;
  }

  return "Automation: table-facing reference. The system preserves the rule text and metadata, but the GM or player confirms the exact application in context.";
}

function costSummary(cost) {
  return Object.entries(cost)
    .filter(([, value]) => Number(value) !== 0)
    .map(([key, value]) => `${value} ${costLabel(key, value)}`)
    .join(", ");
}

function costLabel(key, value) {
  const labels = {
    freeTime: "Free Time",
    wealth: "Wealth",
    pantheonDice: Number(value) === 1 ? "Pantheon Die" : "Pantheon Dice",
    fragments: Number(value) === 1 ? "Fragment" : "Fragments",
    health: "Health",
    psyche: "Psyche",
    strain: "Strain"
  };

  return labels[key] ?? labelize(key);
}

function paragraphs(...texts) {
  return texts.filter(text => String(text ?? "").trim()).map(text => paragraph(text)).join("");
}

function truthPlayerText(name, statement, effect, fragmentCost) {
  return paragraphs(
    `${name} is a Truth: the god ${statement}`,
    `At the table, this tells everyone what is always true about the god and what kind of divine action the player can lean on. ${effect}`,
    fragmentCost
      ? "This Truth has an active use that spends 1 Fragment when the player wants the expanded effect."
      : "This Truth is normally always available unless the GM rules the scene blocks or changes how it applies."
  );
}

function relicPlayerText(name, level, bonus, effect, fragmentCost) {
  return paragraphs(
    `${name} is a Level ${level} Relic. It is a divine object, not ordinary gear, so its story role matters as much as its rating.`,
    `Core benefit: ${bonus}. ${effect}`,
    fragmentCost
      ? "If the effect calls for Fragment use, spend the Fragment when activating the stronger or extended Relic effect."
      : "Use the Relic when its benefit fits the scene; any unusual reach, timing, or resistance should be confirmed with the GM."
  );
}

function abilityPlayerText(type, name, sourceName, effect, { pantheonDice = 1 } = {}) {
  if (type === "curse") {
    const rewardText = pantheonDice > 0
      ? `When the Curse creates a real complication, the character gains ${pantheonDice} Pantheon ${pantheonDice === 1 ? "Die" : "Dice"}.`
      : "This Failing is tracked as a persistent weakness; it does not add Pantheon Dice unless another rule or GM call says it does.";

    return paragraphs(
      `${name} is a Curse from ${sourceName}. It is a player-facing trouble hook, not just a penalty line.`,
      `${effect} ${rewardText}`,
      "Use it when the fictional weakness, demand, or bad habit matters in the current scene; the GM and player should make the consequence visible in play."
    );
  }

  return paragraphs(
    `${name} is a Blessing from ${sourceName}. It describes the situation where the character's background, personality, Dominion, or Theology gives them an edge.`,
    effect,
    "Apply the bonus or special rule when the fictional trigger is true. If the timing is unclear, confirm it with the GM before rolling or spending resources."
  );
}

function attachmentPlayerText(type, name, benefit) {
  const label = type === "vassal" ? "Vassal" : "Worshipper";
  return paragraphs(
    `${name} is a ${label} Entitlement. It represents divine support the god can call on, but it can also become a story obligation or risk.`,
    benefit,
    "Use this entry when the god asks for help, invokes the Entitlement's benefit, or when the GM brings its needs and consequences into the scene."
  );
}

function bondPlayerText(name, kind, description) {
  return paragraphs(
    `${name} is a ${kind} Bond that keeps the god connected to mortal life.`,
    description,
    "Use Bonds for favors, emotional grounding, relationship trouble, and Strain. They are story anchors, not just names on the sheet."
  );
}

function bonusText(effect) {
  const match = String(effect ?? "").match(/(?:Gain|Add) \+?\d+[^.]+/i);
  return match?.[0] ?? "";
}

function abilityBonusMetadata(effect) {
  const initiative = Number(String(effect ?? "").match(/\+(\d+)\s+Initiative\b/i)?.[1] ?? 0);
  return initiative > 0 ? { initiative } : null;
}

function paragraph(text) {
  return `<p>${escapeHTML(text)}</p>`;
}

function source(page) {
  return `<p>Source: Part-Time Gods Second Edition, p. ${page}.</p>`;
}

function stripHTML(html) {
  return String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function defaultIcon(type) {
  const icons = {
    attachment: "icons/sundries/documents/document-sealed-blue.webp",
    armor: "icons/equipment/chest/breastplate-layered-steel.webp",
    blessing: "icons/magic/holy/prayer-hands-glowing-yellow.webp",
    bond: "icons/sundries/documents/document-sealed-red.webp",
    condition: "icons/svg/daze.svg",
    curse: "icons/magic/unholy/silhouette-robe-evil-power.webp",
    domain: "icons/magic/symbols/runes-triangle-orange.webp",
    gearQuality: "icons/tools/smithing/anvil-horned-steel.webp",
    occupation: "icons/sundries/documents/document-sealed-tan.webp",
    power: "icons/magic/symbols/runes-star-pentagon-blue.webp",
    relic: "icons/commodities/treasure/token-runed-os-grey.webp",
    truth: "icons/magic/symbols/rune-sigil-black-pink.webp",
    vassal: "icons/creatures/magical/spirit-undead-winged-blue.webp",
    weapon: "icons/weapons/swords/sword-guard.webp",
    worshipper: "icons/environment/people/group.webp"
  };

  return icons[type] ?? "icons/svg/item-bag.svg";
}

function typeName(type) {
  return {
    archetype: "Archetype",
    domain: "Dominion",
    occupation: "Occupation",
    theology: "Theology"
  }[type] ?? labelize(type);
}

function labelize(type) {
  return `${type[0].toUpperCase()}${type.slice(1)}`;
}
