import * as vscode from "vscode"

import { ClassItem } from "./class-tree-item"
import type { CSSFile } from "./css-file-dto"
import { FileItem } from "./file-tree-item"

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
