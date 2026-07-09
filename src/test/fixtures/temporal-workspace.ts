import * as vscode from "vscode"

export class TemporalWorkspaceFixture {
  private tempDirUri: vscode.Uri

  constructor() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]

    if (!workspaceFolder) {
      throw new Error("No workspace folder found for testing")
    }

    this.tempDirUri = vscode.Uri.joinPath(workspaceFolder.uri, `temp-${Date.now()}`)
  }

  async writeFile(filename: string, content: string): Promise<vscode.Uri> {
    const fileUri = vscode.Uri.joinPath(this.tempDirUri, filename)
    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(content))
    return fileUri
  }

  async teardown() {
    await vscode.workspace.fs.delete(this.tempDirUri, { recursive: true, useTrash: false })
  }
}
