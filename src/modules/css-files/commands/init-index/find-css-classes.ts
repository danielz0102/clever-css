import * as vscode from "vscode"

import { CSSClassRepository } from "../../../../domain/css-class-repository"
import { parseCSSClassSymbols } from "../../css-parser"

export async function findCSSClasses(): Promise<CSSClassRepository> {
  const classes = new CSSClassRepository()
  const uris = await vscode.workspace.findFiles("**/*.css", "**/{node_modules,dist,build}/**")
  const symbols = (await Promise.all(uris.map(parseCSSClassSymbols))).flat()

  symbols.forEach(({ className, location }) => classes.add(className, location))

  return classes
}
