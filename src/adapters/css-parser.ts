import * as csstree from "css-tree"

import type { CssFileDto } from "../dtos/css-file-dto"
import type { Symbol } from "../dtos/symbol-dto"

export type CssClassParser = (file: CssFileDto) => Promise<Symbol[]>

export const parseCssClassSymbols: CssClassParser = async (file: CssFileDto) => {
  const ast = csstree.parse(file.content, { positions: true })
  const symbols: Symbol[] = []

  csstree.walk(ast, {
    visit: "ClassSelector",
    enter(node) {
      if (!node.loc) return

      symbols.push({
        className: node.name,
        location: { uri: file.uri, start: node.loc.start, end: node.loc.end },
      })
    },
  })

  return symbols
}
