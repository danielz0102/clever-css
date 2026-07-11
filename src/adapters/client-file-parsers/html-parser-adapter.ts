import { readFileSync } from "node:fs"

import { Lang, parse } from "@ast-grep/napi"

import type { Token } from "../../dtos/token-dto"
import type { ClientFileParser } from "./client-file-parser-port"

export class HtmlParser implements ClientFileParser {
  parseUsagesFrom(uri: string): Token[] {
    const content = readFileSync(uri, "utf-8")
    const ast = parse(Lang.Html, content)
    const nodes = ast.root().findAll('<$TAG class="$CLASSES">$$$</$TAG>')

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
            uri,
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
}
