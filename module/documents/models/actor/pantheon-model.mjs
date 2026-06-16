const fields = foundry.data.fields;

export class PTGPantheonData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      pantheonPool: new fields.SchemaField({
        value: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        max: new fields.NumberField({ integer: true, min: 0, initial: 0 })
      }),
      territory: new fields.StringField({ initial: "" }),
      influence: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
      notes: new fields.HTMLField({ initial: "" })
    };
  }
}
