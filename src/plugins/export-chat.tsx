/** @jsxImportSource @opentui/solid */
import type { TuiPluginModule } from "@opencode-ai/plugin/tui"
import type { Part, TextPart } from "@opencode-ai/sdk/v2"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import { createWrappedAPI } from "../core/api-wrapper"

function isTextPart(part: Part): part is TextPart {
  return part.type === "text"
}

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-tui-utils.export-chat",
  async tui(rawApi) {
    const api = createWrappedAPI(rawApi)

    api.keymap.registerLayer({
      commands: [
        {
          name: "opencode-tui-utils.export-chat",
          title: "Export Chat",
          category: "Session",
          namespace: "palette",
          slashName: "export-chat",
          async run() {
            const route = api.route.current
            if (route.name !== "session" || !route.params?.sessionID) {
              api.ui.toast({
                title: "No session",
                message: "You must be in a session to export.",
              })
              return
            }

            const sessionID = String(route.params.sessionID)
            const messages = api.state.session.messages(sessionID)

            if (messages.length === 0) {
              api.ui.toast({
                title: "Empty",
                message: "No messages to export.",
              })
              return
            }

            const lines: string[] = ["# OpenCode Chat Export\n"]

            for (const msg of messages) {
              if (msg.role === "user") {
                lines.push(
                  `\n## User (${msg.agent} / ${msg.model.providerID} / ${msg.model.modelID})`,
                )
                lines.push(`Time: ${new Date(msg.time.created).toISOString()}\n`)
                const parts = api.state.part(msg.id)
                for (const part of parts) {
                  if (isTextPart(part)) {
                    lines.push(part.text)
                  }
                }
              } else if (msg.role === "assistant") {
                lines.push(`\n## Assistant (${msg.agent} / ${msg.modelID})`)
                lines.push(`Time: ${new Date(msg.time.created).toISOString()}\n`)
                const parts = api.state.part(msg.id)
                for (const part of parts) {
                  if (isTextPart(part)) {
                    lines.push(part.text)
                  }
                }
              }
              lines.push("")
            }

            const markdown = lines.join("\n")
            const filename = `opencode-chat-${Date.now()}.md`
            const filepath = join(api.state.path.directory, filename)

            try {
              await writeFile(filepath, markdown, "utf-8")
              api.ui.toast({
                variant: "success",
                title: "Exported",
                message: `Saved to ${filepath}`,
              })
            } catch (err) {
              api.ui.toast({
                variant: "error",
                title: "Export failed",
                message: String(err),
              })
            }
          },
        },
      ],
    })
  },
}

export default plugin
