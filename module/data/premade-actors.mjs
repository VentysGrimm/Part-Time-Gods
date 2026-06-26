const SYSTEM_ID = "part-time-gods";

function antagonist(name, category, sourcePage, system) {
  return {
    name,
    type: "antagonist",
    img: "icons/svg/mystery-man.svg",
    system: {
      antagonistType: category,
      rank: system.rank ?? "",
      threat: Number(system.threat ?? 1),
      threshold: Number(system.threshold ?? 1),
      health: Number(system.threshold ?? 1),
      psyche: Number(system.psyche ?? system.threshold ?? 1),
      armor: Number(system.armor ?? 0),
      spark: Number(system.spark ?? 0),
      fragments: Number(system.fragments ?? 0),
      attack: Number(system.attack ?? 1),
      defense: Number(system.defense ?? 1),
      initiative: Number(system.initiative ?? 0),
      damage: Number(system.damage ?? 1),
      skills: system.skills ?? "",
      powers: system.powers ?? "",
      sourcePage,
      description: system.description ?? "",
      notes: system.notes ?? ""
    },
    flags: {
      [SYSTEM_ID]: {
        premade: true,
        kind: "opposition-actor",
        category,
        source: {
          book: "Part-Time Gods Second Edition",
          page: sourcePage
        }
      }
    }
  };
}

export const PTG_PREMADE_ACTORS = [
  antagonist("Large Animal", "Animals", 220, {
    rank: "Master",
    threat: 4,
    threshold: 10,
    armor: 1,
    attack: 8,
    defense: 8,
    initiative: 6,
    damage: 2,
    skills: "Athletics, Fortitude, Might, Perception, Survival (4 dice)",
    powers: "<p><strong>Mount:</strong> Can serve as a mount where appropriate, using its Movement instead of the rider's.</p><p><strong>Strong as an Ox:</strong> Can become enraged when threatened, gaining a Might bonus for the battle.</p><p><strong>Trample:</strong> Can add damage and inflict Unconscious 1 on a Boost.</p>",
    description: "<p>A large mundane threat or potential mount used for mythic-scale animal encounters.</p>"
  }),
  antagonist("The Boss", "Mortals", 222, {
    rank: "Grand Master",
    threat: 5,
    threshold: 20,
    armor: 4,
    attack: 9,
    defense: 15,
    initiative: 5,
    damage: 2,
    skills: "Deception, Discipline, Influence, Intuition, Knowledge, Speed (5 dice)",
    powers: "<p><strong>Always Protected:</strong> Can bring henchmen into a direct fight.</p><p><strong>Listen to Me:</strong> Can drain Free Time instead of dealing damage.</p><p><strong>With the Snap of My Fingers:</strong> Uses wealth, status, and underlings to pressure targets.</p>",
    description: "<p>A politician, executive, crime boss, or other protected mortal power broker.</p>"
  }),
  antagonist("Cultist", "Mortals", 222, {
    rank: "Warrior",
    threat: 3,
    threshold: 9,
    armor: 2,
    attack: 5,
    defense: 5,
    initiative: 5,
    damage: 3,
    skills: "Athletics, Discipline, Fighting, Speed (4 dice)",
    powers: "<p><strong>Belief Keeps Me Safe:</strong> Can resist Manifestations from gods outside their own faith.</p><p><strong>Gift from the God:</strong> Carries or has access to a level 2 Relic.</p>",
    description: "<p>A devoted mortal backed by divine power and dangerous faith.</p>"
  }),
  antagonist("Cherub", "Outsiders", 234, {
    rank: "Warrior",
    threat: 3,
    threshold: 9,
    armor: 1,
    spark: 3,
    fragments: 6,
    attack: 8,
    defense: 6,
    initiative: 4,
    damage: 1,
    skills: "Empathy, Influence, Knowledge, Marksman, Speed, Travel (2 dice)",
    powers: "<p><strong>Arrow of Love:</strong> Can deal damage or spend a Fragment to inflict an In Love 5 Condition.</p><p><strong>Out of Sight:</strong> Can spend a Fragment to become invisible to onlookers.</p>",
    description: "<p>A meddling Outsider whose arrows twist mortal affection into dangerous obsession.</p>"
  }),
  antagonist("Kappa", "Outsiders", 244, {
    rank: "Squad",
    threat: 3,
    threshold: 18,
    armor: 1,
    spark: 2,
    fragments: 4,
    attack: 4,
    defense: 3,
    initiative: 5,
    damage: 2,
    skills: "Deception, Fighting, Knowledge, Medicine, Speed (2 dice)",
    powers: "<p><strong>Amphibious:</strong> Gains Attack and Defense bonuses while fighting in water or while its head bowl remains full.</p><p><strong>Eat Anything:</strong> Can heal Threshold by consuming available material.</p><p><strong>Who Smelt It:</strong> Can release a noxious battle effect when threatened.</p>",
    description: "<p>A small water-dwelling Outsider commonly encountered in groups.</p>"
  })
];
