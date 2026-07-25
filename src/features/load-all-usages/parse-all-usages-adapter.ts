import * as vscode from "vscode"

import { parseUsagesFrom } from "../../adapters/client-file-parser"
import { uriToCssFileDto, type CssFileDto } from "../../dtos/css-file-dto"
import type { Token } from "../../dtos/token-dto"
import { CLIENT_FILE_EXTENSIONS, toGlobPattern } from "../../shared/client-file-extensions"

export async function parseAllUsages(): Promise<Token[]> {
  const files = await findClientFiles()
  return files.flatMap(parseUsagesFrom)
}

async function findClientFiles(): Promise<CssFileDto[]> {
  const uris = await vscode.workspace.findFiles(
    toGlobPattern(CLIENT_FILE_EXTENSIONS),
    "**/node_modules/**"
  )
  return await Promise.all(uris.map(uriToCssFileDto))
}
