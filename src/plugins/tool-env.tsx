/** @jsxImportSource @opentui/solid */
/**
 * /tool-env
 *
 * Persists environment variables for launch-gated OpenCode built-in tools.
 * Changes apply after restarting the shell/OpenCode.
 */
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createWrappedAPI } from "../core/api-wrapper"
import { getShellProfilePath, readManagedToolEnv, writeManagedToolEnv, type ToolEnvName } from "../core/tool-env"

type ToolEnvUpdate = Partial<Record<ToolEnvName, boolean>>

function formatEnabled(enabled: Set<ToolEnvName>) {
  return [
    `Shell profile: ${getShellProfilePath()}`,
    "",
    `websearch on restart: ${enabled.has("websearch") ? "enabled" : "disabled"}`,
    `LSP tool on restart: ${enabled.has("lspTool") ? "enabled" : "disabled"}`,
    "",
    "Changes apply after opening a new terminal and restarting OpenCode.",
  ].join("\n")
}

async function applyUpdate(update: ToolEnvUpdate) {
  const enabled = await readManagedToolEnv()
  for (const [key, value] of Object.entries(update) as Array<[ToolEnvName, boolean]>) {
    if (value) enabled.add(key)
    else enabled.delete(key)
  }
  await writeManagedToolEnv(enabled)
  return enabled
}

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.tool-env",
  async tui(rawApi) {
    const api = createWrappedAPI(rawApi)
    const { DialogSelect, DialogConfirm, DialogAlert } = api.ui

    async function showStatus() {
      const enabled = await readManagedToolEnv()
      api.ui.dialog.replace(() => <DialogAlert title="Tool Env" message={formatEnabled(enabled)} />)
    }

    function confirmUpdate(title: string, message: string, update: ToolEnvUpdate) {
      api.ui.dialog.replace(() => (
        <DialogConfirm
          title={title}
          message={`${message}\n\nThis edits ${getShellProfilePath()}. Restart your terminal and OpenCode after applying.`}
          onConfirm={async () => {
            const enabled = await applyUpdate(update)
            api.ui.dialog.replace(() => <DialogAlert title="Tool Env Updated" message={formatEnabled(enabled)} />)
          }}
          onCancel={() => api.ui.dialog.clear()}
        />
      ))
    }

    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.tool-env",
          title: "Tool Env",
          category: "Config",
          namespace: "palette",
          slashName: "tool-env",
          async run() {
            const enabled = await readManagedToolEnv()
            api.ui.dialog.replace(() => (
              <DialogSelect
                title="Tool Env"
                placeholder={`websearch: ${enabled.has("websearch") ? "on" : "off"}, lsp tool: ${enabled.has("lspTool") ? "on" : "off"}`}
                options={[
                  { title: "Show current managed env", value: "status" },
                  { title: "Enable LSP tool on restart", value: "enable-lsp" },
                  { title: "Disable LSP tool on restart", value: "disable-lsp" },
                  { title: "Enable websearch on restart", value: "enable-websearch" },
                  { title: "Disable websearch on restart", value: "disable-websearch" },
                  { title: "Enable both on restart", value: "enable-both" },
                  { title: "Disable both on restart", value: "disable-both" },
                ]}
                onSelect={(option) => {
                  if (!option) return
                  switch (option.value) {
                    case "status":
                      void showStatus()
                      break
                    case "enable-lsp":
                      confirmUpdate("Enable LSP Tool", "Enable OPENCODE_EXPERIMENTAL_LSP_TOOL=1 for future OpenCode launches?", { lspTool: true })
                      break
                    case "disable-lsp":
                      confirmUpdate("Disable LSP Tool", "Remove the managed OPENCODE_EXPERIMENTAL_LSP_TOOL setting?", { lspTool: false })
                      break
                    case "enable-websearch":
                      confirmUpdate("Enable Web Search", "Enable OPENCODE_ENABLE_EXA=1 for future OpenCode launches?", { websearch: true })
                      break
                    case "disable-websearch":
                      confirmUpdate("Disable Web Search", "Remove the managed OPENCODE_ENABLE_EXA setting?", { websearch: false })
                      break
                    case "enable-both":
                      confirmUpdate("Enable Tool Env", "Enable websearch and the experimental LSP tool for future OpenCode launches?", { websearch: true, lspTool: true })
                      break
                    case "disable-both":
                      confirmUpdate("Disable Tool Env", "Remove the managed websearch and LSP tool env settings?", { websearch: false, lspTool: false })
                      break
                  }
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
