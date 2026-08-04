import * as vscode from "vscode"

import { isClassNameValue } from "../../adapters/client-file-parser"
import { parseCssClassRule } from "../../adapters/css-parser"
import type { CssFileDto } from "../../dtos/css-file-dto"
import { CLIENT_FILE_EXTENSIONS, toGlobPattern } from "../../shared/client-file-extensions"
import { GetDefinition } from "../get-definition/get-definition-query-handler"
import { SearchClasses } from "./search-classes-query-handler"

export function createCompletionProvider(
  searchClasses: SearchClasses,
  getDefinition: GetDefinition
) {
  return vscode.languages.registerCompletionItemProvider(
    {
      pattern: toGlobPattern(CLIENT_FILE_EXTENSIONS),
      scheme: "file",
    },
    {
      provideCompletionItems(document, position) {
        const range = document.getWordRangeAtPosition(position, /[\w-]+/)
        if (!range) {
          return
        }

        const file: CssFileDto = {
          uri: document.uri.fsPath,
          content: document.getText(),
        }

        if (!isClassNameValue(file, range)) {
          return
        }

        const classesFound = searchClasses.execute(document.getText(range))
        return classesFound.map(({ className }) => {
          const item = new vscode.CompletionItem(className, vscode.CompletionItemKind.Text)
          item.range = range
          return item
        })
      },
      async resolveCompletionItem(item) {
        const label = typeof item.label === "string" ? item.label : item.label.label
        const definition = getDefinition.execute(label)
        if (!definition) {
          return item
        }

        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(definition.uri))
        const rule = parseCssClassRule(doc.getText(), label)
        if (!rule) {
          return item
        }

        item.documentation = new vscode.MarkdownString(`\`\`\`css\n${rule}\n\`\`\``)
        return item
      },
    },
    "-",
    " "
  )
}
