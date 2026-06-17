const SYSTEM_ID = "part-time-gods";
const TERRITORY_SCENE_NAME = "God Territory Grid";
const TERRITORY_KIND = "god-territory-grid";

const GRID_SIZE = 100;
const COLUMNS = 12;
const ROWS = 8;
const WIDTH = COLUMNS * GRID_SIZE;
const HEIGHT = ROWS * GRID_SIZE;

const TERRITORY_ZONES = [
  zone("sanctum", "Sanctum / Anchor\nsafe ground", 0, 0, 3, 2, "#2f4858", "#9ad1d4"),
  zone("worshippers", "Worshippers\nfollowers and temples", 0, 2, 3, 2, "#3a5a40", "#a3b18a"),
  zone("bonds", "Mortal Bonds\npeople and places", 0, 4, 3, 2, "#4a3f35", "#d9b38c"),
  zone("assets", "Assets\nrelics and resources", 0, 6, 3, 2, "#503a65", "#d7b4ff"),
  zone("territory-name", "Territory Name\npantheon / god", 3, 0, 5, 1, "#24324f", "#91a7d9", 24),
  zone("claimed", "Claimed Territory\ncontrolled neighborhoods", 3, 1, 4, 3, "#3b4d2f", "#b7d99a", 22),
  zone("unclaimed", "Unclaimed Ground\nopportunities", 3, 4, 3, 2, "#564d2f", "#e3d18a"),
  zone("relic-site", "Relic Site\nomens and gates", 6, 4, 2, 2, "#4b365b", "#d5a6ff"),
  zone("threat-clock", "Threat Clock\nheat, debt, fallout", 3, 6, 5, 2, "#5b3333", "#f0a0a0", 22),
  zone("rivals", "Rival Gods\nclaims and bargains", 8, 0, 4, 2, "#55384a", "#e5a5c8", 22),
  zone("mortal-pressure", "Mortal Pressure\nlaw, media, institutions", 7, 2, 3, 2, "#4d4634", "#e0c878"),
  zone("outsiders", "Outsider Intrusion\nspirits and monsters", 10, 2, 2, 3, "#354552", "#94c7e8"),
  zone("trouble", "Open Trouble\ncurrent scene hooks", 8, 5, 4, 3, "#513c31", "#e4b28c", 22)
];

export function getPremadeScenes() {
  return [getGodTerritorySceneData()];
}

export function getGodTerritorySceneData({ authorId = getAuthorId(), name = TERRITORY_SCENE_NAME } = {}) {
  return {
    name,
    active: false,
    navigation: true,
    navName: "God Territory",
    width: WIDTH,
    height: HEIGHT,
    padding: 0.05,
    backgroundColor: "#111318",
    grid: {
      type: squareGridType(),
      size: GRID_SIZE,
      distance: 1,
      units: "zone",
      color: "#f5ead8",
      alpha: 0.35,
      thickness: 1
    },
    initial: {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      scale: 0.85
    },
    tokenVision: false,
    drawings: TERRITORY_ZONES.map(entry => territoryDrawing(entry, authorId)),
    flags: {
      [SYSTEM_ID]: {
        premade: true,
        kind: TERRITORY_KIND,
        columns: COLUMNS,
        rows: ROWS
      }
    }
  };
}

export async function importGodTerritoryScene({ notify = true, activate = false } = {}) {
  if (!game.user?.isGM) {
    if (notify) ui.notifications.warn("Only a GM can create the God Territory Scene.");
    return null;
  }

  const existing = game.scenes.find(scene =>
    scene.getFlag(SYSTEM_ID, "kind") === TERRITORY_KIND || scene.name === TERRITORY_SCENE_NAME
  );

  if (existing) {
    if (notify) ui.notifications.info("The God Territory Scene already exists in this world.");
    if (activate) await existing.activate();
    return existing;
  }

  const scene = await Scene.create(getGodTerritorySceneData({ authorId: game.user.id }));

  if (activate) await scene.activate();
  if (notify) ui.notifications.info("Created the God Territory Grid Scene.");

  return scene;
}

function territoryDrawing(entry, authorId) {
  return {
    author: authorId,
    name: `Territory: ${entry.key}`,
    x: entry.column * GRID_SIZE,
    y: entry.row * GRID_SIZE,
    shape: {
      type: rectangleShapeType(),
      width: entry.width * GRID_SIZE,
      height: entry.height * GRID_SIZE
    },
    fillType: solidFillType(),
    fillColor: entry.fill,
    fillAlpha: 0.38,
    strokeColor: entry.stroke,
    strokeAlpha: 0.9,
    strokeWidth: 3,
    text: entry.label,
    fontFamily: "Signika",
    fontSize: entry.fontSize,
    textColor: "#f8f5ee",
    textAlpha: 1,
    hidden: false,
    locked: false,
    flags: {
      [SYSTEM_ID]: {
        territoryZone: entry.key
      }
    }
  };
}

function zone(key, label, column, row, width, height, fill, stroke, fontSize = 18) {
  return { key, label, column, row, width, height, fill, stroke, fontSize };
}

function getAuthorId() {
  return globalThis.game?.user?.id ?? "";
}

function squareGridType() {
  return globalThis.CONST?.GRID_TYPES?.SQUARE ?? 1;
}

function solidFillType() {
  return globalThis.CONST?.DRAWING_FILL_TYPES?.SOLID ?? 1;
}

function rectangleShapeType() {
  return globalThis.foundry?.data?.ShapeData?.TYPES?.RECTANGLE ?? "rectangle";
}
