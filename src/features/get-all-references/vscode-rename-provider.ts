import * as vscode from "vscode"

import { CLIENT_FILE_EXTENSIONS, toGlobPattern } from "../../shared/client-file-extensions"
import type { GetAllReferences } from "./get-all-references-query-handler"

export function createRenameProvider(getAllReferences: GetAllReferences) {
  const filesThatCanRename = [...CLIENT_FILE_EXTENSIONS, "css"]

  return vscode.languages.registerRenameProvider(
    { pattern: toGlobPattern(filesThatCanRename), scheme: "file" },
    {
      async provideRenameEdits(document, position, newName) {
        const wordRange = getWordRange(document, position)
        if (!wordRange) {
          return
        }

        const oldName = document.getText(wordRange)
        const uri = document.uri.fsPath
        const isDefinition = uri.endsWith(".css") && oldName.startsWith(".")
        const isUsage = !uri.endsWith(".css") && !oldName.startsWith(".")

        if (!isDefinition && !isUsage) {
          return
        }

        const edits = new vscode.WorkspaceEdit()
        const references = getAllReferences.execute(normalizeClassName(oldName))

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

function getWordRange(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Range | undefined {
  const uri = document.uri.fsPath

  if (uri.endsWith(".css")) {
    return document.getWordRangeAtPosition(position)
  }

  return document.getWordRangeAtPosition(position, /[\w-]+/)
}
