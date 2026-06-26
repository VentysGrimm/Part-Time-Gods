# PTG2E Opposition Actor Coverage

Source: Part-Time Gods Second Edition Opposition chapter, book pp. 220-259, as curated in `module/data/complete-rules.json`.

This table tracks the premade Actor coverage used by `module/data/premade-actors.mjs` and the `part-time-gods.opposition-actors` compendium.

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

Future automation hooks are stored on premade Actor flags at `flags.part-time-gods.powerHooks`. They intentionally do not automate every special power in this slice; they provide stable metadata for later combat, condition, and resource automation.
