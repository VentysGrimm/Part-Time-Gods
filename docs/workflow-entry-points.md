# Workflow Entry Points

Part-Time Gods workflows should be discoverable from native Foundry or system surfaces. The premade workflow macros remain as compatibility launchers, but they are not the primary UX for normal play.

| Workflow macro | Native home | Compatibility role |
| --- | --- | --- |
| `PTG: Table Tools` | Pantheon actor sheet `Table Tools` section. | Opens a visible Pantheon sheet so the table tools hub is available. |
| `PTG: Create Territory Scene` | Unified Territory interface `Create/Open Territory Scene`; GM Setup panel. | Opens the same unified Territory interface with scene setup enabled. |
| `PTG: Territory Controls` | Integrated Territory interface; world-ready auto-open setting; God Territory Grid scene controls; Pantheon actor sheet `Table Tools -> Territory Controls`; GM Setup panel. | Opens the same unified Territory interface as the native buttons. |
| `PTG: Combat Controls` | GM Setup panel; Pantheon actor sheet `Table Tools -> Combat Controls`. | Opens the PTG Combat Controls dialog through the native API. |
| `PTG: Mortal-Divine Tracker` | GM Setup panel; Pantheon actor sheet member `Balance` buttons; Pantheon actor sheet `Table Tools -> Mortal-Divine Balance`. | Opens the party-style Mortal-Divine Balance sheet. |
| `PTG: Pantheon Pool` | Pantheon actor sheet `Pool Workflow`; Pantheon actor sheet `Table Tools -> Pantheon Pool`; GM Setup panel. | Opens the shared Pantheon Pool workflow with selected token/user context when available. |
| `PTG: Story Workflow` | Pantheon actor sheet `Table Tools -> Story Workflow`. | Opens the source-backed story workflow with selected token/user context when available. |
| `PTG: Opposition Builder` | Antagonist actor sheet `Opposition Builder`; GM Setup panel. | Opens the source-backed opposition builder through the native API. |

## Current Direction

- Use sheet buttons, scene controls, and GM setup actions as the canonical workflow paths.
- Treat Territory as an integrated table module: it registers controls and settings during system init, can auto-open on world ready, gives GMs edit controls, and gives players a read-only overlay when a Territory scene exists.
- Keep macros available for migration, older hotbars, and users who already imported them.
- Do not document workflow macros as required setup for normal play.
- Keep mutation workflows GM-only regardless of whether they are launched from a sheet, scene control, setup panel, startup setting, or compatibility macro.
