import * as vscode from "vscode"

import type { ClassAnalyzer } from "./get-unused-classes-query-handler"

export class Diagnostics implements vscode.Disposable {
  private collection = vscode.languages.createDiagnosticCollection("clever-css")

  constructor(private readonly analyzer: ClassAnalyzer) {}

  refresh(): void {
    const unusedClasses = this.analyzer.getUnused()
    const diagnosticsByFile = new Map<string, vscode.Diagnostic[]>()

    for (const cls of unusedClasses) {
      for (const definition of cls.definitions) {
        const diagnostic = new vscode.Diagnostic(
          new vscode.Range(
            new vscode.Position(definition.start.line, definition.start.column),
            new vscode.Position(definition.end.line, definition.end.column)
          ),
          "This class is not being used anywhere in the workspace",
          vscode.DiagnosticSeverity.Warning
        )
        const existing = diagnosticsByFile.get(definition.uri) ?? []
        existing.push(diagnostic)
        diagnosticsByFile.set(definition.uri, existing)
      }
    }

    this.collection.clear()

    for (const [uri, diagnostics] of diagnosticsByFile) {
      this.collection.set(vscode.Uri.parse(uri), diagnostics)
    }
  }

  dispose(): void {
    this.collection.dispose()
  }
}
