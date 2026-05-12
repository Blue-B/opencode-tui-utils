/**
 * OpenCode TUI Utils - Plugin Loader
 */

import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import disconnectPlugin from "./plugins/disconnect"
import lspTogglePlugin from "./plugins/lsp-toggle"
import pluginListPlugin from "./plugins/plugin-list"
import exportChatPlugin from "./plugins/export-chat"
import sessionDiffPlugin from "./plugins/session-diff"
import sessionTodosPlugin from "./plugins/session-todos"
import permissionsPlugin from "./plugins/permissions"
import toolStatusPlugin from "./plugins/tool-status"
import toolEnvPlugin from "./plugins/tool-env"
import websearchTogglePlugin from "./plugins/websearch-toggle"

const plugins: TuiPluginModule[] = [disconnectPlugin, lspTogglePlugin, websearchTogglePlugin, pluginListPlugin, exportChatPlugin, sessionDiffPlugin, sessionTodosPlugin, permissionsPlugin, toolStatusPlugin, toolEnvPlugin]

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
