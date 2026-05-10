/** @jsxImportSource @opentui/solid */
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import { homedir } from "node:os"
import { join } from "node:path"
import { readFile, writeFile } from "node:fs/promises"
import { createWrappedAPI } from "../core/api-wrapper"

function getAuthPath() {
  if (process.env.OPENCODE_AUTH_PATH) return process.env.OPENCODE_AUTH_PATH

  const dataHome = process.env.XDG_DATA_HOME ?? join(homedir(), ".local", "share")
  return join(dataHome, "opencode", "auth.json")
}

async function loadAuth() {
  try {
    const content = await readFile(getAuthPath(), "utf-8")
    return JSON.parse(content) as Record<string, { type: string }>
  } catch (error) {
    console.error("Failed to load auth:", error)
    return null
  }
}

async function saveAuth(data: Record<string, unknown>) {
  try {
    await writeFile(getAuthPath(), JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("Failed to save auth:", error)
    throw error
  }
}

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.disconnect",
  async tui(rawApi) {
    const api = createWrappedAPI(rawApi)
    const { DialogSelect, DialogAlert } = api.ui

    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.disconnect",
          title: "Disconnect Provider",
          category: "Provider",
          namespace: "palette",
          slashName: "disconnect",
          slashAliases: ["dc"],
          async run() {
            const data = await loadAuth()
            if (!data) {
              api.ui.dialog.replace(() => (
                <DialogAlert
                  title="Error"
                  message="Could not read authentication file."
                />
              ))
              return
            }

            const providers = Object.keys(data)
            if (providers.length === 0) {
              api.ui.toast({
                title: "No providers",
                message: "No providers connected.",
              })
              return
            }

            const options = providers.map((p) => ({
              title: `${p} (${data[p]?.type ?? "unknown"})`,
              value: p,
            }))

            api.ui.dialog.replace(() => (
              <DialogSelect
                title="Select provider to disconnect"
                options={options}
                onSelect={(option) => {
                  if (!option) return

                  void (async () => {
                    const nextData = { ...data }
                    delete nextData[option.value]

                    try {
                      await saveAuth(nextData)
                      api.ui.dialog.clear()
                      api.ui.toast({
                        variant: "success",
                        title: "Disconnected",
                        message: `Removed ${option.value}`,
                      })
                    } catch {
                      api.ui.dialog.replace(() => (
                        <DialogAlert
                          title="Error"
                          message="Could not update authentication file."
                        />
                      ))
                    }
                  })()
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
