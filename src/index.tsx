/**
 * OpenCode TUI Utils - Plugin Loader
 * 
 * 모든 플러그인을 한 번에 로드합니다
 */

import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import disconnectPlugin from "./plugins/disconnect"
import bookmarksPlugin from "./plugins/bookmarks"

const plugins: TuiPluginModule[] = [disconnectPlugin, bookmarksPlugin]

export async function initializePlugins(api: Parameters<TuiPluginModule["tui"]>[0]) {
  for (const plugin of plugins) {
    try {
      if (plugin.tui) {
        await plugin.tui(api)
      }
    } catch (error) {
      console.error(`Failed to initialize plugin:`, error)
    }
  }
}

const mainPlugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils",
  async tui(api) {
    await initializePlugins(api)
  },
}

export default mainPlugin
