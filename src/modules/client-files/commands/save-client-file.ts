import * as vscode from "vscode"

import type { CSSClassRepository } from "../../../domain/css-class-repository"
import type { ClientFileParser } from "../adapters/parsers/client-file-parser"

export class SaveClientFile {
  constructor(
    private classes: CSSClassRepository,
    private parser: ClientFileParser
  ) {}

  async execute(uri: vscode.Uri): Promise<void> {
    this.classes.getAll().forEach((c) => c.removeUsage(uri))

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
  }
}
