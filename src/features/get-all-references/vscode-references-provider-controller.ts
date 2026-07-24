import * as vscode from "vscode"

import type { GetAllReferences } from "./get-all-references-query-handler"

export function createFindReferencesProvider(getReferences: GetAllReferences) {
  return vscode.languages.registerReferenceProvider(
    { pattern: "**/*.css", scheme: "file" },
    {
      async provideReferences(document, position) {
        const wordRange = document.getWordRangeAtPosition(position)

        if (!wordRange) return

        let references = getReferences.execute(document.getText(wordRange).substring(1))

        for (const ref of references) {
          const isSeletedClass = ref.uri === document.uri.fsPath && ref.start.line === position.line
          if (isSeletedClass) {
            references = references.filter((r) => r !== ref)
            break
          }
        }

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
