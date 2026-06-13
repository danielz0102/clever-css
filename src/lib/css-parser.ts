import * as csstree from "css-tree"

export type CSSClassSymbol = {
  className: string
  location: csstree.CssLocation
}

export async function parseCSSClassSymbols(stylesheet: string): Promise<CSSClassSymbol[]> {
  const ast = csstree.parse(stylesheet, { positions: true })
  const classes: CSSClassSymbol[] = []

  csstree.walk(ast, {
    visit: "ClassSelector",
    enter(node) {
      if (!node.loc) return
      classes.push({ className: node.name, location: node.loc })
    },
  })

  return classes
}
