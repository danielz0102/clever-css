import * as csstree from "css-tree"

import type { Location } from "../domain/location"
import type { CssFileDto } from "../dtos/css-file-dto"

export type CssClassParser = (file: CssFileDto) => Promise<CssClassSymbol[]>

export type CssClassSymbol = {
  className: string
  location: Location
}

export const parseCssClassSymbols: CssClassParser = async (file: CssFileDto) => {
  const ast = csstree.parse(file.content, { positions: true })
  const classes: CssClassSymbol[] = []

  csstree.walk(ast, {
    visit: "ClassSelector",
    enter(node) {
      if (!node.loc) return

      classes.push({
        className: node.name,
        location: { uri: file.uri, start: node.loc.start, end: node.loc.end },
      })
    },
  })

  return classes
}
