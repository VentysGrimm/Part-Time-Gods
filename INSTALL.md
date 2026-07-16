# Installation

## Foundry Manifest

Use the latest GitHub Release manifest URL:

```text
https://github.com/VentysGrimm/Part-Time-Gods/releases/latest/download/system.json
```

This manifest points Foundry to the versioned release ZIP declared in `system.json`.

## Manual Install

1. Download the main-branch ZIP from GitHub, or a versioned release ZIP if one has been published for the version you want.
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

This creates `dist/part-time-gods-0.1.0.zip` and `dist/system.json` for release packaging. The ZIP builder uses `system.json` as the version source and removes older versioned `part-time-gods-*.zip` files from `dist/` during the build.

The live install manifest follows the latest GitHub Release `system.json` asset. Publish the matching release assets by pushing a `v<system.json version>` tag or manually running the `Publish Release Assets` GitHub Actions workflow from `main`; the workflow builds the ZIP, uploads `dist/system.json` plus the versioned ZIP, and reruns `npm run check:release-assets`. After publishing, open a Foundry VTT v14 world and smoke test the character sheet, item sheets, compendia, roll dialogs, chat card actions, Conditions, Manifestation Measures, and rules journals.
