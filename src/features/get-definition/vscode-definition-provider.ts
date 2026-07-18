import * as vscode from "vscode"

import { CLIENT_FILE_EXTENSIONS, toGlobPattern } from "../../shared/client-file-extensions"
import type { GetDefinition } from "./get-definition-query-handler"

export function createDefinitionProvider(getSelector: GetDefinition) {
  return vscode.languages.registerDefinitionProvider(
    {
      pattern: toGlobPattern(CLIENT_FILE_EXTENSIONS),
      scheme: "file",
    },
    {
      async provideDefinition(document, position) {
        const range = document.getWordRangeAtPosition(position, /[\w-]+/)
        if (!range) {
          return
        }

        const className = document.getText(range)
        const definition = await getSelector.execute(className)
        if (!definition) {
          return
        }

        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(definition.uri))
        return new vscode.Location(
          doc.uri,
          new vscode.Range(
            definition.start.line,
            definition.start.column,
            definition.end.line,
            definition.end.column
          )
        )
      },
    }
  )
}
