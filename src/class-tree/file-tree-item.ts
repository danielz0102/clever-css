import * as path from "path"

import * as vscode from "vscode"

export class FileItem extends vscode.TreeItem {
  iconPath = vscode.ThemeIcon.File
  collapsibleState = vscode.TreeItemCollapsibleState.Expanded

  constructor(override readonly resourceUri: vscode.Uri) {
    super(resourceUri)

    const relativePath = vscode.workspace.asRelativePath(resourceUri)
    this.description = path.dirname(relativePath)
  }
}
