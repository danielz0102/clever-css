import { Lang, parse } from "@ast-grep/napi"
import * as vscode from "vscode"

import { parseUsagesFrom } from "../../adapters/client-file-parser"
import type { CssFileDto } from "../../dtos/css-file-dto"
import type { CssClassIndex } from "../../persistence/css-class-index"
import { CLIENT_FILE_EXTENSIONS, toGlobPattern } from "../../shared/client-file-extensions"

export function createCompletionProvider(classes: CssClassIndex) {
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

        const completions = Array.from(classes.entries()).filter(([className, model]) => {
          return className.includes(document.getText(range)) && model.definitions.length > 0
        })

        return completions.map(([className]) => {
          const item = new vscode.CompletionItem(className, vscode.CompletionItemKind.Text)
          item.range = range
          return item
        })
      },
      async resolveCompletionItem(item) {
        const label = typeof item.label === "string" ? item.label : item.label.label
        const definition = classes.get(label)?.definitions[0]
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

//TODO: Move this function to a shared folder
export function isClassNameValue(file: CssFileDto, range: vscode.Range): boolean {
  const tokens = parseUsagesFrom(file)
  return tokens.some(({ location }) => {
    return new vscode.Range(
      location.start.line,
      location.start.column,
      location.end.line,
      location.end.column
    ).contains(range)
  })
}

function parseCssClassRule(text: string, className: string): string | undefined {
  const ast = parse(Lang.Css, text)
  const rule = ast.root().find(`.${className} {$$$}`)

  if (!rule) {
    return
  }

  return rule.text()
}
