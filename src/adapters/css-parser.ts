import * as csstree from "css-tree"

import type { CssFileDto } from "../dtos/css-file-dto"
import type { Token } from "../dtos/token-dto"
import { toZeroBased } from "../shared/to-zero-based"

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
        location: {
          uri: file.uri,
          start: toZeroBased(node.loc.start),
          end: toZeroBased(node.loc.end),
        },
      })
    },
  })

  return symbols
}
