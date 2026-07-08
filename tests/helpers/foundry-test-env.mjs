import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const SYSTEM_ID = "part-time-gods";
export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

let queuedRolls = [];

export function installFoundryTestEnvironment() {
  globalThis.CONFIG = {
    PTG: {
      skills: {
        athletics: "Athletics",
        discipline: "Discipline",
        fortitude: "Fortitude",
        perception: "Perception",
        speed: "Speed",
        might: "Might",
        stealth: "Stealth"
      },
      manifestations: {
        aegis: "Aegis",
        beckon: "Beckon",
        ruin: "Ruin",
        shaping: "Shaping"
      }
    }
  };

  globalThis.CONST = {
    DRAWING_FILL_TYPES: { SOLID: 1 },
    GRID_TYPES: { SQUARE: 1 },
    JOURNAL_ENTRY_PAGE_FORMATS: { HTML: 1 }
  };

  globalThis.foundry = {
    applications: {
      api: {
        ApplicationV2: class {},
        DialogV2: class {},
        HandlebarsApplicationMixin: Base => Base
      },
      ux: {
        TextEditor: {
          getDragEventData(event) {
            const raw = event?.dataTransfer?.getData?.("text/plain");
            return raw ? JSON.parse(raw) : {};
          }
        }
      }
    },
    data: {
      ShapeData: {
        TYPES: { RECTANGLE: "rectangle" }
      }
    },
    utils: {
      getProperty(source, key) {
        return String(key ?? "").split(".").reduce((value, part) => value?.[part], source);
      },
      deepClone(source) {
        return source == null ? source : JSON.parse(JSON.stringify(source));
      },
      mergeObject(original = {}, other = {}, { inplace = true } = {}) {
        const target = inplace ? original : foundry.utils.deepClone(original);
        for (const [key, value] of Object.entries(other ?? {})) {
          if (
            value
            && typeof value === "object"
            && !Array.isArray(value)
            && target[key]
            && typeof target[key] === "object"
            && !Array.isArray(target[key])
          ) {
            target[key] = foundry.utils.mergeObject(target[key], value, { inplace: true });
          } else {
            target[key] = value;
          }
        }
        return target;
      },
      getRoute(route) {
        const routePrefix = "systems/part-time-gods/";
        const relative = String(route).startsWith(routePrefix)
          ? String(route).slice(routePrefix.length)
          : String(route);
        return pathToFileURL(path.join(repoRoot, relative)).href;
      },
      randomID(length = 16) {
        return "x".repeat(length);
      }
    }
  };

  globalThis.Actor = class {
    prepareDerivedData() {}
  };
  globalThis.ChatMessage = {
    create: async data => data,
    getSpeaker: () => ({})
  };
  globalThis.Roll = TestRoll;
  globalThis.game = {
    i18n: {
      localize: key => key,
      format: key => key,
      has: () => false
    },
    packs: new Map(),
    items: []
  };
  globalThis.ui = {
    notifications: {
      info: () => {},
      warn: () => {},
      error: () => {}
    }
  };
  globalThis.fetch = async route => {
    const filePath = String(route).startsWith("file:")
      ? fileURLToPath(route)
      : path.join(repoRoot, String(route));
    const content = (await fs.readFile(filePath, "utf8")).replace(/^\uFEFF/, "");
    return {
      ok: true,
      json: async () => JSON.parse(content)
    };
  };
}

export function queueRolls(...rolls) {
  queuedRolls = rolls.map(roll => Array.from(roll));
}

class TestRoll {
  constructor(formula) {
    this.formula = formula;
    this.dice = [];
  }

  async evaluate() {
    const results = queuedRolls.shift() ?? [];
    this.dice = [{ results: results.map(result => ({ result })) }];
    return this;
  }
}
