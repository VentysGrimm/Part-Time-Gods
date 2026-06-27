/**
 * Part-Time Gods 2E - Relics Configuration
 * Foundry VTT v14
 */

export const PTG_RELICS = {
  level1: {
    chaliceOfAttraction: {
      id: "chaliceOfAttraction",
      name: "Chalice of Attraction",
      level: 1,
      category: "utility",
      fragmentCost: 1,
      description:
        "A divine vessel that enhances charm, attraction, and social influence.",
      effects: {
        skillBonuses: {
          influence: 2
        }
      }
    },

    obscuringCigar: {
      id: "obscuringCigar",
      name: "Obscuring Cigar",
      level: 1,
      category: "stealth",
      fragmentCost: 1,
      description:
        "Produces supernatural smoke that conceals the bearer and nearby allies.",
      effects: {
        skillBonuses: {
          stealth: 2
        }
      }
    },

    skeletonKey: {
      id: "skeletonKey",
      name: "Skeleton Key",
      level: 1,
      category: "utility",
      fragmentCost: 1,
      description:
        "A key capable of opening almost any mundane lock and many mystical barriers.",
      effects: {
        skillBonuses: {
          tech: 2
        }
      }
    },

    yourStory: {
      id: "yourStory",
      name: "Your Story",
      level: 1,
      category: "custom",
      fragmentCost: 0,
      description:
        "A placeholder relic representing a unique relic created by the player."
    }
  },

  level2: {
    blessedWhetstone: {
      id: "blessedWhetstone",
      name: "Blessed Whetstone",
      level: 2,
      category: "weapon",
      fragmentCost: 1,
      description:
        "Temporarily enhances weapons with divine sharpness.",
      effects: {
        damageBonus: 2
      }
    },

    fortunesFavor: {
      id: "fortunesFavor",
      name: "Fortune's Favor",
      level: 2,
      category: "luck",
      fragmentCost: 1,
      description:
        "A relic of impossible fortune that bends fate in the owner's favor.",
      effects: {
        boostReduction: 1
      }
    },

    mirroredShield: {
      id: "mirroredShield",
      name: "Mirrored Shield",
      level: 2,
      category: "defense",
      fragmentCost: 1,
      description:
        "Reflects hostile divine effects back upon their source.",
      effects: {
        resistanceBonus: 2
      }
    },

    stormBowl: {
      id: "stormBowl",
      name: "Storm Bowl",
      level: 2,
      category: "elemental",
      fragmentCost: 2,
      description:
        "Manipulates weather, storms, rain, and natural disasters."
    }
  },

  level3: {
    cloakOfInvisibility: {
      id: "cloakOfInvisibility",
      name: "Cloak of Invisibility",
      level: 3,
      category: "stealth",
      fragmentCost: 1,
      description:
        "Turns the wearer invisible until they enter combat."
    },

    mercurysBoots: {
      id: "mercurysBoots",
      name: "Mercury's Boots",
      level: 3,
      category: "movement",
      fragmentCost: 1,
      description:
        "Winged footwear that grants flight and supernatural mobility.",
      effects: {
        movementBonus: 5
      }
    },

    scarabOfEternity: {
      id: "scarabOfEternity",
      name: "Scarab of Eternity",
      level: 3,
      category: "survival",
      fragmentCost: 0,
      description:
        "Destroyed instead of allowing the owner to suffer permanent divine loss."
    },

    whisperingRings: {
      id: "whisperingRings",
      name: "Whispering Rings",
      level: 3,
      category: "communication",
      fragmentCost: 1,
      description:
        "Creates a telepathic bond between two attuned wearers."
    }
  },

  level4: {
    ancientTimepiece: {
      id: "ancientTimepiece",
      name: "Ancient Timepiece",
      level: 4,
      category: "time",
      fragmentCost: 1,
      description:
        "A relic tied to the flow of time and temporal manipulation."
    },

    metalwoodBat: {
      id: "metalwoodBat",
      name: "Metalwood Bat",
      level: 4,
      category: "weapon",
      fragmentCost: 1,
      description:
        "A devastating relic weapon forged from impossible materials.",
      effects: {
        damageBonus: 3
      }
    },

    tempestTrident: {
      id: "tempestTrident",
      name: "Tempest Trident",
      level: 4,
      category: "weapon",
      fragmentCost: 1,
      description:
        "Controls water and storms while serving as a potent divine weapon.",
      effects: {
        damageBonus: 3,
        manifestationBonus: {
          beckon: 2
        }
      }
    }
  },

  level5: {
    eternalCoffin: {
      id: "eternalCoffin",
      name: "Eternal Coffin",
      level: 5,
      category: "death",
      fragmentCost: 1,
      description:
        "Preserves life, suspends aging, and can consume souls to extend existence."
    },

    illWind: {
      id: "illWind",
      name: "The Ill Wind",
      level: 5,
      category: "weapon",
      fragmentCost: 1,
      description:
        "A legendary divine rifle that never truly misses.",
      effects: {
        skillBonuses: {
          marksman: 2
        },
        damageBonus: 4,
        grantedTruth: "Divinely Skilled (Marksman)"
      }
    },

    maelstromArmor: {
      id: "maelstromArmor",
      name: "Maelstrom Armor",
      level: 5,
      category: "armor",
      fragmentCost: 1,
      description:
        "Ancient battle armor used in the God Wars.",
      effects: {
        armor: 2,
        resistanceBonus: 2,
        influenceBonus: 4
      }
    }
  }
};

/**
 * Relic construction options used by custom relic builder.
 */
export const PTG_RELIC_FEATURES = {
  armorWeapon: {
    cost: 1,
    label: "Armor / Weapon"
  },

  boostReduction: {
    cost: 2,
    label: "Boost Reduction"
  },

  extraDamage: {
    costPerRank: 1,
    max: 5
  },

  fragmentStorage: {
    costPerRank: 1,
    max: 5
  },

  manifestationBonus: {
    costPerRank: 1,
    max: 5
  },

  resistanceField: {
    costPerRank: 1,
    max: 5
  },

  skillBonus: {
    costPerRank: 1,
    max: 5
  },

  summonable: {
    cost: 1
  },

  unique: {
    costMin: 1,
    costMax: 5
  }
};

export default PTG_RELICS;