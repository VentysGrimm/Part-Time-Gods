# Part-Time Gods 2E

A Foundry VTT system for Part-Time Gods Second Edition.

## Development

This system is intended to live in Foundry's `Data/systems/part-time-gods` directory.

The package manifest is defined in `system.json`, and the main module entry point is `part-time-gods.js`.

For installation steps, see `INSTALL.md`.

## Core Workflows

- Character creation: open a character sheet and use **Creator** on Page 1. The creator supports manual choices and the **Random God** helper, then applies choices through the same embedded Item workflow.
- Rolling: click a Skill or Manifestation row from the character sheet. Roll dialogs show pool previews, optional modifiers, active Condition effects, and chat-card output.
- XP and advancement: use the XP controls on the character sheet to buy Skills, Manifestations, Attachments, Truths, Relics, Free Time, Wealth, Spark, and story upgrades.
- Conditions: use **Add** in the Conditions panel, combat controls, or item automation to apply Conditions. Conditions can be increased, reduced, recovered, removed, and used as transparent roll/combat modifiers when metadata is present.
- Rituals and Manifestations: Manifestation rolls can open ritual workflows, resistance checks, and measure assignment summaries.
- Territory and Pantheons: GM tools seed premade scenes/maps and manage Pantheon state.
- Mortal-Divine Balance: use the Pantheon sheet Table Tools section as a GM to open the tracker.
- Premade content: on world load, GM compendium helpers populate character creation choices, premade Items, opposition actors, maps, roll tables, and rules journals from source-backed system data.

## Release Readiness Checklist

- Run `.\scripts\validate-release.ps1` from the system root.
- Run `node --check` against all `.js` and `.mjs` files after code changes.
- Validate `system.json` paths for modules, styles, languages, packs, and Foundry v14 compatibility.
- In Foundry VTT v14, create or open a world using this system and verify the character sheet, item sheets, Pantheon sheet, compendia, rules journals, roll dialogs, combat controls, Conditions, XP, rituals, and territory tools.
- Verify the Pantheon sheet Mortal-Divine Balance button, character actor drops, tracker adjustments, log clearing, and optional chat output.
- Test as GM, owner, observer, and non-owner where permissions matter.
- Keep local source material and scratch folders out of release commits.

## Implementation Notes

See `docs/issue-35-implementation-summary.md` for the current source-backed Foundry v14 implementation summary, playable-system status, and next-step TODOs.

Additional release and source notes:

- `docs/compendium-source-pipeline.md`
- `CHANGELOG.md`
- `ATTRIBUTION.md`
