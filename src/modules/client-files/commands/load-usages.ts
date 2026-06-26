import * as vscode from "vscode"

import type { CSSClassRepository } from "../../../domain/css-class-repository"
import type { CssClassIndex } from "../../../persistence/class-index"
import type { ClientFileFinder } from "../adapters/client-file-finder/client-file-finder"
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

export class LoadUsagesV2 {
  constructor(
    private index: CssClassIndex,
    private parser: ClientFileParser,
    private clientFiles: ClientFileFinder
  ) {}

  async execute(): Promise<void> {
    this.clearUsages()

    const files = await this.clientFiles.find()

    for (const filePath of files) {
      const usages = this.parser.getUsagesFrom(filePath)

      for (const { name, start, end } of usages) {
        const record = this.index.get(name)
        if (record) {
          record.usages.push({ uri: filePath, start, end })
        }
      }
    }
  }

  private clearUsages() {
    for (const record of this.index.values()) {
      record.usages = []
    }
  }
}
