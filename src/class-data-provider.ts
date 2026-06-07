import path from "node:path"

import * as vscode from "vscode"

import { parseCSSClasses, type CSSClass } from "./parse-css-classes"

export class ClassDataProvider implements vscode.TreeDataProvider<ClassItem | FileItem> {
  private onDidChangeTreeDataEmitter = new vscode.EventEmitter<
    ClassItem | FileItem | undefined | void
  >()
  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire()
  }

  getTreeItem(element: ClassItem | FileItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }

  async getChildren(item?: ClassItem | FileItem): Promise<ClassItem[] | FileItem[]> {
    if (item instanceof ClassItem) {
      return []
    }

    if (item instanceof FileItem) {
      const classes = await this.getCSSFileClasses(item.resourceUri)
      return classes.map((c) => new ClassItem(c, item.resourceUri))
    }

    const fileURIs = await this.getCSSFilesURIs()
    return fileURIs.map((uri) => new FileItem(uri))
  }

  private async getCSSFileClasses(file: vscode.Uri): Promise<CSSClass[]> {
    const buffer = await vscode.workspace.fs.readFile(file)
    return await parseCSSClasses(buffer.toString())
  }

  private async getCSSFilesURIs(): Promise<vscode.Uri[]> {
    return await vscode.workspace.findFiles("**/*.css", "**/node_modules/**")
  }
}

class FileItem extends vscode.TreeItem {
  constructor(override readonly resourceUri: vscode.Uri) {
    super(resourceUri)

    const relativePath = vscode.workspace.asRelativePath(resourceUri)
    this.description = path.dirname(relativePath)
  }

  iconPath = vscode.ThemeIcon.File
  collapsibleState = vscode.TreeItemCollapsibleState.Expanded
}

class ClassItem extends vscode.TreeItem {
  iconPath = new vscode.ThemeIcon("symbol-class")

  constructor(cssClass: CSSClass, fileUri: vscode.Uri) {
    super(`.${cssClass.name}`)

    const range = new vscode.Range(
      cssClass.start.line - 1,
      cssClass.start.column - 1,
      cssClass.end.line - 1,
      cssClass.end.column - 1
    )

    this.command = {
      command: "css-viewer.openClass",
      title: "Open Class",
      arguments: [fileUri, range],
    }
  }
}
