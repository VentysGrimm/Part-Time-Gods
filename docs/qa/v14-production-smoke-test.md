# Foundry VTT v14 Production Smoke Test

Status: Runtime QA in progress. Issue #131 remains open.

Updated: 2026-07-08
System: Part-Time Gods 2E 0.0.2
Repository: VentysGrimm/Part-Time-Gods
OS: Windows, user data under `C:\Users\Owner\AppData\Local\FoundryVTT`
Foundry target: v14 only

## Environment

| Field | Result |
| --- | --- |
| Foundry version | Pass. Status API reports Foundry `14.364`. |
| Browser | Pass. Codex in-app browser against `http://127.0.0.1:30000/game`. |
| QA world | Pass. Status API reports active world `ptg-v14-qa-smoke-test`, system `part-time-gods`, system version `0.0.2`. |
| System install from local checkout | Pass. The running QA world is using this checkout at `C:\Users\Owner\AppData\Local\FoundryVTT\Data\systems\part-time-gods`. |
| System install from public manifest/latest release | Pending Foundry installer UI test. Fetchability passes for the live manifest and archive URLs. |
| Screenshots | Not captured in this pass. Browser-visible UI and chat-card evidence recorded below. |

## Preflight Evidence

| Check | Result | Notes |
| --- | --- | --- |
| JavaScript syntax check | Pass | `npm.cmd run release` reported 56 files checked. |
| Release validation | Pass | 62 actors, 769 items, 40 choices, 9 journals, 91 roll tables, 1 scene, 8 macros, stable source keys. |
| Automated tests | Pass | 10/10 tests passed during `npm.cmd run release`. |
| Release ZIP build | Pass | `dist\part-time-gods-0.0.2.zip` and `dist\system.json` were generated with the live manifest values. |
| GitHub Actions | Pass | Main branch run for commit `ab25d4a3d22af6c62578d805551be5a366371b2a` succeeded: `https://github.com/VentysGrimm/Part-Time-Gods/actions/runs/28914026814`. |
| Public manifest install path | Pass for fetchability | `https://raw.githubusercontent.com/VentysGrimm/Part-Time-Gods/refs/heads/main/system.json?live=20260708-0325` returned HTTP 200 and advertises itself as the manifest URL. |
| Public ZIP install path | Pass for fetchability | `https://github.com/VentysGrimm/Part-Time-Gods/archive/refs/heads/main.zip` returned HTTP 200 as `application/zip`. |

## Required Runtime Flow

| Test | Status | Result / Notes |
| --- | --- | --- |
| Install system from local checkout | Pass | Running Foundry v14.364 world is using this checkout. |
| Install system from release ZIP or manifest | Pending runtime install test | Public manifest and archive fetch successfully, but Foundry's install-by-manifest UI has not been completed in a separate install target. |
| Create a fresh world using the system | Pass | Active QA world is `ptg-v14-qa-smoke-test`. |
| Create Character actor | Pass | `QA Character` exists and was used for sheet, creator, roll, damage, condition, and recovery tests. |
| Create Antagonist actor | Pass | `QA Antagonist` exists. |
| Create Pantheon actor | Pass | `QA Pantheon` exists; Pantheon sheet showed Table Tools in prior runtime pass. |
| Populate compendia | Pass | Runtime notification previously reported `Updated 152 Part-Time Gods compendium entries.` |
| Create/open territory scene | Pass | GM setup created/opened `God Territory Grid`; Territory Grid app showed 10x10 grid, 0 points, and 0 influenced cells. |
| Use character creator with manual choices | Pass | Character Creator completed with valid budgets: Skill Points 10/10, Manifestation Points 4/4, Attachment Points 5/5, Spark 1, Fragments 3, Starting Truth `QA Truth`. |
| Use Random God helper | Pass | Random God helper populated source-backed selections including Occupation, Archetype, Dominion, Theology, Blessing, and Curse before final apply. |
| Drag/drop Occupation item | Pending | Drag/drop matrix not yet run. |
| Drag/drop Archetype item | Pending | Drag/drop matrix not yet run. |
| Drag/drop Dominion item | Pending | Drag/drop matrix not yet run. |
| Drag/drop Theology item | Pending | Drag/drop matrix not yet run. |
| Drag/drop Blessing item | Pending | Drag/drop matrix not yet run. |
| Drag/drop Curse item | Pending | Drag/drop matrix not yet run. |
| Drag/drop Truth item | Pending | Drag/drop matrix not yet run. |
| Drag/drop Relic item | Pending | Drag/drop matrix not yet run. |
| Drag/drop Bond item | Pending | Drag/drop matrix not yet run. |
| Drag/drop Worshipper item | Pending | Drag/drop matrix not yet run. |
| Drag/drop Vassal item | Pending | Drag/drop matrix not yet run. |
| Drag/drop Condition item | Pending | Drag/drop matrix not yet run. |
| Drag/drop Weapon item | Pending | Drag/drop matrix not yet run. |
| Drag/drop Armor item | Pending | Drag/drop matrix not yet run. |
| Roll Skill Combo | Pass | Standard zero-pool Skill Combo posted a Fate Die card. Opposed and extended checks also posted chat cards. |
| Roll Manifestation | Pass | `QA Character: Aegis + Discipline` posted Base Pool 5d10, Successes 3, Difficulty 1, Margin 2, Success. |
| Roll opposed check | Pass | `QA Character: Athletics + Athletics`, Mode Opposed, Base Pool 6d10, Successes 1 vs Difficulty 2, Failure. |
| Roll extended check | Pass | `QA Character: Athletics + Athletics`, Mode Extended, Base Pool 6d10, Successes 3, Extended Progress 5/6, In Progress, Success. |
| Apply Health damage | Pass | Chat card posted `Health Damage`, Raw Damage 2, Applied 2, `Health: 8 -> 6`. |
| Apply Psyche damage | Pass | Chat card posted `Psyche Damage`, Raw Damage 2, Applied 2, `Psyche: 10 -> 8`. |
| Apply armor | Partial | Health damage dialog exposed and used the armor toggle, but `QA Character` had no equipped armor. Equipped-armor reduction still needs coverage. |
| Apply Conditions | Pass | Chat card added custom condition `QA Smoke Strain`, category physical, severity 1, to `QA Character`. |
| Recover/reduce Conditions | Pass | `Reduce` removed `QA Smoke Strain`. Explicit `Recover` on `QA Recover Check` rolled Medicine + Empathy and posted `Severity: 1 -> 0`, Outcome Removed. |
| Apply healing | Pass | Character sheet resource restore increased Health from 6/8 to 7/8. Combat-control healing remains untested until an active encounter exists. |
| Use `/ptg-combat` or GM panel replacement | Partial | GM setup panel `Combat Controls` action fired and correctly warned `Start or open a Combat encounter before using PTG combat controls.` Active-combat workflow still needs coverage. |
| Use `/ptg-territory` or GM panel replacement | Pass | GM setup and scene control paths opened Territory Grid tooling and the God Territory Grid scene. |
| Use `/ptg-balance` or GM panel replacement | Pass | GM setup opened Mortal-Divine Balance tracker with `QA Character - Balanced (0)`. |
| Use `/ptg-antagonist-builder` or GM panel replacement | Pass | GM setup opened PTG Opposition Builder and created `QA Builder Antagonist`; the created antagonist sheet rendered with builder notes. |
| Test GM permission boundary | Pending | Current session is GM; explicit role boundary matrix not yet run. |
| Test owner permission boundary | Pending | Non-GM owner account/path not yet tested. |
| Test observer permission boundary | Pending | Observer account/path not yet tested. |
| Test non-owner permission boundary | Pending | Non-owner account/path not yet tested. |
| Test migration against existing world | Pending | Existing-world migration path not yet run. |

## Runtime Evidence Notes

- `QA Character` creator apply path persisted Occupation `Medical - Therapist`, Archetype `The Wanderer`, Dominion `QA God of Smoke Tests`, Theology `Cult of the Saints`, Health 8, Psyche 10, Free Time 4, Wealth 5, and Fragments 3 before later damage tests.
- Manifestation Measures posted `Aegis Measures` with 3 successes available, 1 measure spent on Damage, 2 unspent successes, and QA notes.
- Condition recovery posted both a recovery roll card and a condition recovery summary card.
- Opposition Builder generated a real world Actor instead of only opening the dialog.

## Unresolved Coverage Gaps

| Gap | Impact | Next Action |
| --- | --- | --- |
| Foundry install-by-manifest UI has not been run in a clean install target. | Public URL fetchability is proven, but the Foundry installer path itself is not. | Use a separate Foundry data path or temporarily remove the local system, install from the cache-busted GitHub raw manifest URL, then open a world. |
| Drag/drop item matrix is untested. | Owned Item drop behavior across the main player-facing item types is not proven. | Drag/drop Occupation, Archetype, Dominion, Theology, Blessing, Curse, Truth, Relic, Bond, Worshipper, Vassal, Condition, Weapon, and Armor onto a character and record the resulting owned Items. |
| Equipped armor reduction is untested. | The armor toggle exists, but actual armor mitigation is not proven. | Add or equip armor on `QA Character`, apply Health damage with armor enabled, and verify reduced Applied damage. |
| Active combat helper flow is untested. | Combat Controls guard works, but initiative, active combat healing, and combat action cards are not proven. | Create a Combat encounter with QA actors, then run initiative, damage/healing, and action-state posts through Combat Controls. |
| Permission boundaries are untested. | GM-only/player-safe behavior is not proven for owner, observer, and non-owner roles. | Join with test users or configure role ownership states, then verify visible controls and denied actions. |
| Existing-world migration is untested. | Migration support is not proven against an older or populated world. | Run v14 with an existing PTG world snapshot and confirm embedded item migration behavior. |

## Production Blockers / Defects

No product defect was observed in the runtime paths completed in this pass. No new blocker issue was filed from the completed coverage. Issue #131 cannot close until the unresolved coverage gaps above are completed or explicitly deferred.

## Release Gate

Do not tag a production release from this QA pass yet. Automated checks are green and many runtime paths pass, but #131 still has unverified install, drag/drop, equipped armor, active combat, permission, and migration coverage.
