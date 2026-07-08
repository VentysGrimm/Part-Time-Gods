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
| JavaScript syntax check | Pass | `node --input-type=module --eval "await import('./scripts/check-syntax.mjs')"` reported 59 files checked. Direct `npm.cmd run check` cannot be run in the sandbox because Node path resolution hits `EPERM` on `C:\Users\Owner\AppData\Local\FoundryVTT\Data`. |
| Release validation | Pass | 62 actors, 769 items, 40 choices, 9 journals, 91 roll tables, 1 scene, 8 macros, stable source keys. |
| Automated tests | Pass | All 6 test modules pass through isolated `node --input-type=module --eval "await import(...)"` executions. Direct `node --test` cannot be run in the sandbox because Node path resolution hits `EPERM` on `C:\Users\Owner\AppData\Local\FoundryVTT\Data`. |
| Release ZIP build | Pass | `dist\part-time-gods-0.0.2.zip` and `dist\system.json` were generated with the live manifest values. |
| GitHub Actions | Pass | Main branch validation for the drop-data and initiative coverage slice passed at `91094ebd90f293cb4f516e323f3bb3a27aee3152`: `https://github.com/VentysGrimm/Part-Time-Gods/actions/runs/28949168516`. |
| Public manifest install path | Pass for fetchability | `https://github.com/VentysGrimm/Part-Time-Gods/releases/latest/download/system.json` returned HTTP 200 and advertises itself as the manifest URL. |
| Public ZIP install path | Pass for fetchability | `https://github.com/VentysGrimm/Part-Time-Gods/releases/download/v0.0.2/part-time-gods-0.0.2.zip` returned HTTP 200 as a release asset. |

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
| Drag/drop Occupation item | Pending | Drag/drop matrix not yet run live. Automated coverage now verifies shared Item drop-data resolution for UUID, compendium pack, world Item, and embedded data sources. |
| Drag/drop Archetype item | Pending | Drag/drop matrix not yet run live. Automated coverage now verifies shared Item drop-data resolution for UUID, compendium pack, world Item, and embedded data sources. |
| Drag/drop Dominion item | Pending | Drag/drop matrix not yet run live. Automated coverage now verifies shared Item drop-data resolution for UUID, compendium pack, world Item, and embedded data sources. |
| Drag/drop Theology item | Pending | Drag/drop matrix not yet run live. Automated coverage now verifies shared Item drop-data resolution for UUID, compendium pack, world Item, and embedded data sources. |
| Drag/drop Blessing item | Pending | Drag/drop matrix not yet run live. Automated coverage now verifies shared Item drop-data resolution for UUID, compendium pack, world Item, and embedded data sources. |
| Drag/drop Curse item | Pending | Drag/drop matrix not yet run live. Automated coverage now verifies shared Item drop-data resolution for UUID, compendium pack, world Item, and embedded data sources. |
| Drag/drop Truth item | Pending | Drag/drop matrix not yet run live. Automated coverage now verifies shared Item drop-data resolution for UUID, compendium pack, world Item, and embedded data sources. |
| Drag/drop Relic item | Pending | Drag/drop matrix not yet run live. Automated coverage now verifies shared Item drop-data resolution for UUID, compendium pack, world Item, and embedded data sources. |
| Drag/drop Bond item | Pending | Drag/drop matrix not yet run live. Automated coverage now verifies shared Item drop-data resolution for UUID, compendium pack, world Item, and embedded data sources. |
| Drag/drop Worshipper item | Pending | Drag/drop matrix not yet run live. Automated coverage now verifies shared Item drop-data resolution for UUID, compendium pack, world Item, and embedded data sources. |
| Drag/drop Vassal item | Pending | Drag/drop matrix not yet run live. Automated coverage now verifies shared Item drop-data resolution for UUID, compendium pack, world Item, and embedded data sources. |
| Drag/drop Condition item | Pending | Drag/drop matrix not yet run live. Automated coverage now verifies shared Item drop-data resolution for UUID, compendium pack, world Item, and embedded data sources. |
| Drag/drop Weapon item | Pending | Drag/drop matrix not yet run live. Automated coverage now verifies shared Item drop-data resolution for UUID, compendium pack, world Item, and embedded data sources. |
| Drag/drop Armor item | Pending | Drag/drop matrix not yet run live. Automated coverage now verifies shared Item drop-data resolution for UUID, compendium pack, world Item, and embedded data sources. |
| Roll Skill Combo | Pass | Standard zero-pool Skill Combo posted a Fate Die card. Opposed and extended checks also posted chat cards. |
| Roll Manifestation | Pass | `QA Character: Aegis + Discipline` posted Base Pool 5d10, Successes 3, Difficulty 1, Margin 2, Success. |
| Roll opposed check | Pass | `QA Character: Athletics + Athletics`, Mode Opposed, Base Pool 6d10, Successes 1 vs Difficulty 2, Failure. |
| Roll extended check | Pass | `QA Character: Athletics + Athletics`, Mode Extended, Base Pool 6d10, Successes 3, Extended Progress 5/6, In Progress, Success. |
| Apply Health damage | Pass | Chat card posted `Health Damage`, Raw Damage 2, Applied 2, `Health: 8 -> 6`. |
| Apply Psyche damage | Pass | Chat card posted `Psyche Damage`, Raw Damage 2, Applied 2, `Psyche: 10 -> 8`. |
| Apply armor | Partial | Health damage dialog exposed and used the armor toggle, but `QA Character` had no equipped armor in the live pass. Automated coverage now exercises `applyDamageToActor()` with equipped armor plus a matching proof quality; live equipped-armor reduction still needs coverage. |
| Apply Conditions | Pass | Chat card added custom condition `QA Smoke Strain`, category physical, severity 1, to `QA Character`. |
| Recover/reduce Conditions | Pass | `Reduce` removed `QA Smoke Strain`. Explicit `Recover` on `QA Recover Check` rolled Medicine + Empathy and posted `Severity: 1 -> 0`, Outcome Removed. |
| Apply healing | Pass | Character sheet resource restore increased Health from 6/8 to 7/8. Combat-control healing remains untested until an active encounter exists. |
| Use `/ptg-combat` or GM panel replacement | Partial | GM setup panel `Combat Controls` correctly warned before an encounter existed. In the active encounter retest, Combat Controls initially failed because v14 collection-backed `combat.combatants` was treated as an array; this was fixed in `module/combat/ptg-combat.mjs`, Foundry was reloaded, and Combat Controls opened and posted a `Round and Turn Sequence` card. Automated coverage now verifies collection-backed combatants render in the dialog and `rollPTGInitiative()` updates collection-backed combatants. Combatant-specific action markers and combat-control healing still need live coverage after adding actors to the encounter. |
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
- Active-combat retest created and started Combat encounter 1, then verified the GM panel `Combat Controls` dialog opened after the v14 combatants collection fix and posted `Round and Turn Sequence` to chat.
- Shared drop-data resolver coverage verifies Item drops from UUID, compendium pack, world Item, and embedded data payloads, which supports the actor-sheet drag/drop matrix but does not replace the required live sheet drop pass.
- Combat-control coverage verifies both dialog option rendering and initiative updates for Foundry v14 collection-backed combatants.

## Unresolved Coverage Gaps

| Gap | Impact | Next Action |
| --- | --- | --- |
| Foundry install-by-manifest UI has not been run in a clean install target. | Public URL fetchability is proven, but the Foundry installer path itself is not. | Use a separate Foundry data path or temporarily remove the local system, install from the GitHub Release manifest URL, then open a world. |
| Drag/drop item matrix is untested live. | Shared drop-data resolution is covered for Foundry Item source shapes, but owned Item sheet drop behavior across the main player-facing item types is not proven in the browser. | Drag/drop Occupation, Archetype, Dominion, Theology, Blessing, Curse, Truth, Relic, Bond, Worshipper, Vassal, Condition, Weapon, and Armor onto a character and record the resulting owned Items. |
| Equipped armor reduction has automated coverage but still needs live UI proof. | The armor toggle exists and `applyDamageToActor()` is covered for equipped armor plus matching proof quality, but the live actor sheet/dialog path is not proven with equipped armor on `QA Character`. | Add or equip armor on `QA Character`, apply Health damage with armor enabled, and verify reduced Applied damage in Foundry chat. |
| Active combat helper flow is partially tested. | Combat Controls now opens and posts an encounter helper card in an active encounter, and automated tests cover collection-backed dialog rendering plus initiative updates. Action-state markers and combat-control healing are not live-proven. | Add QA Character and QA Antagonist to the Combat encounter, then run initiative, damage/healing, and action-state posts through Combat Controls. |
| Permission boundaries are untested. | GM-only/player-safe behavior is not proven for owner, observer, and non-owner roles. | Join with test users or configure role ownership states, then verify visible controls and denied actions. |
| Existing-world migration is untested. | Migration support is not proven against an older or populated world. | Run v14 with an existing PTG world snapshot and confirm embedded item migration behavior. |

## Production Blockers / Defects

One product defect was observed and fixed during this pass: active `Combat Controls` could fail in Foundry v14 because `combat.combatants` is collection-backed and was treated as an array in `module/combat/ptg-combat.mjs`. The fix normalizes combatants before dialog rendering, initiative iteration, and round reset updates; the live retest posted the Round and Turn Sequence card. No separate blocker issue was filed because the defect was fixed in this pass. Issue #131 cannot close until the unresolved coverage gaps above are completed or explicitly deferred.

## Release Gate

Do not tag a production release from this QA pass yet. Automated checks are green and many runtime paths pass, but #131 still has unverified install, drag/drop, equipped armor, active combat, permission, and migration coverage.
