import * as vscode from "vscode"

import type { CSSClassRepository } from "../../domain/css-class-repository"
import { parseCSSClassSymbols } from "../../shared/css-parser"

export class SaveCSSFile {
  constructor(private classes: CSSClassRepository) {}

  async execute(uri: vscode.Uri): Promise<void> {
    this.classes.deleteFromFile(uri)
    const newClasses = await parseCSSClassSymbols(uri)
    newClasses.forEach((c) => this.classes.add(c.className, c.location))
  }
}
