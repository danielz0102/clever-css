import * as vscode from "vscode"

import type { CSSClassRepository } from "../../../domain/css-class-repository"
import type { ClientFileParser } from "../adapters/parsers/client-file-parser"

export class LoadUsages {
  constructor(
    private classes: CSSClassRepository,
    private parser: ClientFileParser
  ) {}

  async execute(): Promise<void> {
    const files = await vscode.workspace.findFiles("**/*.{jsx,tsx}", "**/node_modules/**")

    await Promise.all(
      files.map(async (uri) => {
        const usages = this.parser.getUsagesFrom(uri.fsPath)

        usages.forEach(({ name, start, end }) => {
          const cssClass = this.classes.get(name)

          if (cssClass) {
            cssClass.addUsage(
              new vscode.Location(
                uri,
                new vscode.Range(start.line, start.column, end.line, end.column)
              )
            )
          }
        })
      })
    )
  }
}
