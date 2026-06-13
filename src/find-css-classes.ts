import * as vscode from "vscode"

import { CSSClassRepository } from "./domain/css-class-repository"
import { parseCSSClassSymbols } from "./lib/css-parser"

export async function findCSSClasses(): Promise<CSSClassRepository> {
  const classes = new CSSClassRepository()
  const uris = await findURIs()
  const symbols = (await Promise.all(uris.map(parseSymbol))).flat()

  symbols.forEach(({ className, location }) => classes.add(className, location))

  return classes
}

async function findURIs(): Promise<vscode.Uri[]> {
  return vscode.workspace.findFiles("**/*.css", "**/{node_modules,dist,build}/**")
}

type ParsedSymbol = {
  className: string
  location: vscode.Location
}

export async function parseSymbol(uri: vscode.Uri): Promise<ParsedSymbol[]> {
  const content = await parseContent(uri)
  const fileSymbols = await parseCSSClassSymbols(content)

  return fileSymbols.map((s) => ({
    className: s.className,
    location: new vscode.Location(
      uri,
      new vscode.Position(s.location.start.line - 1, s.location.start.column - 1)
    ),
  }))
}

async function parseContent(uri: vscode.Uri) {
  const buffer = await vscode.workspace.fs.readFile(uri)
  return buffer.toString()
}
