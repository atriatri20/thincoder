# ThinCoder

ThinCoder is a multi-package repository for the CLI, VS Code extension, desktop application, and team server. Shared runtime and rendering code live in first-party core packages.

## Layout

| Path | Purpose |
|---|---|
| `thincoder-core/` | Shared agent runtime, providers, tools, memory, document services, and traces |
| `thincoder-cli/` | Terminal application published as the npm package `thincoder` |
| `thincoder-vscode/` | VS Code extension and webview |
| `thincoder-desktop/` | Electron desktop application |
| `thincoder-render-core/` | Host-independent rendering core shared by the extension and desktop application |
| `thincoder-server/` | Team gateway, collaboration services, and web console |
| `bench/` | Model and tool-call benchmark suites |
| `docs/` | Project requirements, design documents, standards, release process, and batch records |
| `test/` | Repository-level integration tests and the requirements traceability matrix |
| `scripts/` | Repository-level maintenance and verification scripts |

Package-specific contributor instructions live in each package's `AGENTS.md` or `README.md`.

## Documentation

`docs/README.md` is the authoritative document map. Requirements and designs are organized by board under `docs/<board>/requirements/` and `docs/<board>/design/`.

`PROJECT-MANIFEST.json` declares the document roots used by search and validation tools. Shared standards live in `docs/core/standards/`; the release process lives in `docs/RELEASE.md`.

The project ledger is stored outside the work tree and is accessed through the `ledger` tool. Integration coverage is indexed by `test/RTM.md` and the volumes under `test/rtm/`.

## Development

Run each package's own checks from its package directory. For example:

```bash
cd thincoder-cli && npm install && npm run lint && npm test
cd thincoder-vscode && npm install && npm run lint && npm test
```

Before changing project documentation, locate the owning document through `docs/README.md`. Requirements describe what the product must do; designs describe how it works. Batch records carry execution history, while requirement and design documents describe the current state.
