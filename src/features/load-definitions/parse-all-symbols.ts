import * as vscode from "vscode"

import { parseCssClassTokens } from "../../adapters/css-parser"
import { uriToCssFileDto, type CssFileDto } from "../../dtos/css-file-dto"
import type { Token } from "../../dtos/token-dto"

export async function parseAllCssClassSymbols(): Promise<Token[]> {
  const cssFiles = await findCssFiles()
  return cssFiles.flatMap(parseCssClassTokens)
}

async function findCssFiles(): Promise<CssFileDto[]> {
  const uris = await vscode.workspace.findFiles("**/*.css", "**/{node_modules,dist,build}/**")
  const files = uris.map(uriToCssFileDto)
  return Promise.all(files)
}
