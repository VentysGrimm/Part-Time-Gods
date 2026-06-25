const fields = foundry.data.fields;

export class PTGAntagonistData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      antagonistType: new fields.StringField({ initial: "" }),
      rank: new fields.StringField({ initial: "" }),
      threat: new fields.NumberField({ integer: true, min: 1, initial: 1 }),
      threshold: new fields.NumberField({ integer: true, min: 0, initial: 5 }),
      health: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      psyche: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      armor: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
      spark: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
      fragments: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
      attack: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      defense: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      initiative: new fields.NumberField({ integer: true, initial: 1 }),
      damage: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      skills: new fields.StringField({ initial: "" }),
      powers: new fields.HTMLField({ initial: "" }),
      sourcePage: new fields.NumberField({ integer: true, min: 0, nullable: true, initial: null }),
      description: new fields.HTMLField({ initial: "" }),
      notes: new fields.HTMLField({ initial: "" })
    };
  }
}
