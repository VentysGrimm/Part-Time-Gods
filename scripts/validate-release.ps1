$ErrorActionPreference = "Stop"

function Assert-Command($Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command not found on PATH: $Name"
  }
}

function Assert-PathExists($Path, $Label) {
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "$Label does not exist: $Path"
  }
}

Assert-Command "node"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $Root

try {
  $system = Get-Content "system.json" -Raw | ConvertFrom-Json

  Assert-PathExists "part-time-gods.js" "Main system entry point"
  foreach ($path in @($system.esmodules + $system.styles)) {
    Assert-PathExists $path "Manifest asset"
  }

  foreach ($language in @($system.languages)) {
    Assert-PathExists $language.path "Language file"
  }

  foreach ($pack in @($system.packs)) {
    Assert-PathExists $pack.path "Compendium pack"
  }

  if (Get-Command "rg" -ErrorAction SilentlyContinue) {
    $files = rg --files -g "*.js" -g "*.mjs" | Sort-Object
  } else {
    $files = Get-ChildItem -Recurse -Include "*.js", "*.mjs" -File |
      Where-Object { $_.FullName -notmatch "\\node_modules\\" } |
      ForEach-Object { Resolve-Path -Relative $_.FullName } |
      Sort-Object
  }

  foreach ($file in $files) {
    node --check $file *> $null
    if ($LASTEXITCODE -ne 0) {
      throw "JavaScript syntax check failed: $file"
    }
  }

  $sourceCheck = @'
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const sys = "part-time-gods";
const root = process.cwd();
const routePrefix = "systems/part-time-gods/";

globalThis.CONST = {
  JOURNAL_ENTRY_PAGE_FORMATS: { HTML: 1 },
  GRID_TYPES: { SQUARE: 1 }
};
globalThis.foundry = {
  applications: {
    api: { DialogV2: class {} }
  },
  utils: {
    getRoute(route) {
      const relative = String(route).startsWith(routePrefix)
        ? String(route).slice(routePrefix.length)
        : String(route);
      return pathToFileURL(path.join(root, relative)).href;
    }
  }
};
globalThis.fetch = async function fetchLocalJson(route) {
  const filePath = String(route).startsWith("file:")
    ? fileURLToPath(route)
    : path.join(root, String(route));
  const content = (await fs.readFile(filePath, "utf8")).replace(/^\uFEFF/, "");
  return {
    ok: true,
    json: async () => JSON.parse(content)
  };
};

const actors = await import(pathToFileURL(path.join(root, "module/data/premade-actors.mjs")).href);
const items = await import(pathToFileURL(path.join(root, "module/data/premade-items.mjs")).href);
const choices = await import(pathToFileURL(path.join(root, "module/data/premade-choices.mjs")).href);
const journals = await import(pathToFileURL(path.join(root, "module/data/premade-journals.mjs")).href);
const rollTables = await import(pathToFileURL(path.join(root, "module/data/premade-roll-tables.mjs")).href);
const scenes = await import(pathToFileURL(path.join(root, "module/data/premade-scenes.mjs")).href);

function missingStableKeys(documents) {
  return documents
    .filter((document) => !document.flags?.[sys]?.slug || !document.flags?.[sys]?.sourceId)
    .map((document) => `${document.type ?? "document"}:${document.name}`);
}

const journalDocuments = await journals.getPremadeJournals();
const sceneDocuments = scenes.getPremadeScenes();
const result = {
  actors: actors.PTG_PREMADE_ACTORS.length,
  items: items.PTG_PREMADE_ITEMS.length,
  choices: choices.PTG_PREMADE_CHOICES.length,
  journals: journalDocuments.length,
  rollTables: rollTables.PTG_PREMADE_ROLL_TABLES.length,
  scenes: sceneDocuments.length,
  badActors: missingStableKeys(actors.PTG_PREMADE_ACTORS),
  badItems: missingStableKeys(items.PTG_PREMADE_ITEMS),
  badChoices: missingStableKeys(choices.PTG_PREMADE_CHOICES),
  badJournals: missingStableKeys(journalDocuments),
  badRollTables: missingStableKeys(rollTables.PTG_PREMADE_ROLL_TABLES),
  badScenes: missingStableKeys(sceneDocuments)
};
const emptyFamilies = Object.entries({
  actors: result.actors,
  items: result.items,
  choices: result.choices,
  journals: result.journals,
  rollTables: result.rollTables,
  scenes: result.scenes
})
  .filter(([, count]) => count <= 0)
  .map(([family]) => family);

if (
  emptyFamilies.length ||
  result.badActors.length ||
  result.badItems.length ||
  result.badChoices.length ||
  result.badJournals.length ||
  result.badRollTables.length ||
  result.badScenes.length
) {
  console.error(JSON.stringify({ ...result, emptyFamilies }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  actors: result.actors,
  items: result.items,
  choices: result.choices,
  journals: result.journals,
  rollTables: result.rollTables,
  scenes: result.scenes,
  stableSourceKeys: true
}, null, 2));
'@

  $sourceCheckPath = Join-Path ([System.IO.Path]::GetTempPath()) "ptg-source-check-$PID.mjs"
  Set-Content -LiteralPath $sourceCheckPath -Value $sourceCheck -Encoding UTF8
  try {
    node $sourceCheckPath
    if ($LASTEXITCODE -ne 0) {
      throw "Premade compendium source-key validation failed."
    }
  } finally {
    if (Test-Path -LiteralPath $sourceCheckPath) {
      Remove-Item -LiteralPath $sourceCheckPath -Force
    }
  }

  Write-Host "Release validation passed for $($files.Count) JavaScript files."
} finally {
  Pop-Location
}
