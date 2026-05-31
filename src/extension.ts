import * as vscode from "vscode"

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "css-viewer" is now active!')

  const disposable = vscode.commands.registerCommand("css-viewer.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from css-viewer!")
  })

  context.subscriptions.push(disposable)
}

export function deactivate() {}
