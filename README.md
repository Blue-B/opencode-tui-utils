# opencode TUI Utils

English | [한국어](./README.ko.md) | [日本語](./README.ja.md) | [中文](./README.zh.md)

<p align="center">
  <img src="docs/banner.png" alt="opencode-tui-utils" width="860">
</p>

[![npm version](https://img.shields.io/npm/v/opencode-tui-utils?style=flat-square)](https://www.npmjs.com/package/opencode-tui-utils)
[![Build](https://img.shields.io/github/actions/workflow/status/Blue-B/opencode-tui-utils/test.yml?branch=main&style=flat-square)](https://github.com/Blue-B/opencode-tui-utils/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

Small native-feeling TUI utilities for [opencode](https://opencode.ai). The first command adds a safe provider disconnect flow, so you can remove one connected provider without editing `auth.json` by hand.

This project is built to grow command by command. Each utility should solve one focused opencode TUI problem and stay easy to review, test, and remove.

## Preview

```text
> /disconnect

Select provider to disconnect

  github       copilot-free
> anthropic   claude-pro
  openai      api-key

Enter disconnects the selected provider.
```

The command uses opencode's own TUI dialog components, so it appears inside the same command palette and dialog flow instead of launching a separate script.

## Why use opencode TUI Utils

| Need | What you get |
| --- | --- |
| Remove one provider safely | Select a provider in the TUI and remove only that auth entry |
| Avoid manual JSON edits | No need to open or hand-edit `~/.local/share/opencode/auth.json` |
| Keep tokens private | Provider names and auth types are shown, token values are never printed |
| Add more small commands | Shared plugin loader and API wrapper make new utilities straightforward |

## Quick Start

Install from npm with opencode's plugin installer:

```bash
opencode plugin opencode-tui-utils
```

That command installs the package and updates your opencode config. If you manage the config manually, make sure `~/.config/opencode/tui.json` includes:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": ["opencode-tui-utils"]
}
```

Restart opencode and run:

```text
/disconnect
```

## Commands

| Command | Alias | Description |
| --- | --- | --- |
| `/disconnect` | `/dc` | Pick one connected provider and remove it from opencode auth storage. |
| `/lsp-toggle` | — | Toggle `lsp: true/false` in `~/.config/opencode/opencode.json`. Requires opencode restart. |

## How `/disconnect` works

`/disconnect` reads your opencode auth file, lists the provider keys, and rewrites the same file after removing the one provider you selected.

Example auth shape:

```json
{
  "github": { "type": "copilot-free" },
  "anthropic": { "type": "api-key" },
  "openai": { "type": "api-key" }
}
```

If you select `github`, only the top-level `github` key is removed. Other provider entries stay untouched.

This started from the provider disconnect pain point discussed in [opencode issue #10494](https://github.com/anomalyco/opencode/issues/10494).

## Data Storage

| Data | Location | Notes |
| --- | --- | --- |
| Provider auth | `~/.local/share/opencode/auth.json` | The selected provider key is removed from this file |
| Custom auth path | `OPENCODE_AUTH_PATH=/path/to/auth.json` | Optional override for non-standard setups |
| Plugin source | npm package / opencode plugin cache | No external service is contacted by `/disconnect` |

`/disconnect` does not send network requests, copy token values, or print token values to the UI.

## Adding More Utilities

New commands are added as separate plugin modules under `src/plugins/` and registered from `src/index.tsx`.

```text
src/
  core/
    api-wrapper.ts      Shared wrapper around the opencode TUI API
  plugins/
    disconnect.tsx      Provider disconnect command
    lsp-toggle.tsx      LSP toggle command
    your-command.tsx    Add new utilities here
  index.tsx             Public plugin entry point
```

Minimal command shape:

```typescript
/** @jsxImportSource @opentui/solid */
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createWrappedAPI } from "../core/api-wrapper"

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.your-command",
  async tui(rawApi) {
    const api = createWrappedAPI(rawApi)

    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.your-command",
          title: "Your Command",
          category: "Utility",
          namespace: "palette",
          slashName: "your-command",
          async run() {
            api.ui.toast({ message: "Command ran successfully." })
          },
        },
      ],
    })
  },
}

export default plugin
```

Then register it in `src/index.tsx`:

```typescript
import yourCommand from "./plugins/your-command"

const plugins: TuiPluginModule[] = [disconnectPlugin, lspTogglePlugin, yourCommand]
```

Use `createWrappedAPI(rawApi)` for opencode TUI APIs. It keeps API-specific changes easier to isolate when opencode updates its plugin API.

## Development

```bash
git clone https://github.com/Blue-B/opencode-tui-utils.git
cd opencode-tui-utils
npm install
npm run build
```

Local source-file testing:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": ["/absolute/path/to/opencode-tui-utils/src/plugins/disconnect.tsx"]
}
```

Restart opencode after changing `tui.json`.

## Compatibility

Tested with:

| Tool | Version |
| --- | --- |
| opencode | 1.14.46 |

The package declares `@opencode-ai/plugin >=1.14.42` as a peer dependency because it uses opencode's TUI Plugin API.

## Contributing

Issues and PRs are welcome. Please keep changes small and focused. See [CONTRIBUTING.md](CONTRIBUTING.md) before adding a new command.

## License

MIT
