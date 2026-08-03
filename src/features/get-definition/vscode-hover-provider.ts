import { parseAsync, Lang } from "@ast-grep/napi"
import * as vscode from "vscode"

import type { CssFileDto } from "../../dtos/css-file-dto"
import { CLIENT_FILE_EXTENSIONS, toGlobPattern } from "../../shared/client-file-extensions"
import { isClassNameValue } from "../autocomplete/vscode-completion-provider"
import type { GetDefinition } from "./get-definition-query-handler"

export function createHoverProvider(getSelector: GetDefinition) {
  return vscode.languages.registerHoverProvider(
    {
      pattern: toGlobPattern(CLIENT_FILE_EXTENSIONS),
      scheme: "file",
    },
    {
      async provideHover(document, position) {
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

        const className = document.getText(range)
        const definition = getSelector.execute(className)
        if (!definition) {
          return
        }

        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(definition.uri))
        const rule = await parseCssClassRule(doc.getText(), className)
        return new vscode.Hover(`\`\`\`css\n${rule}\n\`\`\``, range)
      },
    }
  )
}

async function parseCssClassRule(text: string, className: string): Promise<string> {
  const ast = await parseAsync(Lang.Css, text)
  const rule = ast.root().find(`.${className} {$$$}`)

  if (!rule) {
    throw new Error(`${className} class rule not found in file ${text}`)
  }

  return rule.text()
}
