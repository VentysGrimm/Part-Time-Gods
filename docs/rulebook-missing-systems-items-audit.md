# PTG2E Rulebook Missing Systems and Items Audit

Audit date: 2026-06-27.

Source checked: `module/data/complete-rules.json` plus `tmp/sources/Part-Time Gods 2e Core Rules.pdf`, extracted with PyMuPDF/MuPDF into `tmp/pdfs/ptg-core-rules-mupdf.txt`.

The PDF pass covered 318 PDF pages, with 310 non-empty text pages. The PDF outline confirms the tail sections after the random tables are Backers List, Backers' Pregens, Index, and reference/cheat-sheet material rather than additional hidden core systems.

## Current Coverage Snapshot

| Area | Current workspace coverage | Status |
| --- | --- | --- |
| Rules journals | 9 JournalEntries, 48 readable pages, covering book pp. 11-284 from the curated payload | Covered in reference form |
| Character creation choices | 11 Occupations, 12 Archetypes, 7 Dominion categories, 9 Theologies plus Undecided | Covered as Choice Item documents |
| Occupation careers | 33 embedded career options now generate 33 standalone Occupation Item documents | Covered as Items |
| Specific Dominions | 133 random specific Dominion entries now generate standalone Domain Item documents | Covered as Items |
| Choice abilities | 179 embedded Blessing/Curse grants now generate 179 standalone Item documents | Covered as Items |
| Choice attachments | 102 embedded attachment grants now generate 102 standalone Bond/Relic/Vassal/Worshipper/Attachment-family Item documents | Covered as Items |
| Truths | 22 premade Truth Items from book pp. 117-120 | Covered |
| Relics | 21 Relic Items, including 18 source examples and 3 generated choice attachment grants | Covered |
| Worshippers | 11 Worshipper Items, including 7 source examples and 4 generated choice attachment grants | Covered |
| Bonds | 94 Bond Items, including generic Bond types and generated choice attachment grants | Covered |
| Failings and Curses | 10 Failing Curse Items plus 80 generated choice Curse Items | Covered |
| Conditions | 20 Conditions from book pp. 205-207 | Covered |
| Gear | 14 Armor Items and 9 Weapon Items from book pp. 210-212 | Covered |
| Opposition and pregens | 62 premade Actors: 53 antagonist Actors covering animals, mortals, the Touched, other-god templates, Outsiders, and custom threat bands, plus 9 metadata-only Backers' Pregens character placeholders | Covered |
| Roll tables | 86 RollTables covering random character creation, PDF p. 285 / book p. 283 archetype option rolls, random territory coordinates, and territory crawl helpers | Covered |
| Workflow entry points | Native GM setup, Pantheon sheet, Antagonist sheet, and scene-control entry points cover territory, combat, balance, Pantheon Pool, opposition building, story workflow, and the table tools hub. The 8 Macro documents are compatibility launchers only. | Covered |
| Territory grid | Premade Scene plus territory controls for movement, costs, influence, notes, and position flags | Partly automated |
| Character sheet workflows | Sheet tabs, item controls, structured conditions, XP, Spark, resources, ritual/power item rolls, Worshipper prayer requests, Vassal tasks, and roll workflows | Automated for core play loops |

## Likely Missing Or Thin Systems

These are rulebook systems that have journal coverage but do not yet appear as full, reusable Foundry-native workflows or compendium content.

| Priority | Missing or thin area | Source pages | Current state | Recommended implementation |
| --- | --- | ---: | --- | --- |
| Done | Manifestation reference documents | 143-165 | Nine `power` Items now cover Aegis, Beckon, Journey, Minion, Oracle, Puppetry, Ruin, Shaping, and Soul. | Seeded under the `Manifestations` folder in `premade-items` with source page metadata, roll metadata, specialties, and Measure guidance. |
| Done | Ritual and Otherworld workflows | 166-173 | Ten ritual `power` Items now cover Admittance, Bolster, Challenge, Detection, Dowsing, Temporary Convergence, Binding, Divination, Pocket Realm, and Portal. Five Otherworld Travel `power` Items now cover Portal, Path, Crossroads, Outsiders, and Realm stages. | Seeded under separate `Rituals` and `Otherworld Travel` folders with costs, checks, roll metadata, and source page metadata. |
| Done | Standalone Occupation Career Items | 37-50 | The 33 career options are still embedded in their parent Occupation Choices for character creation flow, but now also generate separate `occupation` Items. | 33 generated career Items are validated against 33 embedded career grants. |
| Done | Standalone specific Dominion Items | 61-66, 284 | The PDF random Dominion tables list 133 specific Dominion examples. They were previously RollTable text only. | 133 generated `domain` Items are validated against 133 random Dominion table rows. |
| Done | Standalone choice Blessing and Curse Items | 37-101, 175-177 | Occupation career abilities, Archetype options, Dominion options, and Theology grants now generate separate `blessing`/`curse` Items instead of existing only inside Choice data. | 179 generated choice ability Items are validated against 179 embedded source grants. Theology Curses are flagged as non-Pantheon-Dice by default per p. 177. |
| Done | Standalone choice attachment Items | 37-66 | Occupation, Archetype, and Dominion attachment grants now generate standalone Bond/Relic/Vassal/Worshipper/Attachment-family Items. | 102 generated attachment Items are validated against 102 embedded source grants. |
| Done | Random Archetype option tables | 283 | The random archetype section requires rolling Attachment, Blessing, and Curse after selecting the archetype. | Added 36 RollTables, one Attachment/Blessing/Curse option table for each Archetype. |
| Done | Attachment tricks and downtime procedures | 272-277 | The Pantheon sheet Table Tools now open source-backed workflow cards for attachment demands, downtime/job fallout, territory hooks, and player-sourcing prompts. The `PTG: Story Workflow` macro is only a compatibility launcher. | Cards can target a character or attachment, adjust Free Time/Wealth, adjust Attachment Strain, optionally apply a Condition, roll Territory coordinates, and post the prompt/result to chat. |
| Done | Pantheon Pool as a first-class shared resource | 187-189 | Pantheon Actor pool values now have a shared add/spend workflow, chat cards, linked-character access, and roll-dialog spending from the selected shared pool. | Use the Pantheon sheet Pool Workflow button, the Pantheon sheet Table Tools section, or a linked character sheet's Pool button. Skill, Manifestation, and ritual rolls spend selected shared Pantheon Dice before rolling, with character-local fallback when no linked or selected shared pool is available. |
| Done | Vassal entitlement catalog | 121, 234-258 | The catalog now includes `Custom Vassal` plus 30 source-backed Outsider Vassal Items derived from the Opposition actor coverage. | Each source-backed Vassal stores source actor metadata, power hooks, and an embedded actor template so scene drops can create actor-style Vassals. |
| Done | Battle, Condition, prayer, ritual, travel, and Vassal task workflow decisions | 121-124, 166-173, 197-208, 234-258 | Combat controls now resolve battle outcomes, structured Conditions are Item documents rather than ActiveEffect source records, Worshippers post prayer/request cards, Vassals post task cards with statblock rolls, and `power` Items execute ritual/Otherworld roll metadata. | Battle supports manual successes or statblock Attack/Defense rolls. Conditions feed `conditionRollEffects()`. Rituals and Ways stages spend listed costs and roll from their source-backed metadata. Vassal actor templates preserve threshold, health, psyche, armor, fragments, attack, defense, initiative, damage, skills, powers, condition handling, and power hooks. |
| Medium | Other-god template helpers | 231-233 | Other gods are seeded as antagonist template Actors, with customization left to the GM. | Add helper Items or actor-creation presets for Dominion, Truth, Relic, Vassal, Worshipper, and Manifestation selections on other-god templates. |
| Done | Gear quality reference | 209-212 | Gear Qualities now exist as 42 `gearQuality` Items generated from the system's weapon/armor quality metadata. | Seeded under `Gear Qualities` with source page metadata, supported status, default values, automation data, and full source-backed explanations. |
| Done | Backers' pre-generated characters | 288-307 | Nine pregen character sheets after the core random tables now seed as metadata-only `character` placeholders in the `opposition-actors` compendium under `Backers' Pregens`. | Each Actor preserves name, title, source pages, stable source ID, and licensing status without source stat blocks, prose, or embedded Items. |
| Low | Post-random-table reference matter | 308+ | PDF tail contains an Index plus GM/player quick-reference material. No additional core Item family was found there. | Add Journal reference pages only if in-Foundry index/cheat-sheet lookup is desired. |

## Item Families Checked

The current generated `premade-items` inventory defines 647 Item records:

| Type | Count | Notes |
| --- | ---: | --- |
| `power` | 24 | Manifestations, rituals, and Otherworld travel stages. |
| `gearQuality` | 42 | Source-backed weapon/armor quality reference Items. |
| `occupation` | 33 | Generated standalone Occupation Career Items. |
| `domain` | 133 | Generated standalone specific Dominion Items from random Dominion table rows. |
| `truth` | 22 | Source-backed natural gifts / Truths. |
| `relic` | 21 | Source-backed example Relics plus generated choice attachment grants. |
| `worshipper` | 11 | Source-backed Worshipper types plus generated choice attachment grants. |
| `bond` | 94 | Generic Bond types plus generated Occupation/Archetype/Dominion attachment grants. |
| `curse` | 90 | 10 Failings plus 80 generated choice Curse Items. |
| `condition` | 20 | Full condition list with recovery/effect metadata. |
| `vassal` | 34 | Generic Custom Vassal, source-backed Outsider Vassals, and generated choice attachment grants. |
| `attachment` | 1 | Generic "attachment of choice" grant used when the source grants an open attachment pick. |
| `blessing` | 99 | Generated Occupation, Archetype, Dominion, and Theology Blessing Items. |
| `armor` | 14 | Source-backed gear list. |
| `weapon` | 9 | Source-backed gear list. |

Generated career, Dominion, Blessing, Curse, and attachment-family Items are created from Occupation, Archetype, Dominion, and Theology choice data plus the random Dominion tables. The inventory now validates that every embedded career, choice ability, choice attachment grant, random specific Dominion row, and source-listed gear quality has its own Item entity. The one duplicate Blessing name from the source, `This is My Town`, is preserved as separate Items for Privileged and The Wanderer.

## Pack Organization Notes

`system.json` declares these active packs:

- `character-creation`
- `premade-items`
- `opposition-actors`
- `maps`
- `roll-tables`
- `macros`
- `rules-reference`

On GM ready, `organizePTGCompendiumFolders()` groups these active system packs under a top-level Compendium folder named `Part Time Gods` for easier sidebar management.

There are also physical pack directories named `domains`, `relics`, `powers`, and `conditions` in `packs/`, but they are not declared in `system.json` and are not used by `populatePremadeCompendiums()`. Current runtime organization is therefore folder-based inside `character-creation` and `premade-items`, not one pack per item family.

Before adding new pack declarations, decide whether the project should keep the current compact pack layout or split item families into separate system packs. The compact layout is consistent with the current seeding code.

## Recommended Next Implementation Order

1. Decide whether the PDF tail index and quick-reference sheets should become Journal pages.
2. Add other-god template helper presets for Dominion, Truth, Relic, Vassal, Worshipper, and Manifestation selections.
