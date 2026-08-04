import { Lang, parse, type NapiConfig } from "@ast-grep/napi"
import type { TypesMap } from "@ast-grep/napi/types/staticTypes"
import * as vscode from "vscode"

import type { CssFileDto } from "../dtos/css-file-dto"
import type { Token } from "../dtos/token-dto"

export function parseUsagesFrom(file: CssFileDto): Token[] {
  const extension = file.uri.split(".").pop()
  if (!extension) {
    throw new Error(`File ${file.uri} has no extension`)
  }

  const strategy = selectStrategy(extension)
  const ast = parse(strategy.lang, file.content)
  const nodes = ast.root().findAll(strategy.matcher)

  return nodes.flatMap((node) => {
    const classes = node.getMatch("CLASSES")
    if (!classes) return []

    const range = classes.range()
    return Array.from(classes.text().matchAll(/\S+/g)).map((match) => {
      const name = match[0]
      const startCol = range.start.column + match.index

      return {
        name,
        location: {
          uri: file.uri,
          start: {
            line: range.start.line,
            column: startCol,
          },
          end: {
            line: range.end.line,
            column: startCol + name.length,
          },
        },
      }
    })
  })
}

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
      pattern: "$CLASSES",
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
      pattern: "$CLASSES",
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
