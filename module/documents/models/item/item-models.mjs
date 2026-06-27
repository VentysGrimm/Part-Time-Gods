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

  static attachmentDetailFields() {
    return {
      choiceSource: this.textField(),
      choiceKind: this.textField(),
      choiceLabel: this.textField(),
      definition: this.textField(),
      summary: this.textField(),
      relatedBonus: this.htmlField(),
      relatedDetriment: this.htmlField(),
      trigger: this.textField(),
      actionCost: this.textField(),
      sourcePage: new fields.NumberField({ integer: true, min: 0, nullable: true, initial: null }),
      automationNotes: this.htmlField()
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

  static qualitiesField() {
    return new fields.ArrayField(new fields.ObjectField({ initial: {} }), { initial: [] });
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
      customTitle: this.textField(),
      specificPortfolio: this.textField(),
      specificity: new fields.StringField({ initial: "specific" }),
      limitations: this.htmlField(),
      gmNotes: this.htmlField(),
      landmarkBondUuid: this.textField(),
      landmarkBondName: this.textField(),
      sphere: this.textField(),
      manifestations: this.textField(),
      attachmentOptions: new fields.ArrayField(new fields.ObjectField({ initial: {} }), { initial: [] }),
      blessingOptions: new fields.ArrayField(new fields.ObjectField({ initial: {} }), { initial: [] }),
      curseOptions: new fields.ArrayField(new fields.ObjectField({ initial: {} }), { initial: [] }),
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
      undecided: this.checkbox(),
      skillPoints: this.numberField(),
      manifestationPoints: this.numberField(),
      blessingSummary: this.htmlField(),
      curseSummary: this.htmlField(),
      blessingData: new fields.ObjectField({ initial: {} }),
      curseData: new fields.ObjectField({ initial: {} }),
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
      ...this.attachmentDetailFields(),
      kind: this.textField(),
      location: this.textField(),
      linkedDominionUuid: this.textField(),
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
      ...this.attachmentDetailFields(),
      statement: this.textField(),
      rank: this.numberField(1),
      cost: this.numberField(),
      fragmentCost: this.numberField(),
      activation: this.textField(),
      benefit: this.htmlField(),
      effect: this.htmlField(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}

export class PTGRelicData extends PTGBaseItemData {
  static defineSchema() {
    return {
      ...this.rulesAutomationFields("relic", "active"),
      ...this.attachmentDetailFields(),
      level: this.numberField(1),
      cost: this.numberField(),
      bonus: this.textField(),
      benefit: this.htmlField(),
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
      ...this.attachmentDetailFields(),
      level: this.numberField(1),
      cost: this.numberField(),
      strain: new fields.SchemaField({
        value: this.numberField(),
        max: this.numberField()
      }),
      group: this.textField(),
      size: this.textField(),
      requestType: this.textField(),
      currentRisk: this.textField(),
      riskNotes: this.htmlField(),
      requestLog: new fields.ArrayField(new fields.ObjectField({ initial: {} }), { initial: [] }),
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
      ...this.attachmentDetailFields(),
      level: this.numberField(1),
      cost: this.numberField(),
      strain: new fields.SchemaField({
        value: this.numberField(),
        max: this.numberField()
      }),
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
      severityMode: new fields.StringField({ initial: "level" }),
      appliesTo: this.textField(),
      duration: this.textField(),
      recovery: this.textField(),
      removal: this.textField(),
      sourcePage: new fields.NumberField({ integer: true, min: 0, nullable: true, initial: null }),
      sourceSection: this.textField(),
      rollModifier: new fields.ObjectField({ initial: null, nullable: true }),
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
      rangeCategory: this.textField(),
      quality: this.textField(),
      qualities: this.qualitiesField(),
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
      qualities: this.qualitiesField(),
      cost: this.numberField(),
      description: this.htmlField(),
      notes: this.htmlField()
    };
  }
}
