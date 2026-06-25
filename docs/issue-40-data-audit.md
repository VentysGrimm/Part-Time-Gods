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
