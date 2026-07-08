# Foundry VTT v14 Production Smoke Test

Status: Blocked before runtime UI testing.

Date: 2026-07-07
System: Part-Time Gods 2E 0.0.2
Repository: VentysGrimm/Part-Time-Gods
OS: Windows, user data under `C:\Users\Owner\AppData\Local\FoundryVTT`
Foundry target: v14 only

## Environment

| Field | Result |
| --- | --- |
| Foundry version | Not confirmed in app. Local installer found: `C:\Users\Owner\Downloads\FoundryVTT-14.363-Setup.exe`. |
| Browser | Not tested. Foundry was not launched. |
| System install from local checkout | Not run in Foundry UI. Checkout is present at `C:\Users\Owner\AppData\Local\FoundryVTT\Data\systems\part-time-gods`. |
| System install from local release ZIP | Not run in Foundry UI. Local release ZIP exists after `npm.cmd run release`: `dist\part-time-gods-0.0.2.zip`. |
| System install from public manifest/latest release | Pending runtime test. The live main-branch manifest and archive URLs returned HTTP 200 after publishing the `v0.0.2` release assets. |
| Screenshots | None. No Foundry UI session was available. |

## Preflight Evidence

| Check | Result | Notes |
| --- | --- | --- |
| JavaScript syntax check | Pass | `npm.cmd run release` reported 56 files checked. |
| Release validation | Pass | 62 actors, 769 items, 40 choices, 9 journals, 91 roll tables, 1 scene, 8 macros, stable source keys. |
| Automated tests | Pass | 10/10 tests passed during `npm.cmd run release`. |
| Release ZIP build | Pass | `dist\part-time-gods-0.0.2.zip` and `dist\system.json` were generated. |
| GitHub Actions | Pass | Main branch run for commit `9d6b4d9348a6e1d1f6d10034d9c7e4136e29cfff` succeeded. |
| Foundry v14 launch | Blocked | No installed Foundry executable was found. Attempting to run the v14.363 installer was canceled. |
| Public manifest install path | Pass for fetchability | `https://raw.githubusercontent.com/VentysGrimm/Part-Time-Gods/main/system.json` returned HTTP 200. |
| Public ZIP install path | Pass for fetchability | `https://github.com/VentysGrimm/Part-Time-Gods/archive/refs/heads/main.zip` returned HTTP 200. |

## Required Runtime Flow

These checks still require a real Foundry v14 session.

| Test | Status | Result / Notes |
| --- | --- | --- |
| Install system from local checkout | Not run | Requires Foundry v14 launch. |
| Install system from release ZIP or manifest | Pending runtime test | Public release manifest and ZIP URLs are live; Foundry v14 install flow still needs to be run. |
| Create a fresh world using the system | Not run | Requires Foundry v14 launch. |
| Create Character actor | Not run | Requires Foundry v14 launch. |
| Create Antagonist actor | Not run | Requires Foundry v14 launch. |
| Create Pantheon actor | Not run | Requires Foundry v14 launch. |
| Populate compendia | Not run | Requires Foundry v14 launch. |
| Create/open territory scene | Not run | Requires Foundry v14 launch. |
| Use character creator with manual choices | Not run | Requires Foundry v14 launch. |
| Use Random God helper | Not run | Requires Foundry v14 launch. |
| Drag/drop Occupation item | Not run | Requires Foundry v14 launch. |
| Drag/drop Archetype item | Not run | Requires Foundry v14 launch. |
| Drag/drop Dominion item | Not run | Requires Foundry v14 launch. |
| Drag/drop Theology item | Not run | Requires Foundry v14 launch. |
| Drag/drop Blessing item | Not run | Requires Foundry v14 launch. |
| Drag/drop Curse item | Not run | Requires Foundry v14 launch. |
| Drag/drop Truth item | Not run | Requires Foundry v14 launch. |
| Drag/drop Relic item | Not run | Requires Foundry v14 launch. |
| Drag/drop Bond item | Not run | Requires Foundry v14 launch. |
| Drag/drop Worshipper item | Not run | Requires Foundry v14 launch. |
| Drag/drop Vassal item | Not run | Requires Foundry v14 launch. |
| Drag/drop Condition item | Not run | Requires Foundry v14 launch. |
| Drag/drop Weapon item | Not run | Requires Foundry v14 launch. |
| Drag/drop Armor item | Not run | Requires Foundry v14 launch. |
| Roll Skill Combo | Not run | Requires Foundry v14 launch. |
| Roll Manifestation | Not run | Requires Foundry v14 launch. |
| Roll opposed check | Not run | Requires Foundry v14 launch. |
| Roll extended check | Not run | Requires Foundry v14 launch. |
| Apply Health damage | Not run | Requires Foundry v14 launch. |
| Apply Psyche damage | Not run | Requires Foundry v14 launch. |
| Apply armor | Not run | Requires Foundry v14 launch. |
| Apply Conditions | Not run | Requires Foundry v14 launch. |
| Recover/reduce Conditions | Not run | Requires Foundry v14 launch. |
| Apply healing | Not run | Requires Foundry v14 launch. |
| Use `/ptg-combat` or GM panel replacement | Not run | Requires Foundry v14 launch. |
| Use `/ptg-territory` or GM panel replacement | Not run | Requires Foundry v14 launch. |
| Use `/ptg-balance` or GM panel replacement | Not run | Requires Foundry v14 launch. |
| Use `/ptg-antagonist-builder` or GM panel replacement | Not run | Requires Foundry v14 launch. |
| Test GM permission boundary | Not run | Requires Foundry v14 launch. |
| Test owner permission boundary | Not run | Requires Foundry v14 launch. |
| Test observer permission boundary | Not run | Requires Foundry v14 launch. |
| Test non-owner permission boundary | Not run | Requires Foundry v14 launch. |
| Test migration against existing world | Not run | Existing worlds are present, but no Foundry v14 session was available. |

## Unresolved Blockers

| Blocker | Impact | Next Action |
| --- | --- | --- |
| Foundry VTT v14 executable is not currently available for launch. | The manual UI smoke test cannot start. | Install or launch Foundry VTT v14.363+ and rerun this document's runtime flow. |
| Public release manifest and ZIP URLs returned 404 before asset publication. | Fetchability is fixed after publishing the `v0.0.2` release assets; Foundry runtime install remains untested. | Close issue #162 and complete the actual Foundry v14 install test under #131. |

## Release Gate

Do not tag a production release from this QA pass. The automated package checks are green, but the required Foundry v14 runtime flow has not been executed.
