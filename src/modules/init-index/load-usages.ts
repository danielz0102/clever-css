import * as vscode from "vscode"

import type { CSSClassRepository } from "../../domain/css-class-repository"
import { ClientFileParser } from "../../shared/client-file-parser"

export class LoadUsages {
  private parser = new ClientFileParser()

  constructor(private classes: CSSClassRepository) {}

  async execute(): Promise<void> {
    const files = await vscode.workspace.findFiles("**/*.{jsx,tsx}", "**/node_modules/**")

    await Promise.all(
      files.map(async (uri) => {
        const document = await vscode.workspace.openTextDocument(uri)
        const usages = this.parser.getUsagesFrom(document.fileName)

        usages.forEach(({ name, start, end }) => {
          const cssClass = this.classes.get(name)

          if (cssClass) {
            cssClass.addUsage(
              new vscode.Location(
                uri,
                new vscode.Range(document.positionAt(start), document.positionAt(end))
              )
            )
          }
        })
      })
    )
  }
}
