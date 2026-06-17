/**
 * PTG2E Theology Configuration
 * module/config/theologies.mjs
 */

export const PTG2E_THEOLOGIES = {
  ascendants: {
    label: "Ascendants",
    otherNames: ["Exaltants", "True Gods", "Inhumans"],
    stereotype: ["Holier-than-thou", "Snobbish", "Deluded"],

    skills: {
      athletics: 1,
      fighting: 1,
      fortitude: 1,
      might: 1,
      survival: 1
    },

    manifestations: {
      minion: 1,
      ruin: 1,
      shaping: 2
    },

    freeTime: 2,
    wealth: 1,

    blessing: "Inhuman Visage",
    curse: "Cut Off from the World"
  },

  saints: {
    label: "Cult of the Saints",
    otherNames: ["Saints", "Nutjobs", "Messengers"],
    stereotype: ["Zealous", "Spiritual", "Protective"],

    skills: {
      discipline: 1,
      empathy: 1,
      intuition: 1,
      perception: 1,
      survival: 1
    },

    manifestations: {
      beckon: 1,
      oracle: 2,
      soul: 1
    },

    freeTime: 2,
    wealth: 1,

    blessing: "Divine Guidance",
    curse: "Voice of God"
  },

  driftingKingdoms: {
    label: "Drifting Kingdoms",
    otherNames: ["Wanderers", "Missionaries", "Flip-Floppers"],
    stereotype: ["Nomadic", "Wayward", "Infuriating"],

    skills: {
      crafts: 1,
      fortitude: 1,
      marksman: 1,
      medicine: 1,
      travel: 1
    },

    manifestations: {
      aegis: 1,
      journey: 2,
      shaping: 1
    },

    freeTime: 3,
    wealth: 0,

    blessing: "Instant Domain",
    curse: "Never Stay Long"
  },

  kunitsukami: {
    label: "Kunitsukami",
    otherNames: ["Kami", "Traditionalists"],
    stereotype: ["Respectful", "Spiritual", "Hierarchical"],

    skills: {
      discipline: 1,
      intuition: 1,
      knowledge: 1,
      perception: 1,
      travel: 1
    },

    manifestations: {
      beckon: 1,
      oracle: 1,
      soul: 2
    },

    freeTime: 2,
    wealth: 1,

    blessing: "Hierarchy of Spirits",
    curse: "Bound by Tradition"
  },

  masksOfJana: {
    label: "Masks of Jana",
    otherNames: ["Masks", "Veils", "The Obscure"],
    stereotype: ["Mysterious", "Secretive", "Cowards"],

    skills: {
      deception: 1,
      knowledge: 1,
      speed: 1,
      stealth: 1,
      survival: 1
    },

    manifestations: {
      aegis: 1,
      beckon: 2,
      shaping: 1
    },

    freeTime: 1,
    wealth: 2,

    blessing: "Hidden Among Mortals",
    curse: "Keeper of Secrets"
  },

  meskhenet: {
    label: "Order of Meskhenet",
    otherNames: ["Keepers", "Bloodlines", "Traditionalists"],
    stereotype: ["Proud", "Traditional", "Judgmental"],

    skills: {
      discipline: 1,
      empathy: 1,
      fortitude: 1,
      knowledge: 1,
      medicine: 1
    },

    manifestations: {
      oracle: 1,
      shaping: 1,
      soul: 2
    },

    freeTime: 1,
    wealth: 2,

    blessing: "Pure Spark",
    curse: "Lineage Bound"
  },

  phoenixSociety: {
    label: "Phoenix Society",
    otherNames: ["Phoenixes", "Birdies", "Mortal Lovers"],
    stereotype: ["Partiers", "Protective", "Cunning"],

    skills: {
      athletics: 1,
      empathy: 1,
      perform: 1,
      stealth: 1,
      tech: 1
    },

    manifestations: {
      aegis: 2,
      oracle: 1,
      ruin: 1
    },

    freeTime: 2,
    wealth: 1,

    blessing: "Linked to Humanity",
    curse: "Intimacy Addiction"
  },

  puckEaters: {
    label: "Puck-Eaters",
    otherNames: ["Hunters", "Cannibals", "Predators"],
    stereotype: ["Savage", "Pragmatic", "Dangerous"],

    skills: {
      athletics: 1,
      deception: 1,
      fighting: 1,
      influence: 1,
      travel: 1
    },

    manifestations: {
      journey: 1,
      minion: 1,
      ruin: 2
    },

    freeTime: 2,
    wealth: 1,

    blessing: "Cannibal Behavior",
    curse: "Unceasing Appetite"
  },

  warlocksFate: {
    label: "Warlock's Fate",
    otherNames: ["Warlocks", "Wizards", "Conjurers"],
    stereotype: ["Analytical", "Obsessed", "Know-it-alls"],

    skills: {
      crafts: 1,
      empathy: 1,
      influence: 1,
      knowledge: 1,
      perception: 1
    },

    manifestations: {
      beckon: 1,
      journey: 1,
      puppetry: 2
    },

    freeTime: 1,
    wealth: 2,

    blessing: "Web of Connections",
    curse: "Compulsive Meddling"
  }
};

export const PTG2E_THEOLOGY_CHOICES = Object.entries(
  PTG2E_THEOLOGIES
).reduce((obj, [key, value]) => {
  obj[key] = value.label;
  return obj;
}, {});