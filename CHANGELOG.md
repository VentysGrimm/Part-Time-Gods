# Changelog

## Unreleased

- Aligned the 0.1.0 system manifest, package metadata, release validation, and generated compendium metadata version source.
- Added a party-style Mortal-Divine Balance roster and documented workflow macros as compatibility launchers for native sheet, scene, and GM setup entry points.
- Began unifying Territory scene setup and controls behind one native Territory interface API.
- Enforced `package.json`/`system.json` version parity and made release ZIP builds clear stale versioned artifacts from `dist/`.
- Tightened Character title rows, Item sheet fields, rich text editor boxes, and PTG dialog/popout input colors so plain Foundry dialogs stay readable.
- Corrected release-install notes to require publishing the matching 0.1.0 GitHub Release manifest and ZIP assets before treating the live install path as current.
- Added a world-ready Territory startup setting with a resizable, scrollable GM control interface and a player-facing Territory Scene path.
- Added GM Territory background controls for scene image/color changes while keeping the grid overlay foregrounded and fitted to canvas.
- Added Character actor drag/drop import to the GM Territory interface so player territory attachments can seed scene point data.
- Expanded Territory points with rulebook-facing public/GM metadata for control source, boundary status, discovery state, footprint, linked records, and ritual/event tracking.
- Reworked the Mortal-Divine Balance tracker startup into a party-style GM roster with tracked character persistence, character drag/drop/add/remove controls, and a read-only player view for owned characters.
- Reworked Item sheet spacing so fields, selects, text areas, and rich-text sections keep readable sizing, with long rich-text Item sections now collapsible.
- Added permission-aware edit locks to Character, Antagonist, Pantheon, and Item sheets so they open protected against accidental edits until explicitly unlocked.
- Polished Character sheet ability rows so controls stay compact and player-facing detail text renders as readable prose instead of raw markup.
- Corrected character Initiative to Intuition + Speed, wired PTG initiative into Foundry's native Combat Tracker, and made Skill Combo Check dialogs resizable with an internal scroll region.

## 0.0.2 - 2026-06-30

- Added world migration support that converts legacy embedded actor text into canonical owned Items.
- Added roll chat-card actions for opening actors/items, applying Conditions, and applying Health or Psyche damage.
- Added user-facing character creation review and apply-choice previews before actor mutations.
- Added Health/Psyche damage workflow support for armor, severity, recovery, and condition chat actions.
- Added Manifestation Measures support for Fragment spend, Dominion scope penalties, and declared damage/range/target/duration intent.
- Added stable compendium slugs/source IDs and metadata-only rules-journal summaries.
- Expanded generated Item rules explanations, completed the source-listed gear quality reference set, and exposed shared rules explanations on Item sheets.
- Added a shared Pantheon Pool add/spend workflow with chat cards, sheet buttons, and roll-dialog spending from linked Pantheon actors.
- Moved setup and play workflow entry points from legacy chat commands onto Pantheon and antagonist sheet buttons.
- Added a system Macro compendium with workflow macros for GM table tools.
- Added release validation, install, changelog, and attribution notes.
