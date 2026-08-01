import * as path from "node:path"

import ignore from "ignore"
import * as vscode from "vscode"

export class GitIgnoreFilter {
  private readonly ig = ignore()

  private constructor(private readonly workspaceDir: string) {}

  static async create(): Promise<GitIgnoreFilter> {
    const basePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    if (!basePath) {
      throw new Error("No workspace folder found")
    }

    const dir = path.dirname(basePath)
    const filter = new GitIgnoreFilter(dir)
    const uris = await vscode.workspace.findFiles("**/.gitignore", "**/node_modules/**")

    for (const uri of uris) {
      const doc = await vscode.workspace.openTextDocument(uri)
      filter.addFilter(doc.getText())
    }

    return filter
  }

  addFilter(filter: string) {
    this.ig.add(filter)
  }

  ignores = (filePath: string): boolean => {
    const rel = path.relative(this.workspaceDir, filePath)
    return this.ig.ignores(rel)
  }
}
