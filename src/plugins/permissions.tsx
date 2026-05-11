/** @jsxImportSource @opentui/solid */
/**
 * /permissions
 *
 * Manage opencode permission settings via TUI instead of hand-editing
 * ~/.config/opencode/opencode.json.
 *
 * Supports:
 *   - View current permission config
 *   - Set global permission mode (ask / allow / deny)
 *   - Toggle per-tool permission
 *   - Manage pattern-based permissions (e.g. external_directory)
 *   - Reset (remove) permission config
 */
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import { homedir } from "node:os"
import { join } from "node:path"
import { readFile, writeFile } from "node:fs/promises"
import { createWrappedAPI } from "../core/api-wrapper"

function getConfigPath() {
  if (process.env.OPENCODE_CONFIG_DIR) {
    return join(process.env.OPENCODE_CONFIG_DIR, "opencode.json")
  }
  return join(homedir(), ".config", "opencode", "opencode.json")
}

async function loadConfig() {
  try {
    const content = await readFile(getConfigPath(), "utf-8")
    return JSON.parse(content) as Record<string, any>
  } catch {
    return {}
  }
}

async function saveConfig(data: Record<string, any>) {
  await writeFile(getConfigPath(), JSON.stringify(data, null, 2))
}

const TOOLS = [
  "read",
  "edit",
  "glob",
  "grep",
  "list",
  "bash",
  "task",
  "external_directory",
  "todowrite",
  "question",
  "webfetch",
  "websearch",
  "codesearch",
  "repo_clone",
  "repo_overview",
  "lsp",
  "doom_loop",
  "skill",
]

const PATTERN_TOOLS = [
  "read",
  "edit",
  "glob",
  "grep",
  "list",
  "bash",
  "task",
  "external_directory",
  "repo_clone",
  "repo_overview",
  "lsp",
  "skill",
]

const ACTIONS: Array<{ title: string; value: string }> = [
  { title: "ask  - always prompt", value: "ask" },
  { title: "allow - auto approve", value: "allow" },
  { title: "deny  - always reject", value: "deny" },
]

function getPermission(config: Record<string, any>) {
  return config.permission
}

function getToolCurrent(config: Record<string, any>, tool: string): string {
  const perm = getPermission(config)
  if (typeof perm === "string") return perm
  if (perm && typeof perm === "object") {
    const val = perm[tool]
    if (typeof val === "string") return val
    if (typeof val === "object" && val !== null) return "(pattern-based)"
  }
  return "not set (default: ask)"
}

function ensureObjectPermission(config: Record<string, any>) {
  if (!config.permission || typeof config.permission !== "object") {
    config.permission = {}
  }
}

function setToolAction(config: Record<string, any>, tool: string, action: string) {
  ensureObjectPermission(config)
  config.permission[tool] = action
}

function setToolPattern(config: Record<string, any>, tool: string, pattern: string, action: string) {
  ensureObjectPermission(config)
  if (!config.permission[tool] || typeof config.permission[tool] !== "object") {
    config.permission[tool] = {}
  }
  config.permission[tool][pattern] = action
}

function removeToolPattern(config: Record<string, any>, tool: string, pattern: string) {
  ensureObjectPermission(config)
  const toolCfg = config.permission[tool]
  if (toolCfg && typeof toolCfg === "object") {
    delete toolCfg[pattern]
    if (Object.keys(toolCfg).length === 0) {
      delete config.permission[tool]
    }
  }
}

function formatPermission(config: Record<string, any>): string {
  const perm = getPermission(config)
  if (perm === undefined) return "No permission config set."
  return JSON.stringify(perm, null, 2)
}

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.permissions",
  async tui(rawApi) {
    const api = createWrappedAPI(rawApi)
    const { DialogSelect, DialogConfirm, DialogAlert, DialogPrompt } = api.ui

    const mainMenu = async () => {
      const config = await loadConfig()

      api.ui.dialog.replace(() => (
        <DialogSelect
          title="Permission Manager"
          options={[
            { title: "View current permissions", value: "view" },
            { title: "Set global permission mode", value: "global" },
            { title: "Toggle per-tool permission", value: "tool" },
            { title: "Manage pattern permissions", value: "pattern" },
            { title: "Reset permissions", value: "reset" },
          ]}
          onSelect={(option) => {
            if (!option) return
            switch (option.value) {
              case "view":
                viewPermissions(config)
                break
              case "global":
                setGlobalMode(config)
                break
              case "tool":
                selectTool(config)
                break
              case "pattern":
                selectPatternTool(config)
                break
              case "reset":
                confirmReset(config)
                break
            }
          }}
        />
      ))
    }

    const viewPermissions = (config: Record<string, any>) => {
      api.ui.dialog.replace(() => (
        <DialogAlert
          title="Current Permissions"
          message={formatPermission(config)}
        />
      ))
    }

    const setGlobalMode = (config: Record<string, any>) => {
      api.ui.dialog.replace(() => (
        <DialogSelect
          title="Set global permission mode"
          placeholder="This overrides every tool unless individually configured"
          options={ACTIONS}
          onSelect={(option) => {
            if (!option) return
            void (async () => {
              config.permission = option.value
              await saveConfig(config)
              api.ui.dialog.clear()
              api.ui.toast({
                variant: "success",
                title: "Global permission set",
                message: `All tools default to "${option.value}".`,
              })
            })()
          }}
        />
      ))
    }

    const selectTool = (config: Record<string, any>) => {
      const options = TOOLS.map((t) => ({
        title: `${t}  [${getToolCurrent(config, t)}]`,
        value: t,
      }))

      api.ui.dialog.replace(() => (
        <DialogSelect
          title="Select tool to configure"
          options={options}
          onSelect={(option) => {
            if (!option) return
            setToolMode(config, option.value)
          }}
        />
      ))
    }

    const setToolMode = (config: Record<string, any>, tool: string) => {
      api.ui.dialog.replace(() => (
        <DialogSelect
          title={`Set permission for "${tool}"`}
          options={ACTIONS}
          onSelect={(option) => {
            if (!option) return
            void (async () => {
              setToolAction(config, tool, option.value)
              await saveConfig(config)
              api.ui.dialog.clear()
              api.ui.toast({
                variant: "success",
                title: "Permission updated",
                message: `"${tool}" is now "${option.value}".`,
              })
            })()
          }}
        />
      ))
    }

    const selectPatternTool = (config: Record<string, any>) => {
      const options = PATTERN_TOOLS.map((t) => ({
        title: `${t}  [${getToolCurrent(config, t)}]`,
        value: t,
      }))

      api.ui.dialog.replace(() => (
        <DialogSelect
          title="Select tool for pattern management"
          options={options}
          onSelect={(option) => {
            if (!option) return
            managePatterns(config, option.value)
          }}
        />
      ))
    }

    const managePatterns = (config: Record<string, any>, tool: string) => {
      const toolCfg = config.permission?.[tool]
      const patterns =
        toolCfg && typeof toolCfg === "object"
          ? Object.entries(toolCfg).map(([k, v]) => ({ title: `${k} -> ${v}`, value: k }))
          : []

      const options = [
        { title: "Add new pattern", value: "__add__" },
        ...patterns,
      ]

      api.ui.dialog.replace(() => (
        <DialogSelect
          title={`Patterns for "${tool}"${patterns.length === 0 ? " (none set)" : ""}`}
          options={options}
          onSelect={(option) => {
            if (!option) return
            if (option.value === "__add__") {
              addPattern(config, tool)
            } else {
              confirmRemovePattern(config, tool, option.value)
            }
          }}
        />
      ))
    }

    const addPattern = (config: Record<string, any>, tool: string) => {
      api.ui.dialog.replace(() => (
        <DialogPrompt
          title={`Add pattern for "${tool}"`}
          placeholder="/tmp/workspace/* or /home/shell/*"
          onConfirm={(patternValue: string) => {
            const trimmed = patternValue.trim()
            if (!trimmed) {
              api.ui.dialog.clear()
              api.ui.toast({ title: "Cancelled", message: "Empty pattern." })
              return
            }
            api.ui.dialog.replace(() => (
              <DialogSelect
                title={`Action for "${trimmed}"`}
                options={ACTIONS}
                onSelect={(actionOpt) => {
                  if (!actionOpt) {
                    api.ui.dialog.clear()
                    return
                  }
                  void (async () => {
                    setToolPattern(config, tool, trimmed, actionOpt.value)
                    await saveConfig(config)
                    api.ui.dialog.clear()
                    api.ui.toast({
                      variant: "success",
                      title: "Pattern added",
                      message: `"${trimmed}" -> ${actionOpt.value}`,
                    })
                  })()
                }}
              />
            ))
          }}
          onCancel={() => {
            api.ui.dialog.clear()
          }}
        />
      ))
    }

    const confirmRemovePattern = (config: Record<string, any>, tool: string, pattern: string) => {
      api.ui.dialog.replace(() => (
        <DialogConfirm
          title="Remove pattern?"
          message={`Delete "${pattern}" from "${tool}"?`}
          onConfirm={async () => {
            removeToolPattern(config, tool, pattern)
            await saveConfig(config)
            api.ui.dialog.clear()
            api.ui.toast({
              variant: "success",
              title: "Pattern removed",
              message: `"${pattern}" deleted from "${tool}".`,
            })
          }}
          onCancel={() => {
            api.ui.dialog.clear()
          }}
        />
      ))
    }

    const confirmReset = (config: Record<string, any>) => {
      api.ui.dialog.replace(() => (
        <DialogConfirm
          title="Reset permissions?"
          message="This removes the entire 'permission' field from opencode.json."
          onConfirm={async () => {
            delete config.permission
            await saveConfig(config)
            api.ui.dialog.clear()
            api.ui.toast({
              variant: "success",
              title: "Permissions reset",
              message: "Permission config removed. Default behavior restored.",
            })
          }}
          onCancel={() => {
            api.ui.dialog.clear()
          }}
        />
      ))
    }

    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.permissions",
          title: "Manage Permissions",
          category: "Config",
          namespace: "palette",
          slashName: "permissions",
          async run() {
            await mainMenu()
          },
        },
      ],
    })
  },
}

export default plugin
