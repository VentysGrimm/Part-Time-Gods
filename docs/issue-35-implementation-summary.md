# Issue 35 Implementation Summary

This summary records the first playable Foundry VTT v14 pass for Part-Time Gods 2E.

## Source Files Reviewed

- `system.json`: Foundry package manifest, compatibility block, actor/item document type declarations, packs, language, styles, and esmodule entry.
- `part-time-gods.js`: system initialization, v14 sheet registration, data model registration, Handlebars helpers, compendium population, chat commands, and worshipper/vassal scene-drop behavior.
- `module/data/complete-rules.json`: source-derived rules journal payload generated from `Part-Time Gods 2e (Updated).pdf`, including page and PDF-page references.
- `module/data/premade-choices.mjs`: source-referenced occupations, archetypes, dominions, theologies, career options, grants, blessings, curses, and attachment data.
- `module/data/premade-items.mjs`: source-referenced truths, relics, worshippers, vassals, bonds, curses, gear, and choice-derived boons.
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

## Partially Defined Or Needs Clarification

- Full battle automation for Battle of Fists and Battle of Wits is not complete. The system tracks health, psyche, armor, initiative, and damage, but does not yet automate full turn/action/defense flow.
- Conditions are currently editable text on the character sheet, not structured condition documents or Active Effects.
- Blessing, curse, power, truth, relic, worshipper, and vassal automation fields exist, but many effects remain narrative or chat-facing until each rule can be mapped safely.
- Prayers, rituals, travel through the Ways, pocket realms, and territory procedures are represented in reference material but are not yet fully automated.
- Outsider/vassal statblocks from the source are not yet converted into a complete NPC compendium.
- TODO: confirm whether Conditions should become Foundry Active Effects, system-owned Item documents, or a lightweight text/list field.
- TODO: confirm whether Worshippers and Vassals should generate full custom actor sheets, antagonist-derived actor sheets, or token-only scene actors.
- TODO: confirm how much copyrighted rules text may be shipped in public compendiums versus local-only imports.

## Recommended Build Order

1. Keep the existing playable foundation stable: manifest, data models, actor/item sheets, dice engine, and compendium seeds.
2. Add structured Conditions because battles, divine powers, blessings, curses, and healing all depend on them.
3. Expand item-use automation one safe item family at a time, starting with weapons, armor, truths, and relics because they already appear on the sheet.
4. Convert source-backed antagonist and vassal statblocks into actor compendium entries.
5. Add battle helpers after Conditions and actor statblocks are structured.
6. Add ritual/prayer/territory workflows once the dependent resources and consequences are represented.

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
