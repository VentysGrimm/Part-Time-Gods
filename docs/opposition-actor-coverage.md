# PTG2E Opposition Actor Coverage

Source: Part-Time Gods Second Edition Opposition chapter, book pp. 220-259, as curated in `module/data/complete-rules.json`.

This table tracks the premade Actor coverage used by `module/data/premade-actors.mjs` and the `part-time-gods.opposition-actors` compendium.

The same compendium also includes a `Backers' Pregens` folder for metadata-only character placeholders from PDF pp. 290-307; these are not opposition statblocks and do not ship full pregen stats or prose.

| Category | Covered premade Actors | Remaining gaps / notes |
| --- | --- | --- |
| Animals | Animal Swarm, Large Animal, Massive Animal | Animal Swarm is retained as a useful field encounter even though the main Opposition chapter starts its animal examples at book p. 220. |
| Mortals | Average Person, Con Artist, The Boss, Cultist, Internet Personality, Mob, Street Fighter, Trained Emergency Personnel | Named mortal stat blocks from pp. 221-224 are covered. Individual henchmen called by The Boss remain a power note rather than separate Actors. |
| The Touched | Champion, Forsaken, God-Killer, Sibyl, Unhallowed | Each scalable stat family is represented with a middle-rank Actor. Lineage, pact, prophet, and clairvoyant variants remain readable power notes. |
| Other Gods | Guardian, Hunter, Psychopomp, Rival, Templar, Trickster, Warlord templates | These are templates by design. Specific Dominions, Truths, Relics, Vassals, Worshippers, and Manifestation lists should be customized for the campaign god. |
| Outsiders, pp. 234-243 | Cherub, Cloak, Devourer, Djinn, Dwarf, Elf, Giant, Gorgon, Hell Hound, Hydra, Jikininki, Kappa | Giant species variants remain one template Actor with variant notes. |
| Outsiders, pp. 244-253 | Manananggal, Minotaur, Ningyo, Phoenix, Pucks, Puck Crawler, Puck Gnawer, Puck Hider, Puck Possessor, Puck Screamer, Rakshasa, Satyr, Slasher | The base Pucks Actor covers the shared stat line. Puck variant Actors reuse that stat line and expose variant powers as readable rules text. |
| Outsiders, pp. 254-258 | Snarlequin, Spirit, Tengu, Unicorn, Elemental Spirit | Spirit covers the base spirit chassis and ghost/object-possession notes. Elemental Spirit covers the elemental family as a template Actor. |
| Custom Antagonists | PTG Opposition Builder | The builder creates scene-specific custom Actors from the book p. 259 threat bands instead of seeding every possible custom combination. |
| Backers' Pregens | James Fordham, Curtis Jasper "CJ" Lis, Todd Ebert, Tessara Winfield, Tod Browning, Nathan Underwood, Eden Delerosa, Luke Drury, Danielle Frost | Metadata-only character placeholders with stable source IDs and PDF page references; grouped separately from Opposition categories. |

Automation hooks are stored on premade Actor flags at `flags.part-time-gods.powerHooks` and are copied into source-backed Vassal Items. Combat can roll antagonist/vassal Attack and Defense statblock pools directly, and Vassal task cards can roll an embedded statblock pool while recording Strain, risk, current task, and request history.

The hooks still do not automate every special power. They provide stable metadata and readable prompts for power-specific combat, condition, and resource automation that would otherwise require table-specific rulings.
