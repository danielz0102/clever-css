import path from "node:path"

import * as vscode from "vscode"

export interface Usage {
  uri: vscode.Uri
  range: vscode.Range
  text: string
}

export class UsageTreeDataProvider implements vscode.TreeDataProvider<UsageFileItem | UsageItem> {
  private onDidChangeTreeDataEmitter = new vscode.EventEmitter<
    UsageFileItem | UsageItem | undefined | void
  >()
  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event

  private usages: Usage[] = []

  setUsages(usages: Usage[]): void {
    this.usages = usages
    this.onDidChangeTreeDataEmitter.fire()
  }

  clear(): void {
    this.usages = []
    this.onDidChangeTreeDataEmitter.fire()
  }

  getTreeItem(element: UsageFileItem | UsageItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }

  getChildren(element?: UsageFileItem | UsageItem): Thenable<(UsageFileItem | UsageItem)[]> {
    if (element instanceof UsageFileItem) {
      const fileUsages = this.usages.filter(
        (u) => u.uri.toString() === element.resourceUri.toString()
      )
      return Promise.resolve(fileUsages.map((u) => new UsageItem(u.uri, u.range, u.text)))
    }

    const grouped = new Map<string, Usage[]>()
    for (const usage of this.usages) {
      const key = usage.uri.toString()
      const existing = grouped.get(key) ?? []
      existing.push(usage)
      grouped.set(key, existing)
    }

    const files: UsageFileItem[] = []
    for (const [uriString, usages] of grouped) {
      const uri = vscode.Uri.parse(uriString)
      const relativePath = vscode.workspace.asRelativePath(uri)
      const dir = path.dirname(relativePath)
      files.push(new UsageFileItem(uri, dir, usages.length))
    }

    return Promise.resolve(files)
  }
}

class UsageFileItem extends vscode.TreeItem {
  iconPath = vscode.ThemeIcon.File
  collapsibleState = vscode.TreeItemCollapsibleState.Expanded

  constructor(
    override readonly resourceUri: vscode.Uri,
    dir: string,
    usageCount: number
  ) {
    super(resourceUri)
    this.description = `${dir} (${usageCount})`
  }
}

class UsageItem extends vscode.TreeItem {
  constructor(uri: vscode.Uri, range: vscode.Range, text: string) {
    super(text.trim())
    this.description = `Line ${range.start.line + 1}`
    this.iconPath = new vscode.ThemeIcon("references")
    this.command = {
      command: "css-viewer.openUsage",
      title: "Open Usage",
      arguments: [uri, range],
    }
  }
}
