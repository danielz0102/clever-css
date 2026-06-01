import * as csstree from "css-tree"

export async function parseCSSClasses(stylesheet: string): Promise<string[]> {
  const ast = csstree.parse(stylesheet)
  const classes: string[] = []

  csstree.walk(ast, {
    visit: "ClassSelector",
    enter(node) {
      classes.push(node.name)
    },
  })

  return classes
}
