# PTG2E Core PDF Parsing Work Items

This document breaks the Part-Time Gods Second Edition core PDF into Foundry VTT v14 implementation work items.

## Copyright-safe parsing rule

Do not commit wholesale copied prose, fiction, or art from the PDF unless explicit publisher permission is obtained. Commit structured data, original summaries, rules metadata, page references, source sections, and automation fields. Store book text only as private user-entered content or as short licensed/permitted excerpts.

Every generated Foundry `Item` should include:

```json
{
  "name": "Display Name",
  "type": "occupation | archetype | domain | theology | power | bond | truth | relic | worshipper | vassal | blessing | curse | condition | weapon | armor",
  "system": {
    "slug": "stable-kebab-slug",
    "sourceId": "ptg2e.chapter.section.slug",
    "sourceType": "chapter-section-kind",
    "schemaVersion": 1,
    "rules": {
      "summary": "Original short implementation summary.",
      "source": {
        "book": "Part-Time Gods Second Edition",
        "page": 0,
        "section": "Chapter / Section",
        "type": "source type"
      }
    }
  }
}
```

## Chapter 0: Introduction and glossary

Pages: 7-14.

Target documents:

- `JournalEntry` rules reference: setting overview, table expectations, Chakra System basics.
- `Item` definitions for glossary terms that have automation impact: Check, Combo, Difficulty, Boost, Critical Failure, Fate Die, Pantheon Pool, Scene, Story, Spark, Strain, Territory Grid.
- `RollTable` or config source for Difficulty ladder.

Acceptance criteria:

- No long copied introduction prose.
- Dice basics reflected in `PTGDiceEngine` docs/tests.
- Glossary entries linked by page and section.

## Chapter 1: The Descending Storm

Pages: 15-33.

Target documents:

- `JournalEntry` lore summaries: Cosmogony, First Mother, Golden Web, God Wars, Outsiders, Theologies overview, Dominions overview, Territories, Pantheons, Worshippers, Staying Hidden, Staying Human.
- `Item` seeds for setting-facing mechanics: Theology summary references, Dominion category summaries, Territory/Pantheon helper references, Worshipper risk notes, Outsider threat notes.

Acceptance criteria:

- Lore is summarized, not reproduced.
- Mechanical concepts that affect sheets or automation are linked to later structured Items.
- Territory Grid work points to Scene tooling, not actor/item duplication.

## Chapter 2: The Spark of Divinity

Pages: 35-133.

Target documents:

- `occupation` Items for all Occupation categories and careers.
- `archetype` Items for the twelve Archetypes.
- `domain` Items for Dominion categories: Bestial, Conceptual, Elemental, Emotional, Patron, Tangible, Crossover.
- `theology` Items for all Theologies plus Undecided.
- `bond`, `truth`, `relic`, `vassal`, `worshipper`, `blessing`, `curse`, and `condition` Items created from options.
- `JournalEntry` or `RollTable` source for random tables and creation quick reference.

Acceptance criteria:

- Every option has stable `slug` and `sourceId`.
- Choice Items populate `system.grants` with skills, manifestations, resources, attachment options, blessing options, and curse options.
- Text fields contain original summaries and page references, not long copied rulebook prose.
- Character creation wizard can consume these Items without hardcoded options.

## Chapter 3: Divine Expressions

Pages: 137-174.

Target documents:

- `power` Items for Spark, Legendary Acts, Prayers, Limited Immortality, God vs. God, Manifestation Checks.
- `power` Items for each Manifestation application under Aegis, Beckon, Journey, Minion, Oracle, Puppetry, Ruin, Shaping, and Soul.
- `power` Items for Rituals, Territory Rituals, Spark Rituals, Otherworldly Rituals, Beyond Worlds, Hidden Paths, and named realms.
- Config data for Measures: Damage, Range, Targets, Duration, Scale, Detail, Magnitude, Modifier where applicable.

Acceptance criteria:

- Each Manifestation application includes suggested check, common measures, action/cost/duration metadata, and original summary.
- Manifestation dialog can filter applications by Manifestation.
- Broad vs. Specific Dominion penalties are representable in roll modifiers.

## Chapter 4: Blessing the Dice

Pages: 175-195.

Target documents:

- `JournalEntry` rules references for Blessings, Curses, Skill-Combo System, Rolling Dice, Difficulties, Modifiers, Fate Die, Opposed Checks, Extended Checks, Support, Boosts, Critical Failure, Specialties, Tools, Repetitive Skill Usage, Pantheon Pool, Strength, Movement, Free Time, Wealth, Going to Work, Attachments, Territory interaction.
- `condition` Items for common critical failure effects and rules conditions where applicable.
- `RollTable` Items for possible critical failure effects and other procedural tables.
- Config/source JSON for skills and specialties.

Acceptance criteria:

- Dice engine test coverage matches Chakra System success rules.
- Roll dialogs expose core modifiers.
- Free Time, Wealth, Work, Attachment Strain, and Territory movement are represented as sheet actions.

## Chapter 5: Divine Battles

Pages: 197-215.

Target documents:

- `power` or rules-action Items for Battle of Fists actions/defenses.
- `power` or rules-action Items for Battle of Wits actions/defenses.
- `condition` Items for battle Conditions.
- `weapon` Items and `armor` Items for listed gear and qualities.
- `JournalEntry` rules references for initiative, turn sequence, damage, healing, modifiers, armor, weapons, range, battle examples.

Acceptance criteria:

- Combat workflow supports quick/standard actions and defenses.
- Damage can target Health or Psyche.
- Armor and weapon qualities are represented as structured fields.
- Conditions can be created, reduced, recovered, and removed.

## Chapter 6: The Opposition

Pages: 217-259.

Target documents:

- `Actor` antagonist compendium entries for each listed antagonist.
- `condition` Items tied to antagonist conditions where needed.
- `JournalEntry` rules reference for antagonist types, formatting, custom antagonists.
- Optional `Item` powers for reusable antagonist abilities.

Acceptance criteria:

- Each antagonist has type/tier metadata, threshold/health/psyche/damage fields, powers summary, and page reference.
- No copied creature prose beyond permitted short labels/summaries.
- Dragging Vassals/Worshippers to scene remains compatible with antagonist actor model.

## Chapter 7: Creating New Myths

Pages: 261-277.

Target documents:

- `JournalEntry` GM tools: inspirations, developing stories, setting, plots, pacing, conflict, conclusions, story tricks, motivation, curses, downtime, attachment tricks, territory handling, player sourcing.
- `RollTable` Items where the chapter offers reusable prompts/tables.
- Optional `Item` templates for story hooks, territory threats, attachment events, downtime scenes.

Acceptance criteria:

- GM-facing guidance is summarized in original words with page references.
- Any tables/prompts are represented as Foundry `RollTable` documents if mechanically useful.
- Solo-campaign notes can be layered later without modifying core data.

## Appendices and extras

Pages: 279-317.

Target documents:

- Character sheet mapping checklist.
- Territory Grid Scene template and tile/region metadata.
- Random Tables as `RollTable` documents.
- Backer pregens as optional `Actor` examples only if licensing permits.
- Index terms as lightweight reference metadata.

Acceptance criteria:

- Character sheet fields map to DataModel paths.
- Territory Grid can be created from a command or compendium Scene.
- Pregens stay disabled or metadata-only until content permission is resolved.

## Implementation sequence

1. Build JSON source schema and importer validation.
2. Parse Chapter 2 first because character creation drives the system.
3. Parse Chapter 4 dice/resource rules next because they drive automation.
4. Parse Chapter 5 combat and gear.
5. Parse Chapter 3 manifestations.
6. Parse Chapter 6 opposition.
7. Add Chapter 1 and Chapter 7 journal summaries.
8. Add appendices and random tables.
