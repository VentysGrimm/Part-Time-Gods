const SYSTEM_ID = "part-time-gods";
const TERRITORY_SCENE_NAME = "God Territory Grid";
const TERRITORY_KIND = "god-territory-grid";
const { DialogV2 } = foundry.applications.api;

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

export async function openTerritoryControls({ scene = getTerritoryScene() } = {}) {
  if (!game.user?.isGM) {
    ui.notifications.warn("Only a GM can update Territory Grid data.");
    return null;
  }

  if (!scene) {
    ui.notifications.warn("Create the God Territory Grid Scene before using Territory controls.");
    return null;
  }

  const territoryData = mergeTerritoryData(scene.getFlag(SYSTEM_ID, "territory"));
  const selection = await selectTerritoryAction({ scene, territoryData });
  if (!selection) return null;

  const updatedTerritoryData = applyTerritoryAction(territoryData, selection);
  await scene.setFlag(SYSTEM_ID, "territory", updatedTerritoryData);

  const actor = selection.actorUuid ? await fromUuid(selection.actorUuid) : null;
  if (actor?.setFlag && selection.to) await actor.setFlag(SYSTEM_ID, "territoryCoordinate", selection.to);
  const costResults = actor && selection.action === "move" && selection.applyCosts
    ? await applyTerritoryCosts(actor, selection)
    : [];

  await postTerritoryActionCard({ actor, scene, selection, territoryData: updatedTerritoryData, costResults });
  ui.notifications.info("Updated Territory Grid data.");

  return updatedTerritoryData;
}

function getTerritoryScene() {
  const activeScene = globalThis.canvas?.scene ?? game.scenes?.active;
  if (activeScene?.getFlag?.(SYSTEM_ID, "kind") === TERRITORY_KIND) return activeScene;

  return game.scenes?.find(scene =>
    scene.getFlag(SYSTEM_ID, "kind") === TERRITORY_KIND || scene.name === TERRITORY_SCENE_NAME
  ) ?? null;
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
    positions: {},
    movements: [],
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
    positions: existingData?.positions ?? {},
    movements: Array.isArray(existingData?.movements) ? existingData.movements : [],
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
    items: [],
    influence: {
      sphere: "",
      rating: 0,
      notes: ""
    },
    manifestation: {
      modifier: 0,
      notes: ""
    }
  };
}

function coordinateKey(column, row) {
  return `${column}-${row}`;
}

async function selectTerritoryAction({ scene, territoryData }) {
  const coordinates = Object.values(territoryData.coordinates ?? {});
  const coordinateOptions = coordinates
    .map(coordinate => `<option value="${escapeHTML(coordinate.key)}">${escapeHTML(coordinate.label)}</option>`)
    .join("");
  const actorOptions = game.actors
    .filter(actor => ["character", "pantheon", "antagonist"].includes(actor.type))
    .map(actor => `<option value="${escapeHTML(actor.uuid)}">${escapeHTML(actor.name)} (${escapeHTML(actor.type)})</option>`)
    .join("");

  const content = `
    <div class="ptg-territory-dialog">
      <div class="ptg-territory-summary">
        <strong>${escapeHTML(scene.name)}</strong>
        <span>Movement, influence, point-of-interest, GM notes, travel costs, and territory Manifestation modifiers are written to scene flags.</span>
      </div>
      <div class="form-group">
        <label>Action</label>
        <select name="action">
          <option value="move">Move on the Grid</option>
          <option value="influence">Update Sphere of Influence</option>
        </select>
      </div>
      <div class="form-group">
        <label>Actor or Pantheon</label>
        <select name="actorUuid">
          <option value="">No linked actor</option>
          ${actorOptions}
        </select>
      </div>
      <div class="ptg-item-fields two">
        <div class="form-group">
          <label>From Coordinate</label>
          <select name="from">${coordinateOptions}</select>
        </div>
        <div class="form-group">
          <label>To Coordinate</label>
          <select name="to">${coordinateOptions}</select>
        </div>
      </div>
      <div class="ptg-item-fields two">
        <div class="form-group">
          <label>Free Time Cost or Note</label>
          <input type="text" name="freeTimeCost" value="GM sets by table distance and fiction">
        </div>
        <div class="form-group">
          <label>Wealth Cost or Note</label>
          <input type="text" name="wealthCost" value="GM sets by travel method and access">
        </div>
      </div>
      <label class="ptg-checkbox">
        <span>Apply numeric Free Time and Wealth costs to linked actor</span>
        <input type="checkbox" name="applyCosts" checked>
      </label>
      <div class="ptg-item-fields two">
        <div class="form-group">
          <label>Sphere of Influence</label>
          <input type="text" name="sphere" value="" placeholder="Pantheon, faction, god, or none">
        </div>
        <div class="form-group">
          <label>Influence Rating</label>
          <input type="number" name="influenceRating" value="0" min="0">
        </div>
      </div>
      <div class="ptg-item-fields two">
        <div class="form-group">
          <label>Manifestation Modifier</label>
          <input type="number" name="manifestationModifier" value="0">
        </div>
        <div class="form-group">
          <label>Manifestation Note</label>
          <input type="text" name="manifestationNote" value="" placeholder="Bond location, sphere, hostile territory, etc.">
        </div>
      </div>
      <div class="form-group">
        <label>Point of Interest</label>
        <input type="text" name="pointOfInterest" value="">
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea name="notes" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>GM Secret Notes</label>
        <textarea name="gmSecret" rows="2"></textarea>
      </div>
    </div>
  `;

  return DialogV2.prompt({
    window: {
      title: "Territory Grid Controls",
      resizable: true
    },
    position: {
      width: 680,
      height: 720
    },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Update Territory",
      callback: (event, button) => {
        const form = button.form;

        return {
          action: form.elements.action?.value ?? "move",
          actorUuid: form.elements.actorUuid?.value ?? "",
          from: form.elements.from?.value ?? "1-1",
          to: form.elements.to?.value ?? "1-1",
          freeTimeCost: form.elements.freeTimeCost?.value ?? "",
          wealthCost: form.elements.wealthCost?.value ?? "",
          applyCosts: form.elements.applyCosts?.checked ?? false,
          sphere: form.elements.sphere?.value ?? "",
          influenceRating: Number(form.elements.influenceRating?.value ?? 0),
          manifestationModifier: Number(form.elements.manifestationModifier?.value ?? 0),
          manifestationNote: form.elements.manifestationNote?.value ?? "",
          pointOfInterest: form.elements.pointOfInterest?.value ?? "",
          notes: form.elements.notes?.value ?? "",
          gmSecret: form.elements.gmSecret?.value ?? ""
        };
      }
    }
  });
}

function applyTerritoryAction(territoryData, selection) {
  const coordinates = territoryData.coordinates ?? {};
  const from = coordinates[selection.from];
  const to = coordinates[selection.to];
  const actorRef = selection.actorUuid ? { uuid: selection.actorUuid } : null;

  if (selection.action === "move" && from && to) {
    if (actorRef) {
      from.actors = withoutUuid(from.actors, actorRef.uuid);
      to.actors = withUniqueUuid(to.actors, actorRef);
      territoryData.positions = {
        ...(territoryData.positions ?? {}),
        [actorRef.uuid]: selection.to
      };
    }

    territoryData.movements = [
      ...(territoryData.movements ?? []),
      {
        actorUuid: selection.actorUuid || null,
        from: selection.from,
        to: selection.to,
        freeTimeCost: selection.freeTimeCost,
        wealthCost: selection.wealthCost,
        costsApplied: Boolean(selection.applyCosts),
        notes: selection.notes,
        createdAt: new Date().toISOString()
      }
    ].slice(-50);
  }

  if (to) {
    if (selection.pointOfInterest) to.pointOfInterest = selection.pointOfInterest;
    if (selection.notes) to.notes = selection.notes;
    if (selection.gmSecret) to.gmSecret = selection.gmSecret;
    if (selection.action === "influence" || selection.sphere) {
      to.influence = {
        ...(to.influence ?? {}),
        sphere: selection.sphere,
        rating: Number(selection.influenceRating ?? 0),
        notes: selection.notes
      };
    }
    if (Number(selection.manifestationModifier ?? 0) !== 0 || selection.manifestationNote) {
      to.manifestation = {
        modifier: Number(selection.manifestationModifier ?? 0),
        notes: selection.manifestationNote
      };
    }
  }

  return territoryData;
}

function withUniqueUuid(entries, entry) {
  const existing = Array.isArray(entries) ? entries : [];
  if (existing.some(candidate => candidate?.uuid === entry.uuid)) return existing;
  return [...existing, entry];
}

function withoutUuid(entries, uuid) {
  return (Array.isArray(entries) ? entries : []).filter(entry => entry?.uuid !== uuid);
}

async function applyTerritoryCosts(actor, selection) {
  const results = [];
  const costs = {
    freeTime: numericCost(selection.freeTimeCost),
    wealth: numericCost(selection.wealthCost)
  };

  for (const [resource, amount] of Object.entries(costs)) {
    if (amount <= 0) continue;

    if (actor.spendResource) {
      const spent = await actor.spendResource(resource, amount);
      results.push(spent
        ? `${actor.name}: spent ${amount} ${resourceLabel(resource)}.`
        : `${actor.name}: could not spend ${amount} ${resourceLabel(resource)}.`);
    } else {
      results.push(`${actor.name}: ${amount} ${resourceLabel(resource)} cost recorded; actor cannot spend resources automatically.`);
    }
  }

  return results;
}

async function postTerritoryActionCard({ actor, scene, selection, territoryData, costResults = [] }) {
  const target = territoryData.coordinates?.[selection.to];
  const actionLabel = selection.action === "influence" ? "Sphere of Influence" : "Territory Movement";

  await ChatMessage.create({
    speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker({ scene }),
    content: `
      <div class="ptg-chat-card">
        <h3>${escapeHTML(actionLabel)}</h3>
        <div><strong>Scene:</strong> ${escapeHTML(scene.name)}</div>
        ${actor ? `<div><strong>Actor:</strong> ${escapeHTML(actor.name)}</div>` : ""}
        <div><strong>From:</strong> ${escapeHTML(selection.from)} <strong>To:</strong> ${escapeHTML(selection.to)}</div>
        <div><strong>Free Time:</strong> ${escapeHTML(selection.freeTimeCost || "GM note")}</div>
        <div><strong>Wealth:</strong> ${escapeHTML(selection.wealthCost || "GM note")}</div>
        ${costResults.length ? `<ul>${costResults.map(result => `<li>${escapeHTML(result)}</li>`).join("")}</ul>` : ""}
        ${target?.pointOfInterest ? `<div><strong>Point of Interest:</strong> ${escapeHTML(target.pointOfInterest)}</div>` : ""}
        ${target?.influence?.sphere ? `<div><strong>Influence:</strong> ${escapeHTML(target.influence.sphere)} (${Number(target.influence.rating ?? 0)})</div>` : ""}
        ${target?.manifestation ? `<div><strong>Manifestation Modifier:</strong> ${Number(target.manifestation.modifier ?? 0)} ${escapeHTML(target.manifestation.notes ?? "")}</div>` : ""}
        ${selection.notes ? `<div><strong>Notes:</strong> ${escapeHTML(selection.notes)}</div>` : ""}
      </div>
    `
  });
}

function numericCost(value) {
  const match = String(value ?? "").match(/-?\d+/);
  return Math.max(0, Number(match?.[0] ?? 0));
}

function resourceLabel(resource) {
  return {
    freeTime: "Free Time",
    wealth: "Wealth"
  }[resource] ?? resource;
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
