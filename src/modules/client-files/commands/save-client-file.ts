import * as vscode from "vscode"

import type { CSSClassRepository } from "../../../domain/css-class-repository"
import type { CssClassIndex } from "../../../persistence/class-index"
import type { ClientFileParser } from "../adapters/parsers/client-file-parser"

export class SaveClientFile {
  constructor(
    private classes: CSSClassRepository,
    private parser: ClientFileParser
  ) {}

  async execute(uri: vscode.Uri): Promise<void> {
    this.classes.getAll().forEach((c) => c.removeUsage(uri))

    const usages = this.parser.getUsagesFrom(uri.fsPath)

    usages.forEach(({ name, start, end }) => {
      const cssClass = this.classes.get(name)

      if (cssClass) {
        cssClass.addUsage(
          new vscode.Location(uri, new vscode.Range(start.line, start.column, end.line, end.column))
        )
      }
    })
  }
}

export class SaveClientFileV2 {
  constructor(
    private index: CssClassIndex,
    private parser: ClientFileParser
  ) {}

  async execute(uri: string): Promise<void> {
    for (const record of this.index.values()) {
      record.usages = record.usages.filter((u) => u.uri !== uri)
    }

    const usages = this.parser.getUsagesFrom(uri)

    usages.forEach(({ name, start, end }) => {
      const record = this.index.get(name)
      if (record) {
        record.usages.push({ uri, start, end })
      }
    })
  }
}
