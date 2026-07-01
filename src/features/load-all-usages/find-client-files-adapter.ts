import * as vscode from "vscode"

export type ClientFilesFinder = () => Promise<string[]>

export const findClientFiles: ClientFilesFinder = async () => {
  const files = await vscode.workspace.findFiles("**/*.{jsx,tsx}", "**/node_modules/**")
  return files.map((uri) => uri.fsPath)
}
