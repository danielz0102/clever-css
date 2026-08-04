import * as vscode from "vscode"

export type DiagnosticsConfig = {
  unusedClasses: boolean
  duplicatedClasses: boolean
}

export class Configuration {
  get diagnostics(): DiagnosticsConfig {
    const config = vscode.workspace.getConfiguration("clever-css")

    return config.get<DiagnosticsConfig>("diagnostics", {
      duplicatedClasses: true,
      unusedClasses: true,
    })
  }

  onChange(cb: (config: { diagnostics: DiagnosticsConfig }) => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("clever-css.diagnostics")) {
        cb({ diagnostics: this.diagnostics })
      }
    })
  }
}
