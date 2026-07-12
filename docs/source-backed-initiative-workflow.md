# Source-Backed Initiative Workflow

Issue: #175

Source reference: Part-Time Gods Second Edition, Chapter 5 battle timing and initiative material, represented in the managed rules data as `Determining Initiative` and `Alternative Initiative` on book p. 198.

## Procedure

PTG initiative is rolled for combatants at the start of a Battle and normally rerolled each Round unless the table chooses a fixed order.

Character actors use:

```text
1d10 + Intuition + Speed
```

Antagonists and other statblock actors use:

```text
1d10 + listed Initiative
```

Owned source-backed items and abilities can modify the Initiative value before the roll when they carry explicit automation metadata, such as the Crossovers `Reactive` Blessing (`+2 Initiative`) or the `Quick` gear quality (`+1 Initiative`). Active Conditions are added after those item and ability modifiers. The GM can still choose an alternate Skill basis when the scene calls for it, such as chases, unusual terrain, or scene-specific social pressure.

## Implementation

- `PartTimeGodsActor.prepareDerivedData()` stores character `system.derived.initiative` as `Intuition + Speed`.
- `PartTimeGodsCombatant.getInitiativeRoll()` supplies the same `1d10 + @initiative` roll data to Foundry's native Combat Tracker initiative button.
- `part-time-gods.js` registers `PartTimeGodsCombatant` as `CONFIG.Combatant.documentClass` and sets the native combat initiative formula.
- `rollPTGInitiative()` rolls `1d10 + @initiative` for every combatant in the active Foundry Combat encounter.
- Character combatants use `system.derived.initiative`.
- Antagonist/statblock combatants use `system.initiative`, falling back to `system.derived.initiative` if needed.
- `itemInitiativeModifier()` adds active owned `system.automation.bonus.initiative` metadata and held/equipped Quick weapon quality bonuses before the roll.
- `conditionRollEffects({ mode: "initiative" })` contributes active Condition modifiers to both actor families.
- `PTG Combat Controls -> Roll PTG Initiative` updates Foundry Combatant initiative values through `combat.updateEmbeddedDocuments("Combatant", updates)`.

## Manual QA

1. Start a Foundry v14 Combat encounter containing a Character actor and an Antagonist actor.
2. Open `PTG GM Setup -> Combat Controls`.
3. Use the native Foundry Combat Tracker roll-initiative button and confirm both combatants receive PTG initiative values.
4. Open `PTG GM Setup -> Combat Controls`.
5. Choose `Roll PTG Initiative`.
6. Confirm the tracker receives new initiative values for both combatants.
7. Confirm the chat card states the character formula and statblock behavior.
8. If Reactive, Quick, or a Condition with Initiative modifiers is active, confirm the modifier is reflected in the resulting initiative value.
