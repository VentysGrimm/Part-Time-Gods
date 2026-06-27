# Installation

## Foundry Manifest

Use the manifest URL from `system.json`:

```text
https://raw.githubusercontent.com/VentysGrimm/Part-Time-Gods/main/system.json
```

This requires the repository and release assets to be reachable by the Foundry server. If the repository is private, install manually from a local checkout or a zip that the server can access.

## Manual Install

1. Copy or unzip this project into Foundry's data folder at `Data/systems/part-time-gods`.
2. Confirm `Data/systems/part-time-gods/system.json` exists.
3. Restart Foundry VTT.
4. Create a world using the `Part-Time Gods 2E` system.

## Developer Validation

From the system root, run:

```powershell
.\scripts\validate-release.ps1
```

Then open a Foundry VTT v14 world and smoke test the character sheet, item sheets, compendia, roll dialogs, chat card actions, Conditions, Manifestation Measures, and rules journals.
