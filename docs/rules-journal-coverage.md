# PTG2E Rules Journal Coverage

Source audited: `module/data/complete-rules.json` plus `tmp/sources/Part-Time Gods 2e Core Rules.pdf`, extracted with PyMuPDF/MuPDF into `tmp/pdfs/ptg-core-rules-mupdf.txt`.

Audit date: 2026-06-27.

## Summary

The rules-reference payload currently provides 9 source-backed JournalEntries with 48 readable JournalEntry pages.

Validation snapshot:

| Check | Result |
| --- | ---: |
| JournalEntries | 9 |
| JournalEntry pages | 48 |
| PDF pages spot-checked by MuPDF extraction | 318 |
| Non-empty extracted PDF pages | 310 |
| Empty pages | 0 |
| Pages without `data-book-page` markers | 0 |
| Duplicate journal/page names | 0 |
| Pages under 1,200 HTML characters | 0 |

The imported pages now carry stable metadata through `flags.part-time-gods`: `ruleTopic`, `sourceBook`, `sourcePages`, `sourcePageStart`, and `sourcePageEnd`.

Foundry formatting normalization:

- Every imported JournalEntry page is a Foundry text page using the configured HTML journal format.
- Each page body is wrapped in `<article class="ptg-rules-journal" data-rule-topic="...">`.
- A single source aside is added at the top of each page.
- Book-page chunks remain in semantic `<section class="ptg-source-page" data-book-page="...">` blocks.
- Stat-block lines such as Threshold, Armor, Attack, Defense, Initiative, Damage, Skills, and Rank are rendered as paragraphs instead of heading spam.
- Extracted running-foot artifacts are removed from imported journal markup.
- Existing rules-reference compendium entries are refreshed in place when premade compendiums are populated again.

## Covered Sections

| Journal | Pages | Source book pages | Coverage status |
| --- | ---: | --- | --- |
| 01. Core Play and Terms | 1 | 11-13 | Covered |
| 02. Divine Concepts | 3 | 23-33 | Covered |
| 03. Character Creation | 15 | 35-135 | Covered for character creation, occupations, archetypes, dominions, theologies, attachments, advancement, XP, and Spark |
| 04. Divine Expressions | 5 | 137-173 | Covered for Spark, Manifestations, Measures, Rituals, and Otherworlds |
| 05. Dice, Skills, and Resources | 6 | 175-195 | Covered for dice, skills, Pantheon Pool, Strength, Movement, Free Time, Wealth, Attachments, and Territory interaction |
| 06. Divine Battles | 4 | 197-212 | Covered for initiative, actions, defenses, damage, Conditions, healing, armor, weapons, and range |
| 07. Opposition | 8 | 217-259 | Covered for antagonist rules, animals, mortals, Touched, other gods, Outsiders, and custom antagonists |
| 08. Creating New Myths | 3 | 263-277 | Covered for GM/story guidance, extras, plots, pacing, attachment tricks, downtime, territory, and sourcing players |
| 09. Random Tables | 3 | 282-284 | Covered for random occupations, archetypes, dominions, attachments, and theologies |

## Page-Level Coverage

| Journal page | Book pages | Topic id |
| --- | --- | --- |
| Playing the Game, Dice Basics, and Glossary | 11-13 | `playing-the-game-dice-basics-and-glossary` |
| Theologies and Dominions | 23-24 | `theologies-and-dominions` |
| Territories, Pantheons, Worshippers, and Outsiders | 25-29 | `territories-pantheons-worshippers-and-outsiders` |
| Keeping Hidden and Staying Human | 30-33 | `keeping-hidden-and-staying-human` |
| Character Creation Overview | 35-36 | `character-creation-overview` |
| Occupations: Academic, Blue Collar, and Creative | 37-40 | `occupations-academic-blue-collar-and-creative` |
| Occupations: Criminal, Fringe, Medical, and Peacekeepers | 41-45 | `occupations-criminal-fringe-medical-and-peacekeepers` |
| Occupations: Physical, Public Life, Unemployed, and White Collar | 46-50 | `occupations-physical-public-life-unemployed-and-white-collar` |
| Archetypes | 51-59 | `archetypes` |
| Dominions | 60-66 | `dominions` |
| Theologies: Ascendants, Cult of the Saints, and Drifting Kingdoms | 67-77 | `theologies-ascendants-cult-of-the-saints-and-drifting-kingdoms` |
| Theologies: Kunitsukami, Masks of Jana, and Order of Meskhenet | 80-89 | `theologies-kunitsukami-masks-of-jana-and-order-of-meskhenet` |
| Theologies: Phoenix Society, Puck-Eaters, and Warlock's Fate | 92-101 | `theologies-phoenix-society-puck-eaters-and-warlock-s-fate` |
| Attachments and Bonds | 104-107 | `attachments-and-bonds` |
| Failings | 108-110 | `failings` |
| Relics | 111-115 | `relics` |
| Truths | 116-120 | `truths` |
| Vassals and Worshippers | 121-124 | `vassals-and-worshippers` |
| Final Touches and Advancement | 125-135 | `final-touches-and-advancement` |
| Natural Gifts, Spark, and Divine Limits | 137-142 | `natural-gifts-spark-and-divine-limits` |
| Manifestation Rules | 143-147 | `manifestation-rules` |
| Manifestation Skills: Aegis, Beckon, Journey, Minion, and Oracle | 148-157 | `manifestation-skills-aegis-beckon-journey-minion-and-oracle` |
| Manifestation Skills: Puppetry, Ruin, Shaping, and Soul | 158-165 | `manifestation-skills-puppetry-ruin-shaping-and-soul` |
| Rituals and Otherworlds | 166-173 | `rituals-and-otherworlds` |
| Blessings, Curses, and the Skill-Combo System | 175-177 | `blessings-curses-and-the-skill-combo-system` |
| Skill List | 178-182 | `skill-list` |
| Rolling Dice and Checks | 183-186 | `rolling-dice-and-checks` |
| Pantheon Pool, Strength, and Movement | 187-189 | `pantheon-pool-strength-and-movement` |
| Free Time and Wealth | 190-192 | `free-time-and-wealth` |
| Interacting with Attachments and Territory | 193-195 | `interacting-with-attachments-and-territory` |
| Timing, Initiative, and Turns | 197-199 | `timing-initiative-and-turns` |
| Actions and Defenses | 200-203 | `actions-and-defenses` |
| Damage, Conditions, and Healing | 204-208 | `damage-conditions-and-healing` |
| Armor, Weapons, and Range | 209-212 | `armor-weapons-and-range` |
| Antagonist Types and Formatting | 217-219 | `antagonist-types-and-formatting` |
| Animals and Mortals | 220-224 | `animals-and-mortals` |
| The Touched | 225-230 | `the-touched` |
| Other Gods | 231-233 | `other-gods` |
| Outsiders: Overview through Hydras | 234-243 | `outsiders-overview-through-hydras` |
| Outsiders: Kappa through Satyrs | 244-253 | `outsiders-kappa-through-satyrs` |
| Outsiders: Slashers through Elementals | 254-258 | `outsiders-slashers-through-elementals` |
| Custom Antagonists | 259 | `custom-antagonists` |
| Developing Stories, Extras, Setting, and Plots | 263-266 | `developing-stories-extras-setting-and-plots` |
| Pacing, Conflict, Conclusions, and Story Tricks | 267-271 | `pacing-conflict-conclusions-and-story-tricks` |
| Attachment Tricks, Downtime, Territory, and Sourcing Players | 272-277 | `attachment-tricks-downtime-territory-and-sourcing-players` |
| Random Occupations | 282 | `random-occupations` |
| Random Archetypes | 283 | `random-archetypes` |
| Random Dominions, Attachments, and Theologies | 284 | `random-dominions-attachments-and-theologies` |

## Missing Or Intentionally Uncovered

These book-page gaps are not represented as rules-reference pages in `complete-rules.json`.

| Book pages | Status | Notes |
| --- | --- | --- |
| 1-10 | Uncovered front matter | Cover, credits, title, and non-table rules front matter are not needed for play reference. |
| 14-22 | Missing / low priority | Introductory setting prose between core glossary and divine concept rules. Add later only if a lore-reference journal is desired. |
| 26, 34, 70-71, 74-75, 78-79, 82-83, 86-87, 90-91, 94-95, 98-99, 102-103, 132, 136, 174, 196, 213-216, 226, 246, 260-262 | Likely dividers, art, fiction, or blank/transition pages | These gaps align with section breaks and chapter transitions in the extracted source. They are not current rules-reference priorities. |
| 278-281 | PDF spot-checked, represented elsewhere | Character sheet and Territory Grid handout material. The system represents these through the actor sheet and premade territory scene instead of rules-reference Journal pages. |
| 285-307 | PDF spot-checked, not imported as rules journals | Backers List and Backers' Pregens. The 9 pregens now ship as optional character Actor documents with embedded owned Items; the Backers List remains intentionally outside rules-reference journals. |
| 308+ | PDF spot-checked, intentionally uncovered | Index plus GM/player quick-reference material. No additional core rules Item family was found here. Add Journal reference pages only if table lookup inside Foundry is desired. |

## Thin But Present Sections

No JournalEntry pages are mechanically empty or below 1,200 HTML characters. The following pages are present but should be considered thin or table-dependent:

| Section | Book pages | Reason |
| --- | --- | --- |
| Custom Antagonists | 259 | Present as the custom-antagonist band table only; this is enough for the builder, but a later UX pass could turn the table into a formatted quick reference. |
| Random Occupations | 282 | Present but table extraction is compact and should be checked visually against the PDF if table layout precision matters. |
| Random Archetypes | 283 | Present as a compact journal page. The RollTable pack now adds the missing per-archetype Attachment, Blessing, and Curse option tables derived from the source choices. |
| Random Dominions, Attachments, and Theologies | 284 | Present as a compact journal page. The RollTable rows remain available, and the 133 specific Dominion entries now also generate standalone Domain Items. |
| Other Gods | 231-233 | Present and readable, but dense template guidance may benefit from separate template cards later. |

## Highest-Priority Follow-Ups

1. Decide whether the PDF tail index and quick-reference sheets should become Journal pages.
2. Convert compact random tables into table-formatted JournalEntry pages where layout matters at the table.
3. Split dense Manifestation skill pages into one JournalEntry page per Manifestation if users need faster in-play lookup.
4. Split dense Theology pages into one page per Theology for character creation ergonomics.
5. Split Other Gods templates into one page or Actor/Item helper per god archetype.
6. Add visual PDF QA for pages flagged with extraction-noise headings, especially archetypes, skill list, battle actions, opposition, and story tables.

## Compendium Build Validation Notes

Rules journals are generated through `module/data/premade-journals.mjs` and written to the `rules-reference` compendium pack.

Current safety checks:

- `loadRulesJournals()` returns an empty array if `complete-rules.json` cannot be fetched or is not an array.
- `normalizeRulesJournal()` ignores journals without a name or usable page list.
- `normalizeRulesPage()` ignores pages without a name or HTML content.
- `normalizeRulesPage()` also normalizes journal HTML into Foundry-friendly text-page markup and adds source-page metadata flags.
- Pack building keys JournalEntries by stable source metadata and writes the current source-backed rules journals into the declared system pack.
- Re-running the pack build should not create duplicate rules-reference JournalEntries.
