/** @jsxImportSource @opentui/solid */
import type { TuiPluginModule, TuiSidebarTodoItem } from "@opencode-ai/plugin/tui"
import { createWrappedAPI } from "../core/api-wrapper"

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.session-todos",
  async tui(rawApi) {
    const api = createWrappedAPI(rawApi)
    const { DialogSelect, DialogAlert } = api.ui

    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.session-todos",
          title: "Session Todos",
          category: "Session",
          namespace: "palette",
          slashName: "session-todos",
          async run() {
            const route = api.route.current
            if (route.name !== "session" || !route.params?.sessionID) {
              api.ui.toast({
                title: "No session",
                message: "You must be in a session to view todos.",
              })
              return
            }

            const sessionID = String(route.params.sessionID)
            const todos = api.state.session.todo(sessionID)

            if (todos.length === 0) {
              api.ui.toast({
                title: "No todos",
                message: "No todos in this session.",
              })
              return
            }

            const options = todos.map((t: TuiSidebarTodoItem) => ({
              title: `${t.content} (${t.status})`,
              value: t.content,
            }))

            api.ui.dialog.replace(() => (
              <DialogSelect
                title={`Todos (${todos.length})`}
                options={options}
                onSelect={(option) => {
                  if (!option) return
                  const todo = todos.find((t: TuiSidebarTodoItem) => t.content === option.value)
                  if (!todo) return
                  api.ui.dialog.replace(() => (
                    <DialogAlert
                      title="Todo"
                      message={`${todo.content}\nStatus: ${todo.status}`}
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
