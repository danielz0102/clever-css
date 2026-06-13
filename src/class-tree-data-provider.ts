import path from "node:path"

import * as vscode from "vscode"

export type CSSFile = {
  uri: vscode.Uri
  classes: Array<{
    name: string
    range: vscode.Range
  }>
}

export class ClassTreeDataProvider implements vscode.TreeDataProvider<ClassItem | FileItem> {
  private onDidChangeTreeDataEmitter = new vscode.EventEmitter<
    ClassItem | FileItem | undefined | void
  >()
  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event

  constructor(private files: CSSFile[]) {}

  refresh(newData: CSSFile[]): void {
    this.files = newData
    this.onDidChangeTreeDataEmitter.fire()
  }

  getTreeItem(element: ClassItem | FileItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }

  getChildren(item?: ClassItem | FileItem): ClassItem[] | FileItem[] {
    if (item instanceof ClassItem) {
      return []
    }

    if (item instanceof FileItem) {
      const file = this.files.find((d) => d.uri.toString() === item.resourceUri.toString())
      return (
        file?.classes.map(
          (c) => new ClassItem({ className: c.name, fileUri: file.uri, range: c.range })
        ) ?? []
      )
    }

    return this.files.map(({ uri }) => new FileItem(uri))
  }
}

class FileItem extends vscode.TreeItem {
  iconPath = vscode.ThemeIcon.File
  collapsibleState = vscode.TreeItemCollapsibleState.Expanded

  constructor(override readonly resourceUri: vscode.Uri) {
    super(resourceUri)

    const relativePath = vscode.workspace.asRelativePath(resourceUri)
    this.description = path.dirname(relativePath)
  }
}

export class ClassItem extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon("symbol-class")
  contextValue = "cssClass"

  constructor({
    className,
    fileUri,
    range,
  }: {
    className: string
    range: vscode.Range
    fileUri: vscode.Uri
  }) {
    super(`.${className}`)

    this.command = {
      command: "css-viewer.openClass",
      title: "Open Class",
      arguments: [fileUri, range],
    }
  }
}
