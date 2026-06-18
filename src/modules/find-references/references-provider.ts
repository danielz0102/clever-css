import * as vscode from "vscode"

import type { CSSClassRepository } from "../../domain/css-class-repository"
import { FindReferences } from "./find-references"

export function createFindReferencesProvider(classes: CSSClassRepository) {
  return vscode.languages.registerReferenceProvider(
    { pattern: "**/*.css", scheme: "file" },
    {
      async provideReferences(document, position) {
        const wordRange = document.getWordRangeAtPosition(position)
        if (!wordRange) return

        const word = document.getText(wordRange)
        const className = word.substring(1)

        const findReferences = new FindReferences(classes)
        return await findReferences.execute(className)
      },
    }
  )
}
