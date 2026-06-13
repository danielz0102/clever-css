import * as vscode from "vscode"

import { CSSClassRepository } from "./domain/css-class-repository"
import { parseCSSClassSymbols } from "./lib/css-parser"

export async function findCSSClasses(): Promise<CSSClassRepository> {
  const classes = new CSSClassRepository()
  const uris = await findURIs()
  const symbols = (await Promise.all(uris.map(parseCSSClassSymbols))).flat()

  symbols.forEach(({ className, location }) => classes.add(className, location))

  return classes
}

async function findURIs(): Promise<vscode.Uri[]> {
  return vscode.workspace.findFiles("**/*.css", "**/{node_modules,dist,build}/**")
}
