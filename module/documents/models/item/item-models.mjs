const fields = foundry.data.fields;

class PTGBaseItemData extends foundry.abstract.TypeDataModel {
  static textField() {
    return new fields.StringField({ initial: "" });
  }

  static htmlField() {
    return new fields.HTMLField({ initial: "" });
  }

  static numberField(initial = 0, min = 0) {
    return new fields.NumberField({ integer: true, min, initial });
  }

  static checkbox(initial = false) {
    return new fields.BooleanField({ initial });
  }

  static grantsField() {
    return new fields.SchemaField({
      skills: new fields.ObjectField({ initial: {} }),
      manifestations: new fields.ObjectField({ initial: {} }),
      resources: new fields.ObjectField({ initial: {} }),
      attachments: new fields.ObjectField({ initial: {} }),
      blessing: this.textField(),
      curse: this.textField()
    });
  }
}

export class PTGDomainData extends PTGBaseItemData {
  static defineSchema() {
    return {
      category: this.textField(),
      rank: this.numberField(),
      portfolio: this.textField(),
      sphere: this.textField(),
      manifestations: this.textField(),
      grants: this.grantsField(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGOccupationData extends PTGBaseItemData {
  static defineSchema() {
    return {
      category: this.textField(),
      career: this.textField(),
      grants: this.grantsField(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGArchetypeData extends PTGBaseItemData {
  static defineSchema() {
    return {
      definingTrait: this.textField(),
      grants: this.grantsField(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGTheologyData extends PTGBaseItemData {
  static defineSchema() {
    return {
      otherNames: this.textField(),
      stereotype: this.textField(),
      grants: this.grantsField(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGPowerData extends PTGBaseItemData {
  static defineSchema() {
    return {
      domain: this.textField(),
      manifestation: this.textField(),
      rank: this.numberField(),
      cost: this.numberField(),
      activation: this.textField(),
      duration: this.textField(),
      range: this.textField(),
      target: this.textField(),
      requiresRoll: this.checkbox(),
      difficulty: this.numberField(1),
      effect: this.htmlField(),
      limitations: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGBondData extends PTGBaseItemData {
  static defineSchema() {
    return {
      kind: this.textField(),
      level: this.numberField(1),
      strain: new fields.SchemaField({
        value: this.numberField(),
        max: this.numberField()
      }),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGTruthData extends PTGBaseItemData {
  static defineSchema() {
    return {
      statement: this.textField(),
      rank: this.numberField(1),
      cost: this.numberField(),
      fragmentCost: this.numberField(),
      activation: this.textField(),
      effect: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGRelicData extends PTGBaseItemData {
  static defineSchema() {
    return {
      level: this.numberField(1),
      cost: this.numberField(),
      bonus: this.textField(),
      effect: this.htmlField(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGWorshipperData extends PTGBaseItemData {
  static defineSchema() {
    return {
      level: this.numberField(1),
      group: this.textField(),
      size: this.textField(),
      benefit: this.htmlField(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGVassalData extends PTGBaseItemData {
  static defineSchema() {
    return {
      level: this.numberField(1),
      concept: this.textField(),
      loyalty: this.numberField(),
      benefit: this.htmlField(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGBlessingData extends PTGBaseItemData {
  static defineSchema() {
    return {
      source: this.textField(),
      trigger: this.textField(),
      bonus: this.textField(),
      effect: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGCurseData extends PTGBaseItemData {
  static defineSchema() {
    return {
      source: this.textField(),
      trigger: this.textField(),
      pantheonDice: this.numberField(1),
      effect: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGWeaponData extends PTGBaseItemData {
  static defineSchema() {
    return {
      damage: this.numberField(1),
      range: this.textField(),
      quality: this.textField(),
      cost: this.numberField(),
      equipped: this.checkbox(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGArmorData extends PTGBaseItemData {
  static defineSchema() {
    return {
      rating: this.numberField(1),
      quality: this.textField(),
      cost: this.numberField(),
      equipped: this.checkbox(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}
