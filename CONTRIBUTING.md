# Contributing to opencode-tui-utils

Thank you for taking the time to improve `opencode-tui-utils`.

This package is intentionally small. A good contribution should feel native to opencode's TUI, solve one clear problem, and avoid changing how opencode itself works.

## Before You Start

- Check whether the feature already exists in opencode.
- Check existing issues and pull requests for similar work.
- Keep the first version of a command small enough to review and test manually.
- Avoid new runtime dependencies unless they are clearly necessary.

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

## Command Scope

Good fits for this package:

| Idea | Why |
| --- | --- |
| Provider quick switch | Small TUI-native provider utility. |
| Session favorites | Helps navigate opencode sessions without changing core behavior. |
| Config sanity checks | Useful local diagnostics with clear output. |

Poor fits:

| Idea | Why |
| --- | --- |
| Agent orchestration | Better handled by dedicated workflow plugins. |
| Prompt packs | Better as opencode commands or separate repositories. |
| Provider backends | Should be maintained as provider-specific plugins. |

## License

By contributing, you agree that your contribution will be released under the MIT License.
