import { actorInitiative, PTG_INITIATIVE_FORMULA } from "./ptg-combat.mjs";

export class PartTimeGodsCombatant extends Combatant {
  getInitiativeRoll(formula = PTG_INITIATIVE_FORMULA) {
    return new Roll(formula || PTG_INITIATIVE_FORMULA, {
      initiative: actorInitiative(this.actor)
    });
  }
}
