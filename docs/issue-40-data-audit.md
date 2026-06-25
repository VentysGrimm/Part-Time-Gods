# PTG2E Rules Data Audit

This note tracks source-backed data checks for issue #40. Page numbers are book
page numbers from the curated rules reference payload.

## Occupations

Checked against Part-Time Gods Second Edition book pp. 37-49.

| Occupation | Source Page | Skill Grants |
| --- | ---: | --- |
| Academic | 37 | Crafts +1, Discipline +1, Knowledge +1, Perception +1, Stealth +1 |
| Blue Collar | 38 | Fighting +1, Fortitude +1, Might +1, Survival +1, Travel +1 |
| Creative | 40 | Crafts +1, Empathy +1, Marksman +1, Perform +1, Speed +1 |
| Criminal | 41 | Deception +1, Influence +1, Marksman +1, Speed +1, Stealth +1 |
| Fringe | 42 | Athletics +1, Empathy +1, Fortitude +1, Stealth +1, Survival +1 |
| Medical | 43 | Discipline +1, Empathy +1, Intuition +1, Medicine +1, Might +1 |
| Peacekeepers | 45 | Athletics +1, Influence +1, Intuition +1, Perception +1, Speed +1 |
| Physical | 46 | Athletics +1, Discipline +1, Fighting +1, Might +1, Perform +1 |
| Public Life | 47 | Deception +1, Fortitude +1, Influence +1, Perform +1, Tech +1 |
| Unemployed | 48 | Fighting +1, Medicine +1, Perception +1, Tech +1, Travel +1 |
| White Collar | 49 | Deception +1, Knowledge +1, Marksman +1, Medicine +1, Tech +1 |

Implementation notes:

- Base Occupation Items now grant only the book-listed Occupation Skills.
- Career data remains responsible for Free Time, Wealth, Attachment choice, Blessing, and Curse.
- The broad Occupation label is normalized to `Fringe`, matching the book and random table source text.

## Archetypes

Checked against Part-Time Gods Second Edition book pp. 51-59.

| Archetype | Source Page | Skill Grants | Attachment Options |
| --- | ---: | --- | --- |
| The Caregiver | 51 | Empathy +1, Fighting +1, Medicine +1, Perception +1, Travel +1 | +2 Individual Bond or +2 Landmark Bond |
| The Companion | 52 | Empathy +1, Influence +1, Medicine +1, Might +1, Speed +1 | +2 Individual Bond or +2 Worshipper Entitlement |
| The Dreamer | 52 | Crafts +1, Discipline +1, Perception +1, Perform +1, Tech +1 | +2 Landmark Bond or +2 Relic Entitlement |
| The Fool | 53 | Fortitude +1, Intuition +1, Marksman +1, Speed +1, Survival +1 | +2 Individual Bond or +2 Group Bond |
| The Hero | 54 | Athletics +1, Crafts +1, Fighting +1, Perform +1, Survival +1 | +2 Individual Bond or +2 Landmark Bond |
| The Innocent | 54 | Crafts +1, Intuition +1, Knowledge +1, Perform +1, Stealth +1 | +2 Group Bond or +2 Landmark Bond |
| The Lover | 55 | Deception +1, Influence +1, Marksman +1, Stealth +1, Tech +1 | +2 Individual Bond or +2 Group Bond |
| The Rebel | 56 | Fortitude +1, Influence +1, Marksman +1, Might +1, Stealth +1 | +2 Group Bond or +2 Vassal Entitlement |
| The Sage | 57 | Crafts +1, Empathy +1, Intuition +1, Knowledge +1, Perception +1 | +2 Group Bond or +2 Worshipper Entitlement |
| The Tyrant | 57 | Athletics +1, Deception +1, Discipline +1, Might +1, Speed +1 | +2 Group Bond or +2 Vassal Entitlement |
| The Visionary | 58 | Discipline +1, Fortitude +1, Intuition +1, Tech +1, Travel +1 | +2 Individual Bond or +2 Worshipper Entitlement |
| The Wanderer | 59 | Athletics +1, Fighting +1, Knowledge +1, Survival +1, Travel +1 | +2 Group Bond or +2 Relic Entitlement |

Implementation notes:

- Archetype Items now carry all three Blessing options and both Curse options in structured arrays.
- Archetype Items now carry the two book-listed Attachment options in structured arrays.
- The application workflow still needs issue #59 to prompt for the selected Blessing and Curse.

## Dominions

Checked against Part-Time Gods Second Edition book pp. 61-66.

| Dominion Category | Source Page | Skill Grants | Manifestation Grants | Attachment Options |
| --- | ---: | --- | --- | --- |
| Bestial | 61 | Athletics +1, Fortitude +1, Stealth +1, Survival +1, Travel +1 | Journey +1, Ruin +1 | +2 Vassal Entitlement and Level 1 Landmark Bond |
| Conceptual | 62 | Deception +1, Intuition +1, Knowledge +1, Perform +1, Speed +1 | Oracle +1, Soul +1 | +1 Group Bond and Level 2 Landmark Bond |
| Elemental | 63 | Fighting +1, Intuition +1, Might +1, Perception +1, Travel +1 | Ruin +1, Shaping +1 | Level 3 Landmark Bond |
| Emotional | 63 | Discipline +1, Empathy +1, Influence +1, Medicine +1, Tech +1 | Minion +1, Puppetry +1 | +1 Individual Bond and Level 2 Landmark Bond |
| Patrons | 65 | Crafts +1, Fighting +1, Marksman +1, Perform +1, Travel +1 | Aegis +1, Minion +1 | +2 Worshippers Entitlement and Level 1 Landmark Bond |
| Tangible | 65 | Crafts +1, Medicine +1, Might +1, Stealth +1, Tech +1 | Beckon +1, Puppetry +1 | +2 Relic Entitlement and Level 1 Landmark Bond |
| Crossovers | 66 | Discipline +1, Knowledge +1, Marksman +1, Speed +1, Survival +1 | Aegis +1, Soul +1 | +1 Attachment of choice and Level 2 Landmark Bond |

Implementation notes:

- Dominion Items now carry structured Attachment, Blessing, and Curse option arrays.
- Base Dominion grants are limited to Skills and Manifestations until the custom Dominion workflow is implemented.

## Theologies

Checked against Part-Time Gods Second Edition book pp. 67-69, 72-73, 76-77,
80-81, 84-85, 88-89, 92-93, 96-97, and 100-101.

| Theology | Source Page | Skill Grants | Manifestation Grants | Free Time / Wealth | Blessing / Curse |
| --- | ---: | --- | --- | --- | --- |
| Ascendants | 68 | Athletics +1, Fighting +1, Fortitude +1, Might +1, Survival +1 | Minion +1, Ruin +1, Shaping +2 | +2 / +1 | Inhuman Visage / Cut Off from the World |
| Cult of the Saints | 72 | Discipline +1, Empathy +1, Intuition +1, Perception +1, Survival +1 | Beckon +1, Oracle +2, Soul +1 | +2 / +1 | Divine Words / Follow the Voices |
| Drifting Kingdoms | 76 | Crafts +1, Fortitude +1, Marksman +1, Medicine +1, Travel +1 | Aegis +1, Journey +2, Shaping +1 | +3 / +0 | Instant Domain / Wanderlust |
| Kunitsukami | 80 | Discipline +1, Intuition +1, Medicine +1, Perception +1, Speed +1 | Puppetry +1, Oracle +1, Soul +2 | +2 / +1 | Eight Million Spirits / In the Middle |
| Masks of Jana | 84 | Deception +1, Knowledge +1, Speed +1, Stealth +1, Survival +1 | Aegis +1, Beckon +2, Shaping +1 | +1 / +2 | Forgotten / Disconnection |
| Order of Meskhenet | 88 | Deception +1, Influence +1, Knowledge +1, Perform +1, Tech +1 | Minion +2, Puppetry +1, Soul +1 | +0 / +4 | Divine Inheritance / Family Loyalty |
| Phoenix Society | 92 | Athletics +1, Empathy +1, Perform +1, Stealth +1, Tech +1 | Aegis +2, Oracle +1, Ruin +1 | +2 / +1 | Linked to Humanity / Intimacy Addiction |
| Puck-Eaters | 96 | Athletics +1, Deception +1, Fighting +1, Influence +1, Travel +1 | Journey +1, Minion +1, Ruin +2 | +2 / +1 | Cannibal Behavior / Unceasing Appetite |
| Warlock's Fate | 100 | Crafts +1, Empathy +1, Influence +1, Knowledge +1, Perception +1 | Beckon +1, Journey +1, Puppetry +2 | +1 / +2 | See Connections / Manipulators |

Implementation notes:

- Theology Items now include source-backed `blessingSummary` and `curseSummary` fields.
- Corrected Kunitsukami and Order of Meskhenet grants, which were the largest drift from the source data.
- The Undecided / No Theology option remains a separate slice in issue #63.
