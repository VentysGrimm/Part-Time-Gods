import { getGodTerritorySceneData, importGodTerritoryScene, openTerritoryControls } from "../data/premade-scenes.mjs";
import { getDragEventData } from "../util/drop-data.mjs";
import { SYSTEM_ID, localize } from "../util/localization.mjs";

const { ApplicationV2, DialogV2, HandlebarsApplicationMixin } = foundry.applications.api;

const FLAG_KEY = "territoryGrid";
const LEGACY_FLAG_KEY = "territory";
const TERRITORY_SCENE_KIND = "god-territory-grid";
const TERRITORY_SCENE_NAME = "God Territory Grid";
const GRID_VERSION = 1;
const GRID_SIZE = 10;
const TERRITORY_CANVAS_FIT_PADDING = 48;
const DEFAULT_TERRITORY_BACKGROUND_COLOR = "#f4f0e8";

const POINT_CATEGORIES = [
  { value: "individual", label: "Individual Bond", grantsBonus: true },
  { value: "landmark", label: "Landmark Bond", grantsBonus: true },
  { value: "worshipper", label: "Worshippers", grantsBonus: true },
  { value: "rival", label: "Rival", grantsBonus: false },
  { value: "threat", label: "Threat", grantsBonus: false },
  { value: "neutral", label: "Neutral", grantsBonus: false },
  { value: "custom", label: "Custom", grantsBonus: false }
];

const LOCATION_TYPES = [
  { value: "mortal", label: "Mortal" },
  { value: "divine", label: "Divine" },
  { value: "mixed", label: "Mixed" },
  { value: "unknown", label: "Unknown" },
  { value: "custom", label: "Custom" }
];

const CONTROL_TYPES = [
  { value: "god", label: "God" },
  { value: "pantheon", label: "Pantheon" },
  { value: "npc-god", label: "NPC God" },
  { value: "outsider", label: "Outsider" },
  { value: "faction", label: "Faction" },
  { value: "neutral", label: "Neutral" },
  { value: "shared", label: "Shared Territory" },
  { value: "merged", label: "Merged Pantheon" },
  { value: "unclaimed", label: "Unclaimed" },
  { value: "custom", label: "Custom" }
];

const TERRITORY_STATUSES = [
  { value: "friendly", label: "Friendly" },
  { value: "separate", label: "Separate / No Trespass" },
  { value: "hostile", label: "Hostile" },
  { value: "contested", label: "Contested / Disputed" },
  { value: "bolstered", label: "Bolstered" },
  { value: "visitor-admitted", label: "Visitor Admitted" },
  { value: "converged", label: "Temporarily Converged" },
  { value: "converted", label: "Converted" },
  { value: "ceded", label: "Ceded" },
  { value: "unknown", label: "Unknown" }
];

const DISCOVERY_STATES = [
  { value: "public", label: "Public" },
  { value: "known", label: "Known" },
  { value: "rumored", label: "Rumored" },
  { value: "hidden", label: "Hidden from Players" }
];

const RITUAL_EVENT_TYPES = [
  { value: "", label: "No Active Event" },
  { value: "admittance", label: "Admittance" },
  { value: "bolster", label: "Bolster" },
  { value: "challenge", label: "Challenge" },
  { value: "dowsing", label: "Dowsing" },
  { value: "divination", label: "Divination" },
  { value: "temporary-convergence", label: "Temporary Convergence" },
  { value: "pocket-realm", label: "Pocket Realm Portal" }
];

const BONUS_CATEGORIES = new Set(POINT_CATEGORIES.filter(category => category.grantsBonus).map(category => category.value));
const CATEGORY_LABELS = Object.fromEntries(POINT_CATEGORIES.map(category => [category.value, category.label]));
const LOCATION_LABELS = Object.fromEntries(LOCATION_TYPES.map(type => [type.value, type.label]));
const CONTROL_LABELS = Object.fromEntries(CONTROL_TYPES.map(type => [type.value, type.label]));
const STATUS_LABELS = Object.fromEntries(TERRITORY_STATUSES.map(status => [status.value, status.label]));
const DISCOVERY_LABELS = Object.fromEntries(DISCOVERY_STATES.map(state => [state.value, state.label]));
const RITUAL_EVENT_LABELS = Object.fromEntries(RITUAL_EVENT_TYPES.map(event => [event.value, event.label]));

let territoryGridApp = null;

export function registerTerritoryGridSettings() {
  game.settings.register(SYSTEM_ID, "autoOpenTerritoryInterface", {
    name: localize("PTG.Settings.AutoOpenTerritoryInterface.Name"),
    hint: localize("PTG.Settings.AutoOpenTerritoryInterface.Hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
}

export async function maybeOpenTerritoryInterfaceOnReady() {
  if (!game.settings.get(SYSTEM_ID, "autoOpenTerritoryInterface")) return false;

  const scene = findTerritoryScene();
  if (!game.user?.isGM) {
    if (!scene) return false;
    await openTerritoryScene({ scene, notify: false });
    return true;
  }

  await openTerritoryInterface({
    scene,
    ensureScene: !scene,
    activate: false,
    notify: false
  });
  return true;
}

export function registerTerritoryGridControls() {
  Hooks.on("getSceneControlButtons", controls => {
    const tool = {
      name: "ptg-territory-grid",
      title: game.user?.isGM ? "PTG Territory GM Interface" : "PTG Territory Scene",
      icon: "fas fa-map",
      button: true,
      visible: Boolean(game.user?.isGM || findTerritoryScene()),
      onChange: () => game.user?.isGM ? openTerritoryInterface() : openTerritoryScene()
    };

    if (Array.isArray(controls)) {
      let group = controls.find(control => control.name === "ptg");
      if (!group) {
        group = {
          name: "ptg",
          title: "Part-Time Gods",
          icon: "fas fa-map",
          layer: "controls",
          tools: []
        };
        controls.push(group);
      }

      group.tools ??= [];
      if (!group.tools.some(existing => existing.name === tool.name)) group.tools.push(tool);
      return;
    }

    if (!controls || typeof controls !== "object") return;

    controls.ptg ??= {
      name: "ptg",
      title: "Part-Time Gods",
      icon: "fas fa-map",
      layer: "controls",
      tools: {}
    };

    const tools = controls.ptg.tools;
    if (Array.isArray(tools)) {
      if (!tools.some(existing => existing.name === tool.name)) tools.push(tool);
    } else {
      controls.ptg.tools = {
        ...(tools ?? {}),
        [tool.name]: tool
      };
    }
  });
}

export async function createOrOpenTerritoryGridScene({ activate = false, notify = true } = {}) {
  if (!game.user?.isGM) {
    ui.notifications.warn("Only a GM can create the God Territory Grid scene.");
    return null;
  }

  const scene = await importGodTerritoryScene({ activate, notify });
  if (!scene) return null;

  await ensureStoredTerritoryGrid(scene);
  await openTerritoryGridApp({ scene });
  return scene;
}

export async function openTerritoryInterface({ scene = getTerritoryScene({ allowFallback: Boolean(game.user?.isGM) }), ensureScene = false, activate = false, notify = true } = {}) {
  let targetScene = scene;

  if (!game.user?.isGM) {
    if (ensureScene && notify) ui.notifications.warn("Only a GM can create the God Territory Grid scene.");
    return openTerritoryScene({ scene: targetScene ?? findTerritoryScene(), notify });
  }

  if (ensureScene) {
    targetScene = await importGodTerritoryScene({ activate, notify });
    if (targetScene) await ensureStoredTerritoryGrid(targetScene);
  }

  return openTerritoryGridApp({ scene: targetScene });
}

export async function openTerritoryScene({ scene = findTerritoryScene(), notify = true } = {}) {
  const targetScene = scene ?? findTerritoryScene();
  if (!targetScene) {
    if (notify) ui.notifications.warn("No God Territory Grid scene is available yet.");
    return null;
  }

  try {
    if (game.user?.isGM) await ensureTerritorySceneOverlayLayout(targetScene);
    if (globalThis.canvas?.scene?.uuid !== targetScene.uuid) {
      if (typeof targetScene.view === "function") await targetScene.view();
      else if (game.user?.isGM && typeof targetScene.activate === "function") await targetScene.activate();
    }
    await fitTerritorySceneToCanvas(targetScene);
  } catch (error) {
    console.warn("Part-Time Gods 2E | Unable to view Territory scene.", targetScene, error);
    if (notify) ui.notifications.warn("Unable to open the Territory scene. See the console for details.");
    return null;
  }

  return targetScene;
}

export async function fitTerritorySceneToCanvas(scene = findTerritoryScene(), { duration = 250 } = {}) {
  const targetScene = scene ?? findTerritoryScene();
  const canvas = globalThis.canvas;
  if (!targetScene || typeof canvas?.animatePan !== "function") return false;

  await waitForCanvasScene(targetScene);
  if (canvas.scene?.uuid && targetScene.uuid && canvas.scene.uuid !== targetScene.uuid) return false;

  const pan = territorySceneFitPan(targetScene);
  if (!pan) return false;

  await canvas.animatePan({ ...pan, duration });
  return true;
}

export function territorySceneFitPan(scene, viewport = currentCanvasViewport(), { padding = TERRITORY_CANVAS_FIT_PADDING, minScale = 0.2, maxScale = 1.25 } = {}) {
  const dimensions = sceneDimensionsForFit(scene);
  const viewWidth = numericValue(viewport?.width, 0);
  const viewHeight = numericValue(viewport?.height, 0);
  if (!dimensions || viewWidth <= 0 || viewHeight <= 0) return null;

  const usableWidth = Math.max(1, viewWidth - (padding * 2));
  const usableHeight = Math.max(1, viewHeight - (padding * 2));
  const scale = clamp(Math.min(usableWidth / dimensions.width, usableHeight / dimensions.height), minScale, maxScale);

  return {
    x: dimensions.x + (dimensions.width / 2),
    y: dimensions.y + (dimensions.height / 2),
    scale
  };
}

async function waitForCanvasScene(scene) {
  const targetUuid = scene?.uuid;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    if (!targetUuid || globalThis.canvas?.scene?.uuid === targetUuid) return true;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  return !targetUuid || globalThis.canvas?.scene?.uuid === targetUuid;
}

function currentCanvasViewport() {
  const rendererScreen = globalThis.canvas?.app?.renderer?.screen;
  const dimensions = globalThis.canvas?.dimensions;
  const board = globalThis.document?.getElementById?.("board");
  return {
    width: numericValue(rendererScreen?.width ?? dimensions?.widthPixels ?? board?.clientWidth ?? globalThis.innerWidth, 0),
    height: numericValue(rendererScreen?.height ?? dimensions?.heightPixels ?? board?.clientHeight ?? globalThis.innerHeight, 0)
  };
}

function sceneDimensionsForFit(scene) {
  const dimensions = scene?.dimensions ?? {};
  const width = numericValue(dimensions.sceneWidth ?? dimensions.width ?? scene?.width, 0);
  const height = numericValue(dimensions.sceneHeight ?? dimensions.height ?? scene?.height, 0);
  if (width <= 0 || height <= 0) return null;

  return {
    x: numericValue(dimensions.sceneX ?? dimensions.x, 0),
    y: numericValue(dimensions.sceneY ?? dimensions.y, 0),
    width,
    height
  };
}

export async function openTerritoryGridApp({ scene = getTerritoryScene({ allowFallback: Boolean(game.user?.isGM) }) } = {}) {
  if (!game.user?.isGM) return openTerritoryScene({ scene });

  if (!territoryGridApp) territoryGridApp = new TerritoryGridApp();
  if (scene) {
    await ensureTerritorySceneOverlayLayout(scene);
    territoryGridApp.setScene(scene);
  }
  territoryGridApp.render({ force: true });
  return territoryGridApp;
}

export function getTerritoryGrid(scene = getTerritoryScene()) {
  return normalizeTerritoryGrid(scene?.getFlag?.(SYSTEM_ID, FLAG_KEY), scene?.getFlag?.(SYSTEM_ID, LEGACY_FLAG_KEY));
}

export async function setTerritoryGrid(scene, grid) {
  if (!scene) return null;
  if (!game.user?.isGM) {
    ui.notifications.warn("Only a GM can edit Territory Grid points.");
    return null;
  }

  const cleanGrid = {
    ...normalizeTerritoryGrid(grid, scene.getFlag?.(SYSTEM_ID, LEGACY_FLAG_KEY)),
    updatedAt: new Date().toISOString()
  };
  await scene.setFlag(SYSTEM_ID, FLAG_KEY, cleanGrid);
  return cleanGrid;
}

export async function clearTerritoryGrid(scene = getTerritoryScene()) {
  if (!scene) return null;
  if (!game.user?.isGM) {
    ui.notifications.warn("Only a GM can clear Territory Grid points.");
    return null;
  }

  const grid = createEmptyTerritoryGrid();
  await scene.setFlag(SYSTEM_ID, FLAG_KEY, {
    ...grid,
    updatedAt: new Date().toISOString()
  });
  return grid;
}

export async function setTerritorySceneBackground(scene, options = {}) {
  const { notify = true, ...backgroundOptions } = options ?? {};
  if (!scene) return null;
  if (!game.user?.isGM) {
    ui.notifications.warn("Only a GM can change the Territory scene background.");
    return null;
  }

  if (typeof scene.update !== "function") {
    ui.notifications.error("Unable to update the Territory scene background: the selected scene cannot be edited.");
    return null;
  }

  const updateData = territorySceneBackgroundUpdateData(backgroundOptions, scene);
  try {
    await scene.update(updateData);
    const appliedBackground = territorySceneBackgroundFromLevels(updateData.levels);
    if (typeof scene.setFlag === "function") {
      await scene.setFlag(SYSTEM_ID, "territoryBackground", {
        src: appliedBackground.src ?? "",
        color: appliedBackground.color,
        updatedAt: new Date().toISOString()
      });
    }
    await ensureTerritorySceneOverlayLayout(scene);
  } catch (error) {
    console.warn("Part-Time Gods 2E | Unable to update Territory scene background.", scene, error);
    ui.notifications.error("Unable to update the Territory scene background. See the console for details.");
    return null;
  }

  if (notify) ui.notifications.info("Updated the Territory scene background and kept the grid overlay in front.");
  return updateData;
}

export function territorySceneBackgroundUpdateData({ src = "", backgroundSrc = src, color = "", backgroundColor = color, clearImage = false } = {}, scene = null) {
  return territorySceneBackgroundUpdateDataForScene(scene, { src, backgroundSrc, color, backgroundColor, clearImage });
}

function territorySceneBackgroundUpdateDataForScene(scene, { src = "", backgroundSrc = src, color = "", backgroundColor = color, clearImage = false } = {}) {
  const normalizedSrc = clearImage ? null : String(backgroundSrc ?? "").trim() || null;
  const normalizedColor = normalizeColor(backgroundColor, DEFAULT_TERRITORY_BACKGROUND_COLOR);
  const levels = territorySceneLevelsForBackground(scene, {
    src: normalizedSrc,
    color: normalizedColor
  });

  return {
    levels
  };
}

function territorySceneLevelsForBackground(scene, { src = null, color = DEFAULT_TERRITORY_BACKGROUND_COLOR } = {}) {
  const source = scene?.toObject?.() ?? scene?._source ?? {};
  const sourceLevels = Array.isArray(source.levels) && source.levels.length
    ? source.levels
    : [defaultTerritorySceneLevel()];

  return sourceLevels.map((level, index) => {
    const next = deepClone(level);
    if (index !== 0) return next;
    next.background = {
      ...(next.background ?? {}),
      src,
      color
    };
    return next;
  });
}

function territorySceneBackgroundFromLevels(levels = []) {
  const background = Array.isArray(levels) ? levels[0]?.background ?? {} : {};
  return {
    src: background.src ?? "",
    color: normalizeColor(background.color, DEFAULT_TERRITORY_BACKGROUND_COLOR)
  };
}

function territorySceneBackgroundFromScene(scene) {
  const source = scene?.toObject?.() ?? scene?._source ?? {};
  const levelBackground = Array.isArray(source.levels) ? source.levels[0]?.background ?? {} : {};
  const legacyBackground = source.background ?? {};
  return {
    src: String(levelBackground.src ?? legacyBackground.src ?? "").trim(),
    color: normalizeColor(levelBackground.color ?? source.backgroundColor, DEFAULT_TERRITORY_BACKGROUND_COLOR)
  };
}

function defaultTerritorySceneLevel() {
  return {
    _id: "defaultLevel0000",
    name: "Level",
    elevation: { bottom: 0, top: 20 },
    background: {
      color: DEFAULT_TERRITORY_BACKGROUND_COLOR,
      src: null,
      tint: "#ffffff",
      alphaThreshold: 0.75
    },
    foreground: {
      src: null,
      tint: "#ffffff",
      alphaThreshold: 0.75
    },
    fog: { src: null },
    textures: {
      anchorX: 0.5,
      anchorY: 0.5,
      offsetX: 0,
      offsetY: 0,
      fit: "fill",
      scaleX: 1,
      scaleY: 1,
      rotation: 0
    },
    visibility: { levels: [] },
    sort: 0,
    flags: {}
  };
}

function deepClone(value) {
  if (value == null) return value;
  if (typeof globalThis.foundry?.utils?.deepClone === "function") return globalThis.foundry.utils.deepClone(value);
  return JSON.parse(JSON.stringify(value));
}

export function normalizeTerritoryGrid(value, legacyTerritory = null) {
  const grid = createEmptyTerritoryGrid();
  const sourcePoints = Array.isArray(value?.points) ? value.points : [];
  const legacyPoints = sourcePoints.length ? [] : legacyTerritoryPoints(legacyTerritory);
  const points = [];
  const usedIds = new Set();

  for (const point of [...sourcePoints, ...legacyPoints]) {
    const normalized = validateTerritoryPoint(point);
    if (!normalized) continue;

    let id = normalized.id;
    if (usedIds.has(id)) id = uniquePointId(`${id}-${points.length + 1}`, usedIds);
    usedIds.add(id);
    points.push({ ...normalized, id });
  }

  return {
    ...grid,
    ...(value && typeof value === "object" ? value : {}),
    version: GRID_VERSION,
    width: GRID_SIZE,
    height: GRID_SIZE,
    points
  };
}

export function validateTerritoryPoint(point) {
  if (!point || typeof point !== "object") return null;

  const coordinate = normalizeCoordinate(point);
  if (!coordinate) return null;

  const category = normalizeCategory(point.category ?? point.kind ?? point.type);
  const name = String(point.name ?? point.label ?? "").trim() || `${CATEGORY_LABELS[category]} ${coordinate.x}-${coordinate.y}`;
  const publicName = String(point.publicName ?? point.knownName ?? point.playerName ?? name).trim() || name;
  const level = finiteNumber(point.level, 0, 0);
  const owner = String(point.owner ?? point.actorName ?? "").trim();
  const eventSource = point.ritualEvents ?? point.events ?? (point.event ? [point.event] : []);
  const ritualEvents = normalizeRitualEvents(eventSource);
  const footprint = normalizeFootprint(point);

  return {
    id: String(point.id || point.slug || slugify(`${category}-${name}-${coordinate.x}-${coordinate.y}`) || randomId()).slice(0, 80),
    name,
    publicName,
    x: coordinate.x,
    y: coordinate.y,
    category,
    locationType: normalizeOption(point.locationType ?? point.locationKind ?? point.territoryType, LOCATION_TYPES, "unknown", {
      mundane: "mortal",
      supernatural: "divine",
      hybrid: "mixed"
    }),
    controlType: normalizeOption(point.controlType ?? point.ownerType ?? point.controlKind, CONTROL_TYPES, owner ? "god" : "unclaimed", {
      npc: "npc-god",
      "npc god": "npc-god",
      group: "faction",
      none: "unclaimed",
      sharedterritory: "shared",
      mergedpantheon: "merged"
    }),
    status: normalizeOption(point.status ?? point.boundaryStatus ?? point.controlStatus, TERRITORY_STATUSES, "friendly", {
      disputed: "contested",
      "no trespass": "separate",
      notrespass: "separate",
      temporary: "converged",
      converged: "converged",
      admitted: "visitor-admitted"
    }),
    discoveryState: normalizeOption(point.discoveryState ?? point.discovery ?? point.visibility, DISCOVERY_STATES, "known", {
      secret: "hidden",
      private: "hidden",
      discovered: "known",
      visible: "public"
    }),
    owner,
    sourceActorUuid: String(point.sourceActorUuid ?? point.actorUuid ?? "").trim(),
    sourceItemUuid: String(point.sourceItemUuid ?? point.itemUuid ?? "").trim(),
    linkedBondUuid: String(point.linkedBondUuid ?? point.bondUuid ?? "").trim(),
    linkedActorUuid: String(point.linkedActorUuid ?? point.actorUuid ?? point.sourceActorUuid ?? "").trim(),
    linkedItemUuid: String(point.linkedItemUuid ?? point.itemUuid ?? point.sourceItemUuid ?? "").trim(),
    level,
    footprint,
    footprintLabel: footprint.width === 1 && footprint.height === 1 ? "1 point" : `${footprint.width} x ${footprint.height} points`,
    dominionTags: normalizeTagList(point.dominionTags ?? point.dominions ?? point.flavorTags),
    theologyTags: normalizeTagList(point.theologyTags ?? point.theologies),
    publicNotes: String(point.publicNotes ?? point.playerNotes ?? point.knownInfo ?? point.notes ?? point.description ?? "").trim(),
    gmNotes: String(point.gmNotes ?? point.secretNotes ?? point.gmSecret ?? point.hiddenNotes ?? "").trim(),
    notes: String(point.notes ?? point.description ?? point.publicNotes ?? "").trim(),
    ritualEvents,
    history: normalizeHistory(point.history ?? point.changeHistory),
    createdAt: String(point.createdAt ?? "").trim(),
    updatedAt: String(point.updatedAt ?? "").trim()
  };
}

export function calculateTerritoryInfluence(points = [], { canEditTerritory = true } = {}) {
  const influence = {};

  for (const point of visibleTerritoryPoints(points.map(validateTerritoryPoint).filter(Boolean), { canEditTerritory })) {
    if (!BONUS_CATEGORIES.has(point.category)) continue;

    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const x = point.x + dx;
      const y = point.y + dy;
      if (!validCoordinateNumber(x) || !validCoordinateNumber(y)) continue;

      const key = coordinateKey(x, y);
      influence[key] ??= { total: 0, sources: [] };
      influence[key].total += 1;
      influence[key].sources.push({
        id: point.id,
        name: canEditTerritory ? point.name : point.publicName,
        category: point.category,
        categoryLabel: CATEGORY_LABELS[point.category] ?? point.category,
        controlType: point.controlType,
        controlLabel: CONTROL_LABELS[point.controlType] ?? point.controlType,
        status: point.status,
        statusLabel: STATUS_LABELS[point.status] ?? point.status,
        owner: point.owner
      });
    }
  }

  return influence;
}

export function buildTerritoryGridCells(grid, { canEditTerritory = true } = {}) {
  const normalized = normalizeTerritoryGrid(grid);
  const influence = calculateTerritoryInfluence(normalized.points, { canEditTerritory });
  const pointsByCoordinate = new Map();

  for (const point of visibleTerritoryPoints(normalized.points, { canEditTerritory })) {
    const key = coordinateKey(point.x, point.y);
    if (!pointsByCoordinate.has(key)) pointsByCoordinate.set(key, []);
    pointsByCoordinate.get(key).push(pointContext(point, { canEditTerritory }));
  }

  const rows = [];
  for (let y = 1; y <= GRID_SIZE; y += 1) {
    const cells = [];
    for (let x = 1; x <= GRID_SIZE; x += 1) {
      const key = coordinateKey(x, y);
      const bonus = influence[key]?.total ?? 0;
      const bonusSources = influence[key]?.sources ?? [];
      const points = pointsByCoordinate.get(key) ?? [];
      cells.push({
        x,
        y,
        key,
        label: key,
        points,
        bonus,
        bonusSources,
        bonusTitle: bonusSources.map(source => source.name).join(", "),
        hasBonus: bonus > 0,
        hasPoints: points.length > 0
      });
    }
    rows.push({ y, cells });
  }

  return {
    columns: Array.from({ length: GRID_SIZE }, (_, index) => index + 1),
    rows
  };
}

class TerritoryGridApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ["part-time-gods", "ptg-territory-grid-window"],
    position: {
      width: 980,
      height: 760
    },
    window: {
      title: "PTG Territory Grid",
      resizable: true
    },
    tag: "form"
  };

  static PARTS = {
    form: {
      template: "systems/part-time-gods/templates/apps/territory-grid-app.hbs"
    }
  };

  #sceneUuid = "";

  setScene(scene) {
    this.#sceneUuid = scene?.uuid ?? "";
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const scene = await this.#selectedScene();
    const grid = scene ? await this.#gridForScene(scene) : createEmptyTerritoryGrid();
    const canEditTerritory = Boolean(game.user?.isGM);
    const publicPoints = visibleTerritoryPoints(grid.points, { canEditTerritory });
    const gridCells = buildTerritoryGridCells(grid, { canEditTerritory });
    const influence = calculateTerritoryInfluence(grid.points, { canEditTerritory });

    return {
      ...context,
      isGM: canEditTerritory,
      canEditTerritory,
      modeLabel: canEditTerritory ? "GM Controls" : "Territory Scene",
      modeHint: canEditTerritory
        ? "Create, import, edit, and clear Territory Grid points."
        : "Open the Territory scene to view the table-facing grid.",
      scene: scene ? { uuid: scene.uuid, id: scene.id, name: scene.name } : null,
      sceneOptions: territorySceneOptions(scene),
      grid,
      columns: gridCells.columns,
      rows: gridCells.rows,
      points: publicPoints.map(point => pointContext(point, { canEditTerritory })).sort(sortPointContext),
      pointCount: publicPoints.length,
      totalPointCount: grid.points.length,
      hiddenPointCount: Math.max(0, grid.points.length - publicPoints.length),
      bonusCellCount: Object.values(influence).filter(entry => Number(entry.total ?? 0) > 0).length,
      categories: POINT_CATEGORIES,
      locationTypes: LOCATION_TYPES,
      controlTypes: CONTROL_TYPES,
      territoryStatuses: TERRITORY_STATUSES,
      discoveryStates: DISCOVERY_STATES,
      ritualEventTypes: RITUAL_EVENT_TYPES,
      hasScene: Boolean(scene)
    };
  }

  async _onRender(context, options) {
    await super._onRender(context, options);

    const root = this.element;
    root.querySelector("[data-territory-scene-select]")?.addEventListener("change", event => {
      this.#sceneUuid = event.currentTarget.value ?? "";
      this.render({ force: true });
    });

    for (const button of root.querySelectorAll("[data-action]")) {
      button.addEventListener("click", event => this.#onAction(event.currentTarget));
    }

    if (game.user?.isGM) {
      root.addEventListener("dragover", event => this.#onDragOver(event), true);
      root.addEventListener("drop", event => this.#onDrop(event), true);
    }
  }

  async #onAction(button) {
    const action = button.dataset.action;
    if (!action) return null;

    if (action === "create-scene") {
      const scene = await createOrOpenTerritoryGridScene({ activate: false });
      if (scene) this.#sceneUuid = scene.uuid;
      return this.render({ force: true });
    }

    if (action === "view-scene") {
      const scene = await this.#selectedScene();
      return openTerritoryScene({ scene });
    }

    if (action === "territory-controls") {
      const scene = await this.#requireEditableScene();
      if (!scene) return null;
      await openTerritoryControls({ scene });
      return this.render({ force: true });
    }

    if (action === "background") return this.#editBackground();

    if (action === "refresh-grid") return this.render({ force: true });

    if (action === "import-attachments") return this.#importAttachments();
    if (action === "clear-grid") return this.#clearGrid();
    if (action === "create-point") return this.#editPoint(null, {
      x: Number(button.dataset.x ?? 1),
      y: Number(button.dataset.y ?? 1)
    });
    if (action === "edit-point") return this.#editPoint(button.dataset.pointId);
    if (action === "view-point") return this.#viewPoint(button.dataset.pointId);
    if (action === "delete-point") return this.#deletePoint(button.dataset.pointId);

    return null;
  }

  #onDragOver(event) {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  }

  async #onDrop(event) {
    if (!game.user?.isGM) return null;

    event.preventDefault();
    event.stopPropagation();

    const actor = await territoryActorFromDropData(getDragEventData(event));
    if (!actor) {
      ui.notifications.warn("Drop a player Character actor onto the Territory GM interface.");
      return null;
    }

    if (actor?.type !== "character") {
      ui.notifications.warn("Only Character actors can be imported into the Territory Grid.");
      return null;
    }

    const fallbackCoordinate = coordinateFromElement(event.target);
    return this.#importActorTerritory(actor, { fallbackCoordinate });
  }

  async #selectedScene() {
    if (this.#sceneUuid) {
      try {
        const scene = await fromUuid(this.#sceneUuid);
        if (scene?.documentName === "Scene" || scene?.constructor?.documentName === "Scene") return scene;
      } catch (error) {
        console.warn("Part-Time Gods 2E | Unable to resolve Territory Grid scene.", this.#sceneUuid, error);
      }
    }

    const scene = getTerritoryScene({ allowFallback: Boolean(game.user?.isGM) });
    this.#sceneUuid = scene?.uuid ?? "";
    return scene;
  }

  async #gridForScene(scene) {
    const grid = getTerritoryGrid(scene);
    if (game.user?.isGM && !scene.getFlag(SYSTEM_ID, FLAG_KEY)) await setTerritoryGrid(scene, grid);
    return grid;
  }

  async #requireEditableScene() {
    if (!game.user?.isGM) {
      ui.notifications.warn("Only a GM can edit Territory Grid points.");
      return null;
    }

    const scene = await this.#selectedScene();
    if (!scene) {
      ui.notifications.warn("Create the God Territory Grid scene before editing Territory points.");
      return null;
    }

    await ensureStoredTerritoryGrid(scene);
    return scene;
  }

  async #editPoint(pointId, defaults = {}) {
    const scene = await this.#requireEditableScene();
    if (!scene) return null;

    const grid = getTerritoryGrid(scene);
    const existing = grid.points.find(point => point.id === pointId) ?? null;
    const selection = await promptTerritoryPoint(existing, defaults);
    if (!selection) return null;

    const point = validateTerritoryPoint({
      ...(existing ?? {}),
      ...selection,
      id: existing?.id ?? randomId(),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    if (!point) {
      ui.notifications.warn("Territory Grid coordinates must be between 1 and 10.");
      return null;
    }

    const points = existing
      ? grid.points.map(candidate => candidate.id === existing.id ? point : candidate)
      : [...grid.points, point];
    await setTerritoryGrid(scene, { ...grid, points });
    this.render({ force: true });
    return point;
  }

  async #viewPoint(pointId) {
    const scene = await this.#selectedScene();
    if (!scene || !pointId) return null;

    const grid = getTerritoryGrid(scene);
    const point = grid.points.find(candidate => candidate.id === pointId);
    if (!point) return null;

    return promptTerritoryPointDetails(point, { canEditTerritory: Boolean(game.user?.isGM) });
  }

  async #deletePoint(pointId) {
    const scene = await this.#requireEditableScene();
    if (!scene || !pointId) return null;

    const grid = getTerritoryGrid(scene);
    const point = grid.points.find(candidate => candidate.id === pointId);
    if (!point) return null;

    const confirmed = await DialogV2.confirm({
      window: { title: "Delete Territory Point" },
      classes: ["part-time-gods", "ptg-sheet-dialog"],
      content: `<div class="ptg-dialog-body"><p class="ptg-dialog-help">Delete ${escapeHTML(point.name)} from ${point.x}-${point.y}?</p></div>`,
      modal: true
    });
    if (!confirmed) return null;

    const points = grid.points.filter(candidate => candidate.id !== pointId);
    await setTerritoryGrid(scene, { ...grid, points });
    this.render({ force: true });
    return point;
  }

  async #clearGrid() {
    const scene = await this.#requireEditableScene();
    if (!scene) return null;

    const confirmed = await DialogV2.confirm({
      window: { title: "Clear Territory Grid" },
      classes: ["part-time-gods", "ptg-sheet-dialog"],
      content: `<div class="ptg-dialog-body"><p class="ptg-dialog-help">Remove all stored Territory Grid points from ${escapeHTML(scene.name)}?</p></div>`,
      modal: true
    });
    if (!confirmed) return null;

    await clearTerritoryGrid(scene);
    this.render({ force: true });
    return true;
  }

  async #editBackground() {
    const scene = await this.#requireEditableScene();
    if (!scene) return null;

    const selection = await promptTerritorySceneBackground(scene);
    if (!selection) return null;

    const applied = await setTerritorySceneBackground(scene, selection);
    if (!applied) return null;
    await ensureStoredTerritoryGrid(scene);
    await fitTerritorySceneToCanvas(scene);
    this.render({ force: true });
    return scene;
  }

  async #importAttachments() {
    const scene = await this.#requireEditableScene();
    if (!scene) return null;

    const selection = await promptAttachmentImport();
    if (!selection) return null;

    const actors = await resolveImportActors(selection);
    if (!actors.length) {
      ui.notifications.warn("Choose at least one character with territory attachments.");
      return null;
    }

    const grid = getTerritoryGrid(scene);
    const points = [...grid.points];
    let added = 0;
    let skipped = 0;

    for (const actor of actors) {
      const result = await territoryPointsFromActor(actor, {
        existingPoints: points,
        promptForMissingCoordinates: true
      });
      points.push(...result.points);
      added += result.points.length;
      skipped += result.skipped;
    }

    await setTerritoryGrid(scene, { ...grid, points });
    ui.notifications.info(`Imported ${added} Territory Grid attachment${added === 1 ? "" : "s"}${skipped ? `; skipped ${skipped}` : ""}.`);
    this.render({ force: true });
    return { added, skipped };
  }

  async #importActorTerritory(actor, { fallbackCoordinate = null } = {}) {
    const scene = await this.#requireEditableScene();
    if (!scene) return null;

    const grid = getTerritoryGrid(scene);
    const result = await territoryPointsFromActor(actor, {
      existingPoints: grid.points,
      fallbackCoordinate,
      promptForMissingCoordinates: true
    });

    if (!result.points.length) {
      ui.notifications.warn(`${actor.name} has no new territory-ready Individual Bonds, Landmark Bonds, Worshippers, or Attachments to import.`);
      return result;
    }

    await setTerritoryGrid(scene, { ...grid, points: [...grid.points, ...result.points] });
    ui.notifications.info(`Imported ${result.points.length} Territory Grid point${result.points.length === 1 ? "" : "s"} from ${actor.name}${result.skipped ? `; skipped ${result.skipped}` : ""}.`);
    this.render({ force: true });
    return result;
  }
}

async function ensureStoredTerritoryGrid(scene) {
  if (!scene) return null;
  const grid = getTerritoryGrid(scene);
  if (!scene.getFlag(SYSTEM_ID, FLAG_KEY)) await setTerritoryGrid(scene, grid);
  return grid;
}

async function ensureTerritoryGridOverlayForeground(scene) {
  const drawings = Array.from(scene?.drawings?.contents ?? scene?.drawings ?? []);
  const managedDrawings = drawings
    .filter(drawing => isManagedTerritoryDrawing(drawing))
    .sort((a, b) => Number(a.sort ?? drawingSource(a).sort ?? 0) - Number(b.sort ?? drawingSource(b).sort ?? 0));
  if (!managedDrawings.length || typeof scene.updateEmbeddedDocuments !== "function") return managedDrawings.length;

  const updates = managedDrawings
    .map((drawing, index) => {
      const id = drawing.id ?? drawing._id ?? drawingSource(drawing)._id;
      if (!id) return null;
      return {
        _id: id,
        hidden: false,
        locked: true,
        sort: 5000 + index
      };
    })
    .filter(Boolean);

  if (updates.length) await scene.updateEmbeddedDocuments("Drawing", updates);
  return updates.length;
}

async function ensureTerritorySceneOverlayLayout(scene) {
  if (!scene || !game.user?.isGM || typeof scene.updateEmbeddedDocuments !== "function") {
    return ensureTerritoryGridOverlayForeground(scene);
  }

  const desiredDrawings = getGodTerritorySceneData({ authorId: game.user?.id }).drawings ?? [];
  const desiredByElement = new Map(desiredDrawings.map(drawing => [
    drawing.flags?.[SYSTEM_ID]?.territorySheetElement,
    drawing
  ]).filter(([key]) => key));
  const drawingCollection = Array.from(scene.drawings?.contents ?? scene.drawings ?? []);
  const existingByElement = new Map();

  for (const drawing of drawingCollection) {
    const source = drawingSource(drawing);
    const key = drawing?.getFlag?.(SYSTEM_ID, "territorySheetElement") ?? source.flags?.[SYSTEM_ID]?.territorySheetElement;
    if (key && !existingByElement.has(key)) existingByElement.set(key, drawing);
  }

  const updates = [];
  const creates = [];
  let sort = 5000;

  for (const [key, desired] of desiredByElement) {
    const existing = existingByElement.get(key);
    const drawingData = {
      x: desired.x,
      y: desired.y,
      shape: deepClone(desired.shape),
      text: desired.text ?? "",
      fontFamily: desired.fontFamily,
      fontSize: desired.fontSize,
      textColor: desired.textColor,
      textAlpha: desired.textAlpha,
      fillType: desired.fillType,
      fillColor: desired.fillColor,
      fillAlpha: desired.fillAlpha,
      strokeColor: desired.strokeColor,
      strokeAlpha: desired.strokeAlpha,
      strokeWidth: desired.strokeWidth,
      hidden: false,
      locked: true,
      sort: sort++
    };

    if (existing) {
      const id = existing.id ?? existing._id ?? drawingSource(existing)._id;
      if (id) updates.push({ _id: id, ...drawingData });
    } else if (typeof scene.createEmbeddedDocuments === "function") {
      creates.push({
        ...deepClone(desired),
        ...drawingData,
        author: desired.author ?? game.user?.id,
        flags: deepClone(desired.flags)
      });
    }
  }

  if (updates.length) await scene.updateEmbeddedDocuments("Drawing", updates);
  if (creates.length) await scene.createEmbeddedDocuments("Drawing", creates);
  return updates.length + creates.length;
}

function isManagedTerritoryDrawing(drawing) {
  const source = drawingSource(drawing);
  const flags = source.flags?.[SYSTEM_ID] ?? {};
  return Boolean(
    drawing?.getFlag?.(SYSTEM_ID, "territoryZone")
    || drawing?.getFlag?.(SYSTEM_ID, "territorySheetElement")
    || flags.territoryZone
    || flags.territorySheetElement
    || String(source.name ?? drawing?.name ?? "").startsWith("Territory Grid:")
  );
}

function drawingSource(drawing) {
  return drawing?.toObject?.() ?? drawing?._source ?? drawing ?? {};
}

function findTerritoryScene() {
  const activeScene = globalThis.canvas?.scene ?? game.scenes?.active;
  if (isTerritoryScene(activeScene)) return activeScene;

  return game.scenes?.find(scene => isTerritoryScene(scene)) ?? null;
}

function getTerritoryScene({ allowFallback = true } = {}) {
  const territoryScene = findTerritoryScene();
  if (territoryScene) return territoryScene;

  const activeScene = globalThis.canvas?.scene ?? game.scenes?.active;
  return allowFallback ? activeScene ?? null : null;
}

function isTerritoryScene(scene) {
  return Boolean(scene && (
    scene.getFlag?.(SYSTEM_ID, "kind") === TERRITORY_SCENE_KIND ||
    scene.getFlag?.(SYSTEM_ID, FLAG_KEY) ||
    scene.name === TERRITORY_SCENE_NAME
  ));
}

function territorySceneOptions(selectedScene) {
  const scenes = new Map();
  for (const scene of game.scenes ?? []) {
    if (isTerritoryScene(scene)) scenes.set(scene.uuid, scene);
  }
  if (selectedScene) scenes.set(selectedScene.uuid, selectedScene);

  return Array.from(scenes.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(scene => ({
      uuid: scene.uuid,
      name: scene.name,
      selected: scene.uuid === selectedScene?.uuid
    }));
}

function createEmptyTerritoryGrid() {
  return {
    version: GRID_VERSION,
    width: GRID_SIZE,
    height: GRID_SIZE,
    points: [],
    updatedAt: ""
  };
}

function legacyTerritoryPoints(territoryData) {
  const coordinates = territoryData?.coordinates;
  if (!coordinates || typeof coordinates !== "object") return [];

  const points = [];
  for (const coordinate of Object.values(coordinates)) {
    const x = finiteNumber(coordinate?.column ?? coordinate?.x, 0, 1);
    const y = finiteNumber(coordinate?.row ?? coordinate?.y, 0, 1);
    if (!validCoordinateNumber(x) || !validCoordinateNumber(y)) continue;

    const pointOfInterest = String(coordinate?.pointOfInterest ?? "").trim();
    const influence = coordinate?.influence ?? {};
    const sphere = String(influence.sphere ?? "").trim();
    const rating = finiteNumber(influence.rating, 0, 0);
    const manifestation = coordinate?.manifestation ?? {};
    const manifestationModifier = finiteNumber(manifestation.modifier, 0);
    if (!pointOfInterest && !sphere && !rating && !manifestationModifier) continue;

    points.push({
      id: slugify(`legacy-${coordinateKey(x, y)}-${pointOfInterest || sphere || "point"}`),
      name: pointOfInterest || sphere || `Territory Point ${coordinateKey(x, y)}`,
      x,
      y,
      category: rating < 0 || manifestationModifier < 0 ? "threat" : "custom",
      owner: sphere,
      level: Math.abs(rating || manifestationModifier || 0),
      notes: [coordinate.notes, influence.notes, manifestation.notes].filter(Boolean).join(" ")
    });
  }

  return points;
}

function normalizeCoordinate(point) {
  const x = finiteNumber(point.x ?? point.column, NaN);
  const y = finiteNumber(point.y ?? point.row, NaN);
  if (validCoordinateNumber(x) && validCoordinateNumber(y)) return { x, y };

  return parseCoordinate(point.coordinate ?? point.location ?? point.territoryGrid ?? point.key ?? point.label);
}

function parseCoordinate(value) {
  if (!value && value !== 0) return null;
  const match = String(value).match(/\b(10|[1-9])\s*[-,xX/ ]\s*(10|[1-9])\b/);
  if (!match) return null;

  const x = Number(match[1]);
  const y = Number(match[2]);
  return validCoordinateNumber(x) && validCoordinateNumber(y) ? { x, y } : null;
}

function validCoordinateNumber(value) {
  return Number.isInteger(value) && value >= 1 && value <= GRID_SIZE;
}

function coordinateKey(x, y) {
  return `${x}-${y}`;
}

function normalizeCategory(category) {
  const normalized = String(category ?? "").trim().toLowerCase();
  if (normalized.includes("individual")) return "individual";
  if (normalized.includes("landmark")) return "landmark";
  if (normalized.includes("worship")) return "worshipper";
  if (normalized.includes("rival")) return "rival";
  if (normalized.includes("threat")) return "threat";
  if (normalized.includes("neutral") || normalized.includes("group")) return "neutral";
  return POINT_CATEGORIES.some(candidate => candidate.value === normalized) ? normalized : "custom";
}

function normalizeOption(value, options, fallback, aliases = {}) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return fallback;

  const compact = normalized.replace(/[^a-z0-9]+/g, "");
  const alias = aliases[normalized] ?? aliases[compact];
  if (alias && options.some(option => option.value === alias)) return alias;

  const exact = options.find(option => option.value === normalized || option.label.toLowerCase() === normalized);
  if (exact) return exact.value;

  const loose = options.find(option => normalized.includes(option.value) || normalized.includes(option.label.toLowerCase()));
  return loose?.value ?? fallback;
}

function normalizeTagList(value) {
  const source = Array.isArray(value) ? value : String(value ?? "").split(/[,;|]/);
  return source
    .map(entry => String(entry ?? "").trim())
    .filter(Boolean)
    .slice(0, 12);
}

function normalizeFootprint(point) {
  const footprint = point.footprint && typeof point.footprint === "object" ? point.footprint : {};
  return {
    width: Math.min(GRID_SIZE, finiteNumber(footprint.width ?? point.footprintWidth ?? point.width, 1, 1)),
    height: Math.min(GRID_SIZE, finiteNumber(footprint.height ?? point.footprintHeight ?? point.height, 1, 1))
  };
}

function normalizeRitualEvents(value) {
  const source = Array.isArray(value) ? value : value ? [value] : [];
  return source
    .map(event => {
      const type = normalizeOption(event?.type ?? event?.kind ?? event?.ritual, RITUAL_EVENT_TYPES, "", {
        convergence: "temporary-convergence",
        portal: "pocket-realm"
      });
      if (!type) return null;

      return {
        type,
        label: RITUAL_EVENT_LABELS[type] ?? type,
        status: String(event?.status ?? event?.state ?? "active").trim() || "active",
        clock: String(event?.clock ?? event?.timer ?? event?.duration ?? "").trim(),
        expiresAt: String(event?.expiresAt ?? event?.expiry ?? "").trim(),
        notes: String(event?.notes ?? event?.description ?? "").trim(),
        public: event?.public !== false
      };
    })
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeHistory(value) {
  const source = Array.isArray(value) ? value : [];
  return source
    .map(entry => ({
      at: String(entry?.at ?? entry?.date ?? "").trim(),
      summary: String(entry?.summary ?? entry?.text ?? entry?.notes ?? "").trim(),
      public: entry?.public === true
    }))
    .filter(entry => entry.summary)
    .slice(0, 20);
}

function visibleTerritoryPoints(points = [], { canEditTerritory = true } = {}) {
  const normalized = points.map(validateTerritoryPoint).filter(Boolean);
  return canEditTerritory
    ? normalized
    : normalized.filter(point => point.discoveryState !== "hidden");
}

function publicPointName(point) {
  if (point.discoveryState === "rumored") return point.publicName || "Rumored Territory";
  return point.publicName || point.name;
}

function publicRitualEvents(point, { canEditTerritory = true } = {}) {
  return canEditTerritory ? point.ritualEvents : point.ritualEvents.filter(event => event.public);
}

function pointContext(point, { canEditTerritory = true } = {}) {
  const safeName = canEditTerritory ? point.name : publicPointName(point);
  const categoryLabel = CATEGORY_LABELS[point.category] ?? point.category;
  const visibleEvents = publicRitualEvents(point, { canEditTerritory });
  const tagLabels = [...point.dominionTags, ...point.theologyTags].slice(0, 4);
  return {
    id: point.id,
    name: safeName,
    publicName: point.publicName,
    x: point.x,
    y: point.y,
    category: point.category,
    categoryLabel,
    categoryClass: `ptg-territory-point-${point.category}`,
    locationType: point.locationType,
    locationLabel: LOCATION_LABELS[point.locationType] ?? point.locationType,
    controlType: point.controlType,
    controlLabel: CONTROL_LABELS[point.controlType] ?? point.controlType,
    controlClass: `ptg-territory-control-${point.controlType}`,
    status: point.status,
    statusLabel: STATUS_LABELS[point.status] ?? point.status,
    statusClass: `ptg-territory-status-${point.status}`,
    discoveryState: point.discoveryState,
    discoveryLabel: DISCOVERY_LABELS[point.discoveryState] ?? point.discoveryState,
    owner: point.owner,
    levelLabel: point.level ? `Level ${point.level}` : "",
    ownerLabel: point.owner ? `${point.owner}` : "",
    sourceLabel: [point.owner, point.level ? `Level ${point.level}` : ""].filter(Boolean).join(" - "),
    level: point.level,
    footprint: point.footprint,
    footprintLabel: point.footprintLabel,
    dominionTags: point.dominionTags,
    theologyTags: point.theologyTags,
    tagLabels,
    tagSummary: tagLabels.join(", "),
    publicNotes: point.publicNotes,
    notes: canEditTerritory ? point.notes : point.publicNotes,
    gmNotes: canEditTerritory ? point.gmNotes : "",
    sourceActorUuid: canEditTerritory ? point.sourceActorUuid : "",
    sourceItemUuid: canEditTerritory ? point.sourceItemUuid : "",
    linkedBondUuid: canEditTerritory ? point.linkedBondUuid : "",
    linkedActorUuid: canEditTerritory ? point.linkedActorUuid : "",
    linkedItemUuid: canEditTerritory ? point.linkedItemUuid : "",
    ritualEvents: visibleEvents,
    eventLabel: visibleEvents.map(event => event.label).join(", "),
    history: canEditTerritory ? point.history : point.history.filter(entry => entry.public)
  };
}

function sortPointContext(a, b) {
  return (a.y - b.y) || (a.x - b.x) || a.name.localeCompare(b.name);
}

async function promptTerritorySceneBackground(scene) {
  const storedBackground = scene?.getFlag?.(SYSTEM_ID, "territoryBackground") ?? {};
  const sceneBackground = territorySceneBackgroundFromScene(scene);
  const sceneSrc = sceneBackground.src;
  const storedSrc = String(storedBackground.src ?? "").trim();
  const existingSrc = sceneSrc || storedSrc;
  const existingColor = normalizeColor(sceneBackground.color || storedBackground.color, DEFAULT_TERRITORY_BACKGROUND_COLOR);
  const content = `
    <div class="ptg-dialog-body ptg-territory-background-dialog">
      <p class="ptg-dialog-help">Set a scene background image or color. The Territory Grid overlay remains locked in the foreground.</p>
      <label class="ptg-dialog-label">
        <span>Background Image Path or URL</span>
        <div class="ptg-territory-file-row">
          <input type="text" name="backgroundSrc" value="${escapeHTML(existingSrc)}" placeholder="worlds/.../territory.png or https://...">
          <button type="button" data-territory-background-browse title="Choose a background image from Foundry user data">
            <i class="fas fa-folder-open"></i>
            <span>Browse</span>
          </button>
        </div>
      </label>
      <label class="ptg-dialog-label">
        <span>Background Color</span>
        <input type="color" name="backgroundColor" value="${escapeHTML(existingColor)}">
      </label>
      <label class="ptg-dialog-check">
        <input type="checkbox" name="clearImage">
        <span>Clear background image and use color only</span>
      </label>
    </div>
  `;

  return DialogV2.prompt({
    window: { title: "Territory Scene Background", resizable: true },
    classes: ["part-time-gods", "ptg-sheet-dialog", "ptg-territory-background-window"],
    content,
    rejectClose: false,
    modal: true,
    render: (event, dialog) => wireTerritoryBackgroundDialog(dialog.element ?? dialog),
    ok: {
      label: "Update Background",
      callback: (event, button) => ({
        backgroundSrc: button.form.elements.backgroundSrc?.value?.trim() ?? "",
        backgroundColor: button.form.elements.backgroundColor?.value ?? DEFAULT_TERRITORY_BACKGROUND_COLOR,
        clearImage: Boolean(button.form.elements.clearImage?.checked)
      })
    }
  });
}

function wireTerritoryBackgroundDialog(element) {
  const root = element instanceof HTMLElement ? element : element?.querySelector?.(".ptg-territory-background-dialog")?.closest("form");
  const input = root?.querySelector?.("[name='backgroundSrc']");
  const browse = root?.querySelector?.("[data-territory-background-browse]");
  if (!input || !browse) return;

  browse.addEventListener("click", event => {
    event.preventDefault();
    const FilePickerClass = territoryFilePickerClass();
    if (!FilePickerClass) {
      ui.notifications.warn("Foundry's File Picker is not available. Paste a user-data image path into the field.");
      input.focus();
      return;
    }

    const picker = new FilePickerClass({
      type: "image",
      current: input.value,
      callback: path => {
        input.value = String(path ?? "").trim();
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    picker.render(true);
  });
}

export function territoryFilePickerClass() {
  const v14Picker = foundry.applications.apps?.FilePicker;
  return globalThis.FilePicker ?? v14Picker?.implementation ?? v14Picker ?? null;
}

async function promptTerritoryPoint(point = null, defaults = {}) {
  const existing = point ?? {};
  const coordinate = normalizeCoordinate({ ...defaults, ...existing }) ?? { x: defaults.x ?? 1, y: defaults.y ?? 1 };
  const firstEvent = existing.ritualEvents?.[0] ?? {};
  const categoryOptions = selectOptions(POINT_CATEGORIES, existing.category ?? "custom");
  const locationOptions = selectOptions(LOCATION_TYPES, existing.locationType ?? "unknown");
  const controlOptions = selectOptions(CONTROL_TYPES, existing.controlType ?? (existing.owner ? "god" : "unclaimed"));
  const statusOptions = selectOptions(TERRITORY_STATUSES, existing.status ?? "friendly");
  const discoveryOptions = selectOptions(DISCOVERY_STATES, existing.discoveryState ?? "known");
  const ritualOptions = selectOptions(RITUAL_EVENT_TYPES, firstEvent.type ?? "");
  const content = `
    <div class="ptg-dialog-body ptg-territory-point-dialog">
      <div class="ptg-dialog-row">
        <label>
          <span>Name</span>
          <input type="text" name="name" value="${escapeHTML(existing.name ?? "")}" placeholder="Bond, landmark, worshippers, or threat" required>
        </label>
        <label>
          <span>Public Name</span>
          <input type="text" name="publicName" value="${escapeHTML(existing.publicName ?? existing.name ?? "")}" placeholder="Name shown to players">
        </label>
      </div>
      <div class="ptg-dialog-row">
        <label>
          <span>Category</span>
          <select name="category">${categoryOptions}</select>
        </label>
        <label>
          <span>Location Type</span>
          <select name="locationType">${locationOptions}</select>
        </label>
      </div>
      <div class="ptg-dialog-row">
        <label>
          <span>X</span>
          <input type="number" name="x" value="${coordinate.x}" min="1" max="10" required>
        </label>
        <label>
          <span>Y</span>
          <input type="number" name="y" value="${coordinate.y}" min="1" max="10" required>
        </label>
        <label>
          <span>Level</span>
          <input type="number" name="level" value="${finiteNumber(existing.level, 0, 0)}" min="0" max="10">
        </label>
        <label>
          <span>Footprint W</span>
          <input type="number" name="footprintWidth" value="${finiteNumber(existing.footprint?.width ?? existing.footprintWidth, 1, 1)}" min="1" max="10">
        </label>
        <label>
          <span>Footprint H</span>
          <input type="number" name="footprintHeight" value="${finiteNumber(existing.footprint?.height ?? existing.footprintHeight, 1, 1)}" min="1" max="10">
        </label>
      </div>
      <label class="ptg-dialog-label">
        <span>Owner</span>
        <input type="text" name="owner" value="${escapeHTML(existing.owner ?? "")}" placeholder="Character, pantheon, faction, or none">
      </label>
      <div class="ptg-dialog-row">
        <label>
          <span>Control Source</span>
          <select name="controlType">${controlOptions}</select>
        </label>
        <label>
          <span>Boundary / Status</span>
          <select name="status">${statusOptions}</select>
        </label>
        <label>
          <span>Discovery</span>
          <select name="discoveryState">${discoveryOptions}</select>
        </label>
      </div>
      <div class="ptg-dialog-row">
        <label>
          <span>Dominion Tags</span>
          <input type="text" name="dominionTags" value="${escapeHTML((existing.dominionTags ?? []).join(", "))}" placeholder="Smoke, Cities, Ruin">
        </label>
        <label>
          <span>Theology Tags</span>
          <input type="text" name="theologyTags" value="${escapeHTML((existing.theologyTags ?? []).join(", "))}" placeholder="Saints, Ancestors">
        </label>
      </div>
      <div class="ptg-dialog-row">
        <label>
          <span>Linked Bond UUID</span>
          <input type="text" name="linkedBondUuid" value="${escapeHTML(existing.linkedBondUuid ?? "")}" placeholder="Optional Bond/Attachment UUID">
        </label>
        <label>
          <span>Linked Actor UUID</span>
          <input type="text" name="linkedActorUuid" value="${escapeHTML(existing.linkedActorUuid ?? existing.sourceActorUuid ?? "")}" placeholder="Optional actor UUID">
        </label>
      </div>
      <div class="ptg-dialog-row">
        <label>
          <span>Territory Event</span>
          <select name="ritualEventType">${ritualOptions}</select>
        </label>
        <label>
          <span>Event Clock / Expiry</span>
          <input type="text" name="ritualEventClock" value="${escapeHTML(firstEvent.clock || firstEvent.expiresAt || "")}" placeholder="Week 2, expires after scene, etc.">
        </label>
      </div>
      <label class="ptg-dialog-label">
        <span>Public Notes</span>
        <textarea name="publicNotes" rows="3">${escapeHTML(existing.publicNotes ?? existing.notes ?? "")}</textarea>
      </label>
      <label class="ptg-dialog-label">
        <span>GM Secrets / Hidden Notes</span>
        <textarea name="gmNotes" rows="3">${escapeHTML(existing.gmNotes ?? "")}</textarea>
      </label>
      <label class="ptg-dialog-label">
        <span>Event Notes</span>
        <textarea name="ritualEventNotes" rows="2">${escapeHTML(firstEvent.notes ?? "")}</textarea>
      </label>
    </div>
  `;

  return DialogV2.prompt({
    window: { title: point ? "Edit Territory Point" : "Add Territory Point", resizable: true },
    classes: ["part-time-gods", "ptg-sheet-dialog", "ptg-territory-point-window"],
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: point ? "Save Point" : "Add Point",
      callback: (event, button) => ({
        name: button.form.elements.name?.value?.trim() ?? "",
        publicName: button.form.elements.publicName?.value?.trim() ?? "",
        category: button.form.elements.category?.value ?? "custom",
        locationType: button.form.elements.locationType?.value ?? "unknown",
        controlType: button.form.elements.controlType?.value ?? "unclaimed",
        status: button.form.elements.status?.value ?? "friendly",
        discoveryState: button.form.elements.discoveryState?.value ?? "known",
        x: Number(button.form.elements.x?.value ?? 0),
        y: Number(button.form.elements.y?.value ?? 0),
        level: Number(button.form.elements.level?.value ?? 0),
        footprint: {
          width: Number(button.form.elements.footprintWidth?.value ?? 1),
          height: Number(button.form.elements.footprintHeight?.value ?? 1)
        },
        owner: button.form.elements.owner?.value?.trim() ?? "",
        dominionTags: normalizeTagList(button.form.elements.dominionTags?.value ?? ""),
        theologyTags: normalizeTagList(button.form.elements.theologyTags?.value ?? ""),
        linkedBondUuid: button.form.elements.linkedBondUuid?.value?.trim() ?? "",
        linkedActorUuid: button.form.elements.linkedActorUuid?.value?.trim() ?? "",
        publicNotes: button.form.elements.publicNotes?.value?.trim() ?? "",
        gmNotes: button.form.elements.gmNotes?.value?.trim() ?? "",
        ritualEvents: button.form.elements.ritualEventType?.value ? [{
          type: button.form.elements.ritualEventType.value,
          status: "active",
          clock: button.form.elements.ritualEventClock?.value?.trim() ?? "",
          notes: button.form.elements.ritualEventNotes?.value?.trim() ?? "",
          public: true
        }] : []
      })
    }
  });
}

function selectOptions(options, selectedValue) {
  return options
    .map(option => `<option value="${escapeHTML(option.value)}" ${option.value === selectedValue ? "selected" : ""}>${escapeHTML(option.label)}</option>`)
    .join("");
}

async function promptTerritoryPointDetails(point, { canEditTerritory = true } = {}) {
  const context = pointContext(point, { canEditTerritory });
  const detailRows = [
    ["Coordinate", coordinateKey(context.x, context.y)],
    ["Category", context.categoryLabel],
    ["Location", context.locationLabel],
    ["Control", context.controlLabel],
    ["Status", context.statusLabel],
    ["Discovery", context.discoveryLabel],
    context.owner ? ["Owner", context.owner] : null,
    context.level ? ["Level", String(context.level)] : null,
    context.footprintLabel ? ["Footprint", context.footprintLabel] : null,
    context.tagSummary ? ["Flavor Tags", context.tagSummary] : null,
    context.eventLabel ? ["Territory Event", context.eventLabel] : null,
    context.sourceActorUuid ? ["Actor", context.sourceActorUuid] : null,
    context.sourceItemUuid ? ["Source Item", context.sourceItemUuid] : null,
    context.linkedBondUuid ? ["Linked Bond", context.linkedBondUuid] : null
  ].filter(Boolean);
  const rows = detailRows
    .map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`)
    .join("");
  const notes = context.publicNotes || context.notes
    ? `<section class="ptg-territory-point-notes"><h3>Public Notes</h3><p>${escapeHTML(context.publicNotes || context.notes)}</p></section>`
    : "";
  const gmNotes = canEditTerritory && context.gmNotes
    ? `<section class="ptg-territory-point-notes"><h3>GM Secrets</h3><p>${escapeHTML(context.gmNotes)}</p></section>`
    : "";
  const eventNotes = context.ritualEvents.length
    ? `<section class="ptg-territory-point-notes"><h3>Events</h3><p>${escapeHTML(context.ritualEvents.map(event => [event.label, event.clock, event.notes].filter(Boolean).join(": ")).join("; "))}</p></section>`
    : "";
  const content = `
    <div class="ptg-dialog-body ptg-territory-point-dialog">
      <dl class="ptg-territory-point-details">${rows}</dl>
      ${notes}
      ${gmNotes}
      ${eventNotes}
    </div>
  `;

  return DialogV2.prompt({
    window: { title: `Territory Point: ${context.name}`, resizable: true },
    classes: ["part-time-gods", "ptg-sheet-dialog", "ptg-territory-point-window"],
    content,
    rejectClose: false,
    modal: false,
    ok: {
      label: "Close",
      callback: () => true
    }
  });
}

async function promptAttachmentImport() {
  const actorOptions = characterActors()
    .map(actor => `<option value="${escapeHTML(actor.uuid)}">${escapeHTML(actor.name)}</option>`)
    .join("");
  const pantheonOptions = pantheonActors()
    .map(actor => `<option value="${escapeHTML(actor.uuid)}">${escapeHTML(actor.name)}</option>`)
    .join("");
  const content = `
    <div class="ptg-dialog-body ptg-territory-import-dialog">
      <p class="ptg-dialog-help">Import character Individual Bonds, Landmark Bonds, and Worshippers as Territory Grid points. Existing imported item UUIDs are skipped.</p>
      <label class="ptg-dialog-label">
        <span>Pantheon Members</span>
        <select name="pantheonUuid">
          <option value="">No Pantheon</option>
          ${pantheonOptions}
        </select>
      </label>
      <label class="ptg-dialog-label">
        <span>Characters</span>
        <select name="actorUuids" multiple size="8">
          ${actorOptions}
        </select>
      </label>
    </div>
  `;

  return DialogV2.prompt({
    window: { title: "Import Territory Attachments", resizable: true },
    classes: ["part-time-gods", "ptg-sheet-dialog", "ptg-territory-import-window"],
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Import Attachments",
      callback: (event, button) => ({
        pantheonUuid: button.form.elements.pantheonUuid?.value ?? "",
        actorUuids: Array.from(button.form.elements.actorUuids?.selectedOptions ?? []).map(option => option.value)
      })
    }
  });
}

async function resolveImportActors(selection) {
  const actors = new Map();
  for (const uuid of selection.actorUuids ?? []) {
    addCharacterActor(actors, await actorFromUuid(uuid));
  }

  const pantheon = selection.pantheonUuid ? await actorFromUuid(selection.pantheonUuid) : null;
  for (const member of pantheon?.system?.members ?? []) {
    addCharacterActor(actors, await actorFromUuid(member.uuid));
  }

  return Array.from(actors.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function territoryPointsFromActor(actor, {
  existingPoints = [],
  fallbackCoordinate = null,
  promptForMissingCoordinates = false
} = {}) {
  if (actor?.type !== "character") return { actor, points: [], skipped: 0 };

  const usedIds = new Set(existingPoints.map(point => point.id).filter(Boolean));
  const existingSourceItemUuids = new Set(existingPoints.map(point => point.sourceItemUuid).filter(Boolean));
  const points = [];
  let skipped = 0;

  for (const item of importableAttachmentItems(actor)) {
    if (item.uuid && existingSourceItemUuids.has(item.uuid)) {
      skipped += 1;
      continue;
    }

    const importPoint = await pointFromAttachment(actor, item, {
      fallbackCoordinate,
      promptForMissingCoordinate: promptForMissingCoordinates
    });
    if (!importPoint) {
      skipped += 1;
      continue;
    }

    const point = validateTerritoryPoint({
      ...importPoint,
      id: uniquePointId(slugify(`${actor.name}-${item.name}`), usedIds),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    if (!point) {
      skipped += 1;
      continue;
    }

    points.push(point);
    usedIds.add(point.id);
    if (item.uuid) existingSourceItemUuids.add(item.uuid);
  }

  return { actor, points, skipped };
}

function addCharacterActor(actors, actor) {
  if (actor?.type === "character") actors.set(actor.uuid, actor);
}

async function actorFromUuid(uuid) {
  if (!uuid) return null;
  try {
    const document = await fromUuid(uuid);
    if (document?.documentName === "Actor" || document?.constructor?.documentName === "Actor") return document;
    if (document?.actor?.documentName === "Actor" || document?.actor?.constructor?.documentName === "Actor") return document.actor;
  } catch (error) {
    console.warn("Part-Time Gods 2E | Unable to resolve Territory Grid actor.", uuid, error);
  }
  return null;
}

function characterActors() {
  return Array.from(game.actors ?? [])
    .filter(actor => actor.type === "character")
    .sort((a, b) => a.name.localeCompare(b.name));
}

function pantheonActors() {
  return Array.from(game.actors ?? [])
    .filter(actor => actor.type === "pantheon")
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function territoryActorFromDropData(data) {
  if (!data) return null;
  if (data.uuid) return actorFromUuid(data.uuid);
  if (data.type && data.type !== "Actor" && data.type !== "Token") return null;

  const id = data.id ?? data._id ?? data.data?._id;
  if (!id) return null;

  return game.actors?.get?.(id)
    ?? Array.from(game.actors ?? []).find(actor => actor.id === id || actor._id === id)
    ?? null;
}

function importableAttachmentItems(actor) {
  const items = actor.items?.contents ?? Array.from(actor.items ?? []);
  return items
    .filter(item => attachmentCategory(item))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function pointFromAttachment(actor, item, { fallbackCoordinate = null, promptForMissingCoordinate = true } = {}) {
  const category = attachmentCategory(item);
  if (!category) return null;

  const coordinate = attachmentCoordinate(item)
    ?? normalizeCoordinate(fallbackCoordinate ?? {})
    ?? (promptForMissingCoordinate ? await promptAttachmentCoordinate(actor, item) : null);
  if (!coordinate) return null;

  return {
    name: item.name,
    publicName: item.name,
    x: coordinate.x,
    y: coordinate.y,
    category,
    locationType: "mixed",
    controlType: "god",
    status: "friendly",
    discoveryState: "known",
    owner: actor.name,
    sourceActorUuid: actor.uuid,
    sourceItemUuid: item.uuid,
    linkedActorUuid: actor.uuid,
    linkedItemUuid: item.uuid,
    linkedBondUuid: item.type === "bond" ? item.uuid : "",
    level: finiteNumber(item.system?.level ?? item.system?.rank, 0, 0),
    publicNotes: attachmentNotes(item),
    notes: attachmentNotes(item)
  };
}

function coordinateFromElement(element) {
  const coordinate = element?.closest?.("[data-coordinate]")?.dataset?.coordinate;
  return parseCoordinate(coordinate);
}

function attachmentCategory(item) {
  if (!item) return "";
  if (item.type === "worshipper") return "worshipper";
  if (item.type === "bond") return normalizeCategory(item.system?.kind);
  if (item.type === "attachment") return normalizeCategory(item.system?.kind ?? item.system?.choiceKind);
  return "";
}

function attachmentCoordinate(item) {
  const system = item.system ?? {};
  const candidates = [
    system.territoryGrid,
    system.territoryCoordinate,
    system.location,
    system.summary,
    system.description,
    system.notes,
    item.getFlag?.(SYSTEM_ID, FLAG_KEY),
    item.getFlag?.(SYSTEM_ID, "territoryCoordinate")
  ];

  for (const candidate of candidates) {
    const coordinate = parseCoordinate(candidate);
    if (coordinate) return coordinate;
  }

  return null;
}

async function promptAttachmentCoordinate(actor, item) {
  const content = `
    <div class="ptg-dialog-body ptg-territory-coordinate-dialog">
      <p class="ptg-dialog-help">${escapeHTML(actor.name)}: ${escapeHTML(item.name)} has no valid 1-10 Territory Grid coordinate. Enter one to import it, or close this prompt to skip it.</p>
      <div class="ptg-dialog-row">
        <label>
          <span>X</span>
          <input type="number" name="x" value="1" min="1" max="10" required>
        </label>
        <label>
          <span>Y</span>
          <input type="number" name="y" value="1" min="1" max="10" required>
        </label>
      </div>
    </div>
  `;
  const result = await DialogV2.prompt({
    window: { title: "Attachment Territory Coordinate", resizable: true },
    classes: ["part-time-gods", "ptg-sheet-dialog", "ptg-territory-coordinate-window"],
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Import",
      callback: (event, button) => ({
        x: Number(button.form.elements.x?.value ?? 0),
        y: Number(button.form.elements.y?.value ?? 0)
      })
    }
  });

  return result && validCoordinateNumber(result.x) && validCoordinateNumber(result.y) ? result : null;
}

function attachmentNotes(item) {
  const system = item.system ?? {};
  return String(system.summary || system.description || system.benefit || system.notes || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function uniquePointId(seed, usedIds) {
  const base = String(seed || "territory-point").slice(0, 64);
  let id = base || randomId();
  let index = 2;
  while (usedIds.has(id)) {
    id = `${base}-${index}`;
    index += 1;
  }
  return id;
}

function randomId() {
  return foundry.utils.randomID?.(12) ?? globalThis.crypto?.randomUUID?.() ?? `ptg-${Date.now().toString(36)}`;
}

function finiteNumber(value, fallback = 0, min = Number.NEGATIVE_INFINITY) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.trunc(number)) : fallback;
}

function numericValue(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeColor(value, fallback = DEFAULT_TERRITORY_BACKGROUND_COLOR) {
  const color = String(value ?? "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}
