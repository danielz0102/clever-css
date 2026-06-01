import * as vscode from "vscode"
import { ClassDataProvider } from "./class-data-provider"

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("css-viewer.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from css-viewer!")
  })

  context.subscriptions.push(disposable)
  vscode.window.registerTreeDataProvider("classes", new ClassDataProvider())
}

export function deactivate() {}
