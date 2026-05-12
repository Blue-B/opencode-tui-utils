import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { mkdir, readFile, writeFile } from "node:fs/promises"

export const TOOL_ENV_VARS = {
  websearch: "OPENCODE_ENABLE_EXA",
  lspTool: "OPENCODE_EXPERIMENTAL_LSP_TOOL",
} as const

export type ToolEnvName = keyof typeof TOOL_ENV_VARS

const START_MARKER = "# >>> opencode-tui-utils tool env >>>"
const END_MARKER = "# <<< opencode-tui-utils tool env <<<"

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function isTruthyEnv(name: string) {
  const value = process.env[name]
  return !!value && value !== "0" && value.toLowerCase() !== "false"
}

export function getShellProfilePath() {
  const shell = process.env.SHELL ?? ""
  if (shell.endsWith("/zsh")) return join(homedir(), ".zshrc")
  if (shell.endsWith("/bash")) return join(homedir(), ".bashrc")
  return join(homedir(), ".profile")
}

async function readProfile(path = getShellProfilePath()) {
  try {
    return await readFile(path, "utf-8")
  } catch {
    return ""
  }
}

function getManagedBlock(content: string) {
  const start = content.indexOf(START_MARKER)
  const end = content.indexOf(END_MARKER)
  if (start === -1 || end === -1 || end < start) return ""
  return content.slice(start, end + END_MARKER.length)
}

function removeManagedBlock(content: string) {
  const pattern = new RegExp(`\\n?${escapeRegExp(START_MARKER)}[\\s\\S]*?${escapeRegExp(END_MARKER)}\\n?`, "m")
  return content.replace(pattern, "\n").trimEnd()
}

export async function readManagedToolEnv(path = getShellProfilePath()) {
  const content = await readProfile(path)
  const block = getManagedBlock(content)
  const enabled = new Set<ToolEnvName>()

  for (const [key, envName] of Object.entries(TOOL_ENV_VARS) as Array<[ToolEnvName, string]>) {
    if (block.includes(`export ${envName}=1`)) enabled.add(key)
  }

  return enabled
}

export async function writeManagedToolEnv(enabled: Set<ToolEnvName>, path = getShellProfilePath()) {
  const content = await readProfile(path)
  const cleaned = removeManagedBlock(content)
  const lines = Array.from(enabled).map((key) => `export ${TOOL_ENV_VARS[key]}=1`)

  const next = lines.length > 0
    ? `${cleaned}${cleaned ? "\n\n" : ""}${START_MARKER}\n${lines.join("\n")}\n${END_MARKER}\n`
    : `${cleaned}${cleaned ? "\n" : ""}`

  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, next)
}
