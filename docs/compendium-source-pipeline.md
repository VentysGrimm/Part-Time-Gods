# Compendium Source Pipeline

The system seeds premade compendia from repo-native JSON and module data instead of requiring a manual console import.

## Stable Keys

Generated premade Items and character-creation Choices include `flags.part-time-gods.slug` and `flags.part-time-gods.sourceId`.

The pack updater matches by stable source ID first, then import ID, then slug, then the legacy type/name key. This lets existing worlds update old name-keyed entries without creating duplicates.

## Safe Summaries

Rules journals loaded from `module/data/complete-rules.json` include metadata-only `safeSummary` flags on the JournalEntry and pages. These summaries describe the topic and source page range without expanding the source text.

## Release Boundary

Release artifacts should include the normalized system data needed at runtime and exclude local source PDFs, extraction caches, and scratch directories.
