# opencode-tui-utils

**Essential TUI utilities for opencode** - a collection of powerful, battle-tested TUI plugins designed to enhance your opencode workflow.

> The first community-driven TUI plugin package for opencode with extensible architecture. Zero dependencies beyond opencode itself.

## Features

### 🔌 `/disconnect` - Smart Provider Management
Quickly disconnect authentication providers without manual file editing.

```bash
/disconnect      # Interactive provider selection
/dc             # Quick alias
```

**What it does:**
- Shows all connected providers with their types
- Safely removes only the selected provider
- Instant feedback on success/failure

### 📌 `/faves` - Session Bookmarks (Coming Soon)
Bookmark your favorite project sessions for instant access.

```bash
/faves          # View bookmarked sessions  
/fav            # Quick alias
/bookmarks      # Alternative command
```

**What it does:**
- Persist session bookmarks across opencode restarts
- Interactive selection interface
- Quick navigation to frequently used projects

## Installation

### Quick Start

1. **Ensure you're on opencode 1.14.42+**
   ```bash
   opencode --version
   ```

2. **Create plugin directory** (if not exists)
   ```bash
   mkdir -p ~/.config/opencode/plugins
   ```

3. **Copy this plugin** to your plugins folder:
   - Option A: Copy the `.tsx` files directly
   - Option B: Install via npm (coming soon)

4. **Register in `~/.config/opencode/tui.json`**
   ```json
   {
     "plugins": [
       "./plugins/disconnect.tsx",
       "./plugins/bookmarks.tsx"
     ]
   }
   ```

5. **Restart opencode** and test:
   ```bash
   /disconnect
   /faves
   ```

## Compatibility

| opencode Version | Status | Notes |
|-----------------|--------|-------|
| 1.14.46         | ✅ Tested | Current stable |
| 1.14.42+        | ✅ OK | Minimum version |
| 1.15.x          | 🧪 Testing | Report issues! |
| <1.14.42        | ❌ Not supported | API missing |

**How we ensure compatibility:**

- **API Wrapper Layer** (`src/core/api-wrapper.ts`) - All opencode API calls go through a single abstraction layer
- **CI/CD Testing** - Automatically tested against the latest opencode releases
- **Version Pinning** - `peerDependencies` specify compatible opencode versions
- **Rapid Updates** - Issues trigger fast patch releases

If you encounter problems after an opencode update:
1. Check [GitHub Issues](https://github.com/YOUR_USERNAME/opencode-tui-utils/issues)
2. Report with your `opencode --version` output
3. We'll investigate and release a fix within 24 hours

## Usage

### Disconnect Provider
```bash
opencode
/disconnect

# Select provider from list with arrow keys
# Press Enter to disconnect
# Confirmation toast appears
```

**Safe features:**
- Read-only display of provider types
- User must confirm selection
- Selective removal (only selected provider)
- Rollback possible (manually re-auth)

### Bookmarked Sessions (Coming Soon)
```bash
opencode
/faves

# See all bookmarked sessions
# Select one to view details
```

## Architecture

**Why this matters for you:**

```
opencode updates frequently
    ↓
API signatures might change
    ↓
Our API Wrapper catches breaking changes
    ↓
You always get working plugins
```

### Project Structure
```
src/
├── core/
│   └── api-wrapper.ts      ← Single source of truth for API
├── plugins/
│   ├── disconnect.tsx      ← Provider disconnect logic
│   └── bookmarks.tsx       ← Session bookmarking
├── utils/
│   └── (future utilities)
└── index.tsx               ← Plugin loader
```

## Building from Source

### Development
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode
npm run dev

# Test
npm run test
```

### Output
```
dist/
├── plugins/
│   ├── disconnect.js
│   ├── disconnect.d.ts
│   ├── bookmarks.js
│   └── bookmarks.d.ts
├── core/
│   └── api-wrapper.js
└── index.js
```

## Contributing

We welcome community contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- How to build new TUI utilities
- Plugin architecture guidelines
- Pull request process
- Code examples

**Examples of plugins you could add:**
- `api-quick-switch` - Quickly switch between API providers
- `session-export` - Export session logs to different formats
- `token-manager` - Safe token rotation utilities
- `debug-utils` - Debugging and troubleshooting helpers

## FAQ

### Q: Does this work with opencode cloud?
**A:** Yes! Works with both local and cloud installations.

### Q: Will my plugins break when opencode updates?
**A:** Unlikely! We use an API wrapper layer that absorbs changes. See [Compatibility](#compatibility) for details.

### Q: Can I disable individual plugins?
**A:** Yes, remove the file from `~/.config/opencode/plugins/` or comment it out in `tui.json`.

### Q: How is this different from custom markdown commands?
**A:** 
- ✅ No LLM dependency
- ✅ Faster execution
- ✅ Access to native TUI components
- ✅ Persistent storage (KV API)
- ✅ Real-time file I/O

### Q: What happens if opencode removes the TUI plugin API?
**A:** Unlikely, but we're positioned as a "community-driven bridge" until native implementations land.

## Status & Roadmap

- [x] `/disconnect` command
- [ ] `/faves` session bookmarks  
- [ ] `/fave-add` bookmark current session
- [ ] `/fave-remove` remove bookmarks
- [ ] Droid CLI-style interactive UI
- [ ] Unit tests
- [ ] npm package
- [ ] GitHub Actions CI/CD

## Support

- **GitHub Issues**: [Report bugs](https://github.com/YOUR_USERNAME/opencode-tui-utils/issues)
- **Discussions**: [Feature requests & ideas](https://github.com/YOUR_USERNAME/opencode-tui-utils/discussions)
- **opencode Community**: [Discord](https://discord.gg/opencode) #plugins channel

## License

MIT License - see LICENSE file for details

## Acknowledgments

- opencode team for the powerful TUI plugin API
- Community users reporting issues and suggesting features
- Contributors submitting PRs and improvements

---

**Made with ❤️ for the opencode community**

*First-mover advantage in the TUI plugin ecosystem. Help us make it better!*
