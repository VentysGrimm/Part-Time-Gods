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

  static decimalField(initial = 0, min = 0) {
    return new fields.NumberField({ min, initial });
  }

  static checkbox(initial = false) {
    return new fields.BooleanField({ initial });
  }

  static rulesField(sourceType = "") {
    return new fields.SchemaField({
      summary: this.textField(),
      fullText: this.htmlField(),
      source: new fields.SchemaField({
        book: new fields.StringField({ initial: "Part-Time Gods Second Edition" }),
        page: new fields.NumberField({ integer: true, min: 0, nullable: true, initial: null }),
        section: this.textField(),
        type: new fields.StringField({ initial: sourceType })
      })
    });
  }

  static usageField(kind = "narrative") {
    return new fields.SchemaField({
      kind: new fields.StringField({ initial: kind }),
      trigger: this.textField(),
      target: this.textField(),
      cost: new fields.SchemaField({
        freeTime: this.numberField(),
        wealth: this.numberField(),
        pantheonDice: this.numberField(),
        fragments: this.numberField(),
        health: this.numberField(),
        psyche: this.numberField(),
        strain: this.numberField()
      })
    });
  }

  static automationField() {
    return new fields.SchemaField({
      enabled: this.checkbox(),
      action: this.textField(),
      bonus: new fields.ObjectField({ initial: null, nullable: true }),
      penalty: new fields.ObjectField({ initial: null, nullable: true }),
      roll: new fields.ObjectField({ initial: null, nullable: true }),
      healing: new fields.ObjectField({ initial: null, nullable: true }),
      damage: new fields.ObjectField({ initial: null, nullable: true }),
      condition: new fields.ObjectField({ initial: null, nullable: true }),
      resourceChange: new fields.ObjectField({ initial: null, nullable: true }),
      chatCard: this.checkbox(true)
    });
  }

  static rulesAutomationFields(sourceType = "", kind = "narrative") {
    return {
      rules: this.rulesField(sourceType),
      usage: this.usageField(kind),
      automation: this.automationField()
    };
  }

  static gearFields() {
    return {
      amount: this.numberField(1),
      weight: this.decimalField(),
      held: this.checkbox(true),
      equipped: this.checkbox()
    };
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
      ...this.rulesAutomationFields("dominion"),
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
      ...this.rulesAutomationFields("occupation"),
      category: this.textField(),
      career: this.textField(),
      careerOptions: new fields.ArrayField(new fields.ObjectField({ initial: {} }), { initial: [] }),
      grants: this.grantsField(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGArchetypeData extends PTGBaseItemData {
  static defineSchema() {
    return {
      ...this.rulesAutomationFields("archetype"),
      definingTrait: this.textField(),
      attachmentOptions: new fields.ArrayField(new fields.ObjectField({ initial: {} }), { initial: [] }),
      blessingOptions: new fields.ArrayField(new fields.ObjectField({ initial: {} }), { initial: [] }),
      curseOptions: new fields.ArrayField(new fields.ObjectField({ initial: {} }), { initial: [] }),
      grants: this.grantsField(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGTheologyData extends PTGBaseItemData {
  static defineSchema() {
    return {
      ...this.rulesAutomationFields("theology"),
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
      ...this.rulesAutomationFields("power", "active"),
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
      ...this.rulesAutomationFields("bond"),
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
      ...this.rulesAutomationFields("truth", "active"),
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
      ...this.rulesAutomationFields("relic", "active"),
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
      ...this.rulesAutomationFields("worshipper"),
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
      ...this.rulesAutomationFields("vassal"),
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
      ...this.rulesAutomationFields("blessing", "triggered"),
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
      ...this.rulesAutomationFields("curse", "triggered"),
      source: this.textField(),
      trigger: this.textField(),
      pantheonDice: this.numberField(1),
      effect: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGConditionData extends PTGBaseItemData {
  static defineSchema() {
    return {
      ...this.rulesAutomationFields("condition", "passive"),
      category: this.textField(),
      severity: this.numberField(1),
      effect: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGWeaponData extends PTGBaseItemData {
  static defineSchema() {
    return {
      ...this.rulesAutomationFields("weapon", "active"),
      ...this.gearFields(),
      damage: this.numberField(1),
      range: this.textField(),
      quality: this.textField(),
      cost: this.numberField(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGArmorData extends PTGBaseItemData {
  static defineSchema() {
    return {
      ...this.rulesAutomationFields("armor", "passive"),
      ...this.gearFields(),
      rating: this.numberField(1),
      quality: this.textField(),
      cost: this.numberField(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}
