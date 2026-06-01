import * as vscode from "vscode"

export class ClassDataProvider implements vscode.TreeDataProvider<ClassItem> {
  getTreeItem(element: ClassItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }

  getChildren(element?: ClassItem): vscode.ProviderResult<ClassItem[]> {
    if (element) {
      return [new ClassItem("Class 1"), new ClassItem("Class 2"), new ClassItem("Class 3")]
    }

    return [new ClassItem("Class 1"), new ClassItem("Class 2"), new ClassItem("Class 3")]
  }
}

class ClassItem extends vscode.TreeItem {
  iconPath?: vscode.IconPath = new vscode.ThemeIcon("symbol-class")
}
