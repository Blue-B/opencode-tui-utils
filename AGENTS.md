# opencode-tui-utils — Agent Notes

## Build & Verification

- **`npm test` = `npm run build` = `tsc --noEmit`**. There is no test runner; type-checking is the entire test suite.
- `npm run dev` runs `tsc --watch`.
- `tsconfig.json` sets `noEmit: true`, `jsx: "preserve"`, `moduleResolution: "bundler"`, `allowImportingTsExtensions: true`. The package is consumed as **TypeScript source**, not a compiled bundle.

## Plugin Architecture

- Entrypoint: `src/index.tsx` loads every plugin in `src/plugins/`.
- **Adding a command requires two steps:**
  1. Create `src/plugins/<command>.tsx`.
  2. Import and append it to the `plugins` array in `src/index.tsx`.
- Every plugin file must start with `/** @jsxImportSource @opentui/solid */` and import `type { TuiPluginModule } from "@opencode-ai/plugin/tui"`.
- **Always call `createWrappedAPI(rawApi)`** (from `../core/api-wrapper`) instead of using the raw API directly. CI greps for `createWrappedAPI` usage.

## Local Testing

- Reference a **source `.tsx` file by absolute path** in `~/.config/opencode/tui.json`:
  ```json
  { "plugin": ["/absolute/path/to/opencode-tui-utils/src/plugins/disconnect.tsx"] }
  ```
- Restart opencode after changing `tui.json`.

## CI & Quality Checks

- `.github/workflows/test.yml` runs three jobs on Node 18.x and 20.x:
  1. `build` — `npm ci` + `tsc --noEmit` + verify `src/plugins/disconnect.tsx` exists.
  2. `lint` — type-check + verify `createWrappedAPI` usage + warn if core modules lack JSDoc.
  3. `compatibility` — validate `peerDependencies['@opencode-ai/plugin']` includes `>=1.14.42`.

## Peer Dependencies

- `@opencode-ai/plugin >=1.14.42`
- `@opentui/solid >=0.2.6`
- Do not add runtime dependencies lightly. The project ships zero deps.

## Repo Positioning

- Tagline: **"Essential TUI commands missing from opencode. Install once, stop editing JSON by hand."**
- Every command should solve a gap where the TUI already holds the data but lacks a quick slash-command shortcut (pattern established by issue #10494).

## Command Ideation (Agent Checklist)

Before proposing a new command, verify it does **not** duplicate opencode built-ins:
- Known native slash commands: `/connect`, `/init`, `/undo`, `/redo`, `/share`, `/models`
- Known native shortcuts: `Ctrl+T` (variant cycle), `Ctrl+X` then `M` (model switch)

**Verified gaps suitable for this repo:**
- **Provider**: `/provider-list` (read-only counterpart to `/disconnect`)
- **Session**: `/session-info` (message count, status summary)

These expose data already available via `api.state.*` but have no native slash command.

**Already covered by opencode built-ins — do not add:** theme switch, MCP/LSP status viewers, clipboard copy. The TUI already provides these through menus or terminal interactions.

## Repo-Specific Conventions

- Plugin IDs use the prefix `opencode-tui-utils.<command>` (e.g., `opencode-tui-utils.disconnect`).
- Slash commands live in the `palette` namespace.
- `api.ui.DialogSelect`, `api.ui.DialogConfirm`, and `api.ui.DialogAlert` are re-exported from the wrapper.
- The KV wrapper supports `get`, `set`, `getJSON`, `setJSON`. It does **not** expose delete; overwrite with an object that omits the field.

## PR Requirements

- Update `README.md` and **all localized READMEs** (`README.ko.md`, `README.ja.md`, `README.zh.md`) for user-facing changes.
- Keep PRs small and focused; avoid unrelated formatting changes.
- PR template checklist requires manual testing in opencode.

## Environment Variables Honored by Plugins

- `OPENCODE_AUTH_PATH` — override path for `auth.json` (used by `/disconnect`).
- `OPENCODE_CONFIG_DIR` — override path for `opencode.json` (used by `/lsp-toggle`).
- `XDG_DATA_HOME` — respected for default auth file location.

## Sensitive Files

- `.npmrc` contains an npm auth token. Avoid modifying or exposing it in PRs.
