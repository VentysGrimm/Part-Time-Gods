# Foundry System Completeness Check

Check date: 2026-06-27.

## Result

The workspace is structurally complete as a Foundry VTT v14 game system.

One blocking issue was found and fixed during this pass: the `opposition-actors` compendium was declared in `system.json` with the path `packs/npcs`, while the populated LevelDB pack lives at `packs/opposition-actors`. The manifest now points to `packs/opposition-actors`.

## Validated

- `system.json` parses and declares the system id, title, version, Foundry v14 compatibility, ES module, stylesheet, language file, packs, actor document types, item document types, and token attributes.
- All manifest-declared module, style, language, and pack paths exist.
- All declared pack paths include a LevelDB `CURRENT` file.
- On GM ready, the system groups all declared PTG compendium packs under a top-level Compendium folder named `Part Time Gods` for sidebar management.
- `lang/en.json` parses and includes labels for every declared Actor and Item type.
- `module/data/complete-rules.json` parses.
- All 35 `.js`/`.mjs` files pass `node --check`.
- Relative ES module import targets exist.
- Referenced ApplicationV2/sheet templates exist.
- Actor and Item data models registered in `part-time-gods.js` match the `system.json` document types.
- Premade source data imports with a Foundry/fetch stub:
  - 40 character-creation Choice Items
  - 647 premade Items
  - 53 premade Actors
  - 86 RollTables
  - 1 Scene
  - 9 rules-reference Journals with 48 pages
- Premade choices, items, actors, roll tables, scenes, and journals have no duplicate document keys and no nameless records.

## Non-Blocking Cleanup

- The local folder has an empty `.git` directory, so `git status` reports that this workspace is not a Git repository. This does not affect Foundry loading, but it means Git history/diff checks must happen in another checkout or after the repository metadata is restored.
- Legacy undeclared pack directories remain under `packs/`: `conditions`, `domains`, `npcs`, `powers`, and `relics`. They are not referenced by `system.json` and will not load as system packs.
- Old unused templates remain present: `templates/chat/roll-card.hbs`, `templates/item/domain-sheet.hbs`, and `templates/item/power-sheet.hbs`. The active implementation uses inline roll chat cards and the unified item sheet.

## Conclusion

The package has the required Foundry system surface: manifest, startup module, registered document models, registered sheets, templates, styles, language file, declared packs, and source-backed compendium seed data. The remaining notes are release-cleanup items rather than load blockers.
