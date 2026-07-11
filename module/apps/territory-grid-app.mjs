import { importGodTerritoryScene } from "../data/premade-scenes.mjs";
import { SYSTEM_ID } from "../util/localization.mjs";

const { ApplicationV2, DialogV2, HandlebarsApplicationMixin } = foundry.applications.api;

const FLAG_KEY = "territoryGrid";
const LEGACY_FLAG_KEY = "territory";
const TERRITORY_SCENE_KIND = "god-territory-grid";
const TERRITORY_SCENE_NAME = "God Territory Grid";
const GRID_VERSION = 1;
const GRID_SIZE = 10;

const POINT_CATEGORIES = [
  { value: "individual", label: "Individual Bond", grantsBonus: true },
  { value: "landmark", label: "Landmark Bond", grantsBonus: true },
  { value: "worshipper", label: "Worshippers", grantsBonus: true },
  { value: "rival", label: "Rival", grantsBonus: false },
  { value: "threat", label: "Threat", grantsBonus: false },
  { value: "neutral", label: "Neutral", grantsBonus: false },
  { value: "custom", label: "Custom", grantsBonus: false }
];

const BONUS_CATEGORIES = new Set(POINT_CATEGORIES.filter(category => category.grantsBonus).map(category => category.value));
const CATEGORY_LABELS = Object.fromEntries(POINT_CATEGORIES.map(category => [category.value, category.label]));

let territoryGridApp = null;

export function registerTerritoryGridControls() {
  Hooks.on("getSceneControlButtons", controls => {
    const tool = {
      name: "ptg-territory-grid",
      title: "PTG Territory Interface",
      icon: "fas fa-map",
      button: true,
      visible: Boolean(game.user?.isGM),
      onClick: () => openTerritoryInterface()
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
  openTerritoryGridApp({ scene });
  return scene;
}

export async function openTerritoryInterface({ scene = getTerritoryScene(), ensureScene = false, activate = false, notify = true } = {}) {
  let targetScene = scene;

  if (ensureScene) {
    if (!game.user?.isGM) {
      ui.notifications.warn("Only a GM can create the God Territory Grid scene.");
      return openTerritoryGridApp({ scene: targetScene });
    }

    targetScene = await importGodTerritoryScene({ activate, notify });
    if (targetScene) await ensureStoredTerritoryGrid(targetScene);
  }

  return openTerritoryGridApp({ scene: targetScene });
}

export function openTerritoryGridApp({ scene = getTerritoryScene() } = {}) {
  if (!territoryGridApp) territoryGridApp = new TerritoryGridApp();
  if (scene) territoryGridApp.setScene(scene);
  territoryGridApp.render({ force: true });
  return territoryGridApp;
}

export function getTerritoryGrid(scene = getTerritoryScene()) {
  return normalizeTerritoryGrid(scene?.getFlag?.(SYSTEM_ID, FLAG_KEY), scene?.getFlag?.(SYSTEM_ID, LEGACY_FLAG_KEY));
}

export async function setTerritoryGrid(scene, grid) {
  if (!scene) return null;
  const cleanGrid = {
    ...normalizeTerritoryGrid(grid, scene.getFlag?.(SYSTEM_ID, LEGACY_FLAG_KEY)),
    updatedAt: new Date().toISOString()
  };
  await scene.setFlag(SYSTEM_ID, FLAG_KEY, cleanGrid);
  return cleanGrid;
}

export async function clearTerritoryGrid(scene = getTerritoryScene()) {
  if (!scene) return null;
  const grid = createEmptyTerritoryGrid();
  await scene.setFlag(SYSTEM_ID, FLAG_KEY, {
    ...grid,
    updatedAt: new Date().toISOString()
  });
  return grid;
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
  const level = finiteNumber(point.level, 0, 0);

  return {
    id: String(point.id || point.slug || slugify(`${category}-${name}-${coordinate.x}-${coordinate.y}`) || randomId()).slice(0, 80),
    name,
    x: coordinate.x,
    y: coordinate.y,
    category,
    owner: String(point.owner ?? point.actorName ?? "").trim(),
    sourceActorUuid: String(point.sourceActorUuid ?? point.actorUuid ?? "").trim(),
    sourceItemUuid: String(point.sourceItemUuid ?? point.itemUuid ?? "").trim(),
    level,
    notes: String(point.notes ?? point.description ?? "").trim(),
    createdAt: String(point.createdAt ?? "").trim(),
    updatedAt: String(point.updatedAt ?? "").trim()
  };
}

export function calculateTerritoryInfluence(points = []) {
  const influence = {};

  for (const point of points.map(validateTerritoryPoint).filter(Boolean)) {
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
        name: point.name,
        category: point.category,
        categoryLabel: CATEGORY_LABELS[point.category] ?? point.category,
        owner: point.owner
      });
    }
  }

  return influence;
}

export function buildTerritoryGridCells(grid) {
  const normalized = normalizeTerritoryGrid(grid);
  const influence = calculateTerritoryInfluence(normalized.points);
  const pointsByCoordinate = new Map();

  for (const point of normalized.points) {
    const key = coordinateKey(point.x, point.y);
    if (!pointsByCoordinate.has(key)) pointsByCoordinate.set(key, []);
    pointsByCoordinate.get(key).push(pointContext(point));
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
    const gridCells = buildTerritoryGridCells(grid);
    const influence = calculateTerritoryInfluence(grid.points);

    return {
      ...context,
      isGM: Boolean(game.user?.isGM),
      scene: scene ? { uuid: scene.uuid, id: scene.id, name: scene.name } : null,
      sceneOptions: territorySceneOptions(scene),
      grid,
      columns: gridCells.columns,
      rows: gridCells.rows,
      points: grid.points.map(pointContext).sort(sortPointContext),
      pointCount: grid.points.length,
      bonusCellCount: Object.values(influence).filter(entry => Number(entry.total ?? 0) > 0).length,
      categories: POINT_CATEGORIES,
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
  }

  async #onAction(button) {
    const action = button.dataset.action;
    if (!action) return null;

    if (action === "create-scene") {
      const scene = await createOrOpenTerritoryGridScene({ activate: false });
      if (scene) this.#sceneUuid = scene.uuid;
      return this.render({ force: true });
    }

    if (action === "refresh-grid") return this.render({ force: true });

    if (action === "import-attachments") return this.#importAttachments();
    if (action === "clear-grid") return this.#clearGrid();
    if (action === "create-point") return this.#editPoint(null, {
      x: Number(button.dataset.x ?? 1),
      y: Number(button.dataset.y ?? 1)
    });
    if (action === "edit-point") return this.#editPoint(button.dataset.pointId);
    if (action === "delete-point") return this.#deletePoint(button.dataset.pointId);

    return null;
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

    const scene = getTerritoryScene();
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
    const existingSourceItemUuids = new Set(grid.points.map(point => point.sourceItemUuid).filter(Boolean));
    const points = [...grid.points];
    let added = 0;
    let skipped = 0;

    for (const actor of actors) {
      for (const item of importableAttachmentItems(actor)) {
        if (existingSourceItemUuids.has(item.uuid)) {
          skipped += 1;
          continue;
        }

        const importPoint = await pointFromAttachment(actor, item);
        if (!importPoint) {
          skipped += 1;
          continue;
        }

        const point = validateTerritoryPoint({
          ...importPoint,
          id: uniquePointId(slugify(`${actor.name}-${item.name}`), new Set(points.map(existing => existing.id))),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        if (!point) {
          skipped += 1;
          continue;
        }

        points.push(point);
        existingSourceItemUuids.add(item.uuid);
        added += 1;
      }
    }

    await setTerritoryGrid(scene, { ...grid, points });
    ui.notifications.info(`Imported ${added} Territory Grid attachment${added === 1 ? "" : "s"}${skipped ? `; skipped ${skipped}` : ""}.`);
    this.render({ force: true });
    return { added, skipped };
  }
}

async function ensureStoredTerritoryGrid(scene) {
  if (!scene) return null;
  const grid = getTerritoryGrid(scene);
  if (!scene.getFlag(SYSTEM_ID, FLAG_KEY)) await setTerritoryGrid(scene, grid);
  return grid;
}

function getTerritoryScene() {
  const activeScene = globalThis.canvas?.scene ?? game.scenes?.active;
  if (isTerritoryScene(activeScene)) return activeScene;

  return game.scenes?.find(scene => isTerritoryScene(scene)) ?? activeScene ?? null;
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

function pointContext(point) {
  const categoryLabel = CATEGORY_LABELS[point.category] ?? point.category;
  return {
    ...point,
    categoryLabel,
    categoryClass: `ptg-territory-point-${point.category}`,
    levelLabel: point.level ? `Level ${point.level}` : "",
    ownerLabel: point.owner ? `${point.owner}` : "",
    sourceLabel: [point.owner, point.level ? `Level ${point.level}` : ""].filter(Boolean).join(" - ")
  };
}

function sortPointContext(a, b) {
  return (a.y - b.y) || (a.x - b.x) || a.name.localeCompare(b.name);
}

async function promptTerritoryPoint(point = null, defaults = {}) {
  const existing = point ?? {};
  const coordinate = normalizeCoordinate({ ...defaults, ...existing }) ?? { x: defaults.x ?? 1, y: defaults.y ?? 1 };
  const categoryOptions = POINT_CATEGORIES
    .map(category => `<option value="${category.value}" ${category.value === (existing.category ?? "custom") ? "selected" : ""}>${escapeHTML(category.label)}</option>`)
    .join("");
  const content = `
    <div class="ptg-dialog-body ptg-territory-point-dialog">
      <div class="ptg-dialog-row">
        <label>
          <span>Name</span>
          <input type="text" name="name" value="${escapeHTML(existing.name ?? "")}" placeholder="Bond, landmark, worshippers, or threat" required>
        </label>
        <label>
          <span>Category</span>
          <select name="category">${categoryOptions}</select>
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
      </div>
      <label class="ptg-dialog-label">
        <span>Owner</span>
        <input type="text" name="owner" value="${escapeHTML(existing.owner ?? "")}" placeholder="Character, pantheon, faction, or none">
      </label>
      <label class="ptg-dialog-label">
        <span>Notes</span>
        <textarea name="notes" rows="4">${escapeHTML(existing.notes ?? "")}</textarea>
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
        category: button.form.elements.category?.value ?? "custom",
        x: Number(button.form.elements.x?.value ?? 0),
        y: Number(button.form.elements.y?.value ?? 0),
        level: Number(button.form.elements.level?.value ?? 0),
        owner: button.form.elements.owner?.value?.trim() ?? "",
        notes: button.form.elements.notes?.value?.trim() ?? ""
      })
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

function addCharacterActor(actors, actor) {
  if (actor?.type === "character") actors.set(actor.uuid, actor);
}

async function actorFromUuid(uuid) {
  if (!uuid) return null;
  try {
    const document = await fromUuid(uuid);
    if (document?.documentName === "Actor" || document?.constructor?.documentName === "Actor") return document;
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

function importableAttachmentItems(actor) {
  const items = actor.items?.contents ?? Array.from(actor.items ?? []);
  return items
    .filter(item => attachmentCategory(item))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function pointFromAttachment(actor, item) {
  const category = attachmentCategory(item);
  if (!category) return null;

  const coordinate = attachmentCoordinate(item) ?? await promptAttachmentCoordinate(actor, item);
  if (!coordinate) return null;

  return {
    name: item.name,
    x: coordinate.x,
    y: coordinate.y,
    category,
    owner: actor.name,
    sourceActorUuid: actor.uuid,
    sourceItemUuid: item.uuid,
    level: finiteNumber(item.system?.level ?? item.system?.rank, 0, 0),
    notes: attachmentNotes(item)
  };
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
