import * as vscode from "vscode"

import { parseUsagesFrom } from "../../adapters/client-file-parser"
import { uriToCssFileDto, type CssFileDto } from "../../dtos/css-file-dto"
import type { Token } from "../../dtos/token-dto"
import { CLIENT_FILE_EXTENSIONS, toGlobPattern } from "../../shared/client-file-extensions"
import { GitIgnoreFilter } from "../../ui/gitignore"

export async function parseAllUsages(gitIgnore: GitIgnoreFilter): Promise<Token[]> {
  const files = await findClientFiles(gitIgnore)
  return files.flatMap(parseUsagesFrom)
}

async function findClientFiles(gitIgnore: GitIgnoreFilter): Promise<CssFileDto[]> {
  const uris = await vscode.workspace.findFiles(
    toGlobPattern(CLIENT_FILE_EXTENSIONS),
    "**/node_modules/**"
  )

  return await Promise.all(
    uris.filter((uri) => !gitIgnore.ignores(uri.fsPath)).map(uriToCssFileDto)
  )
}
