# Contributing to opencode-tui-utils

Thank you for taking the time to improve `opencode-tui-utils`.

**Goal:** Provide essential TUI commands missing from opencode. Install once, stop editing JSON by hand.

A good contribution feels native to opencode's TUI, solves one clear problem, and never changes how opencode itself works.

## Before You Start

1. **Check opencode built-ins first.** Native slash commands include `/connect`, `/init`, `/undo`, `/redo`, `/share`, `/models`. Native shortcuts include `Ctrl+T` (variant cycle) and `Ctrl+X` then `M` (model switch). We only add what is missing.
2. **Check existing issues and pull requests** for similar work.
3. **Keep the first version small.** One focused command is easier to review and test than a bundle.
4. **Avoid new runtime dependencies.** The project ships zero deps for a reason.

## Project Layout

```text
src/
  core/
    api-wrapper.ts      Shared wrapper around the opencode TUI API
  plugins/
    disconnect.tsx      Current provider disconnect command
    your-feature.tsx    New commands belong here
  index.tsx             Public plugin entry point
```

## Adding A Command

Create a file in `src/plugins/`:

```typescript
/** @jsxImportSource @opentui/solid */
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createWrappedAPI } from "../core/api-wrapper"

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.your-feature",
  async tui(rawApi) {
    const api = createWrappedAPI(rawApi)

    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.your-feature",
          title: "Your Feature",
          category: "Utility",
          namespace: "palette",
          slashName: "your-command",
          async run() {
            api.ui.toast({
              title: "Ready",
              message: "Your command ran successfully.",
            })
          },
        },
      ],
    })
  },
}

export default plugin
```

Register it in `src/index.tsx`:

```typescript
import yourPlugin from "./plugins/your-feature"

const plugins: TuiPluginModule[] = [disconnectPlugin, yourPlugin]
```

## API Wrapper

Use `createWrappedAPI(rawApi)` in plugin files instead of calling the raw opencode API directly. This keeps API-specific changes isolated to `src/core/api-wrapper.ts` when possible.

Example:

```typescript
const api = createWrappedAPI(rawApi)

api.ui.toast({
  variant: "success",
  message: "Done",
})
```

## KV Storage

The wrapper currently supports `get`, `set`, `getJSON`, and `setJSON`.

```typescript
await api.kv.setJSON("my-feature.settings", { enabled: true })

const settings = await api.kv.getJSON<{ enabled: boolean }>(
  "my-feature.settings",
)
```

The current opencode TUI KV API does not expose delete. If you need deletion semantics, store an updated object without the removed field.

## Local Testing

Type-check the package:

```bash
npm install
npm run build
```

To test a command in opencode before publishing, reference the source file from `~/.config/opencode/tui.json`:

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "plugin": ["/absolute/path/to/opencode-tui-utils/src/plugins/your-feature.tsx"]
}
```

Then restart opencode and run the slash command.

## Pull Requests

- Describe the user-facing problem the change solves.
- Include manual testing steps.
- Update `README.md` if the command is user-facing.
- Update localized README files when changing install, compatibility, or command behavior.
- Keep unrelated formatting and refactors out of feature PRs.

Suggested PR title format:

```text
feat: add /your-command
fix: handle missing auth file in /disconnect
docs: clarify plugin installation
```

## What Makes a Good Command

The best commands expose data the TUI already has but offers no quick slash-command shortcut for. Think of the pain point behind [opencode issue #10494](https://github.com/anomalyco/opencode/issues/10494): the UI showed a connected provider, but there was no way to disconnect it without hand-editing JSON.

**Great fit checklist:**
- **TUI-native end-to-end.** No external terminal windows. Use palettes, dialogs, toasts, and selects.
- **One clear frustration.** "I have to open a config file to toggle this," or "I can't see X without clicking three menus."
- **Read-only or local-only.** Prefer commands that read from `api.state.*`, `api.plugins.list()`, or local config files. Avoid network calls when possible.
- **Doesn't touch opencode core.** We only change user configs or session state that opencode already exposes to plugins.

**Not a great fit:**
- Agent orchestration, prompt packs, or provider backends — these belong in dedicated plugins or opencode core.
- Heavy external services or large new dependencies.

## Command Ideas (Up for Grabs)

These are verified gaps based on the plugin API. Feel free to pick one and open an issue before starting.

| Command | Problem it Solves | API Source |
| --- | --- | --- |
| `/provider-list` | "What's connected right now?" before or after `/disconnect` | `api.state.provider` |
| `/session-info` | "How many messages in this session? What's the status?" | `api.state.session.*` |

**Already covered by opencode built-ins — do not propose:** theme switch, MCP/LSP status viewers, clipboard copy. The TUI already provides these.

If you have a new idea, open an issue with the problem statement first. We'll confirm it doesn't duplicate a built-in before you start coding.

## License

By contributing, you agree that your contribution will be released under the MIT License.
