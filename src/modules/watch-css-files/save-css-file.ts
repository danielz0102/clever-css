import * as vscode from "vscode"

import type { CSSClassRepository } from "../../domain/css-class-repository"
import { parseCSSClassSymbols } from "../../lib/css-parser"

export async function saveCSSFile(classes: CSSClassRepository, uri: vscode.Uri): Promise<void> {
  classes.deleteFromFile(uri)
  const newClasses = await parseCSSClassSymbols(uri)
  newClasses.forEach((c) => classes.add(c.className, c.location))
}
