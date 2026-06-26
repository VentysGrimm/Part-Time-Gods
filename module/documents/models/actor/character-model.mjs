const fields = foundry.data.fields;

export class PTGCharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      identity: new fields.SchemaField({
        concept: new fields.StringField({ initial: "" }),
        ageEthnicity: new fields.StringField({ initial: "" }),
        occupation: new fields.StringField({ initial: "" }),
        archetype: new fields.StringField({ initial: "" }),
        dominion: new fields.StringField({ initial: "" }),
        dominionTitle: new fields.StringField({ initial: "" }),
        dominionPortfolio: new fields.StringField({ initial: "" }),
        dominionSpecificity: new fields.StringField({ initial: "specific" }),
        dominionLimitations: new fields.StringField({ initial: "" }),
        dominionLandmarkBondUuid: new fields.StringField({ initial: "" }),
        dominionLandmarkBondName: new fields.StringField({ initial: "" }),
        theology: new fields.StringField({ initial: "" })
      }),

      resources: new fields.SchemaField({
        health: resourceField(10),
        psyche: resourceField(10),
        fragments: resourceField(0),
        pantheon: resourceField(0),
        spark: new fields.NumberField({ integer: true, min: 1, initial: 1 }),
        freeTime: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        freeTimeMax: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        wealth: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        wealthMax: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        occupationFreeTime: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        occupationWealth: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        legendaryActs: new fields.StringField({ initial: "" }),
        xpGained: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        xpSpent: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        xpPurchases: new fields.ArrayField(new fields.ObjectField({ initial: {} }), { initial: [] })
      }),

      derived: new fields.SchemaField({
        initiative: new fields.NumberField({ integer: true, initial: 0 }),
        strength: new fields.NumberField({ integer: true, initial: 1 }),
        movement: new fields.NumberField({ integer: true, initial: 1 }),
        armor: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        carriedWeight: new fields.NumberField({ min: 0, initial: 0 })
      }),

      skills: new fields.SchemaField(Object.fromEntries(
        Object.keys(CONFIG?.PTG?.skills ?? FALLBACK_SKILLS).map(key => [key, ratingField()])
      )),

      manifestations: new fields.SchemaField(Object.fromEntries(
        Object.keys(CONFIG?.PTG?.manifestations ?? FALLBACK_MANIFESTATIONS).map(key => [key, ratingField()])
      )),

      attachments: new fields.SchemaField({
        bonds: new fields.StringField({ initial: "" }),
        failings: new fields.StringField({ initial: "" }),
        relics: new fields.StringField({ initial: "" }),
        truths: new fields.StringField({ initial: "" }),
        vassals: new fields.StringField({ initial: "" }),
        worshippers: new fields.StringField({ initial: "" }),
        blessings: new fields.StringField({ initial: "" }),
        curses: new fields.StringField({ initial: "" })
      }),

      conditions: new fields.StringField({ initial: "" }),
      specialties: new fields.StringField({ initial: "" }),
      notes: new fields.HTMLField({ initial: "" })
    };
  }
}

function ratingField() {
  return new fields.NumberField({ integer: true, min: 0, initial: 0 });
}

function resourceField(initial) {
  return new fields.SchemaField({
    value: new fields.NumberField({ integer: true, min: 0, initial }),
    max: new fields.NumberField({ integer: true, min: 0, initial })
  });
}

const FALLBACK_SKILLS = {
  athletics: "Athletics",
  crafts: "Crafts",
  deception: "Deception",
  discipline: "Discipline",
  empathy: "Empathy",
  fighting: "Fighting",
  fortitude: "Fortitude",
  influence: "Influence",
  intuition: "Intuition",
  knowledge: "Knowledge",
  marksman: "Marksman",
  medicine: "Medicine",
  might: "Might",
  perception: "Perception",
  perform: "Perform",
  speed: "Speed",
  stealth: "Stealth",
  survival: "Survival",
  tech: "Tech",
  travel: "Travel"
};

const FALLBACK_MANIFESTATIONS = {
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
