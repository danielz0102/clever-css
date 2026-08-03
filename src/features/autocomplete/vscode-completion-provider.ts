import { Lang, parse, type NapiConfig } from "@ast-grep/napi"
import type { TypesMap } from "@ast-grep/napi/types/staticTypes"
import * as vscode from "vscode"

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
  const extension = file.uri.split(".").pop()
  if (!extension) {
    throw new Error(`File ${file.uri} has no extension`)
  }

  const strategy = selectStrategy(extension)
  const ast = parse(strategy.lang, file.content)
  const nodes = ast.root().findAll(strategy.matcher)

  return nodes.some((n) => {
    return new vscode.Range(
      new vscode.Position(n.range().start.line, n.range().start.column),
      new vscode.Position(n.range().end.line, n.range().end.column)
    ).contains(range)
  })
}

function selectStrategy(extension: string): ParserStrategy {
  switch (extension) {
    case "jsx":
    case "tsx":
      return JsxStrategy
    case "html":
      return HtmlStrategy
    default:
      throw new Error(`No parser strategy found for extension ${extension}`)
  }
}

type ParserStrategy = {
  lang: Lang
  matcher: NapiConfig<TypesMap>
}

const JsxStrategy: ParserStrategy = {
  lang: Lang.Tsx,
  matcher: {
    rule: {
      kind: "string_fragment",
      inside: {
        kind: "jsx_attribute",
        has: {
          kind: "property_identifier",
          regex: "^className$",
        },
        stopBy: "end",
      },
    },
  },
}

const HtmlStrategy: ParserStrategy = {
  lang: Lang.Html,
  matcher: {
    rule: {
      kind: "attribute_value",
      inside: {
        kind: "attribute",
        has: {
          kind: "attribute_name",
          regex: "^class$",
        },
        stopBy: "end",
      },
    },
  },
}

function parseCssClassRule(text: string, className: string): string | undefined {
  const ast = parse(Lang.Css, text)
  const rule = ast.root().find(`.${className} {$$$}`)

  if (!rule) {
    return
  }

  return rule.text()
}
