# Installation

## Foundry Manifest

Use the live main-branch manifest URL:

```text
https://raw.githubusercontent.com/VentysGrimm/Part-Time-Gods/main/system.json
```

This manifest points Foundry to the versioned GitHub Release ZIP declared in `system.json`.

## Manual Install

1. Download the versioned release ZIP, for example `part-time-gods-0.0.2.zip`, from GitHub Releases.
2. Unzip it into Foundry's data folder at `Data/systems/part-time-gods`.
3. Confirm `Data/systems/part-time-gods/system.json` exists.
4. Restart Foundry VTT.
5. Create a world using the `Part-Time Gods 2E` system.

## Local Checkout Install

1. Copy this project into Foundry's data folder at `Data/systems/part-time-gods`.
2. Confirm `Data/systems/part-time-gods/system.json` exists.
3. Restart Foundry VTT.
4. Create a world using the `Part-Time Gods 2E` system.

## Developer Validation

From the system root, run:

```powershell
npm.cmd run release
```

This creates `dist/part-time-gods-0.0.2.zip` and `dist/system.json`. Upload the ZIP to the matching GitHub Release tag when publishing a new version, then open a Foundry VTT v14 world and smoke test the character sheet, item sheets, compendia, roll dialogs, chat card actions, Conditions, Manifestation Measures, and rules journals.
