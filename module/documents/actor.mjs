/**
 * Part-Time Gods 2e Actor Document
 * Foundry VTT v14
 */

export class PTGActor extends Actor {
  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system;

    this.#prepareResources(system);
    this.#prepareDerivedTraits(system);
  }

  /**
   * Initialize and clamp resource values.
   */
  #prepareResources(system) {
    const resources = system.resources ?? {};

    for (const resource of Object.values(resources)) {
      if (!resource) continue;

      resource.max = Number(resource.max ?? 0);
      resource.value = Math.clamp(
        Number(resource.value ?? 0),
        0,
        resource.max
      );
    }
  }

  /**
   * Calculate PTG2E derived traits.
   */
  #prepareDerivedTraits(system) {
    const traits = system.traits ?? {};
    const skills = system.skills ?? {};

    const body =
      Number(skills.athletics?.rank ?? 0) +
      Number(skills.endurance?.rank ?? 0);

    const mind =
      Number(skills.education?.rank ?? 0) +
      Number(skills.awareness?.rank ?? 0);

    const spirit =
      Number(skills.influence?.rank ?? 0) +
      Number(skills.conviction?.rank ?? 0);

    traits.health ??= {};
    traits.psyche ??= {};
    traits.strength ??= {};
    traits.movement ??= {};

    traits.health.max = Math.max(5, 10 + Math.floor(body / 2));
    traits.psyche.max = Math.max(5, 10 + Math.floor((mind + spirit) / 2));

    traits.strength.value = Math.max(
      1,
      Math.floor(body / 2)
    );

    traits.movement.value = Math.max(
      1,
      5 + Math.floor(body / 3)
    );

    traits.health.value = Math.clamp(
      traits.health.value ?? traits.health.max,
      0,
      traits.health.max
    );

    traits.psyche.value = Math.clamp(
      traits.psyche.value ?? traits.psyche.max,
      0,
      traits.psyche.max
    );
  }

  /**
   * Return total dice pool for a PTG skill combo.
   *
   * @param {string} skillA
   * @param {string} skillB
   * @returns {number}
   */
  getComboPool(skillA, skillB) {
    const a = Number(this.system.skills?.[skillA]?.rank ?? 0);
    const b = Number(this.system.skills?.[skillB]?.rank ?? 0);

    return a + b;
  }

  /**
   * Spend Fragments.
   *
   * @param {number} amount
   */
  async spendFragments(amount = 1) {
    const current = this.system.resources.fragments.value;

    if (current < amount) {
      ui.notifications.warn("Not enough Fragments.");
      return false;
    }

    await this.update({
      "system.resources.fragments.value": current - amount
    });

    return true;
  }

  /**
   * Spend Pantheon Pool dice from actor-owned reserve.
   * Shared pool logic can be added later.
   *
   * @param {number} amount
   */
  async spendPantheonDice(amount = 1) {
    const current = this.system.resources.pantheon.value;

    if (current < amount) {
      ui.notifications.warn("No Pantheon Dice available.");
      return false;
    }

    await this.update({
      "system.resources.pantheon.value": current - amount
    });

    return true;
  }
}