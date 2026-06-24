import * as vscode from "vscode"

import type { CSSClassRepository } from "../../../domain/css-class-repository"
import type { CSSClassIndex } from "../../../persistence/class-index"
import { parseCSSClassSymbols } from "../css-parser"
import type { CSSFileDTO } from "../dtos/css-file"
import { readCSSFileUri } from "../lib/read-css-uri"

export class SaveCSSFile {
  constructor(private classes: CSSClassRepository) {}

  async execute(uri: vscode.Uri): Promise<void> {
    this.classes.deleteFromFile(uri)
    const newClasses = await readCSSFileUri(uri)
    newClasses.forEach((c) => this.classes.add(c.className, c.location))
  }
}

export class SaveCSSFileV2 {
  constructor(private index: CSSClassIndex) {}

  async execute(file: CSSFileDTO): Promise<void> {
    const symbols = await parseCSSClassSymbols(file.content)
    const foundClasses = symbols.map((c) => c.className)

    for (const [className, data] of this.index.entries()) {
      if (
        data.definitions.some((def) => def.uri === file.uri) &&
        !foundClasses.includes(className)
      ) {
        data.definitions = data.definitions.filter((def) => def.uri !== file.uri)
      }
    }
  }
}
