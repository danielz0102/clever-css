import * as vscode from "vscode"

import type { GetAllReferences } from "./get-all-references-query-handler"

/**
 * Built-in reference provider only includes definitions from the active file.
 * This function augments the built-in reference provider to include definitions
 * from other CSS files, as well as class usages in client files (HTML, JSX, etc.).
 */
export function createFindReferencesProvider(getReferences: GetAllReferences) {
  return vscode.languages.registerReferenceProvider(
    { pattern: "**/*.css", scheme: "file" },
    {
      async provideReferences(document, position) {
        const wordRange = document.getWordRangeAtPosition(position)
        if (!wordRange) return

        const word = document.getText(wordRange)
        const references = getReferences
          .execute(word.startsWith(".") ? word.substring(1) : word)
          //* Workaround: Filtering out references from the current document
          //* Built-in refernce provider should include them
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
