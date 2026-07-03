import * as vscode from "vscode"

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
      command: "cleverCss.openClass",
      title: "Open Class",
      arguments: [fileUri, range],
    }
  }
}
