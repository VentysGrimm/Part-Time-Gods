const fields = foundry.data.fields;

export class PTGAntagonistData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      threat: new fields.NumberField({ integer: true, min: 1, initial: 1 }),
      health: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      psyche: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      initiative: new fields.NumberField({ integer: true, initial: 1 }),
      damage: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      description: new fields.HTMLField({ initial: "" })
    };
  }
}
