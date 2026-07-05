import * as vscode from "vscode"

import { JsxParser } from "../../adapters/client-file-parsers/jsx-parser-adapter"
import type { Token } from "../../dtos/token-dto"

export type ClientFilesFinder = () => Promise<string[]>

export async function parseAllUsages(): Promise<Token[]> {
  const files = await findClientFiles()
  const parser = new JsxParser()
  return files.flatMap((uri) => parser.parseUsagesFrom(uri))
}

export const findClientFiles: ClientFilesFinder = async () => {
  const files = await vscode.workspace.findFiles("**/*.{jsx,tsx}", "**/node_modules/**")
  return files.map((uri) => uri.fsPath)
}
