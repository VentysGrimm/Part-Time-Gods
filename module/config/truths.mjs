// module/config/truths.mjs

export const PTG_TRUTHS = {
  aquatic: {
    id: "aquatic",
    name: "Aquatic",
    type: "passive",
    statement: "…is one with the sea.",
    cost: 2,
    category: "environmental",
    fragmentCost: 0,
    description:
      "The god can breathe underwater and gains a +2 bonus to checks while operating within a body of water."
  },

  armored: {
    id: "armored",
    name: "Armored",
    type: "passive",
    statement: "…is tougher than they appear.",
    cost: 2,
    category: "defensive",
    fragmentCost: 0,
    description:
      "Choose a damage source. Gain protection against that source."
  },

  bane: {
    id: "bane",
    name: "Bane",
    type: "passive",
    statement: "…is the enemy of...",
    cost: 2,
    category: "offensive",
    fragmentCost: 0,
    description:
      "The god is exceptionally effective against a chosen creature, group, or target."
  },

  beastForm: {
    id: "beastForm",
    name: "Beast Form",
    type: "active",
    statement: "…can walk in their paws.",
    cost: 2,
    category: "transformation",
    fragmentCost: 1,
    description:
      "Transform into a chosen animal form."
  },

  beastTongue: {
    id: "beastTongue",
    name: "Beast Tongue",
    type: "passive",
    statement: "…can speak with animals.",
    cost: 2,
    category: "social",
    fragmentCost: 0,
    description:
      "Communicate freely with animals."
  },

  colossalSize: {
    id: "colossalSize",
    name: "Colossal Size",
    type: "active",
    statement: "…grows beyond mortal proportions.",
    cost: 2,
    category: "transformation",
    fragmentCost: 1,
    description:
      "Increase physical size and presence dramatically."
  },

  divinelySkilled: {
    id: "divinelySkilled",
    name: "Divinely Skilled",
    type: "passive",
    statement: "…never fails at...",
    cost: 2,
    category: "skill",
    fragmentCost: 0,
    description:
      "Choose a Specialty. Gain +1 and treat failures as 1 success when using that Specialty."
  },

  extraAppendages: {
    id: "extraAppendages",
    name: "Extra Appendages",
    type: "active",
    statement: "…has been gifted with additional...",
    cost: 2,
    category: "transformation",
    fragmentCost: 1,
    description:
      "Grow additional arms, legs, or a head."
  },

  firstMove: {
    id: "firstMove",
    name: "First Move",
    type: "active",
    statement: "…is always a step ahead.",
    cost: 2,
    category: "combat",
    fragmentCost: 1,
    description:
      "Gain initiative advantages and act before others."
  },

  flight: {
    id: "flight",
    name: "Flight",
    type: "active",
    statement: "…can fly among the clouds.",
    cost: 2,
    category: "movement",
    fragmentCost: 1,
    description:
      "Fly at twice normal Movement."
  },

  healingHands: {
    id: "healingHands",
    name: "Healing Hands",
    type: "active",
    statement: "…can heal with a touch.",
    cost: 2,
    category: "healing",
    fragmentCost: 1,
    description:
      "Heal Health, Psyche, or Conditions through touch."
  },

  immunity: {
    id: "immunity",
    name: "Immunity",
    type: "passive",
    statement: "…can't be harmed by...",
    cost: 2,
    category: "defensive",
    fragmentCost: 0,
    description:
      "Choose an effect. The god is completely immune to it."
  },

  lash: {
    id: "lash",
    name: "Lash",
    type: "active",
    statement: "…can harm you with a stare.",
    cost: 2,
    category: "offensive",
    fragmentCost: 1,
    description:
      "Attack a target at range with divine force."
  },

  naturalWeapons: {
    id: "naturalWeapons",
    name: "Natural Weapons",
    type: "passive",
    statement: "…is never unarmed.",
    cost: 2,
    category: "combat",
    fragmentCost: 0,
    description:
      "Gain claws, horns, fangs, or other natural weapons."
  },

  otherworldlySight: {
    id: "otherworldlySight",
    name: "Otherworldly Sight",
    type: "active",
    statement: "…cannot be fooled by illusions.",
    cost: 2,
    category: "perception",
    fragmentCost: 1,
    description:
      "See ghosts, Outsiders, Source energies, and pierce illusions."
  },

  regeneration: {
    id: "regeneration",
    name: "Regeneration",
    type: "passive",
    statement: "…heals from any wound.",
    cost: 2,
    category: "healing",
    fragmentCost: 0,
    description:
      "Recover from injuries faster than mortals."
  },

  soothingAura: {
    id: "soothingAura",
    name: "Soothing Aura",
    type: "passive",
    statement: "…brings peace to those nearby.",
    cost: 2,
    category: "social",
    fragmentCost: 0,
    description:
      "Calm emotions and reduce hostility."
  },

  tongues: {
    id: "tongues",
    name: "Tongues",
    type: "passive",
    statement: "…speaks every language.",
    cost: 2,
    category: "social",
    fragmentCost: 0,
    description:
      "Understand and communicate in any spoken language."
  },

  unobscuredEyes: {
    id: "unobscuredEyes",
    name: "Unobscured Eyes",
    type: "passive",
    statement: "…cannot be blinded.",
    cost: 2,
    category: "perception",
    fragmentCost: 0,
    description:
      "Ignore blindness and sight-related penalties."
  },

  visions: {
    id: "visions",
    name: "Visions",
    type: "passive",
    statement: "…is visited by prophecy in the night.",
    cost: 2,
    category: "divination",
    fragmentCost: 0,
    description:
      "Receive prophetic dreams and glimpses of possible futures."
  }
};

export const TRUTH_TYPES = {
  PASSIVE: "passive",
  ACTIVE: "active"
};

export const TRUTH_CATEGORIES = {
  COMBAT: "combat",
  DEFENSIVE: "defensive",
  DIVINATION: "divination",
  ENVIRONMENTAL: "environmental",
  HEALING: "healing",
  MOVEMENT: "movement",
  OFFENSIVE: "offensive",
  PERCEPTION: "perception",
  SKILL: "skill",
  SOCIAL: "social",
  TRANSFORMATION: "transformation"
};

export function getTruth(id) {
  return PTG_TRUTHS[id] ?? null;
}

export function getAllTruths() {
  return Object.values(PTG_TRUTHS);
}