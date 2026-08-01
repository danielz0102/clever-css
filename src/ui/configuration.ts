import * as vscode from "vscode"

export class Configuration {
  get diagnosticsEnabled(): boolean {
    return vscode.workspace.getConfiguration("clever-css").get<boolean>("diagnostics.enabled", true)
  }

  onChange(cb: (config: { diagnositcsEnabled: boolean }) => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("clever-css.diagnostics.enabled")) {
        cb({ diagnositcsEnabled: this.diagnosticsEnabled })
      }
    })
  }
}
