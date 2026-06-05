import * as csstree from "css-tree"

export type CSSClass = {
  name: string
  start: CSSClassPosition
  end: CSSClassPosition
}

type CSSClassPosition = {
  line: number
  column: number
}

export async function parseCSSClasses(stylesheet: string): Promise<CSSClass[]> {
  const ast = csstree.parse(stylesheet, { positions: true })
  const classes: CSSClass[] = []

  csstree.walk(ast, {
    visit: "ClassSelector",
    enter(node) {
      if (!node.loc) return

      classes.push({
        name: node.name,
        start: node.loc.start,
        end: node.loc.end,
      })
    },
  })

  return classes
}
