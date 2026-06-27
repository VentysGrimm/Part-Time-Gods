const SYSTEM_ID = "part-time-gods";

export const PTG_PREMADE_MACROS = [
  toolMacro({
    name: "PTG: Table Tools",
    slug: "table-tools",
    img: "icons/svg/temple.svg",
    summary: "Open the Pantheon sheet Table Tools hub.",
    command: `
const pantheon = game.actors?.find(actor => actor.type === "pantheon" && (game.user?.isGM || actor.isOwner || actor.visible !== false));
if (!pantheon) {
  ui.notifications.warn("Create a Pantheon actor before opening Part-Time Gods table tools.");
  return;
}
pantheon.sheet?.render(true);
`
  }),
  toolMacro({
    name: "PTG: Import Premade Items",
    slug: "import-premade-items",
    img: "icons/svg/item-bag.svg",
    summary: "Import source-backed Part-Time Gods Items into the world.",
    command: `
const api = game.partTimeGods;
if (!api?.importPremadeItems) {
  ui.notifications.error("Part-Time Gods item import API is not available.");
  return;
}
await api.importPremadeItems();
`
  }),
  toolMacro({
    name: "PTG: Import Character Choices",
    slug: "import-character-choices",
    img: "icons/svg/book.svg",
    summary: "Import source-backed Occupation, Archetype, Dominion, and Theology choices into the world.",
    command: `
const api = game.partTimeGods;
if (!api?.importPremadeChoices) {
  ui.notifications.error("Part-Time Gods character choice import API is not available.");
  return;
}
await api.importPremadeChoices();
`
  }),
  toolMacro({
    name: "PTG: Populate Compendiums",
    slug: "populate-compendiums",
    img: "icons/svg/archive.svg",
    summary: "Populate or refresh Part-Time Gods system compendiums.",
    command: `
const api = game.partTimeGods;
if (!api?.populatePremadeCompendiums) {
  ui.notifications.error("Part-Time Gods compendium population API is not available.");
  return;
}
await api.populatePremadeCompendiums();
`
  }),
  toolMacro({
    name: "PTG: Create Territory Scene",
    slug: "create-territory-scene",
    img: "icons/svg/direction.svg",
    summary: "Create or update the God Territory Grid scene.",
    command: `
const api = game.partTimeGods;
if (!api?.importGodTerritoryScene) {
  ui.notifications.error("Part-Time Gods territory scene API is not available.");
  return;
}
await api.importGodTerritoryScene({ activate: false });
`
  }),
  toolMacro({
    name: "PTG: Territory Controls",
    slug: "territory-controls",
    img: "icons/svg/target.svg",
    summary: "Open the Territory Grid control dialog.",
    command: `
const api = game.partTimeGods;
if (!api?.openTerritoryControls) {
  ui.notifications.error("Part-Time Gods territory controls API is not available.");
  return;
}
await api.openTerritoryControls();
`
  }),
  toolMacro({
    name: "PTG: Combat Controls",
    slug: "combat-controls",
    img: "icons/svg/sword.svg",
    summary: "Open the Part-Time Gods combat control workflow.",
    command: `
const api = game.partTimeGods;
if (!api?.openPTGCombatControls) {
  ui.notifications.error("Part-Time Gods combat controls API is not available.");
  return;
}
await api.openPTGCombatControls();
`
  }),
  toolMacro({
    name: "PTG: Mortal-Divine Balance",
    slug: "mortal-divine-balance",
    img: "icons/svg/scales.svg",
    summary: "Open the Mortal-Divine Balance tracker.",
    command: `
const api = game.partTimeGods;
if (!api?.openMortalDivineBalanceTracker) {
  ui.notifications.error("Part-Time Gods Mortal-Divine Balance API is not available.");
  return;
}
await api.openMortalDivineBalanceTracker();
`
  }),
  toolMacro({
    name: "PTG: Pantheon Pool",
    slug: "pantheon-pool",
    img: "icons/svg/dice-target.svg",
    summary: "Open the shared Pantheon Pool add/spend workflow.",
    command: `
const api = game.partTimeGods;
if (!api?.openPantheonPoolDialog) {
  ui.notifications.error("Part-Time Gods Pantheon Pool API is not available.");
  return;
}
const actor = canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character ?? null;
const pantheon = actor?.type === "pantheon" ? actor : null;
await api.openPantheonPoolDialog({ pantheon, actingActor: actor?.type === "character" ? actor : null });
`
  }),
  toolMacro({
    name: "PTG: Opposition Builder",
    slug: "opposition-builder",
    img: "icons/svg/mystery-man.svg",
    summary: "Open the source-backed opposition builder.",
    command: `
const api = game.partTimeGods;
if (!api?.openAntagonistBuilder) {
  ui.notifications.error("Part-Time Gods opposition builder API is not available.");
  return;
}
await api.openAntagonistBuilder();
`
  }),
  toolMacro({
    name: "PTG: Import Rules Journals",
    slug: "import-rules-journals",
    img: "icons/svg/book.svg",
    summary: "Import curated Part-Time Gods rules-reference journals into the world.",
    command: `
const api = game.partTimeGods;
if (!api?.importRulesJournals) {
  ui.notifications.error("Part-Time Gods rules journal import API is not available.");
  return;
}
await api.importRulesJournals();
`
  })
];

function toolMacro({ name, slug, img, summary, command }) {
  return {
    name,
    type: "script",
    scope: "global",
    img,
    command: command.trim(),
    flags: {
      [SYSTEM_ID]: {
        premade: true,
        kind: "workflow-macro",
        slug,
        sourceId: `macro:workflow:${slug}`,
        sourceBook: "Part-Time Gods Second Edition",
        summary
      }
    }
  };
}
