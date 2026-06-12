import * as csstree from "css-tree"
import * as vscode from "vscode"

import { CSSClassCollection } from "./domain/css-class-collection"

export async function findCSSClasses(): Promise<CSSClassCollection> {
  const classes = new CSSClassCollection()
  const files = await findCSSFiles()
  const symbols = (await Promise.all(files.map(findCSSClassSymbols))).flat()

  for (const { className, location } of symbols) {
    classes.add(className, location)
  }

  return classes
}

type CSSFile = {
  uri: vscode.Uri
  content: string
}

async function findCSSFiles(): Promise<CSSFile[]> {
  const uris = await vscode.workspace.findFiles("**/*.css", "**/{node_modules,dist,build}/**")

  const files = await Promise.all(
    uris.map(async (uri) => {
      const buffer = await vscode.workspace.fs.readFile(uri)
      return { uri, content: buffer.toString() }
    })
  )

  return files
}

type CSSClassSymbol = {
  className: string
  location: vscode.Location
}

async function findCSSClassSymbols(cssFile: CSSFile): Promise<CSSClassSymbol[]> {
  const ast = csstree.parse(cssFile.content, { positions: true })
  const classes: CSSClassSymbol[] = []

  csstree.walk(ast, {
    visit: "ClassSelector",
    enter(node) {
      if (!node.loc) return

      classes.push({
        className: node.name,
        location: new vscode.Location(
          cssFile.uri,
          new vscode.Position(node.loc.start.line - 1, node.loc.start.column - 1)
        ),
      })
    },
  })

  return classes
}
