import * as csstree from "css-tree"

import type { CssFileDto } from "../dtos/css-file-dto"
import type { Token } from "../dtos/token-dto"

export type CssClassParser = (file: CssFileDto) => Promise<Token[]>

export const parseCssClassTokens: CssClassParser = async (file: CssFileDto) => {
  const ast = csstree.parse(file.content, { positions: true })
  const symbols: Token[] = []

  csstree.walk(ast, {
    visit: "ClassSelector",
    enter(node) {
      if (!node.loc) return

      symbols.push({
        name: node.name,
        location: { uri: file.uri, start: node.loc.start, end: node.loc.end },
      })
    },
  })

  return symbols
}
