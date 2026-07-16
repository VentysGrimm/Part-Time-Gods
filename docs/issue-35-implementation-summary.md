# Issue 35 Implementation Summary

This summary records the first playable Foundry VTT v14 pass for Part-Time Gods 2E.

## Source Files Reviewed

- `system.json`: Foundry package manifest, compatibility block, actor/item document type declarations, packs, language, styles, and esmodule entry.
- `part-time-gods.js`: system initialization, v14 sheet registration, data model registration, Handlebars helpers, compendium population, public API exports, and worshipper/vassal scene-drop behavior.
- `module/data/complete-rules.json`: source-derived rules journal payload generated from `Part-Time Gods 2e (Updated).pdf`, including page and PDF-page references.
- `module/data/premade-choices.mjs`: source-referenced occupations, archetypes, dominions, theologies, career options, grants, blessings, curses, and attachment data.
- `module/data/premade-items.mjs`: source-referenced truths, relics, worshippers, vassals, bonds, curses, gear, and choice-derived boons.
- `module/data/premade-character-actors.mjs`: metadata-only Backers' Pregens character placeholders with stable source IDs and PDF page references.
- `module/data/premade-journals.mjs`: rules-reference journal structure and complete-rules import path.
- `module/data/premade-scenes.mjs`: source-referenced territory grid scene seed.
- `module/documents/models/actor/*.mjs`: character, antagonist, and pantheon data models.
- `module/documents/models/item/item-models.mjs`: item data models for all declared Part-Time Gods item types.
- `module/documents/actor/part-time-gods-actor.mjs`: derived character data, resource spending, choice application, and item-use hooks.
- `module/dice/ptg-dice-engine.mjs`: Skill Combo and Manifestation roll resolution.
- `module/sheets/*.mjs`, `templates/actor/*.hbs`, `templates/item/*.hbs`, and `styles/part-time-gods.css`: visible actor/item sheet implementation and styling.

## Clearly Defined Enough To Build

- Foundry v14 system manifest and package structure.
- Actor types: `character`, `antagonist`, and `pantheon`.
- Item types: occupations, archetypes, dominions, theologies, powers, bonds, truths, relics, worshippers, vassals, blessings, curses, weapons, and armor.
- Character identity, resources, derived stats, skills, manifestations, attachments, conditions, specialties, notes, XP, and sheet-facing progression fields.
- Skill Combo rolls: roll a d10 pool from two skills, count 7-9 as one success and 10 as two successes, compare to difficulty, and show chat output.
- Manifestation rolls: roll manifestation rating plus selected skill through the same success-counting engine.
- Starter character creation choices, item content, territory grid scene, and rules-reference compendiums.
- Worshippers and vassals as owned items when dropped on a character sheet, and as scene actors/tokens when dropped on a Scene.
- Basic gear, relic, truth, blessing, curse, bond, worshipper, and vassal sheet visibility.

## Resolved Workflow Decisions

- Battle flow is handled through the Pantheon sheet Combat Controls button: initiative, round/action/defense markers, Battle of Fists, Battle of Wits, direct Health/Psyche damage, healing, armor, weapon qualities, Boost damage, and Condition application/recovery. The battle dialog accepts manual successes or rolls antagonist/vassal statblock Attack and Defense pools, and direct damage can be aimed at either Health or Psyche while armor only reduces Health damage.
- Conditions are system-owned `condition` Item documents. They are the source of truth for severity, category, duration, recovery, roll metadata, and chat workflow. Foundry Active Effects are not the primary representation because PTG Conditions are narrative/severity records whose effects depend on check context; the system applies their structured metadata through `conditionRollEffects()` instead.
- Prayers are handled through Worshipper request cards with Strain, risk, resource changes, consequences, results, and request logs.
- Vassals use task cards with Strain, risk, statblock pool rolls, current task/risk fields, request logs, and scene-drop actor generation.
- Ritual `power` Items execute their `automation.roll` metadata on use. Rituals roll Skill + Manifestation from the source-backed Item definition; Ways travel is now represented in the `Rituals and Otherworlds` rules journal as a staged GM-facing procedure instead of standalone Power Items.
- Opposition statblocks are converted into the `opposition-actors` compendium. Source-backed Outsider Vassal Items embed antagonist actor templates with threshold, health, psyche, armor, fragments, attack, defense, initiative, damage, skills, powers, condition handling, source page, and power hooks.
- Backers' Pregens are converted into metadata-only `character` placeholders in the `opposition-actors` compendium, grouped under `Backers' Pregens`, without source stat blocks, prose, or embedded Items.
- Public compendium content remains curated summaries, metadata, and workflow text rather than a raw one-page-per-source-page dump.

## Recommended Build Order

1. Keep the existing playable foundation stable: manifest, data models, actor/item sheets, dice engine, and compendium seeds.
2. Keep Conditions as Item documents and expand only rule-specific roll metadata when a source entry clearly maps to numeric automation.
3. Expand item-use automation one safe item family at a time, starting with Blessings, Curses, Truths, and Relics whose effects can be mapped without table-specific judgment.
4. Use the shipped Pantheon Pool and Story Workflow helpers for shared dice, attachment tricks, downtime/job fallout, territory hooks, and player-sourcing prompts.
5. Treat PDF tail references as optional content, not core load blockers; Backers' Pregens now ship only as metadata placeholders until permission is confirmed.

## Foundry VTT v14 Compatibility Notes

- The system uses `esmodules`, `documentTypes`, and v14 compatibility metadata in `system.json`.
- Actor and Item sheets extend `ActorSheetV2` and `ItemSheetV2` through `HandlebarsApplicationMixin`.
- Sheet registration uses `foundry.applications.apps.DocumentSheetConfig`.
- Dialogs use `DialogV2`.
- Drag/drop data uses `foundry.applications.ux.TextEditor.getDragEventData`.
- Sheets use `DEFAULT_OPTIONS`, `PARTS`, `_prepareContext`, and `_onRender` patterns compatible with ApplicationV2 sheets.

## Missing Files Required For Load

No required load files were missing during this pass. The system has a manifest, esmodule entry, styles, language file, data models, sheets, templates, and declared packs.

Local source PDFs and scratch extraction files should remain under ignored `tmp/` or `temp/` paths and should not be required for Foundry to load the system.

## First Playable Version Status

- Foundry v14 can load the package structure.
- A world can use the system manifest.
- Character, antagonist, and pantheon actors can be created.
- Items can be created for the declared Part-Time Gods item types.
- Actor and item sheets have visible, editable UI.
- Skill Combo and Manifestation rolls can be made from the character sheet and create chat output.
- Starter compendiums can populate character creation choices, premade items, rules reference journals, and a territory grid scene.
- The current implementation is intentionally small and modular, with unresolved source interpretation questions documented above.
