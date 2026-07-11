# Workflow Entry Points

Part-Time Gods workflows should be discoverable from native Foundry or system surfaces. The premade workflow macros remain as compatibility launchers, but they are not the primary UX for normal play.

| Workflow macro | Native home | Compatibility role |
| --- | --- | --- |
| `PTG: Table Tools` | Pantheon actor sheet `Table Tools` section. | Opens a visible Pantheon sheet so the table tools hub is available. |
| `PTG: Create Territory Scene` | GM Setup panel `Create/Open Territory Scene`. | Calls the territory scene import helper for older hotbars. |
| `PTG: Territory Controls` | God Territory Grid scene controls; Pantheon actor sheet `Table Tools -> Territory Controls`; GM Setup panel. | Opens the Territory Grid app through the same API as the native buttons. |
| `PTG: Combat Controls` | GM Setup panel; Pantheon actor sheet `Table Tools -> Combat Controls`. | Opens the PTG Combat Controls dialog through the native API. |
| `PTG: Mortal-Divine Tracker` | GM Setup panel; Pantheon actor sheet member `Balance` buttons; Pantheon actor sheet `Table Tools -> Mortal-Divine Balance`. | Opens the party-style Mortal-Divine Balance sheet. |
| `PTG: Pantheon Pool` | Pantheon actor sheet `Pool Workflow`; Pantheon actor sheet `Table Tools -> Pantheon Pool`; GM Setup panel. | Opens the shared Pantheon Pool workflow with selected token/user context when available. |
| `PTG: Story Workflow` | Pantheon actor sheet `Table Tools -> Story Workflow`. | Opens the source-backed story workflow with selected token/user context when available. |
| `PTG: Opposition Builder` | Antagonist actor sheet `Opposition Builder`; GM Setup panel. | Opens the source-backed opposition builder through the native API. |

## Current Direction

- Use sheet buttons, scene controls, and GM setup actions as the canonical workflow paths.
- Keep macros available for migration, older hotbars, and users who already imported them.
- Do not document workflow macros as required setup for normal play.
- Keep GM-only workflows GM-only regardless of whether they are launched from a sheet, scene control, setup panel, or compatibility macro.
