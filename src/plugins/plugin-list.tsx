/** @jsxImportSource @opentui/solid */
import type { TuiPluginModule, TuiPluginStatus } from "@opencode-ai/plugin/tui"
import { createWrappedAPI } from "../core/api-wrapper"

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.plugin-list",
  async tui(rawApi) {
    const api = createWrappedAPI(rawApi)
    const { DialogSelect, DialogAlert } = api.ui

    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.plugin-list",
          title: "List Plugins",
          category: "System",
          namespace: "palette",
          slashName: "plugin-list",
          async run() {
            const plugins = api.plugins.list()
            if (plugins.length === 0) {
              api.ui.toast({
                title: "No plugins",
                message: "No plugins installed.",
              })
              return
            }

            const options = plugins.map((p: TuiPluginStatus) => ({
              title: `${p.id} (${p.enabled ? "enabled" : "disabled"}, ${p.active ? "active" : "inactive"})`,
              value: p.id,
            }))

            api.ui.dialog.replace(() => (
              <DialogSelect
                title="Installed plugins"
                options={options}
                onSelect={(option) => {
                  if (!option) return
                  const plugin = plugins.find((p: TuiPluginStatus) => p.id === option.value)
                  if (!plugin) return
                  api.ui.dialog.replace(() => (
                    <DialogAlert
                      title={plugin.id}
                      message={`Source: ${plugin.source}\nEnabled: ${plugin.enabled ? "Yes" : "No"}\nActive: ${plugin.active ? "Yes" : "No"}\nSpec: ${plugin.spec}`}
                    />
                  ))
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
