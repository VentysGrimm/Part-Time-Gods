/**
 * Part-Time Gods 2e
 * Manifestation Configuration
 * Foundry VTT v14
 */

export const PTG_MANIFESTATIONS = {
  aegis: {
    id: "aegis",
    label: "PTG.Manifestation.Aegis",
    description: "Protection, wards, cleansing, and warning effects.",
    icon: "icons/magic/defensive/shield-barrier-glowing-blue.webp",
    specialties: [
      "protectionField",
      "purge",
      "warning"
    ]
  },

  beckon: {
    id: "beckon",
    label: "PTG.Manifestation.Beckon",
    description: "Summoning, multiplication, and banishment.",
    icon: "icons/magic/symbols/runes-star-pentagon-blue.webp",
    specialties: [
      "banish",
      "multiply",
      "summon"
    ]
  },

  journey: {
    id: "journey",
    label: "PTG.Manifestation.Journey",
    description: "Movement, teleportation, and phasing.",
    icon: "icons/magic/movement/trail-streak-zigzag-teal.webp",
    specialties: [
      "blink",
      "phasing",
      "swift"
    ]
  },

  minion: {
    id: "minion",
    label: "PTG.Manifestation.Minion",
    description: "Empowering followers, enchantments, and creating servants.",
    icon: "icons/creatures/magical/spirit-undead-winged-blue.webp",
    specialties: [
      "bestow",
      "enchant",
      "instillLife"
    ]
  },

  oracle: {
    id: "oracle",
    label: "PTG.Manifestation.Oracle",
    description: "Divination, perception, and foresight.",
    icon: "icons/magic/perception/eye-ringed-glow-angry-large-teal.webp",
    specialties: [
      "areaSense",
      "readMinds",
      "temporalView"
    ]
  },

  puppetry: {
    id: "puppetry",
    label: "PTG.Manifestation.Puppetry",
    description: "Control, manipulation, and possession.",
    icon: "icons/magic/control/energy-stream-link-blue.webp",
    specialties: [
      "manipulation",
      "marionette",
      "transfer"
    ]
  },

  ruin: {
    id: "ruin",
    label: "PTG.Manifestation.Ruin",
    description: "Destruction, curses, and divine warfare.",
    icon: "icons/magic/fire/explosion-fireball-large-orange.webp",
    specialties: [
      "blast",
      "geas",
      "warrior"
    ]
  },

  shaping: {
    id: "shaping",
    label: "PTG.Manifestation.Shaping",
    description: "Transformation and environmental alteration.",
    icon: "icons/magic/earth/orb-stone-smoke-teal.webp",
    specialties: [
      "ambience",
      "transmutation",
      "vessel"
    ]
  },

  soul: {
    id: "soul",
    label: "PTG.Manifestation.Soul",
    description: "Spirits, memories, and identity.",
    icon: "icons/magic/death/spirit-skull-glowing-blue.webp",
    specialties: [
      "callSpirit",
      "figments",
      "redefine"
    ]
  }
};

/**
 * Ordered list used by sheets and character creation.
 */
export const PTG_MANIFESTATION_LIST = Object.keys(PTG_MANIFESTATIONS);

/**
 * Manifestation specialties.
 */
export const PTG_MANIFESTATION_SPECIALTIES = {
  protectionField: "Protection Field",
  purge: "Purge",
  warning: "Warning",

  banish: "Banish",
  multiply: "Multiply",
  summon: "Summon",

  blink: "Blink",
  phasing: "Phasing",
  swift: "Swift",

  bestow: "Bestow",
  enchant: "Enchant",
  instillLife: "Instill Life",

  areaSense: "Area Sense",
  readMinds: "Read Minds",
  temporalView: "Temporal View",

  manipulation: "Manipulation",
  marionette: "Marionette",
  transfer: "Transfer",

  blast: "Blast",
  geas: "Geas",
  warrior: "Warrior",

  ambience: "Ambience",
  transmutation: "Transmutation",
  vessel: "Vessel",

  callSpirit: "Call Spirit",
  figments: "Figments",
  redefine: "Redefine"
};

/**
 * Default actor manifestation structure.
 */
export function createManifestationData() {
  return {
    aegis: { value: 0, specialty: "" },
    beckon: { value: 0, specialty: "" },
    journey: { value: 0, specialty: "" },
    minion: { value: 0, specialty: "" },
    oracle: { value: 0, specialty: "" },
    puppetry: { value: 0, specialty: "" },
    ruin: { value: 0, specialty: "" },
    shaping: { value: 0, specialty: "" },
    soul: { value: 0, specialty: "" }
  };
}