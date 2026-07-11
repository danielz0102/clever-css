import * as vscode from "vscode"

import { selectParser } from "../../adapters/client-file-parsers/select-parser"
import type { Token } from "../../dtos/token-dto"
import { CLIENT_FILE_EXTENSIONS, toGlobPattern } from "../../shared/client-file-extensions"

export async function parseAllUsages(): Promise<Token[]> {
  const files = await findClientFiles()
  return files.flatMap((uri) => selectParser(uri).parseUsagesFrom(uri))
}

async function findClientFiles(): Promise<string[]> {
  const files = await vscode.workspace.findFiles(
    toGlobPattern(CLIENT_FILE_EXTENSIONS),
    "**/node_modules/**"
  )
  return files.map((uri) => uri.fsPath)
}
