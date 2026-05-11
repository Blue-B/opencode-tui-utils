/** @jsxImportSource @opentui/solid */
import type { TuiPluginModule, TuiSidebarFileItem } from "@opencode-ai/plugin/tui"
import { createWrappedAPI } from "../core/api-wrapper"

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.session-diff",
  async tui(rawApi) {
    const api = createWrappedAPI(rawApi)
    const { DialogSelect, DialogAlert } = api.ui

    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.session-diff",
          title: "Session Diff",
          category: "Session",
          namespace: "palette",
          slashName: "session-diff",
          async run() {
            const route = api.route.current
            if (route.name !== "session" || !route.params?.sessionID) {
              api.ui.toast({
                title: "No session",
                message: "You must be in a session to view diffs.",
              })
              return
            }

            const sessionID = String(route.params.sessionID)
            const diffs = api.state.session.diff(sessionID)

            if (diffs.length === 0) {
              api.ui.toast({
                title: "No changes",
                message: "No file changes in this session.",
              })
              return
            }

            const options = diffs.map((d: TuiSidebarFileItem) => ({
              title: `${d.file} (+${d.additions}/-${d.deletions})`,
              value: d.file,
            }))

            api.ui.dialog.replace(() => (
              <DialogSelect
                title={`Changed files (${diffs.length})`}
                options={options}
                onSelect={(option) => {
                  if (!option) return
                  const diff = diffs.find((d: TuiSidebarFileItem) => d.file === option.value)
                  if (!diff) return
                  api.ui.dialog.replace(() => (
                    <DialogAlert
                      title={diff.file}
                      message={`Additions: +${diff.additions}\nDeletions: -${diff.deletions}`}
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
