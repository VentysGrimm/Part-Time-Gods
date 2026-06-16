const fields = foundry.data.fields;

export class TruthDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      name: new fields.StringField({ required: true, initial: "New Truth" }),
      description: new fields.StringField({ initial: "" }),
      rating: new fields.NumberField({ required: true, integer: true, min: 1, max: 5, initial: 1 }),
      triggers: new fields.ArrayField(new fields.StringField({ initial: "" }), { initial: [] }),
      effects: new fields.ArrayField(new fields.ObjectField({ initial: {} }), { initial: [] }),
      active: new fields.BooleanField({ initial: true }),
      gmNotes: new fields.StringField({ initial: "" }),
      tags: new fields.ArrayField(new fields.StringField({ initial: "" }), { initial: [] })
    };
  }

  isActive() {
    return this.active === true;
  }
}
