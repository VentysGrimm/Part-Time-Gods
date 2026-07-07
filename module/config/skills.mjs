/**
 * Part-Time Gods 2E
 * Skill Configuration
 * Foundry VTT v14
 */

export const PTG_SKILL_SOURCE = {
  book: "Part-Time Gods Second Edition",
  chapter: 4,
  pages: "177-182",
  table: "Skill-Combo System",
  specialtyLimit: 2
};

export const PTG_SPECIALTY_LIMIT = 2;

export const PTG_SKILLS = {
  athletics: {
    label: "Athletics",
    abbreviation: "ATH",
    characteristic: "physical",
    specialties: ["Climbing", "Running", "Parkour"]
  },

  crafts: {
    label: "Crafts",
    abbreviation: "CRF",
    characteristic: "technical",
    specialties: ["Weapons", "Food", "Clothing"]
  },

  deception: {
    label: "Deception",
    abbreviation: "DEC",
    characteristic: "social",
    specialties: ["Misdirection", "Exaggeration", "Bluffing"]
  },

  discipline: {
    label: "Discipline",
    abbreviation: "DIS",
    characteristic: "mental",
    specialties: ["Meditation", "Resist Pain", "Calmness"]
  },

  empathy: {
    label: "Empathy",
    abbreviation: "EMP",
    characteristic: "social",
    specialties: ["Hiding Emotion", "Anecdotes", "Discerning Truth"]
  },

  fighting: {
    label: "Fighting",
    abbreviation: "FIG",
    characteristic: "combat",
    specialties: ["Wrestling", "Swords", "Blocking"]
  },

  fortitude: {
    label: "Fortitude",
    abbreviation: "FOR",
    characteristic: "physical",
    specialties: ["Iron Stomach", "Illness", "Poison"]
  },

  influence: {
    label: "Influence",
    abbreviation: "INF",
    characteristic: "social",
    specialties: ["Seduce", "Intimidate", "Negotiating"]
  },

  intuition: {
    label: "Intuition",
    abbreviation: "INT",
    characteristic: "mental",
    specialties: ["Chance", "Motivations", "Directions"]
  },

  knowledge: {
    label: "Knowledge",
    abbreviation: "KNO",
    characteristic: "mental",
    specialties: ["History", "Physics", "Literature"]
  },

  marksman: {
    label: "Marksman",
    abbreviation: "MRK",
    characteristic: "combat",
    specialties: ["Guns", "Bows", "Throwing Knives"]
  },

  medicine: {
    label: "Medicine",
    abbreviation: "MED",
    characteristic: "technical",
    specialties: ["Childbirth", "Natural Remedies", "Trauma"]
  },

  might: {
    label: "Might",
    abbreviation: "MIG",
    characteristic: "physical",
    specialties: ["Grappling", "Lifting", "Throwing"]
  },

  perception: {
    label: "Perception",
    abbreviation: "PER",
    characteristic: "mental",
    specialties: ["Specific Sense", "Search", "Appraising"]
  },

  perform: {
    label: "Perform",
    abbreviation: "PRF",
    characteristic: "social",
    specialties: ["Dancing", "Public Speaking", "Singing"]
  },

  speed: {
    label: "Speed",
    abbreviation: "SPD",
    characteristic: "physical",
    specialties: ["Climbing", "Catching", "Dodging"]
  },

  stealth: {
    label: "Stealth",
    abbreviation: "STL",
    characteristic: "physical",
    specialties: ["Sleight-of-Hand", "Sneaking", "Shadowing"]
  },

  survival: {
    label: "Survival",
    abbreviation: "SUR",
    characteristic: "technical",
    specialties: ["Foraging", "Tracking", "Specific Terrain"]
  },

  tech: {
    label: "Tech",
    abbreviation: "TEC",
    characteristic: "technical",
    specialties: ["Computers", "Hacking", "Programming"]
  },

  travel: {
    label: "Travel",
    abbreviation: "TRV",
    characteristic: "technical",
    specialties: ["Defensive Driving", "Cartography", "Local Customs"]
  }
};

export const PTG_SKILL_KEYS = Object.keys(PTG_SKILLS);

export const PTG_SKILL_CHOICES = Object.fromEntries(
  Object.entries(PTG_SKILLS).map(([key, skill]) => [key, skill.label])
);
