const SYSTEM_ID = "part-time-gods";
const TERRITORY_SCENE_NAME = "God Territory Grid";
const TERRITORY_KIND = "god-territory-grid";

const GRID_SIZE = 100;
const PLAY_GRID_SIZE = 10;
const LABEL_BAND_SIZE = 1;
const COLUMNS = PLAY_GRID_SIZE + LABEL_BAND_SIZE;
const ROWS = PLAY_GRID_SIZE + LABEL_BAND_SIZE;
const WIDTH = COLUMNS * GRID_SIZE;
const HEIGHT = ROWS * GRID_SIZE;
const TERRITORY_DATA_VERSION = 1;

const SHEET_BACKGROUND = "#f4f0e8";
const SHEET_INK = "#1f1a17";

export function getPremadeScenes() {
  return [getGodTerritorySceneData()];
}

export function getGodTerritorySceneData({
  authorId = getAuthorId(),
  name = TERRITORY_SCENE_NAME,
  territoryData = createTerritoryData()
} = {}) {
  return {
    name,
    active: false,
    navigation: true,
    navName: "God Territory",
    width: WIDTH,
    height: HEIGHT,
    padding: 0.05,
    backgroundColor: SHEET_BACKGROUND,
    grid: {
      type: squareGridType(),
      size: GRID_SIZE,
      distance: 1,
      units: "square",
      color: SHEET_INK,
      alpha: 0.85,
      thickness: 2
    },
    initial: {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      scale: 0.85
    },
    tokenVision: false,
    drawings: territorySheetDrawings(authorId),
    flags: {
      [SYSTEM_ID]: {
        premade: true,
        kind: TERRITORY_KIND,
        source: "Part-Time Gods 2E PDF p. 283 territory grid",
        columns: PLAY_GRID_SIZE,
        rows: PLAY_GRID_SIZE,
        labelBandSize: LABEL_BAND_SIZE,
        territory: territoryData
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
    const existingTerritoryData = existing.getFlag(SYSTEM_ID, "territory");
    await updateExistingTerritoryScene(existing, getGodTerritorySceneData({
      authorId: game.user.id,
      territoryData: mergeTerritoryData(existingTerritoryData)
    }));
    if (notify) ui.notifications.info("Updated the God Territory Grid Scene.");
    if (activate) await existing.activate();
    return existing;
  }

  const scene = await Scene.create(getGodTerritorySceneData({ authorId: game.user.id }));

  if (activate) await scene.activate();
  if (notify) ui.notifications.info("Created the God Territory Grid Scene.");

  return scene;
}

function createTerritoryData() {
  const coordinates = {};

  for (let row = 1; row <= PLAY_GRID_SIZE; row += 1) {
    for (let column = 1; column <= PLAY_GRID_SIZE; column += 1) {
      const key = coordinateKey(column, row);
      coordinates[key] = createTerritoryCoordinate(column, row);
    }
  }

  return {
    version: TERRITORY_DATA_VERSION,
    width: PLAY_GRID_SIZE,
    height: PLAY_GRID_SIZE,
    keyFormat: "column-row",
    coordinates
  };
}

function mergeTerritoryData(existingData) {
  const territoryData = createTerritoryData();
  const existingCoordinates = existingData?.coordinates ?? {};

  for (const [key, coordinate] of Object.entries(territoryData.coordinates)) {
    territoryData.coordinates[key] = {
      ...coordinate,
      ...(existingCoordinates[key] ?? {})
    };
  }

  return {
    ...territoryData,
    ...(existingData ?? {}),
    version: TERRITORY_DATA_VERSION,
    width: PLAY_GRID_SIZE,
    height: PLAY_GRID_SIZE,
    keyFormat: "column-row",
    coordinates: territoryData.coordinates
  };
}

function createTerritoryCoordinate(column, row) {
  return {
    key: coordinateKey(column, row),
    label: `${column}-${row}`,
    column,
    row,
    pointOfInterest: "",
    notes: "",
    gmSecret: "",
    bonds: [],
    followers: [],
    actors: [],
    items: []
  };
}

function coordinateKey(column, row) {
  return `${column}-${row}`;
}

async function updateExistingTerritoryScene(scene, sceneData) {
  const drawingCollection = scene.drawings?.contents ?? scene.drawings ?? [];
  const managedDrawings = Array.from(drawingCollection).filter(drawing =>
    drawing?.getFlag?.(SYSTEM_ID, "territoryZone") || drawing?.getFlag?.(SYSTEM_ID, "territorySheetElement")
  );
  const drawingIds = managedDrawings.map(drawing => drawing.id);
  const { drawings, ...updateData } = sceneData;

  if (drawingIds.length) await scene.deleteEmbeddedDocuments("Drawing", drawingIds);
  await scene.update(updateData);
  if (drawings.length) await scene.createEmbeddedDocuments("Drawing", drawings);
}

function territorySheetDrawings(authorId) {
  const drawings = [
    sheetBand("top-number-band", 0, 0, WIDTH, GRID_SIZE, authorId, 1000),
    sheetBand("side-number-band", 0, 0, GRID_SIZE, HEIGHT, authorId, 1001),
    sheetLabel("legend", "Legend", 0, GRID_SIZE, GRID_SIZE, GRID_SIZE, authorId, 2000, 22),
    sheetBorder("play-grid-border", GRID_SIZE, GRID_SIZE, PLAY_GRID_SIZE * GRID_SIZE, PLAY_GRID_SIZE * GRID_SIZE, authorId, 3000)
  ];

  for (let index = 0; index < PLAY_GRID_SIZE; index += 1) {
    const number = String(index + 1);
    drawings.push(sheetLabel(
      `column-${number}`,
      number,
      GRID_SIZE + index * GRID_SIZE,
      0,
      GRID_SIZE,
      GRID_SIZE,
      authorId,
      2100 + index,
      28
    ));
    drawings.push(sheetLabel(
      `row-${number}`,
      number,
      0,
      GRID_SIZE + index * GRID_SIZE,
      GRID_SIZE,
      GRID_SIZE,
      authorId,
      2200 + index,
      28
    ));
  }

  return drawings;
}

function sheetBand(key, x, y, width, height, authorId, sort) {
  return baseDrawing(key, x, y, width, height, authorId, sort, {
    fillAlpha: 1,
    strokeAlpha: 0,
    strokeWidth: 0
  });
}

function sheetBorder(key, x, y, width, height, authorId, sort) {
  return baseDrawing(key, x, y, width, height, authorId, sort, {
    fillAlpha: 0,
    strokeAlpha: 1,
    strokeWidth: 4
  });
}

function sheetLabel(key, text, x, y, width, height, authorId, sort, fontSize) {
  return {
    ...baseDrawing(key, x, y, width, height, authorId, sort, {
      fillAlpha: 0,
      strokeAlpha: 0,
      strokeWidth: 0
    }),
    text,
    fontFamily: "Signika",
    fontSize,
    textColor: SHEET_INK,
    textAlpha: 1
  };
}

function baseDrawing(key, x, y, width, height, authorId, sort, options) {
  return {
    author: authorId,
    name: `Territory Grid: ${key}`,
    x,
    y,
    sort,
    shape: {
      type: rectangleShapeType(),
      width,
      height
    },
    fillType: solidFillType(),
    fillColor: SHEET_BACKGROUND,
    fillAlpha: options.fillAlpha,
    strokeColor: SHEET_INK,
    strokeAlpha: options.strokeAlpha,
    strokeWidth: options.strokeWidth,
    hidden: false,
    locked: true,
    flags: {
      [SYSTEM_ID]: {
        territorySheetElement: key
      }
    }
  };
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
