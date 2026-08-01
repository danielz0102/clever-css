import * as vscode from "vscode"

import { parseCssClassTokens } from "../../adapters/css-parser"
import { uriToCssFileDto, type CssFileDto } from "../../dtos/css-file-dto"
import type { Token } from "../../dtos/token-dto"
import { GitIgnoreFilter } from "../../ui/gitignore"

export async function parseAllCssClassSymbols(gitIgnore: GitIgnoreFilter): Promise<Token[]> {
  const cssFiles = await findCssFiles(gitIgnore)
  return cssFiles.flatMap(parseCssClassTokens)
}

async function findCssFiles(gitIgnore: GitIgnoreFilter): Promise<CssFileDto[]> {
  const uris = await vscode.workspace.findFiles("**/*.css", "**/node_modules/**")
  const files = uris.filter((uri) => !gitIgnore.ignores(uri.fsPath)).map(uriToCssFileDto)
  return Promise.all(files)
}
