# Premade Item Compendium Audit

Date: 2026-07-12

This note tracks the source-data audit for GitHub issue #172. The repeatable audit command is:

```powershell
node scripts\audit-premade-items.mjs
```

## Current Result

The audit covers both source-backed Item collections that become Foundry Item documents:

| Collection | Count |
| --- | ---: |
| `character-creation` | 40 |
| `premade-items` | 731 |
| Total created Item documents | 771 |

The current audit reports zero issues:

- No invalid Item document types.
- No unapproved folder keys.
- No duplicate type/name pairs.
- No duplicate source IDs.
- No journal-style Item kinds such as `chapter-4-rule`, `chapter-5-rule`, `rules-reference`, or `complete-rules`.
- No Item source IDs pointing at `journal:` content.
- No missing source IDs.

## Folder Coverage

The current source-data folder counts are:

| Folder key | Count |
| --- | ---: |
| `occupation` | 44 |
| `archetype` | 12 |
| `domain` | 140 |
| `theology` | 10 |
| `battle-fists` | 23 |
| `battle-wits` | 23 |
| `manifestation` | 9 |
| `manifestation-application` | 27 |
| `ritual` | 10 |
| `otherworld` | 5 |
| `gearQuality` | 42 |
| `truth` | 22 |
| `relic` | 21 |
| `worshipper` | 11 |
| `bond` | 94 |
| `curse` | 90 |
| `critical-failure-effects` | 11 |
| `condition` | 20 |
| `vassal` | 34 |
| `attachment` | 1 |
| `blessing` | 99 |
| `armor` | 14 |
| `weapon` | 9 |

## Remaining Gate

The source data is clean. Closing #172 still needs either a fresh shipped-pack rebuild/audit or live Foundry compendium verification once the local `packs/**` LevelDB churn is intentionally reconciled.
