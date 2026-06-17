export class PartTimeGodsCharacter extends foundry.abstract.DataModel {

  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      stats: new fields.SchemaField({
        might: new fields.NumberField({ initial: 0 }),
        agility: new fields.NumberField({ initial: 0 }),
        wits: new fields.NumberField({ initial: 0 }),
        resolve: new fields.NumberField({ initial: 0 })
      }),

      divinity: new fields.NumberField({ initial: 0 }),
      surge: new fields.NumberField({ initial: 0 })
    };
  }
}