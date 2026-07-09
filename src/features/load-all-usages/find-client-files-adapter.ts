import * as vscode from "vscode"

import type { ClientFileParser } from "../../adapters/client-file-parsers/client-file-parser-port"
import { HtmlParser } from "../../adapters/client-file-parsers/html-parser-adapter"
import { JsxParser } from "../../adapters/client-file-parsers/jsx-parser-adapter"
import type { Token } from "../../dtos/token-dto"

export async function parseAllUsages(): Promise<Token[]> {
  const files = await findClientFiles()

  return files.flatMap((uri) => {
    const extension = uri.split(".").pop()
    if (!extension) {
      throw new Error(`File ${uri} has no extension`)
    }

    return selectParser(extension).parseUsagesFrom(uri)
  })
}

async function findClientFiles(): Promise<string[]> {
  const files = await vscode.workspace.findFiles("**/*.{jsx,tsx,html}", "**/node_modules/**")
  return files.map((uri) => uri.fsPath)
}

const parsers: Record<string, ClientFileParser> = {
  jsx: new JsxParser(),
  tsx: new JsxParser(),
  html: new HtmlParser(),
}

function selectParser(extension: string): ClientFileParser {
  const parser = parsers[extension]
  if (!parser) {
    throw new Error(`No parser found for extension ${extension}`)
  }
  return parser
}
