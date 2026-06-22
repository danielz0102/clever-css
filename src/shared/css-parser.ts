import * as csstree from "css-tree"
import * as vscode from "vscode"

export type CSSClassSymbol = {
  className: string
  location: vscode.Location
}

export async function parseCSSClassSymbols(uri: vscode.Uri): Promise<CSSClassSymbol[]> {
  const doc = await vscode.workspace.openTextDocument(uri)
  const ast = csstree.parse(doc.getText(), { positions: true })
  const classes: CSSClassSymbol[] = []

  csstree.walk(ast, {
    visit: "ClassSelector",
    enter(node) {
      if (!node.loc) return

      classes.push({
        className: node.name,
        location: new vscode.Location(
          uri,
          new vscode.Position(node.loc.start.line - 1, node.loc.start.column - 1)
        ),
      })
    },
  })

  return classes
}
