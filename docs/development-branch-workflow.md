# Development Branch Workflow

Use `develop` as the working branch for new changes. Keep `main` as the release branch that receives tested work only after validation and QA notes are current.

## Branch Roles

| Branch | Purpose |
| --- | --- |
| `develop` | Primary working branch for system fixes, QA follow-up, pack rebuilds, and release-prep commits. |
| `main` | Release-ready branch. Push or merge here only after validation passes and any active QA blockers are documented or resolved. |

## Current Setup

Local `develop` was created from `main` at `d370db8` and currently carries the `0.1.0` release metadata alignment commit.

Remote `origin/develop` cannot be created yet because GitHub repository rules reject new branch refs with:

```text
Cannot create ref due to creations being restricted.
```

To finish the remote setup, update the repository rules to allow creating `refs/heads/develop`, then push:

```powershell
git push -u origin develop
```

After `origin/develop` exists, keep new work on `develop`, open pull requests from `develop` or feature branches into `main`, and reserve direct `main` pushes for explicit release publication steps.

## Release Flow

1. Work and commit on `develop`.
2. Run syntax, validation, tests, and any Foundry QA required by the active issue.
3. Rebuild generated packs and release ZIPs only after Foundry releases live LevelDB pack locks.
4. Update QA and release audit docs with the current evidence.
5. Merge or push the verified state to `main`.
6. Publish the matching GitHub release assets for the manifest version.
