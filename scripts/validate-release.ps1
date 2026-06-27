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
import path from "node:path";
import { pathToFileURL } from "node:url";

const sys = "part-time-gods";
const root = process.cwd();
const items = await import(pathToFileURL(path.join(root, "module/data/premade-items.mjs")).href);
const choices = await import(pathToFileURL(path.join(root, "module/data/premade-choices.mjs")).href);

function missingStableKeys(documents) {
  return documents
    .filter((document) => !document.flags?.[sys]?.slug || !document.flags?.[sys]?.sourceId)
    .map((document) => `${document.type ?? "document"}:${document.name}`);
}

const result = {
  items: items.PTG_PREMADE_ITEMS.length,
  choices: choices.PTG_PREMADE_CHOICES.length,
  badItems: missingStableKeys(items.PTG_PREMADE_ITEMS),
  badChoices: missingStableKeys(choices.PTG_PREMADE_CHOICES)
};

if (result.badItems.length || result.badChoices.length) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  items: result.items,
  choices: result.choices,
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
