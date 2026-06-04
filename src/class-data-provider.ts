import * as vscode from "vscode"
import { parseCSSClasses } from "./parse-css-classes"

export class ClassDataProvider implements vscode.TreeDataProvider<ClassItem> {
  getTreeItem(element: ClassItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }

  async getChildren(element?: ClassItem): Promise<ClassItem[]> {
    if (element) {
      return [new ClassItem("Class 1"), new ClassItem("Class 2"), new ClassItem("Class 3")]
    }

    const cssFiles = await this.getCSSFiles()
    const classes = await this.getCSSClasses(cssFiles)

    return classes.map((c) => new ClassItem(`.${c}`))
  }

  private async getCSSFiles(): Promise<vscode.Uri[]> {
    return await vscode.workspace.findFiles("**/*.css", "**/node_modules/**")
  }

  private async getCSSClasses(files: vscode.Uri[]): Promise<string[]> {
    const classesPromises = files.map(async (file) => {
      const content = await this.getCSSFileContent(file)
      return await parseCSSClasses(content)
    })
    return await Promise.all(classesPromises).then((r) => r.flat())
  }

  private async getCSSFileContent(file: vscode.Uri): Promise<string> {
    const content = await vscode.workspace.fs.readFile(file)
    return content.toString()
  }
}

class ClassItem extends vscode.TreeItem {
  iconPath?: vscode.IconPath = new vscode.ThemeIcon("symbol-class")
}
