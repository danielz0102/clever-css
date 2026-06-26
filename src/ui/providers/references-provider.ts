import * as vscode from "vscode"

import type { CssClassIndex } from "../../persistence/class-index"

export function createFindReferencesProvider(index: CssClassIndex) {
  return vscode.languages.registerReferenceProvider(
    { pattern: "**/*.css", scheme: "file" },
    {
      async provideReferences(document, position) {
        const wordRange = document.getWordRangeAtPosition(position)
        if (!wordRange) return

        const word = document.getText(wordRange)
        const className = word.substring(1)

        const cssClass = index.get(className)
        if (!cssClass) return

        return cssClass.usages.map(
          (location) =>
            new vscode.Location(
              vscode.Uri.file(location.uri),
              new vscode.Range(
                location.start.line,
                location.start.column,
                location.end.line,
                location.end.column
              )
            )
        )
      },
    }
  )
}
