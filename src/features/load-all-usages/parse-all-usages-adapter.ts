import * as vscode from "vscode"

import { selectParser } from "../../adapters/client-file-parsers/select-parser"
import type { Token } from "../../dtos/token-dto"
import { CLIENT_FILES_GLOB_PATTERN } from "../../shared/glob-patterns"

export async function parseAllUsages(): Promise<Token[]> {
  const files = await findClientFiles()
  return files.flatMap((uri) => selectParser(uri).parseUsagesFrom(uri))
}

async function findClientFiles(): Promise<string[]> {
  const files = await vscode.workspace.findFiles(CLIENT_FILES_GLOB_PATTERN, "**/node_modules/**")
  return files.map((uri) => uri.fsPath)
}
