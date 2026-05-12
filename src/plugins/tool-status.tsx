/** @jsxImportSource @opentui/solid */
/**
 * /tool-status
 *
 * Shows launch-gated built-in tool status. These are OpenCode tools, not
 * skills or MCP servers, and most require restarting OpenCode after changing
 * environment variables.
 */
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import { homedir } from "node:os"
import { join } from "node:path"
import { readFile } from "node:fs/promises"
import { createWrappedAPI } from "../core/api-wrapper"
import { getShellProfilePath, isTruthyEnv, readManagedToolEnv } from "../core/tool-env"

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
    return {}
  }
}

function enabled(value: boolean) {
  return value ? "enabled" : "disabled"
}

async function formatStatus(config: Record<string, unknown>) {
  const lspServers = !!config.lsp
  const lspTool = isTruthyEnv("OPENCODE_EXPERIMENTAL_LSP_TOOL") || isTruthyEnv("OPENCODE_EXPERIMENTAL")
  const websearch = isTruthyEnv("OPENCODE_ENABLE_EXA")
  const managed = await readManagedToolEnv()

  return [
    "Built-in tool status",
    "",
    `LSP servers: ${enabled(lspServers)} (${getConfigPath()}: lsp=${JSON.stringify(config.lsp ?? false)})`,
    `LSP tool: ${enabled(lspTool)} (requires OPENCODE_EXPERIMENTAL_LSP_TOOL=true or OPENCODE_EXPERIMENTAL=true before launch)`,
    `websearch: ${enabled(websearch)} (requires OPENCODE_ENABLE_EXA=1 before launch, unless using the OpenCode provider)`,
    "webfetch: built in (permission-controlled)",
    "codesearch: not exposed as a built-in tool in current OpenCode releases tested here",
    "",
    `Managed shell profile: ${getShellProfilePath()}`,
    `Managed websearch on restart: ${enabled(managed.has("websearch"))}`,
    `Managed LSP tool on restart: ${enabled(managed.has("lspTool"))}`,
    "",
    "These are OpenCode tools, not skills or MCP servers.",
    "Restart OpenCode after changing config or environment variables.",
    "Verify actual tool injection with: opencode debug agent build",
  ].join("\n")
}

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.tool-status",
  async tui(rawApi) {
    const api = createWrappedAPI(rawApi)
    const { DialogAlert } = api.ui

    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.tool-status",
          title: "Tool Status",
          category: "Config",
          namespace: "palette",
          slashName: "tool-status",
          async run() {
            const config = await loadConfig()
            const message = await formatStatus(config)
            api.ui.dialog.replace(() => <DialogAlert title="Tool Status" message={message} />)
          },
        },
      ],
    })
  },
}

export default plugin
