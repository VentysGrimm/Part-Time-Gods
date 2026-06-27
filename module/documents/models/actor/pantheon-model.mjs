const fields = foundry.data.fields;

export class PTGPantheonData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      pantheonPool: new fields.SchemaField({
        value: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
        max: new fields.NumberField({ integer: true, min: 0, initial: 10 })
      }),
      territory: new fields.StringField({ initial: "" }),
      territorySceneUuid: new fields.StringField({ initial: "" }),
      influence: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
      members: new fields.ArrayField(new fields.ObjectField({ initial: {} }), { initial: [] }),
      sharedWorshippers: new fields.StringField({ initial: "" }),
      goals: new fields.HTMLField({ initial: "" }),
      enemies: new fields.HTMLField({ initial: "" }),
      obligations: new fields.HTMLField({ initial: "" }),
      storyHooks: new fields.HTMLField({ initial: "" }),
      trouble: new fields.HTMLField({ initial: "" }),
      notes: new fields.HTMLField({ initial: "" })
    };
  }
}
