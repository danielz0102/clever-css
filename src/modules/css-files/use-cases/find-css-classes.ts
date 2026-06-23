import * as vscode from "vscode"

import { CSSClassRepository } from "../../../domain/css-class-repository"
import { readCSSFileUri } from "../lib/read-css-uri"

export async function findCSSClasses(): Promise<CSSClassRepository> {
  const classes = new CSSClassRepository()
  const uris = await vscode.workspace.findFiles("**/*.css", "**/{node_modules,dist,build}/**")
  const symbols = (await Promise.all(uris.map(readCSSFileUri))).flat()

  symbols.forEach((c) => classes.add(c.className, c.location))

  return classes
}
