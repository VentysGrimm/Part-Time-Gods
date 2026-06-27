/**
 * Part-Time Gods 2e
 * Actor Data Model
 * Foundry VTT v14
 */

const fields = foundry.data.fields;

import { TruthDataModel } from "./truth-template.mjs";
export class PTGActorData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {

      /* -------------------------------------------- */
      /* Identity                                     */
      /* -------------------------------------------- */

      concept: new fields.StringField({
        initial: ""
      }),

      occupation: new fields.StringField({
        initial: ""
      }),

      archetype: new fields.StringField({
        initial: ""
      }),

      dominion: new fields.StringField({
        initial: ""
      }),

      theology: new fields.StringField({
        initial: ""
      }),

      /* -------------------------------------------- */
      /* Advancement                                  */
      /* -------------------------------------------- */

      spark: new fields.SchemaField({
        rank: new fields.NumberField({
          integer: true,
          min: 1,
          initial: 1
        }),

        xp: new fields.NumberField({
          integer: true,
          min: 0,
          initial: 0
        })
      }),

      /* -------------------------------------------- */
      /* Resources                                    */
      /* -------------------------------------------- */

      resources: new fields.SchemaField({

        health: new fields.SchemaField({
          value: new fields.NumberField({ integer: true, initial: 10 }),
          max: new fields.NumberField({ integer: true, initial: 10 })
        }),

        psyche: new fields.SchemaField({
          value: new fields.NumberField({ integer: true, initial: 10 }),
          max: new fields.NumberField({ integer: true, initial: 10 })
        }),

        fragments: new fields.SchemaField({
          value: new fields.NumberField({ integer: true, initial: 0 }),
          max: new fields.NumberField({ integer: true, initial: 0 })
        }),

        pantheon: new fields.SchemaField({
          value: new fields.NumberField({ integer: true, initial: 0 }),
          max: new fields.NumberField({ integer: true, initial: 0 })
        }),

        wealth: new fields.NumberField({
          integer: true,
          min: 0,
          initial: 0
        }),

        freeTime: new fields.NumberField({
          integer: true,
          min: 0,
          initial: 0
        })
      }),

      /* -------------------------------------------- */
      /* Derived Traits                               */
      /* -------------------------------------------- */

      traits: new fields.SchemaField({

        strength: new fields.SchemaField({
          value: new fields.NumberField({
            integer: true,
            initial: 1
          })
        }),

        movement: new fields.SchemaField({
          value: new fields.NumberField({
            integer: true,
            initial: 5
          })
        })
      }),

      /* -------------------------------------------- */
      /* Skills                                       */
      /* -------------------------------------------- */

      skills: new fields.SchemaField({

        athletics: skillField(),
        awareness: skillField(),
        academics: skillField(),
        influence: skillField(),
        endurance: skillField(),
        technology: skillField(),
        medicine: skillField(),
        stealth: skillField(),
        survival: skillField(),
        investigation: skillField(),
        expression: skillField(),
        persuasion: skillField(),
        intimidation: skillField(),
        crafting: skillField(),
        driving: skillField(),
        fighting: skillField(),
        firearms: skillField(),
        leadership: skillField(),
        empathy: skillField(),
        conviction: skillField()

      }),

      /* -------------------------------------------- */
      /* Blessings & Curses                           */
      /* -------------------------------------------- */

      blessings: new fields.ArrayField(
        new fields.StringField()
      ),

      curses: new fields.ArrayField(
        new fields.StringField()
      ),

      /* -------------------------------------------- */
      /* Attachments                                  */
      /* -------------------------------------------- */

      attachments: new fields.SchemaField({

        bonds: new fields.ArrayField(
          new fields.StringField()
        ),

        failings: new fields.ArrayField(
          new fields.StringField()
        ),

        relics: new fields.ArrayField(
          new fields.StringField()
        ),

        truths: new fields.ArrayField(
          new fields.StringField()
        ),

        worshippers: new fields.ArrayField(
          new fields.StringField()
        ),

        vassals: new fields.ArrayField(
          new fields.StringField()
        )
      }),

      /* -------------------------------------------- */
      /* Manifestations                               */
      /* -------------------------------------------- */

      manifestations: new fields.ArrayField(
        new fields.StringField()
      ),

      rituals: new fields.ArrayField(
        new fields.StringField()
      ),

      legendaryActs: new fields.ArrayField(
        new fields.StringField()
      ),

      /* -------------------------------------------- */
      /* Territory                                    */
      /* -------------------------------------------- */

      territory: new fields.SchemaField({

        name: new fields.StringField({
          initial: ""
        }),

        size: new fields.NumberField({
          integer: true,
          min: 0,
          initial: 0
        }),

        influence: new fields.NumberField({
          integer: true,
          min: 0,
          initial: 0
        })
      }),

      /* -------------------------------------------- */
      /* Notes                                        */
      /* -------------------------------------------- */

      notes: new fields.HTMLField({
        initial: ""
      })
    };
  }
}

/**
 * Shared PTG skill schema
 */
function skillField() {
  return new fields.SchemaField({

    rank: new fields.NumberField({
      integer: true,
      min: 0,
      initial: 0
    }),

    specialty: new fields.StringField({
      initial: ""
    })
  });
}