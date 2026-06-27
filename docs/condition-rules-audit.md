# PTG2E Condition Rules Audit

Audit date: 2026-06-27.

Source audited: `module/data/premade-items.mjs` against the PTG2E battle Conditions section in the rules journal payload, book pp. 205-207.

## Summary

The premade Item data currently includes all 20 PTG2E Conditions found in the book's Conditions list.

| Category | Count | Conditions |
| --- | ---: | --- |
| Physical | 7 | Bleeding, Burned/Frozen, Deprived, Impaired, Injured, Sickened, Unconscious |
| Mental | 7 | Afraid, Confused, Convinced, Dazed, Embarrassed, Hopeless, Overwhelmed |
| Crossover | 6 | Broken, Drunk, Ignored Limits, On the Altar, Pain, Scarred |

No missing book-defined Conditions are currently known from the audited source pages.

## Encoded Metadata

Every premade Condition now carries:

- `category`: physical, mental, or crossover.
- `severity` and `severityMode`: Condition level/rank handling.
- `appliesTo`: health, psyche, both, or fictional state.
- `duration`: persistence bucket for later recovery automation.
- `recovery`: GM/player-facing recovery hint.
- `removal`: automation-facing removal hint.
- `sourcePage` and `sourceSection`.
- `rollModifier`: structured metadata for later roll/effect workflows.
- Existing readable `effect`, `notes`, `rules`, `usage`, and `automation` fields.

Older or custom Condition Items remain valid because the new TypeDataModel fields have defaults.

## Source Page Map

| Condition | Category | Book page |
| --- | --- | ---: |
| Bleeding | Physical | 205 |
| Burned/Frozen | Physical | 205 |
| Deprived | Physical | 205 |
| Impaired | Physical | 206 |
| Injured | Physical | 206 |
| Sickened | Physical | 206 |
| Unconscious | Physical | 206 |
| Afraid | Mental | 206 |
| Confused | Mental | 206 |
| Convinced | Mental | 206 |
| Dazed | Mental | 206 |
| Embarrassed | Mental | 206 |
| Hopeless | Mental | 206 |
| Overwhelmed | Mental | 206 |
| Broken | Crossover | 207 |
| Drunk | Crossover | 207 |
| Ignored Limits | Crossover | 207 |
| On the Altar | Crossover | 207 |
| Pain | Crossover | 207 |
| Scarred | Crossover | 207 |

## Follow-Up Automation Slices

- #105 can use the metadata fields to present stronger Condition UI and severity controls.
- #106 can use `rollModifier` and `appliesTo` when applying battle results.
- #107 can use `duration`, `recovery`, and `removal` for recovery workflows.
- #108 can use `rollModifier` and `automation.condition` to affect rolls and actor state.
