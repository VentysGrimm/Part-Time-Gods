# Compendium Source Pipeline

The system seeds premade compendia from repo-native JSON and module data instead of requiring a manual console import.

## Stable Keys

Generated premade Items and character-creation Choices include `flags.part-time-gods.slug` and `flags.part-time-gods.sourceId`.

The pack updater matches by stable source ID first, then import ID, then slug, then the legacy type/name key. This lets existing worlds update old name-keyed entries without creating duplicates.

## Safe Summaries

Rules journals loaded from `module/data/complete-rules.json` include release-safe source-backed summaries plus `safeSummary` flags on the JournalEntry and pages. These summaries describe the actual rules topic and Foundry support surface without reproducing source-book text.

## Item Explanations

Generated premade Items include shared `system.rules.fullText` explanations with table-use guidance, usage/cost context, automation notes, and source page references. Gear Items also include source-backed quality explanations, armor penalties, proof-armor notes, range behavior, and firearm reminders.

## Release Boundary

Release artifacts should include the normalized system data needed at runtime and exclude local source PDFs, extraction caches, and scratch directories.
