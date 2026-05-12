/** @jsxImportSource @opentui/solid */
/**
 * /websearch-toggle
 *
 * Toggles the managed OPENCODE_ENABLE_EXA env var for future OpenCode launches.
 */
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createWrappedAPI } from "../core/api-wrapper"
import { getShellProfilePath, readManagedToolEnv, writeManagedToolEnv } from "../core/tool-env"

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.websearch-toggle",
  async tui(rawApi) {
    const api = createWrappedAPI(rawApi)
    const DialogConfirm = api.ui.DialogConfirm

    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.websearch-toggle",
          title: "Toggle Web Search",
          category: "Config",
          namespace: "palette",
          slashName: "websearch-toggle",
          async run() {
            const env = await readManagedToolEnv()
            const isEnabled = env.has("websearch")

            api.ui.dialog.replace(() => (
              <DialogConfirm
                title="Toggle Web Search"
                message={
                  isEnabled
                    ? "Web search is currently enabled for future launches. Disable it?"
                    : "Web search is currently disabled for future launches. Enable it?"
                }
                onConfirm={async () => {
                  if (isEnabled) env.delete("websearch")
                  else env.add("websearch")
                  await writeManagedToolEnv(env)
                  api.ui.dialog.clear()

                  const nextEnabled = !isEnabled
                  api.ui.toast({
                    variant: nextEnabled ? "success" : "info",
                    title: nextEnabled ? "Web Search Enabled" : "Web Search Disabled",
                    message: nextEnabled
                      ? `Web search env turned on. Restart terminal/opencode to apply. Updated ${getShellProfilePath()}.`
                      : `Web search env turned off. Restart terminal/opencode to apply. Updated ${getShellProfilePath()}.`,
                  })
                }}
                onCancel={() => api.ui.dialog.clear()}
              />
            ))
          },
        },
      ],
    })
  },
}

export default plugin
