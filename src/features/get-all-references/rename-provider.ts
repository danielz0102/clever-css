import * as vscode from "vscode"

import type { GetAllReferences } from "./get-all-references-query-handler"

export function createRenameProvider(getAllReferences: GetAllReferences) {
  return vscode.languages.registerRenameProvider(
    { pattern: "**/*.css", scheme: "file" },
    {
      async provideRenameEdits(document, position, newName) {
        const wordRange = document.getWordRangeAtPosition(position)
        if (!wordRange) {
          throw new Error("No range found at the given position")
        }

        const oldName = document.getText(wordRange).substring(1)
        const edits = new vscode.WorkspaceEdit()
        const references = await getAllReferences.execute(oldName)

        references.forEach((ref) => {
          const uri = vscode.Uri.file(ref.uri)
          const range = new vscode.Range(
            ref.start.line,
            ref.start.column,
            ref.end.line,
            ref.end.column
          )
          edits.replace(uri, range, normalizeClassName(newName))
        })

        return edits
      },
    }
  )
}

function normalizeClassName(className: string) {
  if (className.startsWith(".")) {
    return className.substring(1)
  }
  return className
}
