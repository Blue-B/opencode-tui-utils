# Contributing to opencode-tui-utils

Thank you for your interest in contributing! This guide explains how to add new TUI utilities to the package.

## The Vision

opencode-tui-utils is a **community-driven plugin ecosystem**. We want to be the go-to place for:
- ✨ Missing opencode features
- 🛠️ Workflow acceleration utilities
- 🔌 Reusable TUI components

## Before You Start

- ✅ Ensure the feature **doesn't exist** in native opencode
- ✅ Check [GitHub Issues](https://github.com/YOUR_USERNAME/opencode-tui-utils/issues) for similar work
- ✅ Read the [Architecture](#architecture) section below
- ✅ Understand the [API Wrapper](#api-wrapper) pattern

## Quick Start: Adding a New Plugin

### Step 1: Plan Your Plugin

Ask yourself:
- **What problem does it solve?** (Be specific)
- **Is it opencode-specific?** (If generic, maybe submit to npm separately)
- **Does it need persistent storage?** (Use `api.kv`)
- **Does it need file I/O?** (Use Node.js `fs/promises`)

### Step 2: Create the Plugin File

Create `src/plugins/[your-feature].tsx`:

```typescript
/** @jsxImportSource @opentui/solid */
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createWrappedAPI } from "../core/api-wrapper"

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.[your-feature]",
  async tui(rawApi) {
    // Always use the API wrapper for future compatibility!
    const api = createWrappedAPI(rawApi)
    
    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.[your-feature]",
          title: "Your Feature Title",
          category: "YourCategory",
          namespace: "palette",
          slashName: "your-command",
          async run() {
            // Your implementation here
            api.ui.toast({
              title: "Hello",
              message: "Your plugin works!",
            })
          },
        },
      ],
    })
  },
}

export default plugin
```

### Step 3: Register in Plugin Loader

Edit `src/index.tsx`:

```typescript
import yourPlugin from "./plugins/[your-feature]"

const plugins: TuiPluginModule[] = [
  disconnectPlugin,
  bookmarksPlugin,
  yourPlugin,  // ← Add here
]
```

### Step 4: Test Locally

1. **Copy built file** to your plugins folder:
   ```bash
   cp dist/plugins/[your-feature].js ~/.config/opencode/plugins/
   ```

2. **Verify in `tui.json`**:
   ```json
   {
     "plugins": [
       "./plugins/[your-feature].tsx"
     ]
   }
   ```

3. **Test in opencode**:
   ```bash
   opencode
   /your-command
   ```

### Step 5: Submit a PR

See [Pull Request Guidelines](#pull-request-guidelines) below.

## Architecture

### API Wrapper Pattern

**Why it matters:** opencode updates frequently. The API wrapper abstracts opencode API calls so breaking changes only affect one file.

```
Your Plugin
    ↓
API Wrapper (src/core/api-wrapper.ts)
    ↓
opencode TUI API
    ↓
opencode Core
```

**Always import from the wrapper:**

```typescript
// ❌ Don't do this
const providers = await rawApi.kv.get("key")

// ✅ Do this
const api = createWrappedAPI(rawApi)
const data = await api.kv.getJSON("key")
```

### File Structure

```
src/
├── core/
│   └── api-wrapper.ts          ← Don't touch this (maintainers only)
├── plugins/
│   ├── disconnect.tsx          ← Example plugin
│   ├── bookmarks.tsx           ← Example plugin  
│   └── [your-feature].tsx      ← Your new plugin here
├── utils/
│   └── [shared-helpers].ts     ← Optional shared utilities
└── index.tsx                   ← Register your plugin here
```

### Styling & Components

Use **SolidJS components** from opencode's TUI API:

```typescript
// Available components
const { DialogSelect, DialogAlert } = api.ui

// Example: Show a dialog
api.ui.dialog.replace(() => (
  <DialogSelect
    title="Choose something"
    options={[
      { title: "Option 1", value: "opt1" },
      { title: "Option 2", value: "opt2" },
    ]}
    onSelect={(option) => {
      // Handle selection
    }}
  />
))

// Example: Show a toast notification
api.ui.toast({
  variant: "success",    // "success", "error", "warning", "info"
  title: "Done!",
  message: "Operation completed successfully",
})
```

## Common Patterns

### Pattern 1: Using KV Storage

```typescript
// Store data
await api.kv.setJSON("my-key", { name: "value" })

// Retrieve data
const data = await api.kv.getJSON("my-key")
if (!data) {
  console.log("No data found")
}

// Delete data
await api.kv.delete("my-key")
```

### Pattern 2: File I/O

```typescript
import { readFile, writeFile } from "node:fs/promises"

// Read
const content = await readFile("/path/to/file", "utf-8")

// Write
await writeFile("/path/to/file", "new content")
```

### Pattern 3: Multiple Commands

```typescript
api.keymap.registerLayer({
  commands: [
    {
      name: "feature.cmd1",
      slashName: "cmd1",
      async run() { /* ... */ }
    },
    {
      name: "feature.cmd2",
      slashName: "cmd2",
      async run() { /* ... */ }
    },
  ],
})
```

### Pattern 4: Error Handling

```typescript
async run() {
  try {
    const data = await someAsyncOperation()
    api.ui.toast({
      variant: "success",
      title: "Success!",
      message: data
    })
  } catch (error) {
    api.ui.dialog.replace(() => (
      <DialogAlert
        title="Error"
        message={error instanceof Error ? error.message : "Unknown error"}
      />
    ))
  }
}
```

## Pull Request Guidelines

### Before You PR

- [ ] Plugin works in opencode (tested locally)
- [ ] No breaking changes to existing commands
- [ ] Follows the API Wrapper pattern
- [ ] Has JSDoc comments for public functions
- [ ] Handles errors gracefully
- [ ] Uses `opencode-tui-utils` namespace

### PR Title Format

```
feat: Add /your-command for feature description
fix: Fix /existing-command bug
docs: Update installation guide
refactor: Improve API wrapper
test: Add tests for feature
```

### PR Description

```markdown
## What does this PR do?
Clear explanation of the feature or fix.

## How to test
1. Copy the file to plugins folder
2. Run `/your-command`
3. Verify X, Y, Z happen

## Breaking changes?
None / Describe if any

## Closes
#issue-number (if applicable)
```

### Code Review

- We'll review within 48 hours
- Feedback will be constructive and actionable
- Minor style issues might be auto-fixed by maintainers
- Large changes might need architectural discussion

### Merge & Release

Once approved:
1. We'll merge your PR
2. Add you to CONTRIBUTORS.md
3. Bump version (semantic versioning)
4. Release new npm package

## Plugin Ideas

These are good candidates for PRs:

### Category: Provider Management
- [ ] `api-quick-switch` - Quickly switch between configured providers
- [ ] `token-expiry-checker` - Show token expiry times
- [ ] `provider-status` - Health check for connected providers

### Category: Session Management
- [ ] `session-export` - Export session to different formats (JSON, markdown)
- [ ] `session-search` - Full-text search across sessions
- [ ] `session-stats` - Show session statistics and usage patterns

### Category: Debugging
- [ ] `debug-logs` - Pretty-print opencode logs
- [ ] `performance-monitor` - Show resource usage
- [ ] `error-history` - Recent errors and solutions

### Category: Workflow
- [ ] `quick-project` - Jump to project folder quickly
- [ ] `model-finder` - Search available models by capabilities
- [ ] `config-validator` - Validate opencode configuration

## Testing

For now, manual testing is required. We're working on automated tests.

**How to test your plugin:**
```bash
# 1. Build
npm run build

# 2. Copy to plugins
cp dist/plugins/[feature].js ~/.config/opencode/plugins/

# 3. Test in opencode
opencode
/your-command

# 4. Check for errors
opencode --print-logs
```

## Documentation

Every plugin needs:
- **JSDoc comments** on all public functions
- **README section** in the main README.md
- **Usage examples** in CONTRIBUTING.md
- **Comments** explaining complex logic

```typescript
/**
 * My awesome utility
 * 
 * @param id - The session ID to process
 * @returns Whether the operation succeeded
 * 
 * @example
 * const result = await myFunction("ses_123")
 * console.log(result) // true
 */
async function myFunction(id: string): Promise<boolean> {
  // Implementation
}
```

## Getting Help

- **API Questions**: Check `@opencode-ai/plugin/dist/tui.d.ts` type definitions
- **Design Questions**: Open a GitHub Discussion
- **Bug Reports**: Open an Issue with steps to reproduce
- **General Help**: Ask in opencode Discord #plugins channel

## Code of Conduct

- Be respectful and constructive
- Assume good intent
- Help others learn
- Report harassment to maintainers

## License

By contributing, you agree that your code will be released under the MIT License (same as this project).

---

## FAQ

**Q: How long until my PR is merged?**  
A: We aim for 48-72 hour review. High-quality PRs are merged faster.

**Q: What if opencode changes the TUI API?**  
A: Update the wrapper layer (`api-wrapper.ts`) in a new version. All plugins automatically work with the new API.

**Q: Can I use external npm packages?**  
A: Keep dependencies minimal. Avoid heavy packages. Ask maintainers first.

**Q: What about backwards compatibility?**  
A: Don't remove or rename commands users rely on. Add new ones instead.

---

Thank you for helping make opencode better! 🙏
