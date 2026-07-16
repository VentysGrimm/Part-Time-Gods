# PTG2E Rules Journal Coverage

Source audited: `module/data/complete-rules.json` plus `tmp/sources/Part-Time Gods 2e Core Rules.pdf`, extracted with PyMuPDF/MuPDF into `tmp/pdfs/ptg-core-rules-mupdf.txt`.

Audit date: 2026-07-12.

## Summary

The rules-reference payload currently provides 9 source-backed JournalEntries with 51 readable JournalEntry pages. The 2026-07-12 audit replaced repeated placeholder sections with source-page-specific summaries derived from the local source PDF and MuPDF extraction cache, including Chapter One's setting spine from The Descending Storm and dedicated Battle of Fists / Battle of Wits procedure pages.

Validation snapshot:

| Check | Result |
| --- | ---: |
| JournalEntries | 9 |
| JournalEntry pages | 51 |
| PDF pages spot-checked by MuPDF extraction | 318 |
| Non-empty extracted PDF pages | 310 |
| Rules summary words | 6,672 |
| Largest page summary | 455 words |
| Pages below 85 words | 0 |
| Repeated placeholder boilerplate pages | 0 |
| PDF extractor artifact pages | 0 |
| Pages without `data-book-page` markers | 0 |
| Duplicate journal/page names | 0 |

The imported pages carry stable metadata through `flags.part-time-gods`: `ruleTopic`, `sourceBook`, `sourcePages`, `sourcePageStart`, `sourcePageEnd`, `slug`, `sourceId`, and `safeSummary`.

Foundry formatting normalization:

- Every imported JournalEntry page is a Foundry text page using the configured HTML journal format.
- Each page body is wrapped in `<article class="ptg-rules-journal" data-rule-topic="...">`.
- A single source aside is added at the top of each page.
- Source page markers remain as `data-book-page` markers for lookup and validation.
- Stat-block lines such as Threshold, Armor, Attack, Defense, Initiative, Damage, Skills, and Rank are rendered as paragraphs instead of heading spam.
- Extracted running-foot artifacts are removed from imported journal markup.
- Validation fails if repeated placeholder text, known extractor artifacts, repeated rules paragraphs, or thin summary pages return.
- Existing rules-reference compendium entries are refreshed in place when premade compendiums are populated again.

## Covered Sections

| Journal | Pages | Source book pages | Coverage status |
| --- | ---: | --- | --- |
| 01. Core Play and Terms | 1 | 11-13 | Covered |
| 02. Divine Concepts | 4 | 14-33 | Covered for The Descending Storm, divine origins, Theologies, Dominions, Territories, Pantheons, Worshippers, Outsiders, secrecy, and staying human |
| 03. Character Creation | 15 | 35-135 | Covered for character creation, occupations, archetypes, dominions, theologies, attachments, advancement, XP, and Spark |
| 04. Divine Expressions | 5 | 137-173 | Covered for Spark, Manifestations, Measures, Rituals, and Otherworlds |
| 05. Dice, Skills, and Resources | 6 | 175-195 | Covered for dice, skills, Pantheon Pool, Strength, Movement, Free Time, Wealth, Attachments, and Territory interaction |
| 06. Divine Battles | 6 | 197-212 | Covered for initiative, action economy, Battle of Fists procedures, Battle of Wits procedures, damage, Conditions, healing, armor, weapons, and range |
| 07. Opposition | 8 | 217-259 | Covered for antagonist rules, animals, mortals, Touched, other gods, Outsiders, and custom antagonists |
| 08. Creating New Myths | 3 | 263-277 | Covered for GM/story guidance, extras, plots, pacing, attachment tricks, downtime, territory, and sourcing players |
| 09. Random Tables | 3 | 282-284 | Covered for random occupations, archetypes, dominions, attachments, and theologies |

## Page-Level Coverage

| Journal page | Book pages | Topic id |
| --- | --- | --- |
| Playing the Game, Dice Basics, and Glossary | 11-13 | `playing-the-game-dice-basics-and-glossary` |
| The Descending Storm and Modern Godhood | 14-22 | `the-descending-storm-and-modern-godhood` |
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
| Battle of Fists Actions and Defenses | 200-202 | `battle-of-fists-actions-and-defenses` |
| Battle of Wits Actions and Defenses | 202-203 | `battle-of-wits-actions-and-defenses` |
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
| 26, 34, 70-71, 74-75, 78-79, 82-83, 86-87, 90-91, 94-95, 98-99, 102-103, 132, 136, 174, 196, 213-216, 226, 246, 260-262 | Likely dividers, art, fiction, or blank/transition pages | These gaps align with section breaks and chapter transitions in the extracted source. They are not current rules-reference priorities. |
| 278-281 | PDF spot-checked, represented elsewhere | Character sheet and Territory Grid handout material. The system represents these through the actor sheet and premade territory scene instead of rules-reference Journal pages. |
| 285-307 | PDF spot-checked, not imported as rules journals | Backers List and Backers' Pregens. The 9 pregens now ship as metadata-only character placeholders with stable source IDs and page references; the Backers List remains intentionally outside rules-reference journals. |
| 308+ | PDF spot-checked, intentionally uncovered | Index plus GM/player quick-reference material. No additional core rules Item family was found here. Add Journal reference pages only if table lookup inside Foundry is desired. |

## Summary Quality

No JournalEntry pages are mechanically empty, below 85 words, or carrying the older repeated placeholder pattern. The pages remain release-safe summaries rather than source-book replacements, but each page now names the actual source topic and how the Foundry system represents it.

Table-heavy pages remain summarized instead of preserving table layout in the journal. The RollTable and Item packs carry the reusable structured data for random character creation, random territory prompts, gear, Conditions, rituals, and opposition.

## Highest-Priority Follow-Ups

1. Decide whether the PDF tail index and quick-reference sheets should become Journal pages.
2. Convert compact random tables into table-formatted JournalEntry pages only where layout matters at the table.
3. Split dense Manifestation skill pages into one JournalEntry page per Manifestation if users need faster in-play lookup.
4. Split dense Theology pages into one page per Theology for character creation ergonomics.
5. Split Other Gods templates into one page or Actor/Item helper per god archetype.
6. Keep the repeated-placeholder and extractor-artifact validation guards active when future journal pages are added.

## Compendium Build Validation Notes

Rules journals are generated through `module/data/premade-journals.mjs` and written to the `rules-reference` compendium pack.

Current safety checks:

- `loadRulesJournals()` returns an empty array if `complete-rules.json` cannot be fetched or is not an array.
- `normalizeRulesJournal()` ignores journals without a name or usable page list.
- `normalizeRulesPage()` ignores pages without a name or HTML content.
- `normalizeRulesPage()` also normalizes journal HTML into Foundry-friendly text-page markup and adds source-page metadata flags.
- `scripts/validate-release.mjs` fails repeated placeholder boilerplate, known PDF extractor artifacts, repeated rules paragraphs, thin pages, missing `safeSummary` flags, and oversized rules-reference payloads.
- Pack building keys JournalEntries by stable source metadata and writes the current source-backed rules journals into the declared system pack.
- Re-running the pack build should not create duplicate rules-reference JournalEntries.
