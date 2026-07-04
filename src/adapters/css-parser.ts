import * as csstree from "css-tree"

import type { Position } from "../domain/location"
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

/**
 * Converts a 1-based position to a 0-based position.
 * @param position The 1-based position to convert.
 * @returns The converted 0-based position.
 */
function toZeroBased(position: Position): Position {
  return {
    line: position.line - 1,
    column: position.column - 1,
  }
}
