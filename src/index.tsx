/**
 * OpenCode TUI Utils - Plugin Loader
 */

import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import disconnectPlugin from "./plugins/disconnect"
import lspTogglePlugin from "./plugins/lsp-toggle"

const plugins: TuiPluginModule[] = [disconnectPlugin, lspTogglePlugin]

export async function initializePlugins(...args: Parameters<TuiPluginModule["tui"]>) {
  for (const plugin of plugins) {
    try {
      await plugin.tui(...args)
    } catch (error) {
      console.error(`Failed to initialize plugin:`, error)
    }
  }
}

const mainPlugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils",
  async tui(...args: Parameters<TuiPluginModule["tui"]>) {
    await initializePlugins(...args)
  },
}

export default mainPlugin
