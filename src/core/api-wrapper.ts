/**
 * OpenCode TUI API Wrapper
 * 
 * Keeps opencode TUI API calls behind a small local layer so API-specific
 * changes are easier to isolate.
 */

import type { TuiPluginApi } from "@opencode-ai/plugin/tui"

export interface WrappedAPI {
  keymap: ReturnType<typeof createKeymapAPI>
  ui: ReturnType<typeof createUIAPI>
  kv: ReturnType<typeof createKVAPI>
  plugins: TuiPluginApi["plugins"]
  client: TuiPluginApi["client"]
  route: TuiPluginApi["route"]
  state: TuiPluginApi["state"]
}

/**
 * Keymap API wrapper for slash commands and palette commands.
 */
export function createKeymapAPI(api: TuiPluginApi) {
  return {
    registerLayer: (config: Parameters<typeof api.keymap.registerLayer>[0]) => {
      return api.keymap.registerLayer(config)
    },
  }
}

/**
 * UI API wrapper for dialogs and toasts.
 */
export function createUIAPI(api: TuiPluginApi) {
  return {
    dialog: {
      replace: (component: Parameters<typeof api.ui.dialog.replace>[0]) => {
        return api.ui.dialog.replace(component)
      },
      clear: () => {
        return api.ui.dialog.clear()
      },
    },
    toast: (options: Parameters<typeof api.ui.toast>[0]) => {
      return api.ui.toast(options)
    },
    // Re-export UI components used by plugins.
    DialogSelect: api.ui.DialogSelect,
    DialogConfirm: api.ui.DialogConfirm,
    DialogAlert: api.ui.DialogAlert,
    DialogPrompt: api.ui.DialogPrompt,
  }
}

/**
 * KV storage wrapper for future commands that need persistence.
 */
export function createKVAPI(api: TuiPluginApi) {
  return {
    get: async (key: string): Promise<string | undefined> => {
      try {
        return api.kv.get<string | undefined>(key)
      } catch (error) {
        console.error(`Failed to get KV key "${key}":`, error)
        return undefined
      }
    },
    set: async (key: string, value: string): Promise<void> => {
      try {
        api.kv.set(key, value)
      } catch (error) {
        console.error(`Failed to set KV key "${key}":`, error)
      }
    },
    getJSON: async <T = unknown>(key: string): Promise<T | undefined> => {
      try {
        const value = api.kv.get<string | undefined>(key)
        return value ? JSON.parse(value) : undefined
      } catch (error) {
        console.error(`Failed to parse JSON from KV key "${key}":`, error)
        return undefined
      }
    },
    setJSON: async <T = unknown>(key: string, value: T): Promise<void> => {
      try {
        api.kv.set(key, JSON.stringify(value))
      } catch (error) {
        console.error(`Failed to set JSON to KV key "${key}":`, error)
      }
    },
  }
}

/**
 * Main wrapper used by plugins.
 */
export function createWrappedAPI(api: TuiPluginApi): WrappedAPI {
  return {
    keymap: createKeymapAPI(api),
    ui: createUIAPI(api),
    kv: createKVAPI(api),
    plugins: api.plugins,
    client: api.client,
    route: api.route,
    state: api.state,
  }
}
