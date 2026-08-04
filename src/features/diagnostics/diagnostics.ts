import * as vscode from "vscode"

import type { CssClassRepository } from "../../adapters/css-class-repository"
import type { DiagnosticsConfig } from "../../ui/configuration"
import { ClassAnalyzer } from "./class-analyzer"

export class Diagnostics implements vscode.Disposable {
  private collection = vscode.languages.createDiagnosticCollection("clever-css")

  private constructor(
    private readonly analyzer: ClassAnalyzer,
    private config: DiagnosticsConfig = {
      unusedClasses: true,
      duplicatedClasses: true,
    }
  ) {}

  static create(classes: CssClassRepository, config?: DiagnosticsConfig) {
    const diagnostics = new Diagnostics(new ClassAnalyzer(classes), config)
    diagnostics.refresh()
    return diagnostics
  }

  updateConfig(c: DiagnosticsConfig) {
    this.config = c
    this.refresh()
  }

  refresh(): void {
    const diagnosticsByFile = new Map<string, vscode.Diagnostic[]>()

    if (this.config.unusedClasses) {
      const unusedClasses = this.analyzer.getUnused()
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
    }

    if (this.config.duplicatedClasses) {
      const duplicatedClasses = this.analyzer.getDuplicated()
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
