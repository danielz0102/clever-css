import * as csstree from "css-tree"

export type CssClassParser = (content: string) => Promise<CssClassSymbol[]>

export type CssClassSymbol = {
  className: string
  location: {
    start: {
      line: number
      column: number
    }
    end: {
      line: number
      column: number
    }
  }
}

export const parseCssClassSymbols: CssClassParser = async (content: string) => {
  const ast = csstree.parse(content, { positions: true })
  const classes: CssClassSymbol[] = []

  csstree.walk(ast, {
    visit: "ClassSelector",
    enter(node) {
      if (!node.loc) return

      classes.push({
        className: node.name,
        location: { start: node.loc.start, end: node.loc.end },
      })
    },
  })

  return classes
}
