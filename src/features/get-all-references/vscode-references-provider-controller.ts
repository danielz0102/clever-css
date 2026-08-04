import * as vscode from "vscode"

import type { GetAllReferences } from "./get-all-references-query-handler"

export function createFindReferencesProvider(getReferences: GetAllReferences) {
  return vscode.languages.registerReferenceProvider(
    { pattern: "**/*.css", scheme: "file" },
    {
      async provideReferences(document, position) {
        const wordRange = document.getWordRangeAtPosition(position)
        if (!wordRange) return

        const word = (() => {
          const w = document.getText(wordRange)
          return w.startsWith(".") ? w.substring(1) : w
        })()

        const references = getReferences
          .execute(word)
          //* Built-in reference provider already includes references from the current file,
          //* so we filter them out to avoid duplicates
          .filter((r) => r.uri !== document.uri.fsPath)

        return references.map(
          (l) =>
            new vscode.Location(
              vscode.Uri.file(l.uri),
              new vscode.Range(l.start.line, l.start.column, l.end.line, l.end.column)
            )
        )
      },
    }
  )
}
