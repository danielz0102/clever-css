import * as vscode from "vscode"

import type { ClientFileFinder } from "./client-file-finder"

export class VSCodeClientFileFinder implements ClientFileFinder {
  async find(): Promise<string[]> {
    const files = await vscode.workspace.findFiles("**/*.{jsx,tsx}", "**/node_modules/**")
    return files.map((uri) => uri.fsPath)
  }
}
