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
| `premade-items` | 600 |
| Total created Item documents | 640 |

The current audit reports zero issues:

- No invalid Item document types.
- No unapproved folder keys.
- No duplicate type/name pairs.
- No duplicate source IDs.
- No journal-style Item kinds such as `chapter-4-rule`, `chapter-5-rule`, `rules-reference`, or `complete-rules`.
- No Item source IDs pointing at `journal:` content.
- No missing source IDs.
- No Battle of Fists/Wits action Items; those procedures now live in rules-reference Journal pages.
- No Manifestation Application, Critical Failure Effect, or Gear Quality rules-reference Items; those now live in rules-reference Journal pages.

## Folder Coverage

The current source-data folder counts are:

| Folder key | Count |
| --- | ---: |
| `occupation` | 44 |
| `archetype` | 12 |
| `domain` | 140 |
| `theology` | 10 |
| `manifestation` | 9 |
| `ritual` | 10 |
| `truth` | 22 |
| `relic` | 21 |
| `worshipper` | 11 |
| `bond` | 94 |
| `curse` | 90 |
| `condition` | 20 |
| `vassal` | 34 |
| `attachment` | 1 |
| `blessing` | 99 |
| `armor` | 14 |
| `weapon` | 9 |

## Remaining Gate

The source data is clean. Closing #180/#181 still needs a fresh shipped-pack rebuild/audit or live Foundry compendium verification once the local `packs/**` LevelDB churn is intentionally reconciled.

2026-07-12 live browser note: opening the current `Part-Time Gods Premade Items` compendium in the running QA world still showed stale pack folders such as `Chapter-4-ruless`, `Chapter-5-ruless`, and `Otherworld Travel`. Those folders are no longer present in the source audit above, so this is live/generated LevelDB pack state, not current source data. Runtime population now also retires empty `Battle of Fists Actions`, `Battle of Wits Actions`, `Critical Failure Effects`, `Gear Qualities`, and `Manifestation Applications` folders after their stale Items are removed. Rebuild and re-audit the shipped pack after Foundry releases the `packs/**` locks.
