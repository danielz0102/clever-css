import * as vscode from "vscode"

import type { ClassAnalyzer } from "./class-analyzer"

export class Diagnostics implements vscode.Disposable {
  private collection = vscode.languages.createDiagnosticCollection("clever-css")
  private enabled = true

  constructor(private readonly analyzer: ClassAnalyzer) {}

  enable(): void {
    this.enabled = true
    this.refresh()
  }

  disable(): void {
    this.enabled = false
    this.collection.clear()
  }

  refresh(): void {
    if (!this.enabled) {
      this.collection.clear()
      return
    }

    const unusedClasses = this.analyzer.getUnused()
    const duplicatedClasses = this.analyzer.getDuplicated()
    const diagnosticsByFile = new Map<string, vscode.Diagnostic[]>()

    for (const cls of unusedClasses) {
      for (const definition of cls.definitions) {
        const diagnostic = new vscode.Diagnostic(
          new vscode.Range(
            new vscode.Position(definition.start.line, definition.start.column),
            new vscode.Position(definition.end.line, definition.end.column)
          ),
          `Class ".${cls.className}" is defined but never used`,
          vscode.DiagnosticSeverity.Warning
        )
        const existing = diagnosticsByFile.get(definition.uri) ?? []
        existing.push(diagnostic)
        diagnosticsByFile.set(definition.uri, existing)
      }
    }

    for (const cls of duplicatedClasses) {
      for (const definition of cls.definitions) {
        const diagnostic = new vscode.Diagnostic(
          new vscode.Range(
            new vscode.Position(definition.start.line, definition.start.column),
            new vscode.Position(definition.end.line, definition.end.column)
          ),
          `Class ".${cls.className}" is duplicated in ${cls.definitions.length} locations`,
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
