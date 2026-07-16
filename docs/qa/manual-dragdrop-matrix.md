# Manual Drag/Drop Evidence Matrix

Updated: 2026-07-16

This file tracks the remaining physical mouse-drag evidence for issues #131 and #165. Automated tests and runtime `DataTransfer` proofs cover the handlers, but these rows require human-level sidebar-to-sheet or sidebar-to-app dragging in the live Foundry client.

Run `npm.cmd run check:dragdrop-evidence` after updating this table. The check is expected to fail until every required row is marked `Pass`.

## Required Evidence

| Gate | Surface | Source | Target | Required Evidence | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| item-occupation | Character sheet | Character Creation or Premade Items Occupation item | Unlocked Character sheet | Owned Occupation item appears on the character and choice data applies or warns cleanly. | Pending | |
| item-archetype | Character sheet | Character Creation Archetype item | Unlocked Character sheet | Owned Archetype item appears on the character and choice data applies or warns cleanly. | Pending | |
| item-domain | Character sheet | Character Creation Dominion/Domain item | Unlocked Character sheet | Owned Dominion/Domain item appears on the character and choice data applies or warns cleanly. | Pending | |
| item-theology | Character sheet | Character Creation Theology item | Unlocked Character sheet | Owned Theology item appears on the character and choice data applies or warns cleanly. | Pending | |
| item-blessing | Character sheet | Premade Items Blessing item | Unlocked Character sheet | Owned Blessing item appears on the character. | Pending | |
| item-curse | Character sheet | Premade Items Curse item | Unlocked Character sheet | Owned Curse item appears on the character. | Pending | |
| item-truth | Character sheet | Premade Items Truth item | Unlocked Character sheet | Owned Truth item appears on the character in the correct section. | Pending | |
| item-relic | Character sheet | Premade Items Relic item | Unlocked Character sheet | Owned Relic item appears on the character in the correct attachment section. | Pending | |
| item-bond | Character sheet | Premade Items Bond item | Unlocked Character sheet | Owned Bond item appears on the character in the correct attachment section. | Pending | |
| item-worshipper | Character sheet | Premade Items Worshipper item | Unlocked Character sheet | Owned Worshipper item appears on the character in the correct attachment section. | Pending | |
| item-vassal | Character sheet | Premade Items Vassal item | Unlocked Character sheet | Owned Vassal item appears on the character in the correct attachment section. | Pending | |
| item-condition | Character sheet | Premade Items Condition item | Unlocked Character sheet | Owned Condition item appears on the character and condition controls remain usable. | Pending | 2026-07-16 Computer Use opened `Part-Time Gods Premade Items -> Conditions` and attempted physical drags of `Afraid` from the row icon/text into the visible Character sheet Conditions panel and the sheet body; the sheet stayed unchanged, no owned Condition appeared, and no warning appeared, matching the current automation-native-drag limitation rather than a confirmed product rejection. Later the same day, the clean manifest-installed world `PTG Manifest Install QA` created and unlocked `QA Manifest Drag Character`; supported Computer Use `sky.drag` attempts from visible `Afraid` row/icon/text into the Conditions box and sheet body again produced no owned Condition and no warning. |
| item-weapon | Character sheet | Premade Items Weapon item | Unlocked Character sheet | Owned Weapon item appears on the character and gear controls remain usable. | Pending | |
| item-armor | Character sheet | Premade Items Armor item | Unlocked Character sheet | Owned Armor item appears on the character, can be equipped, and damage reduction can be checked if relevant. | Partial | Runtime `DataTransfer` proof created owned Armor `QA Runtime Armor Drop`; physical sidebar drag is still pending. |
| actor-territory-character | GM Territory interface | Actors sidebar Character actor | GM Territory grid or points panel | Character territory-ready attachments import or cleanly report no new territory-ready attachments. | Pending | Computer Use attempted physical drags from `Character` / `Character (2)` rows and portrait areas into the GM Territory grid and points panel on 2026-07-15; the app stayed at `3 points` / `2 influenced cells`, no warning appeared, and no native Foundry Actor payload was delivered under automation. |

## Completion Notes

- Use a live Foundry v14 client, not a synthetic browser event.
- Unlock the target Character sheet before item drops.
- Record actor/item names in the Evidence column, plus any warning text if the drop is rejected cleanly.
- #165 can close only after `actor-territory-character` is `Pass`.
- #131 can close its drag/drop gate only after all `item-*` rows are `Pass`.
