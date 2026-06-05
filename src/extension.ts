import * as vscode from "vscode"
import { ClassDataProvider } from "./class-data-provider"

export function activate(context: vscode.ExtensionContext) {
  const openClassCommand = vscode.commands.registerCommand(
    "css-viewer.openClass",
    async (uri: vscode.Uri, range: vscode.Range) => {
      const document = await vscode.workspace.openTextDocument(uri)
      const editor = await vscode.window.showTextDocument(document, { preview: false })
      editor.revealRange(range, vscode.TextEditorRevealType.InCenter)
      editor.selection = new vscode.Selection(range.start, range.start)
    }
  )
  context.subscriptions.push(openClassCommand)

  vscode.window.registerTreeDataProvider("classes", new ClassDataProvider())
}

export function deactivate() {}
