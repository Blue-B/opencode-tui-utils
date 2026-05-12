/**
 * /lsp-toggle
 *
 * Toggles the `lsp` field in ~/.config/opencode/opencode.json between true/false.
 * This controls whether opencode starts Language Server Protocol support.
 * It does not enable the experimental `lsp` LLM tool; that requires launching
 * opencode with OPENCODE_EXPERIMENTAL_LSP_TOOL=true.
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
import { getShellProfilePath, readManagedToolEnv, writeManagedToolEnv } from "../core/tool-env"

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
                  const nextEnabled = !isEnabled
                  config.lsp = nextEnabled
                  await saveConfig(config)
                  const env = await readManagedToolEnv()
                  if (nextEnabled) env.add("lspTool")
                  else env.delete("lspTool")
                  await writeManagedToolEnv(env)
                  api.ui.dialog.clear()

                  api.ui.toast({
                    variant: nextEnabled ? "success" : "info",
                    title: nextEnabled ? "LSP Enabled" : "LSP Disabled",
                    message: nextEnabled
                      ? `LSP servers and LSP tool env turned on. Restart terminal/opencode to apply. Updated ${getShellProfilePath()}.`
                      : `LSP servers and LSP tool env turned off. Restart terminal/opencode to apply. Updated ${getShellProfilePath()}.`,
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
