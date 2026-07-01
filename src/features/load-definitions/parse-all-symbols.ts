import * as vscode from "vscode"

import { parseCssClassSymbols } from "../../adapters/css-parser"
import { uriToCssFileDto, type CssFileDto } from "../../dtos/css-file-dto"
import type { Symbol } from "../../dtos/symbol-dto"

export async function parseAllCssClassSymbols(): Promise<Symbol[]> {
  const cssFiles = await findCssFiles()
  const symbols = cssFiles.map((file) => parseCssClassSymbols(file))
  return (await Promise.all(symbols)).flat()
}

async function findCssFiles(): Promise<CssFileDto[]> {
  const uris = await vscode.workspace.findFiles("**/*.css", "**/{node_modules,dist,build}/**")
  const files = uris.map(async (u) => uriToCssFileDto(u.toString()))
  return Promise.all(files)
}
