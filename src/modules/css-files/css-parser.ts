import * as csstree from "css-tree"

export type CSSClassSymbol = {
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

export async function parseCSSClassSymbols(content: string): Promise<CSSClassSymbol[]> {
  const ast = csstree.parse(content, { positions: true })
  const classes: CSSClassSymbol[] = []

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
