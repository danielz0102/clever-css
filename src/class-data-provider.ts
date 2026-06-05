import * as vscode from "vscode"
import { parseCSSClasses } from "./parse-css-classes"

export class ClassDataProvider implements vscode.TreeDataProvider<ClassItem> {
  getTreeItem(element: ClassItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }

  async getChildren(item?: ClassItem | FileItem): Promise<ClassItem[] | FileItem[]> {
    if (item instanceof ClassItem) {
      return []
    }

    if (item instanceof FileItem) {
      const content = await this.getCSSFileContent(item.resourceUri)
      const classes = await parseCSSClasses(content)
      return classes.map((c) => new ClassItem(`.${c}`))
    }

    const fileURIs = await this.getCSSFilesURIs()
    return fileURIs.map((uri) => new FileItem(uri))
  }

  private async getCSSFileContent(file: vscode.Uri): Promise<string> {
    const content = await vscode.workspace.fs.readFile(file)
    return content.toString()
  }

  private async getCSSFilesURIs(): Promise<vscode.Uri[]> {
    return await vscode.workspace.findFiles("**/*.css", "**/node_modules/**")
  }
}

class FileItem extends vscode.TreeItem {
  constructor(override readonly resourceUri: vscode.Uri) {
    super(resourceUri)
  }

  iconPath = vscode.ThemeIcon.File
  collapsibleState = vscode.TreeItemCollapsibleState.Expanded
}

class ClassItem extends vscode.TreeItem {
  iconPath?: vscode.IconPath = new vscode.ThemeIcon("symbol-class")
}
