/**
 * /lsp-toggle
 *
 * Toggles the `lsp` field in ~/.config/opencode/opencode.json between true/false.
 * This controls whether opencode starts Language Server Protocol support.
 *
 * Important: opencode reads config at startup. Changing the JSON file does NOT
 * hot-reload the setting. You must restart opencode after toggling for the
 * change to take effect.
 *
 * Usage:
 *   /lsp-toggle        Toggle LSP on/off
 */

/** @jsxImportSource @opentui/solid */
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import { homedir } from "node:os"
import { join } from "node:path"
import { readFile, writeFile } from "node:fs/promises"
import { createWrappedAPI } from "../core/api-wrapper"

/** Resolve opencode.json path. Honors OPENCODE_CONFIG_DIR if set. */
function getConfigPath() {
  if (process.env.OPENCODE_CONFIG_DIR) {
    return join(process.env.OPENCODE_CONFIG_DIR, "opencode.json")
  }
  return join(homedir(), ".config", "opencode", "opencode.json")
}

async function loadConfig() {
  try {
    const content = await readFile(getConfigPath(), "utf-8")
    return JSON.parse(content) as Record<string, unknown>
  } catch {
    // If file is missing or unreadable, start with an empty object.
    return {}
  }
}

async function saveConfig(data: Record<string, unknown>) {
  await writeFile(getConfigPath(), JSON.stringify(data, null, 2))
}

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.lsp-toggle",
  async tui(rawApi) {
    const api = createWrappedAPI(rawApi)

    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.lsp-toggle",
          title: "Toggle LSP",
          category: "Config",
          namespace: "palette",
          slashName: "lsp-toggle",
          async run() {
            const config = await loadConfig()
            const isEnabled = !!config.lsp
            const DialogConfirm = api.ui.DialogConfirm

            api.ui.dialog.replace(() => (
              <DialogConfirm
                title="Toggle LSP"
                message={
                  isEnabled
                    ? "LSP is currently enabled. Disable it?"
                    : "LSP is currently disabled. Enable it?"
                }
                onConfirm={async () => {
                  config.lsp = !isEnabled
                  await saveConfig(config)
                  api.ui.dialog.clear()

                  const nextEnabled = !isEnabled
                  api.ui.toast({
                    variant: nextEnabled ? "success" : "info",
                    title: nextEnabled ? "LSP Enabled" : "LSP Disabled",
                    message: nextEnabled
                      ? "LSP turned on. Restart opencode to apply."
                      : "LSP turned off. Restart opencode to apply.",
                  })
                }}
                onCancel={() => {
                  api.ui.dialog.clear()
                }}
              />
            ))
          },
        },
      ],
    })
  },
}

export default plugin
