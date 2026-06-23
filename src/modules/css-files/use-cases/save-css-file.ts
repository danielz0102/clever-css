import * as vscode from "vscode"

import type { CSSClassRepository } from "../../../domain/css-class-repository"
import { readCSSFileUri } from "../lib/read-css-uri"

export class SaveCSSFile {
  constructor(private classes: CSSClassRepository) {}

  async execute(uri: vscode.Uri): Promise<void> {
    this.classes.deleteFromFile(uri)
    const newClasses = await readCSSFileUri(uri)
    newClasses.forEach((c) => this.classes.add(c.className, c.location))
  }
}
